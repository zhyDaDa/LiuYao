import type {
  BranchName,
  ElementName,
  LifeStageName,
  StemName,
} from "../../types/basicTerms";
import {
  FIVE_ELEMENT_CONTROLS,
  FIVE_ELEMENT_GENERATES,
  LIFE_STAGE_BRANCHES,
} from "../../types/basicTerms";
import { compareYaoForSKCH } from "../../utils/SKCH";
import {
  FOUNDATION_SCORE,
  HORSE_BRANCH_GROUPS,
  LIFE_STAGE_SCORES,
  MOVING_SCORE,
  PROGRESSIVE_BRANCH_PAIRS,
  TIAN_XI_BY_SEASON,
} from "./constants";
import type { RuleContext, RuleYaoContext, SKCHSource } from "./types";

export function getDefaultSourceScore(source: SKCHSource): number {
  if (source === "月建" || source === "日辰") return FOUNDATION_SCORE;
  return MOVING_SCORE;
}

export function isYaoStrongForDayClash(
  yao: Pick<RuleYaoContext, "branch" | "element" | "isMoving" | "isDarkMoving">,
  context?: RuleContext,
): boolean {
  if (!context) return false;
  if (context.voidBranches.includes(yao.branch)) return true;
  if (yao.isMoving || yao.isDarkMoving) return true;
  return getYaoFoundationScore(yao, context) > 0;
}

export function getActiveYaoScore(
  yao: Pick<RuleYaoContext, "branch" | "element" | "isMoving" | "isDarkMoving">,
  context: RuleContext,
): number {
  const foundation = getYaoFoundationScore(yao, context);
  const adjusted = MOVING_SCORE + Math.round(foundation / 4);
  return Math.max(1, Math.min(FOUNDATION_SCORE, adjusted));
}

export function getChangedYaoScore(
  yao: RuleYaoContext,
  context: RuleContext,
): number {
  return getActiveYaoScore(
    {
      branch: yao.changedBranch,
      element: yao.changedElement,
      isMoving: true,
      isDarkMoving: false,
    },
    context,
  );
}

export function getYaoFoundationScore(
  yao: Pick<RuleYaoContext, "branch" | "element">,
  context: RuleContext,
): number {
  let score = 0;

  score += getBranchFoundationScore(
    context.month.branch,
    context.month.element,
    yao,
  );
  score += getBranchFoundationScore(
    context.day.branch,
    context.day.element,
    yao,
  );

  const dayStage = getLifeStage(yao.element, context.day.branch);
  if (dayStage) score += LIFE_STAGE_SCORES[dayStage];

  if (context.voidBranches.includes(yao.branch)) {
    score -= FOUNDATION_SCORE;
  }

  return score;
}

export function getBranchFoundationScore(
  sourceBranch: BranchName,
  sourceElement: ElementName,
  yao: Pick<RuleYaoContext, "branch" | "element">,
): number {
  const skch = compareYaoForSKCH(sourceBranch, yao.branch);

  if (sourceBranch === yao.branch) return FOUNDATION_SCORE;
  if (sourceElement === yao.element) return FOUNDATION_SCORE - 2;
  if (skch === "生") return FOUNDATION_SCORE;
  if (skch === "合") return FOUNDATION_SCORE - 2;
  if (skch === "克" || skch === "冲") return -FOUNDATION_SCORE;

  return 0;
}

export function getLifeStage(
  element: ElementName,
  branch: BranchName,
): LifeStageName | null {
  const stage = (
    Object.keys(LIFE_STAGE_BRANCHES[element]) as LifeStageName[]
  ).find((stageName) => LIFE_STAGE_BRANCHES[element][stageName] === branch);

  return stage ?? null;
}

export function getLifeStageReason(stage: LifeStageName): string {
  if (stage === "长生") return "长生主有根、有来源，能渐起";
  if (stage === "帝旺") return "帝旺主势足、有力，生克作用更明显";
  if (stage === "墓") return "墓主收藏、困滞，旺者为库，衰者为困";
  return "绝主气断、无根，若无日月动爻生扶则力弱";
}

export function getProgressionDirection(
  branch: BranchName,
  changedBranch: BranchName,
): "进神" | "退神" | null {
  if (
    PROGRESSIVE_BRANCH_PAIRS.some(
      ([from, to]) => from === branch && to === changedBranch,
    )
  ) {
    return "进神";
  }

  if (
    PROGRESSIVE_BRANCH_PAIRS.some(
      ([from, to]) => from === changedBranch && to === branch,
    )
  ) {
    return "退神";
  }

  return null;
}

export function getGanZhiStem(ganZhi: string): StemName {
  return ganZhi[0] as StemName;
}

export function getHorseBranch(dayBranch: BranchName): BranchName {
  return (
    HORSE_BRANCH_GROUPS.find((group) => group.branches.includes(dayBranch))
      ?.horse ?? "寅"
  );
}

export function getTianXiBranch(monthBranch: BranchName): BranchName {
  return (
    TIAN_XI_BY_SEASON.find((season) => season.months.includes(monthBranch))
      ?.branch ?? "戌"
  );
}

export function isElementProsperousByMonth(
  element: ElementName,
  monthElement: ElementName,
): boolean {
  return (
    element === monthElement || FIVE_ELEMENT_GENERATES[monthElement] === element
  );
}

export function isElementControlling(
  sourceElement: ElementName,
  targetElement: ElementName,
): boolean {
  return FIVE_ELEMENT_CONTROLS[sourceElement] === targetElement;
}
