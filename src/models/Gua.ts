import type { CalendarInfo } from "./Calendar";
import { LiuYaoTime } from "./Calendar";
import type { RuleTrace, RuleYaoContext } from "./Rules";
import { evaluateRulePipeline, isTraceTargetingYao } from "./Rules";
import type { YaoPositionCategory } from "./YaoPositionImages";
import type {
  BranchName,
  ElementName,
  GanZhiName,
  GuaSpecialType,
  RelativeName,
  SixSpiritName,
  StrengthLabel,
  TrigramName,
  UseSpiritRole,
  YaoRole,
} from "../types/basicTerms";
import {
  ELEMENT_NAMES,
  FIVE_ELEMENT_CONTROLS,
  FIVE_ELEMENT_GENERATES,
  GUI_HUN_GUA_NAMES,
  LIU_CHONG_GUA_NAMES,
  LIU_HE_GUA_NAMES,
  SIX_SPIRIT_NAMES,
  YAO_NAMES,
  YOU_HUN_GUA_NAMES,
} from "../types/basicTerms";
import { branch2Element } from "../utils/branch2Element";
import { createId } from "../utils/createId";

const CODE_KEY = "liuyao@zhyDaDa";

interface LiuYaoChartCode {
  question: string;
  remark: string;
  createdAt: number;
  yaos: Array<{
    isYang: boolean;
    isMoving: boolean;
  }>;
}

function encode(data: LiuYaoChartCode): string {
  if (data.yaos.length !== 6) {
    throw new Error("必须包含六个爻");
  }

  const encoder = new TextEncoder();
  const questionBytes = encoder.encode(data.question);
  const remarkBytes = encoder.encode(data.remark);

  if (questionBytes.length > 0xffff) {
    throw new Error("占事内容过长");
  }

  /*
   * 数据布局：
   *
   * 0~3：时间，精确到分钟
   * 4~5：六爻状态，12 bit
   * 6~7：question 的 UTF-8 字节长度
   * 8~ ：question 和 remark 的 UTF-8 数据
   */
  const bytes = new Uint8Array(8 + questionBytes.length + remarkBytes.length);

  const view = new DataView(bytes.buffer);

  const minutes = Math.floor(data.createdAt / 60_000);

  if (minutes < 0 || minutes > 0xffffffff) {
    throw new Error("排盘时间超出编码范围");
  }

  let yaoBits = 0;

  data.yaos.forEach((yao, position) => {
    if (yao.isYang) {
      yaoBits |= 1 << (position * 2);
    }

    if (yao.isMoving) {
      yaoBits |= 1 << (position * 2 + 1);
    }
  });

  view.setUint32(0, minutes);
  view.setUint16(4, yaoBits);
  view.setUint16(6, questionBytes.length);

  bytes.set(questionBytes, 8);
  bytes.set(remarkBytes, 8 + questionBytes.length);

  /*
   * 简单异或混淆。
   *
   * 除了固定密钥，还混入字节位置，
   * 避免相同字符总是产生完全相同的字节。
   */
  const keyBytes = encoder.encode(CODE_KEY);

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] ^=
      keyBytes[index % keyBytes.length] ^ ((index * 31 + 17) & 0xff);
  }

  if (bytes.length > 0x7fff) {
    throw new Error("存档内容过长");
  }

  /*
   * 每个字符保存 15 bit。
   *
   * 使用 U+3400 ~ U+B3FF，避开 UTF-16 代理区，
   * 每个编码字符的 string.length 都是 1。
   *
   * 第一个字符保存原始字节数量。
   */
  let result = String.fromCharCode(0x3400 + bytes.length);
  let buffer = 0;
  let bitCount = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitCount += 8;

    while (bitCount >= 15) {
      bitCount -= 15;

      result += String.fromCharCode(0x3400 + ((buffer >> bitCount) & 0x7fff));

      buffer &= (1 << bitCount) - 1;
    }
  }

  if (bitCount > 0) {
    result += String.fromCharCode(
      0x3400 + ((buffer << (15 - bitCount)) & 0x7fff),
    );
  }

  return result;
}

