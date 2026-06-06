import { YAO_NAMES } from "../../types/basicTerms";
import { isBranchClash } from "../../utils/SKCH";
import { createActor } from "./actors";
import { LIFE_STAGE_SCORES } from "./constants";
import {
  getActiveYaoScore,
  getChangedYaoScore,
  getLifeStage,
  getLifeStageReason,
  getProgressionDirection,
  isYaoStrongForDayClash,
} from "./scoring";
import { createSKCHTrace } from "./skch";
import type {
  ContextRule,
  Rule,
  RuleContext,
  RuleEntry,
  RuleEvaluation,
  RuleTrace,
} from "./types";

export const contextRules: RuleEntry<ContextRule>[] = [
  [
    darkMovingRule,
    "暗动：旺相静爻、旬空逢日冲之爻，被日辰冲起时先标记为暗动，让它在后续规则中作为有效动爻发生作用；休囚被日冲作日破。",
  ],
];

export const movingRuleSet: RuleEntry<Rule>[] = [
  [
    movingYaoRule,
    "动爻作用：明动爻和暗动爻会作为作用方，对其他爻产生生、克、冲、合关系；基础权重按 4，并随动爻自身日月空破力量浮动。",
  ],
  [
    backInfluenceRule,
    "回头生克冲合：明动爻的变出之爻会回头作用本爻，产生生、克、冲、合关系；变爻力量也参考日月空破。",
  ],
  [
    progressionRule,
    "进神退神：动爻化进主渐进增强，化退主渐退减力；须结合用神旺衰判断成败。",
  ],
  [
    changingLifeStageRule,
    "化长生帝旺墓绝：动爻化出的地支若为本爻五行长生、帝旺、墓、绝，提示动变趋势。",
  ],
];

function darkMovingRule(context: RuleContext): RuleEvaluation {
  const source = createActor("day", { branch: context.day.branch });
  const traces: RuleTrace[] = [];
  const yaos = context.yaos.map((yao) => {
    if (yao.isMoving || yao.isDarkMoving) return yao;
    if (!isBranchClash(context.day.branch, yao.branch)) return yao;
    if (!isYaoStrongForDayClash(yao, context)) {
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
      score: getActiveYaoScore(darkMovingYao, context),
      reason: `${target.label}[${target.be_pair}]静而有气，受${source.label}[${source.be_pair}]冲起，作暗动论；后续按有效动爻参与生克冲合`,
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

function movingYaoRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!yao.isMoving && !yao.isDarkMoving) return [];
    const source = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: yao.isDarkMoving
        ? `${YAO_NAMES[yao.position]}暗动`
        : YAO_NAMES[yao.position],
    });
    return context.yaos.flatMap<RuleTrace>((targetYao) => {
      if (targetYao.position === yao.position) return [];
      const target = createActor("yao", {
        position: targetYao.position,
        branch: targetYao.branch,
      });
      const trace = createSKCHTrace("动爻", source, target, {
        context,
        targetYao,
        scoreBase: getActiveYaoScore(yao, context),
      });
      return trace ? [trace] : [];
    });
  });
}

function backInfluenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
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
      {
        context,
        targetYao: yao,
        scoreBase: getChangedYaoScore(yao, context),
      },
    );
    return trace ? [trace] : [];
  });
}

function progressionRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!yao.isMoving) return [];

    const direction = getProgressionDirection(yao.branch, yao.changedBranch);
    if (!direction) return [];

    const source = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const target = createActor("changedYao", {
      position: yao.position,
      branch: yao.changedBranch,
    });
    const isProgressive = direction === "进神";

    return [
      {
        title: direction,
        source,
        target,
        effect: direction,
        score: isProgressive
          ? getActiveYaoScore(yao, context)
          : -getActiveYaoScore(yao, context),
        reason: `${source.label}[${source.be_pair}]发动化${target.label}[${target.be_pair}]，为${direction}；进主渐增，退主渐减，仍须看其对用神有益或有害`,
      },
    ];
  });
}

function changingLifeStageRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!yao.isMoving) return [];

    const stage = getLifeStage(yao.element, yao.changedBranch);
    if (!stage) return [];

    const source = createActor("changedYao", {
      position: yao.position,
      branch: yao.changedBranch,
    });
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: `化${stage}`,
        source,
        target,
        effect: stage,
        score: LIFE_STAGE_SCORES[stage],
        reason: `${target.label}[${target.be_pair}]发动化出${source.label}[${source.be_pair}]，为本爻${yao.element}之${stage}；${getLifeStageReason(stage)}`,
      },
    ];
  });
}
