import type { CalendarInfo } from "./Calendar";
import type {
  BranchName,
  ElementName,
  RelativeName,
  SixSpiritName,
  SKCHEffect,
  TrigramName,
  VoidBranches,
} from "../types/basicTerms";
import {
  FIVE_ELEMENT_CONTROLS,
  FIVE_ELEMENT_GENERATES,
  YAO_NAMES,
} from "../types/basicTerms";
import { getRelativeChangeReference } from "./RelativeImages";
import { getSixSpiritImage } from "./SixSpiritImages";
import type { YaoPositionCategory } from "./YaoPositionImages";
import { getYaoPositionImage } from "./YaoPositionImages";
import { compareYaoForSKCH, isBranchClash } from "../utils/SKCH";
import { BE_pair } from "../utils/branch2Element";

// 作用的主体
export type RuleActorKind = "yao" | "changedYao" | "month" | "day" | "void";
export type RuleEffect =
  | Exclude<SKCHEffect, "无">
  | "空亡"
  | "暗动"
  | "三合局"
  | "参考";

export interface RuleActor {
  id: string;
  kind: RuleActorKind;
  label: string;
  position?: number;
  be_pair?: BE_pair;
}

interface CreateActorOptions {
  position?: number;
  branch?: BranchName;
  label?: string;
  voidBranches?: VoidBranches;
}

export interface RuleTrace {
  title: string;
  source: RuleActor | RuleActor[];
  target: RuleActor | RuleActor[];
  effect: RuleEffect;
  score: number;
  reason: string;
}

export interface RuleYaoContext {
  position: number;
  spirit: SixSpiritName;
  branch: BranchName;
  element: ElementName;
  relative: RelativeName;
  changedBranch: BranchName;
  changedElement: ElementName;
  changedRelative: RelativeName;
  isMoving: boolean;
  isDarkMoving: boolean;
}

export interface RuleContext {
  calendar: CalendarInfo;
  palace: TrigramName;
  palaceElement: ElementName;
  changedPalace: TrigramName;
  changedPalaceElement: ElementName;
  yaos: RuleYaoContext[];
  month: {
    branch: BranchName;
    element: ElementName;
  };
  day: {
    branch: BranchName;
    element: ElementName;
  };
  voidBranches: VoidBranches;
  yaoPositionCategory?: YaoPositionCategory;
}

export type RuleResult = RuleTrace | RuleTrace[] | null;
export type Rule = (context: RuleContext) => RuleResult;
export type ContextRule = (context: RuleContext) => RuleEvaluation;
export type RuleEntry<T> = readonly [rule: T, explanation: string];

export interface RuleEvaluation {
  context: RuleContext;
  traces: RuleTrace[];
}

interface SanHeGroup {
  branches: readonly [BranchName, BranchName, BranchName];
  element: ElementName;
}

interface SanHeParticipant {
  branch: BranchName;
  element: ElementName;
  actor: RuleActor;
  priority: number;
  isYaoRelated: boolean;
  isActivatedByYao: boolean;
}

const SAN_HE_GROUPS: readonly SanHeGroup[] = [
  { branches: ["亥", "卯", "未"], element: "木" },
  { branches: ["寅", "午", "戌"], element: "火" },
  { branches: ["巳", "酉", "丑"], element: "金" },
  { branches: ["申", "子", "辰"], element: "水" },
];

// notice: 前置规则
export const contextRules: RuleEntry<ContextRule>[] = [
  [
    darkMovingRule,
    "暗动：旺相静爻被日辰冲起时，先标记为暗动，让它在后续规则中作为有效动爻发生作用；休囚被日冲不入局。",
  ],
];