function decode(code: string): LiuYaoChartCode {
  const text = code.trim();

  if (!text) {
    throw new Error("存档代码不能为空");
  }

  const byteLength = text.charCodeAt(0) - 0x3400;

  if (byteLength < 0 || byteLength > 0x7fff) {
    throw new Error("存档代码格式错误");
  }

  const bytes = new Uint8Array(byteLength);

  let byteIndex = 0;
  let buffer = 0;
  let bitCount = 0;

  for (let index = 1; index < text.length && byteIndex < byteLength; index++) {
    const value = text.charCodeAt(index) - 0x3400;

    if (value < 0 || value > 0x7fff) {
      throw new Error("存档代码包含非法字符");
    }

    buffer = (buffer << 15) | value;
    bitCount += 15;

    while (bitCount >= 8 && byteIndex < byteLength) {
      bitCount -= 8;

      bytes[byteIndex++] = (buffer >> bitCount) & 0xff;

      buffer &= (1 << bitCount) - 1;
    }
  }

  if (byteIndex !== byteLength) {
    throw new Error("存档代码不完整");
  }

  // 异或操作执行两次即可恢复原始数据。
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(CODE_KEY);

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] ^=
      keyBytes[index % keyBytes.length] ^ ((index * 31 + 17) & 0xff);
  }

  if (bytes.length < 8) {
    throw new Error("存档数据不完整");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const minutes = view.getUint32(0);
  const yaoBits = view.getUint16(4);
  const questionLength = view.getUint16(6);

  if (8 + questionLength > bytes.length) {
    throw new Error("存档内容长度错误");
  }

  const decoder = new TextDecoder("utf-8", {
    fatal: true,
  });

  let question: string;
  let remark: string;

  try {
    question = decoder.decode(bytes.slice(8, 8 + questionLength));

    remark = decoder.decode(bytes.slice(8 + questionLength));
  } catch {
    throw new Error("存档文本解析失败");
  }

  return {
    question,
    remark,
    createdAt: minutes * 60_000,

    yaos: Array.from({ length: 6 }, (_, position) => ({
      isYang: (yaoBits & (1 << (position * 2))) !== 0,

      isMoving: (yaoBits & (1 << (position * 2 + 1))) !== 0,
    })),
  };
}

export interface YaoSnapshot {
  position: number;
  name: string;
  isYang: boolean;
  isMoving: boolean;
  isDarkMoving: boolean;
  branch: BranchName;
  element: ElementName;
  relative: RelativeName;
  spirit: SixSpiritName;
  role: YaoRole;
  changedBranch: BranchName;
  changedElement: ElementName;
  changedRelative: RelativeName;
  changedIsYang: boolean;
  changedRole: YaoRole;
  strength: number;
  strengthLabel: StrengthLabel;
  useSpiritRole: UseSpiritRole;
  traces: RuleTrace[];
}

export interface ChartSnapshot {
  id: string;
  title: string;
  question: string;
  remark?: string;
  useYaoPosition?: number | null;
  yaoPositionCategory?: YaoPositionCategory;
  calendar: CalendarInfo;
  originalName: string;
  changedName: string;
  originalType: GuaSpecialType;
  changedType: GuaSpecialType;
  palace: TrigramName;
  changedPalace: TrigramName;
  palaceElement: ElementName;
  changedPalaceElement: ElementName;
  yaos: YaoSnapshot[];
}

interface TrigramInfo {
  readonly name: TrigramName;
  readonly bits: string;
  readonly element: ElementName;
}

interface TrigramPair {
  lower: TrigramInfo;
  upper: TrigramInfo;
}

