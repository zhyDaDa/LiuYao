import { LIFE_STAGE_SCORES, FOUNDATION_SCORE } from "./constants";
import { createActor } from "./actors";
import { createSKCHTrace } from "./skch";
import { getLifeStage, getLifeStageReason } from "./scoring";
import type {
  Rule,
  RuleContext,
  RuleEntry,
  RuleResult,
  RuleTrace,
} from "./types";
import { isBranchClash, isBranchHarmony } from "../../utils/SKCH";
import { BE_pair } from "../../utils/branch2Element";

export const foundationRuleSet: RuleEntry<Rule>[] = [
  [
    monthInfluenceRule,
    "月建生克冲合：月建为一月纲领，基础权重按 8 处理；月建冲爻为月破，生合比扶则扶起衰弱。",
  ],
  [
    dayInfluenceRule,
    "日辰生克冲合：日辰与月建同功，基础权重按 8 处理；日冲旺静为暗动，冲衰静为日破，冲空则实。",
  ],
  [
    dayMonthValueRule,
    "日月入卦与比扶：爻值月建、日辰则得令有权；与日月同类且不被冲破者，作比扶参考。",
  ],
  [
    lifeStageRule,
    "长生帝旺墓绝：按日辰判断各爻五行临长生、帝旺、墓、绝；旺衰仍需合看日月动爻。",
  ],
  [
    voidBranchRule,
    "旬空：本爻地支落入当前旬空时先按空亡处理；若被日辰冲起，则按冲空则实提示。",
  ],
  [
    breakHarmonyRule,
    "合处逢冲：爻被月建合住，又遇日辰冲开时，提示合被打开；吉凶仍需看被冲开者是用神还是忌神。",
  ],
];

function monthInfluenceRule(context: RuleContext): RuleTrace[] {
  const source = createActor("month", { branch: context.month.branch });
  return context.yaos.flatMap<RuleTrace>((yao) => {
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const trace = createSKCHTrace("月建", source, target);
    return trace ? [trace] : [];
  });
}

function dayInfluenceRule(context: RuleContext): RuleTrace[] {
  const source = createActor("day", { branch: context.day.branch });
  return context.yaos.flatMap<RuleTrace>((yao) => {
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const trace = createSKCHTrace("日辰", source, target, {
      context,
      targetYao: yao,
    });
    return trace ? [trace] : [];
  });
}

function dayMonthValueRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const traces: RuleTrace[] = [];

    if (yao.branch === context.month.branch) {
      traces.push({
        title: "临月建",
        source: createActor("month", { branch: context.month.branch }),
        target,
        effect: "值月",
        score: FOUNDATION_SCORE,
        reason: `${target.label}[${target.be_pair}]值月建，旺相当权；若发动或作元忌，用力更重`,
      });
    } else if (
      yao.element === context.month.element &&
      !isBranchClash(context.month.branch, yao.branch)
    ) {
      traces.push({
        title: "月令比扶",
        source: createActor("month", { branch: context.month.branch }),
        target,
        effect: "比扶",
        score: FOUNDATION_SCORE - 2,
        reason: `${target.label}[${target.be_pair}]与月建同类，得月令比扶`,
      });
    }

    if (yao.branch === context.day.branch) {
      traces.push({
        title: "临日辰",
        source: createActor("day", { branch: context.day.branch }),
        target,
        effect: "值日",
        score: FOUNDATION_SCORE,
        reason: `${target.label}[${target.be_pair}]值日辰，四时俱旺；逢月破、动克仍须合看众力`,
      });
    } else if (
      yao.element === context.day.element &&
      !isBranchClash(context.day.branch, yao.branch)
    ) {
      traces.push({
        title: "日辰比扶",
        source: createActor("day", { branch: context.day.branch }),
        target,
        effect: "比扶",
        score: FOUNDATION_SCORE - 2,
        reason: `${target.label}[${target.be_pair}]与日辰同类，得日辰比扶`,
      });
    }

    return traces;
  });
}

function lifeStageRule(context: RuleContext): RuleTrace[] {
  const source = createActor("day", { branch: context.day.branch });

  return context.yaos.flatMap<RuleTrace>((yao) => {
    const stage = getLifeStage(yao.element, context.day.branch);
    if (!stage) return [];

    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: `日辰${stage}`,
        source,
        target,
        effect: stage,
        score: LIFE_STAGE_SCORES[stage],
        reason: `${target.label}[${target.be_pair}]之${yao.element}临${source.label}[${source.be_pair}]为${stage}；${getLifeStageReason(stage)}`,
      },
    ];
  });
}

function voidBranchRule(context: RuleContext): RuleResult {
  const source = createActor("void", { voidBranches: context.voidBranches });
  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!context.voidBranches.includes(yao.branch)) return [];
    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });
    const isVoidFilled = isBranchClash(context.day.branch, yao.branch);

    return [
      {
        title: isVoidFilled ? "冲空则实" : "旬空",
        source,
        target,
        effect: isVoidFilled ? "冲实" : "空亡",
        score: isVoidFilled ? FOUNDATION_SCORE : -FOUNDATION_SCORE,
        reason: isVoidFilled
          ? `${target.label}[${target.be_pair}]逢旬空，又被日辰[${new BE_pair(context.day.branch)}]冲起，按冲空则实提示`
          : `${target.label}[${target.be_pair}]逢旬空，主虚、未实、待填；旺空动空仍须待出空或填实`,
      },
    ];
  });
}

function breakHarmonyRule(context: RuleContext): RuleTrace[] {
  const source = createActor("day", { branch: context.day.branch });

  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!isBranchHarmony(context.month.branch, yao.branch)) return [];
    if (!isBranchClash(context.day.branch, yao.branch)) return [];

    const target = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: "合处逢冲",
        source,
        target,
        effect: "冲开",
        score: 2,
        reason: `${target.label}[${target.be_pair}]先与月建[${new BE_pair(context.month.branch)}]作合，又遇日辰[${new BE_pair(context.day.branch)}]冲开；吉神合住不喜冲，凶神合住反喜冲，须随用神判断`,
      },
    ];
  });
}
