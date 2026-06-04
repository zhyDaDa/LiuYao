import type { CalendarInfo } from "./Calendar";
import type {
  BranchName,
  ElementName,
  SKCHEffect,
  TrigramName,
  VoidBranches,
} from "../types/basicTerms";
import { YAO_NAMES } from "../types/basicTerms";
import { compareYaoForSKCH, isBranchClash } from "../utils/SKCH";
import { BE_pair } from "../utils/branch2Element";

// 作用的主体
export type RuleActorKind = "yao" | "changedYao" | "month" | "day" | "void";
export type RuleEffect = Exclude<SKCHEffect, "无"> | "空亡" | "暗动";

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
  branch: BranchName;
  element: ElementName;
  changedBranch: BranchName;
  changedElement: ElementName;
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
}

export type RuleResult = RuleTrace | RuleTrace[] | null;
export type Rule = (context: RuleContext) => RuleResult;
export type ContextRule = (context: RuleContext) => RuleEvaluation;
export type RuleEntry<T> = readonly [rule: T, explanation: string];

export interface RuleEvaluation {
  context: RuleContext;
  traces: RuleTrace[];
}

// notice: 前置规则
export const contextRules: RuleEntry<ContextRule>[] = [
  [
    darkMovingRule,
    "暗动：静爻被月建冲起时，先标记为暗动，让它在后续规则中作为有效动爻发生作用。",
  ],
];

// notice: 规则登记顺序
export const ruleSet: RuleEntry<Rule>[] = [
  [
    monthInfluenceRule,
    "月建生克冲合：判断月建对每一爻的生、克、冲、合影响；月建冲爻时记为月破。",
  ],
  [
    dayInfluenceRule,
    "日辰生克冲合：判断日辰对每一爻的生、克、冲、合影响。",
  ],
  [
    movingYaoRule,
    "动爻作用：明动爻和暗动爻会作为作用方，对其他爻产生生、克、冲、合关系。",
  ],
  [
    backInfluenceRule,
    "回头生克冲合：明动爻的变出之爻会回头作用本爻，产生生、克、冲、合关系。",
  ],
  [
    voidBranchRule,
    "旬空：本爻地支落入当前旬空时，标记为空亡并降低参考分。",
  ],
];

export const enabledRuleExplanations = [
  ...contextRules.map(([, explanation]) => explanation),
  ...ruleSet.map(([, explanation]) => explanation),
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
    ],
  };
}

export function isTraceTargetingYao(
  trace: RuleTrace,
  position: number,
): boolean {
  const targets = Array.isArray(trace.target) ? trace.target : [trace.target];
  return targets.some(
    (actor) => actor.kind === "yao" && actor.position === position,
  );
}

// 暗动：静爻被月建冲起，先转成后续规则可识别的有效动爻
function darkMovingRule(context: RuleContext): RuleEvaluation {
  const source = createActor("month", { branch: context.month.branch });
  const traces: RuleTrace[] = [];
  const yaos = context.yaos.map((yao) => {
    if (yao.isMoving || yao.isDarkMoving) return yao;
    if (!isBranchClash(context.month.branch, yao.branch)) return yao;

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
      reason: `${target.label}[${target.be_pair}]静而受${source.label}[${source.be_pair}]冲，作暗动论`,
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