const TRIGRAMS: readonly TrigramInfo[] = [
  { name: "乾", bits: "111", element: "金" },
  { name: "兑", bits: "110", element: "金" },
  { name: "离", bits: "101", element: "火" },
  { name: "震", bits: "100", element: "木" },
  { name: "巽", bits: "011", element: "木" },
  { name: "坎", bits: "010", element: "水" },
  { name: "艮", bits: "001", element: "土" },
  { name: "坤", bits: "000", element: "土" },
] as const;
const NA_JIA: Record<TrigramName, BranchName[]> = {
  乾: ["子", "寅", "辰", "午", "申", "戌"],
  震: ["子", "寅", "辰", "午", "申", "戌"],
  坎: ["寅", "辰", "午", "申", "戌", "子"],
  艮: ["辰", "午", "申", "戌", "子", "寅"],
  坤: ["未", "巳", "卯", "丑", "亥", "酉"],
  巽: ["丑", "亥", "酉", "未", "巳", "卯"],
  离: ["卯", "丑", "亥", "酉", "未", "巳"],
  兑: ["巳", "卯", "丑", "亥", "酉", "未"],
};
const GUA_NAMES: Record<string, string> = {
  乾乾: "乾为天",
  坤坤: "坤为地",
  坎震: "水雷屯",
  艮坎: "山水蒙",
  坎乾: "水天需",
  乾坎: "天水讼",
  坤坎: "地水师",
  坎坤: "水地比",
  巽乾: "风天小畜",
  乾兑: "天泽履",
  坤乾: "地天泰",
  乾坤: "天地否",
  乾离: "天火同人",
  离乾: "火天大有",
  坤艮: "地山谦",
  震坤: "雷地豫",
  兑震: "泽雷随",
  艮巽: "山风蛊",
  坤兑: "地泽临",
  巽坤: "风地观",
  离震: "火雷噬嗑",
  艮离: "山火贲",
  艮坤: "山地剥",
  坤震: "地雷复",
  乾震: "天雷无妄",
  艮乾: "山天大畜",
  艮震: "山雷颐",
  兑巽: "泽风大过",
  坎坎: "坎为水",
  离离: "离为火",
  兑艮: "泽山咸",
  震巽: "雷风恒",
  乾艮: "天山遁",
  震乾: "雷天大壮",
  离坤: "火地晋",
  坤离: "地火明夷",
  巽离: "风火家人",
  离兑: "火泽睽",
  坎艮: "水山蹇",
  震坎: "雷水解",
  艮兑: "山泽损",
  巽震: "风雷益",
  兑乾: "泽天夬",
  乾巽: "天风姤",
  兑坤: "泽地萃",
  坤巽: "地风升",
  兑坎: "泽水困",
  坎巽: "水风井",
  兑离: "泽火革",
  离巽: "火风鼎",
  震震: "震为雷",
  艮艮: "艮为山",
  巽艮: "风山渐",
  震兑: "雷泽归妹",
  震离: "雷火丰",
  离艮: "火山旅",
  巽巽: "巽为风",
  兑兑: "兑为泽",
  巽坎: "风水涣",
  坎兑: "水泽节",
  巽兑: "风泽中孚",
  震艮: "雷山小过",
  坎离: "水火既济",
  离坎: "火水未济",
} as const;
export type GuaName = (typeof GUA_NAMES)[keyof typeof GUA_NAMES];

export class Yao {
  public readonly position: number;
  public readonly isYang: boolean;
  public readonly isMoving: boolean;

  constructor(position: number, isYang: boolean, isMoving = false) {
    this.position = position;
    this.isYang = isYang;
    this.isMoving = isMoving;
  }

  changed(): Yao {
    return new Yao(
      this.position,
      this.isMoving ? !this.isYang : this.isYang,
      false,
    );
  }
}

export class LiuYaoChart {
  public readonly id: string;
  public readonly title: string;
  public readonly question: string;
  public readonly remark: string;
  public readonly createdAt: Date;
  public readonly yaos: Yao[];