// notice: 规则登记顺序
export const ruleSet: RuleEntry<Rule>[] = [
  [
    monthInfluenceRule,
    "月建生克冲合：判断月建对每一爻的生、克、冲、合影响；月建冲爻时记为月破。",
  ],
  [dayInfluenceRule, "日辰生克冲合：判断日辰对每一爻的生、克、冲、合影响。"],
  [
    movingYaoRule,
    "动爻作用：明动爻和暗动爻会作为作用方，对其他爻产生生、克、冲、合关系。",
  ],
  [
    backInfluenceRule,
    "回头生克冲合：明动爻的变出之爻会回头作用本爻，产生生、克、冲、合关系。",
  ],
  [
    sanHeRule,
    "三合局：明动、暗动、动爻变爻、日辰、月建凑齐亥卯未、寅午戌、巳酉丑、申子辰时成局；日破与旬空被克之爻不入局。",
  ],
  [voidBranchRule, "旬空：本爻地支落入当前旬空时，标记为空亡并降低参考分。"],
];

// notice: 参考规则只提供取象提示，不参与生克冲合和旺衰判断
export const referenceRules: RuleEntry<Rule>[] = [
  [
    relativeChangeReferenceRule,
    "六亲互化参考：动爻六亲化出变爻六亲时，提示变化过程和取象方向；此规则只作参考说明。",
  ],
  [
    yaoPositionReferenceRule,
    "爻位取象参考：按当前本卦范畴提示每个爻位可能对应的人事物象；此规则只作参考说明。",
  ],
  [
    sixSpiritReferenceRule,
    "六神取象参考：按每个爻所临六神提示可能对应的象意；此规则只作参考说明。",
  ],
];

export const enabledRuleExplanations = [
  ...contextRules.map(([, explanation]) => explanation),
  ...ruleSet.map(([, explanation]) => explanation),
  ...referenceRules.map(([, explanation]) => explanation),
];

export function evaluateRules(context: RuleContext): RuleTrace[] {
  return evaluateRulePipeline(context).traces;
}

export function evaluateRulePipeline(context: RuleContext): RuleEvaluation {
  const staged = contextRules.reduce<RuleEvaluation>(
    (current, [rule]) => {
      const result = rule(current.context);
      return {
        context: result.context,
        traces: [...current.traces, ...result.traces],
      };
    },
    {
      context: {
        ...context,
        yaos: context.yaos.map((yao) => ({ ...yao })),
      },
      traces: [],
    },
  );

  return {
    context: staged.context,
    traces: [
      ...staged.traces,
      ...ruleSet.flatMap(([rule]) => {
        const result = rule(staged.context);
        if (!result) return [];
        return Array.isArray(result) ? result : [result];
      }),
      ...referenceRules.flatMap(([rule]) => {
        const result = rule(staged.context);
        if (!result) return [];
        return Array.isArray(result) ? result : [result];
      }),
    ],
  };
}

export function isTraceTargetingYao(
  trace: RuleTrace,
  position: number,
): boolean {
  const targets = Array.isArray(trace.target) ? trace.target : [trace.target];
  return targets.some(
    (actor) =>
      (actor.kind === "yao" || actor.kind === "changedYao") &&
      actor.position === position,
  );
}

// 暗动：旺相静爻被日辰冲起，先转成后续规则可识别的有效动爻
function darkMovingRule(context: RuleContext): RuleEvaluation {
  const source = createActor("day", { branch: context.day.branch });
  const traces: RuleTrace[] = [];
  const yaos = context.yaos.map((yao) => {
    if (yao.isMoving || yao.isDarkMoving) return yao;
    if (!isBranchClash(context.day.branch, yao.branch)) return yao;
    if (!isElementProsperousByMonth(yao.element, context.month.element)) {
      return yao;
    }

    const darkMovingYao = { ...yao, isDarkMoving: true };
    const target = createActor("yao", {
      position: darkMovingYao.position,
      branch: darkMovingYao.branch,
    });
    traces.push({
      title: "暗动",
      source,
      target,
      effect: "暗动",
      score: 0,
      reason: `${target.label}[${target.be_pair}]静而旺相，受${source.label}[${source.be_pair}]冲起，作暗动论`,
    });
    return darkMovingYao;
  });

  return {
    context: {
      ...context,
      yaos,
    },
    traces,
  };
}

