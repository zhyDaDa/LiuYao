import { isBranchClash } from "../../utils/SKCH";
import { BE_pair } from "../../utils/branch2Element";
import type { BranchName } from "../../types/basicTerms";
import { YAO_NAMES } from "../../types/basicTerms";
import { createActor } from "./actors";
import { SAN_HE_GROUPS, SAN_HE_SCORE } from "./constants";
import { isElementControlling, isElementProsperousByMonth } from "./scoring";
import type {
  Rule,
  RuleContext,
  RuleEntry,
  RuleTrace,
  RuleYaoContext,
  SanHeParticipant,
} from "./types";

export const sanHeRuleSet: RuleEntry<Rule>[] = [
  [
    sanHeRule,
    "三合局：明动、暗动、动爻变爻、日辰、月建凑齐亥卯未、寅午戌、巳酉丑、申子辰时成局；日月入局则局旺，日破与旬空被克之爻不入局。",
  ],
];

function sanHeRule(context: RuleContext): RuleTrace[] {
  const participants = createSanHeParticipants(context);

  return SAN_HE_GROUPS.flatMap<RuleTrace>((group) => {
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
        score:
          SAN_HE_SCORE +
          selected.filter((participant) => !participant.isYaoRelated).length,
        reason: `${group.branches.join("、")}三支齐备，合成${group.element}局，主多方聚合、合伙促成或长期成势；日月入局则局旺，局生克谁须结合用神、世应再断`,
      },
    ];
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
  branch: RuleYaoContext["branch"],
  context: RuleContext,
): boolean {
  if (!context.voidBranches.includes(branch)) return false;

  const element = new BE_pair(branch).element;
  return (
    isElementControlling(context.day.element, element) ||
    isElementControlling(context.month.element, element)
  );
}