  constructor(
    yaos: Yao[],
    question = "未命名占事",
    createdAt = new Date(),
    id: string = createId("chart"),
    remark = "",
  ) {
    this.yaos = yaos;
    this.question = question;
    this.remark = remark;
    this.createdAt = createdAt;
    this.id = id;
    this.title = `${question} · ${createdAt.toLocaleDateString("zh-CN")}`;
  }

  static random(question = "随机起卦", createdAt = new Date()): LiuYaoChart {
    const yaos = Array.from({ length: 6 }, (_, position) => {
      const coinTotal = 6 + Math.floor(Math.random() * 4);
      return new Yao(
        position,
        coinTotal % 2 === 1,
        coinTotal === 6 || coinTotal === 9,
      );
    });
    return new LiuYaoChart(yaos, question, createdAt);
  }

  static sample(): LiuYaoChart {
    return new LiuYaoChart(
      [
        new Yao(0, true, false),
        new Yao(1, false, true),
        new Yao(2, false, false),
        new Yao(3, false, false),
        new Yao(4, true, false),
        new Yao(5, false, true),
      ],
      "示例排盘",
    );
  }

  static fromSnapshot(snapshot: ChartSnapshot): LiuYaoChart {
    return new LiuYaoChart(
      snapshot.yaos.map(
        (yao) => new Yao(yao.position, yao.isYang, yao.isMoving),
      ),
      snapshot.question,
      new Date(snapshot.calendar.createdAt),
      snapshot.id,
      snapshot.remark ?? "",
    );
  }

  toSnapshot(
    useYaoPosition: number | null = null,
    yaoPositionCategory?: YaoPositionCategory,
  ): ChartSnapshot {
    const originalTrigrams = this.getTrigrams(this.yaos);
    const changedYaos = this.yaos.map((yao) => yao.changed());

    const originalName = getGuaName(originalTrigrams);
    const changedName = getGuaName(this.getTrigrams(changedYaos));

    const changedTrigrams = this.getTrigrams(changedYaos);
    const world = this.getWorldAndPalace(this.yaos);
    const changedWorld = this.getWorldAndPalace(changedYaos);
    const branches = this.getBranches(originalTrigrams);
    const changedBranches = this.getBranches(changedTrigrams);
    const calendar = this.getCalendar();
    const spirits = this.getSixSpirits(calendar.day[0]);
    const monthBranch = getGanZhiBranch(calendar.month);
    const dayBranch = getGanZhiBranch(calendar.day);
    const ruleYaos: RuleYaoContext[] = this.yaos.map((yao) => {
      const branch = branches[yao.position];
      const changedBranch = changedBranches[yao.position];
      const element = branch2Element(branch);
      const changedElement = branch2Element(changedBranch);
      return {
        position: yao.position,
        spirit: spirits[yao.position],
        branch,
        element,
        relative: getRelative(world.palaceElement, element),
        changedBranch,
        changedElement,
        changedRelative: getRelative(
          changedWorld.palaceElement,
          changedElement,
        ),
        isMoving: yao.isMoving,
        isDarkMoving: false,
      };
    });
    const ruleEvaluation = evaluateRulePipeline({
      calendar,
      palace: world.palace,
      palaceElement: world.palaceElement,
      changedPalace: changedWorld.palace,
      changedPalaceElement: changedWorld.palaceElement,
      yaos: ruleYaos,
      month: {
        branch: monthBranch,
        element: branch2Element(monthBranch),
      },
      day: {
        branch: dayBranch,
        element: branch2Element(dayBranch),
      },
      voidBranches: calendar.voidBranches,
      yaoPositionCategory,
    });
    const ruleTraces = ruleEvaluation.traces;
    const evaluatedRuleYaos = ruleEvaluation.context.yaos;

    const yaos: YaoSnapshot[] = this.yaos.map((yao) => {
      const ruleYao = evaluatedRuleYaos[yao.position];
      const branch = branches[yao.position];
      const changedBranch = changedBranches[yao.position];
      const element = branch2Element(branch);
      const changedElement = branch2Element(changedBranch);
      const relative = getRelative(world.palaceElement, element);
      const traces = ruleTraces.filter((trace) =>
        isTraceTargetingYao(trace, yao.position),
      );
      const strength = traces.reduce((sum, trace) => sum + trace.score, 0);

      return {
        position: yao.position,
        name: YAO_NAMES[yao.position],
        isYang: yao.isYang,
        isMoving: yao.isMoving,
        isDarkMoving: ruleYao?.isDarkMoving ?? false,
        branch,
        element,
        relative,
        spirit: spirits[yao.position],
        role:
          world.worldIndex === yao.position
            ? "世"
            : world.respondIndex === yao.position
              ? "应"
              : "",
        changedBranch,
        changedElement,
        changedRelative: getRelative(
          changedWorld.palaceElement,
          changedElement,
        ),
        changedIsYang: changedYaos[yao.position].isYang,
        changedRole:
          changedWorld.worldIndex === yao.position
            ? "世"
            : changedWorld.respondIndex === yao.position
              ? "应"
              : "",
        strength,
        strengthLabel: strength >= 2 ? "旺" : strength <= -2 ? "衰" : "平",
        useSpiritRole: "",
        traces,
      };
    });
    const useYao = yaos.find((yao) => yao.position === useYaoPosition);
    const yaosWithUseSpirit = useYao
      ? yaos.map((yao) => ({
          ...yao,
          useSpiritRole: getUseSpiritRole(yao, useYao),
        }))
      : yaos;

    return {
      id: this.id,
      title: this.title,
      question: this.question,
      remark: this.remark,
      useYaoPosition,
      yaoPositionCategory,
      calendar,
      originalName,
      changedName,
      originalType: getGuaSpecialType(originalName),
      changedType: getGuaSpecialType(changedName),
      palace: world.palace,
      changedPalace: changedWorld.palace,
      palaceElement: trigramElement(world.palace),
      changedPalaceElement: trigramElement(changedWorld.palace),
      yaos: yaosWithUseSpirit,
    };
  }

