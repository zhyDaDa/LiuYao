import type { CalendarInfo } from "./Calendar";
import type {
  BranchName,
  ElementName,
  SKCHEffect,
  TrigramName,
  VoidBranches,
} from "../types/basicTerms";
import { FIVE_ELEMENT_CONTROLS, FIVE_ELEMENT_GENERATES } from "../types/basicTerms";
import type { YaoSnapshot } from "./Gua";

export interface RuleTrace {
  title: string;
  effect: number;
  reason: string;
}

export interface RuleYaoContext {
  position: number;
  branch: BranchName;
  element: ElementName;
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
function monthInfluenceRule(context: RuleContext): RuleTrace {
  return compareElement("月建", context.month.element, context.yao.element);
}

// 日辰
function dayInfluenceRule(context: RuleContext): RuleTrace {
  return compareElement("日辰", context.day.element, context.yao.element);
}

// 动爻
function movingYaoRule(context: RuleContext): RuleResult {
  if (!context.yao.isMoving) return null;
  return {
    title: "动爻",
    effect: 1,
    reason: "本爻发动，有主动变化之力。",
  };
}

// 变出之爻回头生克冲合

// 旬空
function voidBranchRule(context: RuleContext): RuleResult {
  if (!context.voidBranches.includes(context.yao.branch)) return null;
  return {
    title: "旬空",
    effect: -2,
    reason: `[${context.yao.branch}]落入旬空，当前力量暂不落实。`,
  };
}

export function compareYaoForSKCH(
  sourceYao: YaoSnapshot,
  targetYao: YaoSnapshot,
): SKCH_Effect {
  if (FIVE_ELEMENT_GENERATES[sourceYao.element] === targetYao.element) {
    return "生";
  }
  if (FIVE_ELEMENT_CONTROLS[sourceYao.element] === targetYao.element) {
    return "克";
  }
  if (FIVE_ELEMENT_GENERATES[targetYao.element] === sourceYao.element) {
    return "冲";
  }
  if (FIVE_ELEMENT_CONTROLS[targetYao.element] === sourceYao.element) {
    return "合";
  } else {
    return "无";
  }
}

function compareElement(
  source: string,
  sourceElement: ElementName,
  targetElement: ElementName,
): RuleTrace {
  if (FIVE_ELEMENT_GENERATES[sourceElement] === targetElement) {
    return {
      title: source,
      effect: 2,
      reason: `${source}${sourceElement}生本爻${targetElement}，有生扶之力。`,
    };
  }
  if (FIVE_ELEMENT_CONTROLS[sourceElement] === targetElement) {
    return {
      title: source,
      effect: -2,
      reason: `${source}${sourceElement}克本爻${targetElement}，受制较重。`,
    };
  }
  return {
    title: source,
    effect: 0,
    reason: `本爻${targetElement}与${source}${sourceElement}无关。`,
  };
}
