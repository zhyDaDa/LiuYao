import type { CalendarInfo } from "./Calendar";
import type {
  BranchName,
  ElementName,
  SKCHEffect,
  TrigramName,
  VoidBranches,
} from "../types/basicTerms";
import { compareYaoForSKCH } from "../utils/SKCH";
import { BE_pair } from "../utils/branch2Element";

export interface RuleTrace {
  title: string;
  effect: number;
  reason: string;
}

export interface RuleYaoContext {
  position: number;
  branch: BranchName;
  element: ElementName;
  changedBranch: BranchName;
  changedElement: ElementName;
  isMoving: boolean;
}

export interface RuleContext {
  calendar: CalendarInfo;
  palace: TrigramName;
  palaceElement: ElementName;
  changedPalace: TrigramName;
  changedPalaceElement: ElementName;
  yaos: RuleYaoContext[];
  yao: RuleYaoContext;
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

// notice: 规则登记顺序
export const yaoStrengthRules: Rule[] = [
  monthInfluenceRule,
  dayInfluenceRule,
  movingYaoRule,
  backInfluenceRule,
  voidBranchRule,
];

export function evaluateYaoRules(context: RuleContext): RuleTrace[] {
  return yaoStrengthRules.flatMap((rule) => {
    const result = rule(context);
    if (!result) return [];
    return Array.isArray(result) ? result : [result];
  });
}

// 生克冲合

// 月建
function monthInfluenceRule(context: RuleContext): RuleTrace | null {
  return createSKCHTrace("月建", context.month.branch, context.yao.branch);
}

// 日辰
function dayInfluenceRule(context: RuleContext): RuleTrace | null {
  return createSKCHTrace("日辰", context.day.branch, context.yao.branch);
}

// 动爻
function movingYaoRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap((yao) => {
    if (!yao.isMoving || yao.position === context.yao.position) return [];
    const trace = createSKCHTrace("动爻", yao.branch, context.yao.branch);
    return trace ? [trace] : [];
  });
}

// 变出之爻回头生克冲合
function backInfluenceRule(context: RuleContext): RuleTrace | null {
  if (!context.yao.isMoving) return null;
  return createSKCHTrace("回头", context.yao.changedBranch, context.yao.branch);
}

// 旬空
function voidBranchRule(context: RuleContext): RuleResult {
  if (!context.voidBranches.includes(context.yao.branch)) return null;
  const yaoBE = new BE_pair(context.yao.branch);
  return {
    title: "旬空",
    effect: -2,
    reason: `[${yaoBE}]逢旬空`,
  };
}

function createSKCHTrace(
  source: "月建" | "日辰" | "动爻" | "回头",
  sourceBranch: BranchName,
  targetBranch: BranchName,
): RuleTrace | null {
  const sourceBE = new BE_pair(sourceBranch);
  const targetBE = new BE_pair(targetBranch);
  const skch = compareYaoForSKCH(sourceBE.branch, targetBE.branch);

  if (skch === "无") return null;

  return {
    title: getSKCHTitle(source, skch),
    effect: getSKCHEffect(skch),
    reason: getSKCHReason(source, skch, sourceBE, targetBE),
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

function getSKCHEffect(skch: Exclude<SKCHEffect, "无">): number {
  if (skch === "生") return 2;
  if (skch === "合") return 1;
  if (skch === "克") return -1;
  return -2;
}

function getSKCHReason(
  source: "月建" | "日辰" | "动爻" | "回头",
  skch: Exclude<SKCHEffect, "无">,
  sourceBE: BE_pair,
  targetBE: BE_pair,
): string {
  if (source === "月建" && skch === "冲") {
    return `[${targetBE}]被月建[${sourceBE}]冲破`;
  }
  if (source === "回头") {
    return `[${sourceBE}]回头${skch}[${targetBE}]`;
  }
  if (skch === "克") {
    return `[${targetBE}]被${source}[${sourceBE}]克`;
  }
  return `${source}[${sourceBE}]${skch}[${targetBE}]`;
}