// 月建
function monthInfluenceRule(context: RuleContext): RuleTrace[] {
  const source = createActor("month", { branch: context.month.branch });
  return context.yaos.flatMap((yao) => {
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const trace = createSKCHTrace("月建", source, target);
    return trace ? [trace] : [];
  });
}

// 日辰
function dayInfluenceRule(context: RuleContext): RuleTrace[] {
  const source = createActor("day", { branch: context.day.branch });
  return context.yaos.flatMap((yao) => {
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const trace = createSKCHTrace("日辰", source, target);
    return trace ? [trace] : [];
  });
}

// 动爻
function movingYaoRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap((yao) => {
    if (!yao.isMoving && !yao.isDarkMoving) return [];
    const source = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: yao.isDarkMoving
        ? `${YAO_NAMES[yao.position]}暗动`
        : YAO_NAMES[yao.position],
    });
    return context.yaos.flatMap((targetYao) => {
      if (targetYao.position === yao.position) return [];
      const target = createActor("yao", {
        position: targetYao.position,
        branch: targetYao.branch,
      });
      const trace = createSKCHTrace("动爻", source, target);
      return trace ? [trace] : [];
    });
  });
}

// 变出之爻回头生克冲合
function backInfluenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap((yao) => {
    if (!yao.isMoving) return [];
    const trace = createSKCHTrace(
      "回头",
      createActor("changedYao", {
        position: yao.position,
        branch: yao.changedBranch,
      }),
      createActor("yao", {
        position: yao.position,
        branch: yao.branch,
      }),
    );
    return trace ? [trace] : [];
  });
}

// 三合局
function sanHeRule(context: RuleContext): RuleTrace[] {
  const participants = createSanHeParticipants(context);

  return SAN_HE_GROUPS.flatMap((group) => {
    const selected = group.branches
      .map((branch) => selectSanHeParticipant(branch, participants))
      .filter((participant): participant is SanHeParticipant =>
        Boolean(participant),
      );

    if (selected.length !== group.branches.length) return [];
    if (!selected.some((participant) => participant.isActivatedByYao)) {
      return [];
    }

    const actors = selected.map((participant) => participant.actor);
    const targetActors = selected
      .filter((participant) => participant.isYaoRelated)
      .map((participant) => participant.actor);

    return [
      {
        title: `三合${group.element}局`,
        source: actors,
        target: targetActors.length > 0 ? targetActors : actors,
        effect: "三合局",
        score: 3,
        reason: `${group.branches.join("、")}三支齐备，合成${group.element}局，主多方聚合、合伙促成或长期成势`,
      },
    ];
  });
}

// 旬空
function voidBranchRule(context: RuleContext): RuleResult {
  const source = createActor("void", { voidBranches: context.voidBranches });
  return context.yaos.flatMap((yao) => {
    if (!context.voidBranches.includes(yao.branch)) return [];
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    return [
      {
        title: "旬空",
        source,
        target,
        effect: "空亡",
        score: -2,
        reason: `${target.label}[${target.be_pair}]逢旬空`,
      },
    ];
  });
}

// 六亲互化参考：仅为详情补充说明，不改变实际作用关系
function relativeChangeReferenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap((yao) => {
    if (!yao.isMoving) return [];

    const source = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: `${YAO_NAMES[yao.position]}${yao.relative}`,
    });
    const target = createActor("changedYao", {
      position: yao.position,
      branch: yao.changedBranch,
      label: `${YAO_NAMES[yao.position]}变${yao.changedRelative}`,
    });

    return [
      {
        title: `${yao.relative}化${yao.changedRelative}`,
        source,
        target,
        effect: "参考",
        score: 0,
        reason: getRelativeChangeReference(yao.relative, yao.changedRelative),
      },
    ];
  });
}

// 爻位取象参考：按当前占事范畴给每个爻补充象意提示
function yaoPositionReferenceRule(context: RuleContext): RuleTrace[] {
  if (!context.yaoPositionCategory) return [];

  return context.yaos.map((yao) => {
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return {
      title: `${YAO_NAMES[yao.position]}爻位取象`,
      source: actor,
      target: actor,
      effect: "参考",
      score: 0,
      reason: `本卦范畴为「${context.yaoPositionCategory}」，${actor.label}可参考：${getYaoPositionImage(context.yaoPositionCategory, yao.position)}`,
    };
  });
}

