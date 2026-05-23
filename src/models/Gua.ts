import type { CalendarInfo } from "./Calendar";
import { LiuYaoTime } from "./Calendar";
import type { RuleTrace, RuleYaoContext } from "./Rules";
import { evaluateYaoRules } from "./Rules";
import type {
  BranchName,
  ElementName,
  GanZhiName,
  RelativeName,
  SixSpiritName,
  StrengthLabel,
  TrigramName,
  YaoRole,
} from "../types/basicTerms";
import {
  FIVE_ELEMENT_CONTROLS,
  FIVE_ELEMENT_GENERATES,
  SIX_SPIRIT_NAMES,
} from "../types/basicTerms";
import { branch2Element } from "../utils/branch2Element";
import { createId } from "../utils/createId";

export interface YaoSnapshot {
  position: number;
  name: string;
  isYang: boolean;
  isMoving: boolean;
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
  traces: RuleTrace[];
}

export interface ChartSnapshot {
  id: string;
  title: string;
  question: string;
  remark?: string;
  calendar: CalendarInfo;
  originalName: string;
  changedName: string;
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

const YAO_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
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
};

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

  static random(question = "随机起卦"): LiuYaoChart {
    const yaos = Array.from({ length: 6 }, (_, position) => {
      const coinTotal = 6 + Math.floor(Math.random() * 4);
      return new Yao(
        position,
        coinTotal % 2 === 1,
        coinTotal === 6 || coinTotal === 9,
      );
    });
    return new LiuYaoChart(yaos, question);
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

  toSnapshot(): ChartSnapshot {
    const originalTrigrams = this.getTrigrams(this.yaos);
    const changedYaos = this.yaos.map((yao) => yao.changed());
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
      return {
        position: yao.position,
        branch,
        element: branch2Element(branch),
        changedBranch,
        changedElement: branch2Element(changedBranch),
        isMoving: yao.isMoving,
      };
    });

    return {
      id: this.id,
      title: this.title,
      question: this.question,
      remark: this.remark,
      calendar,
      originalName: getGuaName(originalTrigrams),
      changedName: getGuaName(changedTrigrams),
      palace: world.palace,
      changedPalace: changedWorld.palace,
      palaceElement: trigramElement(world.palace),
      changedPalaceElement: trigramElement(changedWorld.palace),
      yaos: this.yaos.map((yao) => {
        const branch = branches[yao.position];
        const changedBranch = changedBranches[yao.position];
        const element = branch2Element(branch);
        const changedElement = branch2Element(changedBranch);
        const relative = getRelative(world.palaceElement, element);
        const traces = evaluateYaoRules({
          calendar,
          palace: world.palace,
          palaceElement: world.palaceElement,
          changedPalace: changedWorld.palace,
          changedPalaceElement: changedWorld.palaceElement,
          yaos: ruleYaos,
          yao: ruleYaos[yao.position],
          month: {
            branch: monthBranch,
            element: branch2Element(monthBranch),
          },
          day: {
            branch: dayBranch,
            element: branch2Element(dayBranch),
          },
          voidBranches: calendar.voidBranches,
        });
        const strength = traces.reduce((sum, trace) => sum + trace.effect, 0);

        return {
          position: yao.position,
          name: YAO_NAMES[yao.position],
          isYang: yao.isYang,
          isMoving: yao.isMoving,
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
          traces,
        };
      }),
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