  private getCalendar(): CalendarInfo {
    return new LiuYaoTime(this.createdAt).toCalendarInfo();
  }

  private getTrigrams(yaos: Yao[]): TrigramPair {
    return {
      lower: trigramByBits(yaos.slice(0, 3).map(toBit).join("")),
      upper: trigramByBits(yaos.slice(3, 6).map(toBit).join("")),
    };
  }

  private getBranches(trigrams: TrigramPair): BranchName[] {
    return [
      ...NA_JIA[trigrams.lower.name].slice(0, 3),
      ...NA_JIA[trigrams.upper.name].slice(3, 6),
    ];
  }

  private getWorldAndPalace(yaos: Yao[]) {
    const trigrams = this.getTrigrams(yaos);
    const heaven = yaos[5].isYang === yaos[2].isYang ? 0 : 1;
    const earth = yaos[3].isYang === yaos[0].isYang ? 0 : 1;
    const human = yaos[4].isYang === yaos[1].isYang ? 0 : 1;
    const key = `${heaven},${earth},${human}`;
    const worldMap: Record<string, number> = {
      "0,0,0": 5,
      "0,1,0": 0,
      "0,1,1": 1,
      "1,1,1": 2,
      "1,0,1": 3,
      "1,0,0": 4,
      "1,1,0": 3,
      "0,0,1": 2,
    };
    const worldIndex = worldMap[key];
    const palace =
      key === "0,0,1"
        ? trigrams.lower.name
        : worldIndex === 3 || worldIndex === 4
          ? trigramByBits(
              yaos
                .slice(0, 3)
                .map((yao) => (yao.isYang ? "0" : "1"))
                .join(""),
            ).name
          : trigrams.upper.name;

    return {
      palace,
      palaceElement: trigramElement(palace),
      worldIndex,
      respondIndex: (worldIndex + 3) % 6,
    };
  }

