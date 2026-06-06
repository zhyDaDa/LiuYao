import {
  contextRules,
  enabledRuleExplanations,
  getConsequentialRuleSet,
  getFoundationRuleSet,
  referenceRules,
  ruleSet,
} from "./rules/index";
import type { RuleContext, RuleEvaluation, RuleTrace } from "./rules/index";

export { contextRules, enabledRuleExplanations, referenceRules, ruleSet };
export type {
  ContextRule,
  Rule,
  RuleActor,
  RuleActorKind,
  RuleContext,
  RuleEffect,
  RuleEntry,
  RuleEvaluation,
  RuleResult,
  RuleTrace,
  RuleYaoContext,
} from "./rules/index";

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
      ...getFoundationRuleSet().flatMap(([rule]) => {
        const result = rule(staged.context);
        if (!result) return [];
        return Array.isArray(result) ? result : [result];
      }),
      ...staged.traces,
      ...getConsequentialRuleSet().flatMap(([rule]) => {
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