// 六神取象参考：按每个爻所临六神补充象意提示
function sixSpiritReferenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.map((yao) => {
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: `${YAO_NAMES[yao.position]}${yao.spirit}`,
    });

    return {
      title: `${yao.spirit}取象`,
      source: actor,
      target: actor,
      effect: "参考",
      score: 0,
      reason: `${actor.label}临${yao.spirit}，可参考：${getSixSpiritImage(yao.spirit)}`,
    };
  });
}

function createSanHeParticipants(context: RuleContext): SanHeParticipant[] {
  const participants: SanHeParticipant[] = [];

  context.yaos.forEach((yao) => {
    if (
      (yao.isMoving || yao.isDarkMoving) &&
      !isYaoBrokenForSanHe(yao, context)
    ) {
      participants.push({
        branch: yao.branch,
        element: yao.element,
        actor: createActor("yao", {
          position: yao.position,
          branch: yao.branch,
          label: yao.isDarkMoving
            ? `${YAO_NAMES[yao.position]}暗动`
            : YAO_NAMES[yao.position],
        }),
        priority: yao.isDarkMoving ? 2 : 1,
        isYaoRelated: true,
        isActivatedByYao: true,
      });
    }

    if (yao.isMoving && !isBranchBrokenForSanHe(yao.changedBranch, context)) {
      participants.push({
        branch: yao.changedBranch,
        element: yao.changedElement,
        actor: createActor("changedYao", {
          position: yao.position,
          branch: yao.changedBranch,
        }),
        priority: 3,
        isYaoRelated: true,
        isActivatedByYao: true,
      });
    }

    if (
      !yao.isMoving &&
      !yao.isDarkMoving &&
      isYaoValuedByDayOrMonth(yao, context) &&
      !isYaoBrokenForSanHe(yao, context)
    ) {
      participants.push({
        branch: yao.branch,
        element: yao.element,
        actor: createActor("yao", {
          position: yao.position,
          branch: yao.branch,
          label: `${YAO_NAMES[yao.position]}${getValuedLabel(yao, context)}`,
        }),
        priority: 4,
        isYaoRelated: true,
        isActivatedByYao: false,
      });
    }
  });

  participants.push({
    branch: context.day.branch,
    element: context.day.element,
    actor: createActor("day", { branch: context.day.branch }),
    priority: 5,
    isYaoRelated: false,
    isActivatedByYao: false,
  });

  participants.push({
    branch: context.month.branch,
    element: context.month.element,
    actor: createActor("month", { branch: context.month.branch }),
    priority: 6,
    isYaoRelated: false,
    isActivatedByYao: false,
  });

  return participants;
}

function selectSanHeParticipant(
  branch: BranchName,
  participants: SanHeParticipant[],
): SanHeParticipant | null {
  return (
    participants
      .filter((participant) => participant.branch === branch)
      .sort((a, b) => a.priority - b.priority)[0] ?? null
  );
}

function isYaoValuedByDayOrMonth(
  yao: RuleYaoContext,
  context: RuleContext,
): boolean {
  return (
    yao.branch === context.day.branch || yao.branch === context.month.branch
  );
}

function getValuedLabel(yao: RuleYaoContext, context: RuleContext): string {
  if (yao.branch === context.day.branch) return "值日";
  return "值月";
}

function isYaoBrokenForSanHe(
  yao: Pick<RuleYaoContext, "branch" | "element" | "isMoving" | "isDarkMoving">,
  context: RuleContext,
): boolean {
  if (
    !yao.isMoving &&
    !yao.isDarkMoving &&
    isBranchClash(context.day.branch, yao.branch) &&
    !isElementProsperousByMonth(yao.element, context.month.element)
  ) {
    return true;
  }

  return isBranchBrokenForSanHe(yao.branch, context);
}