  private getSixSpirits(dayStem: string): SixSpiritName[] {
    const startMap: Record<string, number> = {
      甲: 0,
      乙: 0,
      丙: 1,
      丁: 1,
      戊: 2,
      己: 3,
      庚: 4,
      辛: 4,
      壬: 5,
      癸: 5,
    };
    const start = startMap[dayStem] ?? 0;
    return Array.from(
      { length: 6 },
      (_, index) => SIX_SPIRIT_NAMES[(start + index) % SIX_SPIRIT_NAMES.length],
    );
  }

  exportToCode(): string {
    return encode({
      question: this.question,
      remark: this.remark,
      createdAt: this.createdAt.getTime(),
      yaos: this.yaos.map((yao) => ({
        isYang: yao.isYang,
        isMoving: yao.isMoving,
      })),
    });
  }

  static importFromCode(code: string): LiuYaoChart {
    const data = decode(code);

    return new LiuYaoChart(
      data.yaos.map(
        (yao, position) => new Yao(position, yao.isYang, yao.isMoving),
      ),
      data.question,
      new Date(data.createdAt),
      createId("chart"),
      data.remark,
    );
  }

  static importFromText(text: string): LiuYaoChart {
    throw new Error(`TODO: 此功能尚待开发 ///-_-💧, 你的输入是:${text}`);
  }
}

function getRelative(
  palaceElement: ElementName,
  yaoElement: ElementName,
): RelativeName {
  if (palaceElement === yaoElement) return "兄弟";
  if (FIVE_ELEMENT_GENERATES[yaoElement] === palaceElement) return "父母";
  if (FIVE_ELEMENT_GENERATES[palaceElement] === yaoElement) return "子孙";
  if (FIVE_ELEMENT_CONTROLS[yaoElement] === palaceElement) return "官鬼";
  return "妻财";
}

function getUseSpiritRole(
  yao: YaoSnapshot,
  useYao: YaoSnapshot,
): UseSpiritRole {
  if (yao.position === useYao.position) return "用";
  if (FIVE_ELEMENT_GENERATES[yao.element] === useYao.element) return "元";
  if (FIVE_ELEMENT_CONTROLS[yao.element] === useYao.element) return "忌";

  const jiElement = getElementControlling(useYao.element);
  if (FIVE_ELEMENT_GENERATES[yao.element] === jiElement) return "仇";

  return "";
}

function getElementControlling(element: ElementName): ElementName {
  const controller = ELEMENT_NAMES.find(
    (item) => FIVE_ELEMENT_CONTROLS[item] === element,
  );
  if (!controller) {
    throw new Error(`未知五行克制关系：${element}`);
  }
  return controller;
}

function trigramByBits(bits: string): TrigramInfo {
  const trigram = TRIGRAMS.find((item) => item.bits === bits);
  if (!trigram) {
    throw new Error(`未知三爻组合：${bits}`);
  }
  return trigram;
}

function trigramElement(name: TrigramName): ElementName {
  const trigram = TRIGRAMS.find((item) => item.name === name);
  if (!trigram) {
    throw new Error(`未知八卦：${name}`);
  }
  return trigram.element;
}

function getGuaName(trigrams: {
  upper: { name: TrigramName };
  lower: { name: TrigramName };
}) {
  return (
    GUA_NAMES[trigrams.upper.name + trigrams.lower.name] ??
    `${trigrams.upper.name}上${trigrams.lower.name}下`
  );
}

function toBit(yao: Yao) {
  return yao.isYang ? "1" : "0";
}

function getGanZhiBranch(ganZhi: GanZhiName): BranchName {
  return ganZhi[1] as BranchName;
}

export const getGuaSpecialType = (guaName: string): GuaSpecialType => {
  if (LIU_CHONG_GUA_NAMES.has(guaName)) {
    return "六冲";
  } else if (LIU_HE_GUA_NAMES.has(guaName)) {
    return "六合";
  } else if (YOU_HUN_GUA_NAMES.has(guaName)) {
    return "游魂";
  } else if (GUI_HUN_GUA_NAMES.has(guaName)) {
    return "归魂";
  }
  return "";
};
