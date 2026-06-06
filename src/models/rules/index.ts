import { foundationRuleSet } from "./foundationRules";
import { contextRules, movingRuleSet } from "./movingRules";
import { referenceRules } from "./referenceRules";
import { sanHeRuleSet } from "./sanHeRule";
import type { Rule, RuleEntry } from "./types";

export { contextRules } from "./movingRules";
export { referenceRules } from "./referenceRules";
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
} from "./types";

export const consequentialRuleSet: RuleEntry<Rule>[] = [
  ...movingRuleSet,
  ...sanHeRuleSet,
];

export const ruleSet: RuleEntry<Rule>[] = [
  ...foundationRuleSet,
  ...consequentialRuleSet,
];

export const enabledRuleExplanations = [
  ...foundationRuleSet.map(([, explanation]) => explanation),
  ...contextRules.map(([, explanation]) => explanation),
  ...consequentialRuleSet.map(([, explanation]) => explanation),
  ...referenceRules.map(([, explanation]) => explanation),
];

export function getFoundationRuleSet(): RuleEntry<Rule>[] {
  return foundationRuleSet;
}

export function getConsequentialRuleSet(): RuleEntry<Rule>[] {
  return consequentialRuleSet;
}