function isBranchBrokenForSanHe(
  branch: BranchName,
  context: RuleContext,
): boolean {
  if (!context.voidBranches.includes(branch)) return false;

  const element = new BE_pair(branch).element;
  return (
    isElementControlling(context.day.element, element) ||
    isElementControlling(context.month.element, element)
  );
}

function createSKCHTrace(
  source: "月建" | "日辰" | "动爻" | "回头",
  sourceActor: RuleActor,
  targetActor: RuleActor,
): RuleTrace | null {
  if (!sourceActor.be_pair || !targetActor.be_pair) return null;

  const sourceBE = sourceActor.be_pair;
  const targetBE = targetActor.be_pair;
  const skch = compareYaoForSKCH(sourceBE.branch, targetBE.branch);

  if (skch === "无") return null;

  return {
    title: getSKCHTitle(source, skch),
    source: sourceActor,
    target: targetActor,
    effect: skch,
    score: getSKCHScore(skch),
    reason: getSKCHReason(
      source,
      skch,
      sourceActor,
      targetActor,
      sourceBE,
      targetBE,
    ),
  };
}

function getSKCHTitle(
  source: "月建" | "日辰" | "动爻" | "回头",
  skch: Exclude<SKCHEffect, "无">,
): string {
  if (source === "月建" && skch === "冲") return "月破";
  if (source === "回头") return `${source}${skch}`;
  return `${source}${skch}`;
}

function getSKCHScore(skch: Exclude<SKCHEffect, "无">): number {
  if (skch === "生") return 2;
  if (skch === "合") return 1;
  if (skch === "克") return -1;
  return -2;
}

function getSKCHReason(
  source: "月建" | "日辰" | "动爻" | "回头",
  skch: Exclude<SKCHEffect, "无">,
  sourceActor: RuleActor,
  targetActor: RuleActor,
  sourceBE: BE_pair,
  targetBE: BE_pair,
): string {
  if (source === "月建" && skch === "冲") {
    return `${targetActor.label}[${targetBE}]被${sourceActor.label}[${sourceBE}]冲破`;
  }
  if (source === "回头") {
    return `${sourceActor.label}[${sourceBE}]回头${skch}${targetActor.label}[${targetBE}]`;
  }
  if (skch === "克") {
    return `${targetActor.label}[${targetBE}]被${sourceActor.label}[${sourceBE}]克`;
  }
  return `${sourceActor.label}[${sourceBE}]${skch}${targetActor.label}[${targetBE}]`;
}

function isElementProsperousByMonth(
  element: ElementName,
  monthElement: ElementName,
): boolean {
  return (
    element === monthElement || FIVE_ELEMENT_GENERATES[monthElement] === element
  );
}

function isElementControlling(
  sourceElement: ElementName,
  targetElement: ElementName,
): boolean {
  return FIVE_ELEMENT_CONTROLS[sourceElement] === targetElement;
}

function createActor(
  kind: RuleActorKind,
  options: CreateActorOptions = {},
): RuleActor {
  if (kind === "month") {
    return {
      id: "month",
      kind,
      label: options.label ?? "月建",
      be_pair: options.branch ? new BE_pair(options.branch) : undefined,
    };
  }

  if (kind === "day") {
    return {
      id: "day",
      kind,
      label: options.label ?? "日辰",
      be_pair: options.branch ? new BE_pair(options.branch) : undefined,
    };
  }

  if (kind === "void") {
    return {
      id: "void",
      kind,
      label: options.label ?? `旬空(${options.voidBranches?.join("") ?? ""})`,
    };
  }

  const position = options.position ?? 0;
  const defaultLabel =
    kind === "changedYao" ? `${YAO_NAMES[position]}变` : YAO_NAMES[position];

  return {
    id: kind === "changedYao" ? `changed-yao-${position}` : `yao-${position}`,
    kind,
    label: options.label ?? defaultLabel,
    position,
    be_pair: options.branch ? new BE_pair(options.branch) : undefined,
  };
}
