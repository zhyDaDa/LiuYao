import type { CalendarInfo } from "./Calendar";
import type { ElementName } from "./Gua";

export interface RuleTrace {
  title: string;
  effect: number;
  reason: string;
}

export interface RuleYaoContext {
  position: number;
  branch: string;
  element: ElementName;
  isMoving: boolean;
}

export interface RuleContext {
  calendar: CalendarInfo;
  palace: string;
  palaceElement: ElementName;
  changedPalace: string;
  changedPalaceElement: ElementName;
  yaos: RuleYaoContext[];
  yao: RuleYaoContext;
  month: {
    branch: string;
    element: ElementName;
  };
  day: {
    branch: string;
    element: ElementName;
  };
  voidBranches: [string, string];
}

export type RuleResult = RuleTrace | RuleTrace[] | null;
export type Rule = (context: RuleContext) => RuleResult;

const GENERATES: Record<ElementName, ElementName> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const CONTROLS: Record<ElementName, ElementName> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

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

function monthInfluenceRule(context: RuleContext): RuleTrace {
  return compareElement("月令", context.month.element, context.yao.element);
}

function dayInfluenceRule(context: RuleContext): RuleTrace {
  return compareElement("日辰", context.day.element, context.yao.element);
}

function movingYaoRule(context: RuleContext): RuleResult {
  if (!context.yao.isMoving) return null;
  return {
    title: "动爻",
    effect: 1,
    reason: "本爻发动，有主动变化之力。",
  };
}

function voidBranchRule(context: RuleContext): RuleResult {
  if (!context.voidBranches.includes(context.yao.branch)) return null;
  return {
    title: "旬空",
    effect: -2,
    reason: `[${context.yao.branch}]落入旬空，当前力量暂不落实。`,
  };
}

function compareElement(
  source: string,
  sourceElement: ElementName,
  targetElement: ElementName,
): RuleTrace {
  if (sourceElement === targetElement) {
    return {
      title: source,
      effect: 2,
      reason: `${source}${sourceElement}与本爻同气，直接帮扶。`,
    };
  }
  if (GENERATES[sourceElement] === targetElement) {
    return {
      title: source,
      effect: 1,
      reason: `${source}${sourceElement}生本爻${targetElement}，有生扶之力。`,
    };
  }
  if (GENERATES[targetElement] === sourceElement) {
    return {
      title: source,
      effect: -1,
      reason: `本爻${targetElement}生${source}${sourceElement}，自身泄气。`,
    };
  }
  if (CONTROLS[sourceElement] === targetElement) {
    return {
      title: source,
      effect: -2,
      reason: `${source}${sourceElement}克本爻${targetElement}，受制较重。`,
    };
  }
  return {
    title: source,
    effect: 1,
    reason: `本爻${targetElement}克${source}${sourceElement}，有制物之力。`,
  };
}
