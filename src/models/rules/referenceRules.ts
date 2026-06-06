import { YAO_NAMES } from "../../types/basicTerms";
import { getRelativeChangeReference } from "../RelativeImages";
import { getSixSpiritImage } from "../SixSpiritImages";
import { getYaoPositionImage } from "../YaoPositionImages";
import { createActor } from "./actors";
import { LU_BRANCH_BY_STEM, NOBLE_BRANCHES_BY_STEM } from "./constants";
import { getGanZhiStem, getHorseBranch, getTianXiBranch } from "./scoring";
import type { Rule, RuleContext, RuleEntry, RuleTrace } from "./types";

export const referenceRules: RuleEntry<Rule>[] = [
  [
    singleMovingReferenceRule,
    "独发独静参考：一爻独动或一爻独静时提示其应事线索，但不可舍用神而专执独发独静。",
  ],
  [
    starSpiritReferenceRule,
    "星煞参考：仅取原书认为较验的贵人、禄神、驿马、天喜；不能独操祸福，必须附和用神旺相。",
  ],
  [
    relativeChangeReferenceRule,
    "六亲互化参考：动爻六亲化出变爻六亲时，提示变化过程和取象方向；此规则只作参考说明。",
  ],
  [
    yaoPositionReferenceRule,
    "爻位取象参考：按当前本卦范畴提示每个爻位可能对应的人事物象；此规则只作参考说明。",
  ],
  [
    sixSpiritReferenceRule,
    "六神取象参考：按每个爻所临六神提示可能对应的象意；此规则只作参考说明。",
  ],
];

function singleMovingReferenceRule(context: RuleContext): RuleTrace[] {
  const movingYaos = context.yaos.filter((yao) => yao.isMoving);
  const staticYaos = context.yaos.filter((yao) => !yao.isMoving);

  if (movingYaos.length === 1) {
    const yao = movingYaos[0];
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: "独发参考",
        source: actor,
        target: actor,
        effect: "参考",
        score: 0,
        reason: `${actor.label}[${actor.be_pair}]一爻独发，可作事机与应期线索；但吉凶仍须以用神旺衰、生克空破为主`,
      },
    ];
  }

  if (staticYaos.length === 1) {
    const yao = staticYaos[0];
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: "独静参考",
        source: actor,
        target: actor,
        effect: "参考",
        score: 0,
        reason: `${actor.label}[${actor.be_pair}]五动一静，可作事机与应期线索；不可离开用神独断吉凶`,
      },
    ];
  }

  return [];
}

function starSpiritReferenceRule(context: RuleContext): RuleTrace[] {
  const dayStem = getGanZhiStem(context.calendar.day);
  const dayBranch = context.day.branch;
  const nobleBranches = NOBLE_BRANCHES_BY_STEM[dayStem];
  const luBranch = LU_BRANCH_BY_STEM[dayStem];
  const horseBranch = getHorseBranch(dayBranch);
  const tianXiBranch = getTianXiBranch(context.month.branch);

  return context.yaos.flatMap<RuleTrace>((yao) => {
    const matchedStars = [
      nobleBranches.includes(yao.branch) ? "贵人" : "",
      yao.branch === luBranch ? "禄神" : "",
      yao.branch === horseBranch ? "驿马" : "",
      yao.branch === tianXiBranch ? "天喜" : "",
    ].filter((star): star is string => star.length > 0);

    if (matchedStars.length === 0) return [];

    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return [
      {
        title: `${matchedStars.join("、")}参考`,
        source: actor,
        target: actor,
        effect: "参考",
        score: matchedStars.length,
        reason: `${actor.label}[${actor.be_pair}]临${matchedStars.join("、")}；星煞不能独操祸福，用神旺者见之愈吉，用神失陷则虽有如无`,
      },
    ];
  });
}

function relativeChangeReferenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.flatMap<RuleTrace>((yao) => {
    if (!yao.isMoving) return [];

    const source = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: `${YAO_NAMES[yao.position]}${yao.relative}`,
    });
    const target = createActor("changedYao", {
      position: yao.position,
      branch: yao.changedBranch,
      label: `${YAO_NAMES[yao.position]}变${yao.changedRelative}`,
    });

    return [
      {
        title: `${yao.relative}化${yao.changedRelative}`,
        source,
        target,
        effect: "参考",
        score: 0,
        reason: getRelativeChangeReference(yao.relative, yao.changedRelative),
      },
    ];
  });
}

function yaoPositionReferenceRule(context: RuleContext): RuleTrace[] {
  if (!context.yaoPositionCategory) return [];

  return context.yaos.map<RuleTrace>((yao) => {
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
    });

    return {
      title: `${YAO_NAMES[yao.position]}爻位取象`,
      source: actor,
      target: actor,
      effect: "参考",
      score: 0,
      reason: `本卦范畴为「${context.yaoPositionCategory}」，${actor.label}可参考：${context.yaoPositionCategory ? getYaoPositionImage(context.yaoPositionCategory, yao.position) : "请先选择占事范畴"}`,
    };
  });
}

function sixSpiritReferenceRule(context: RuleContext): RuleTrace[] {
  return context.yaos.map<RuleTrace>((yao) => {
    const actor = createActor("yao", {
      position: yao.position,
      branch: yao.branch,
      label: `${YAO_NAMES[yao.position]}${yao.spirit}`,
    });

    return {
      title: `${yao.spirit}取象`,
      source: actor,
      target: actor,
      effect: "参考",
      score: 0,
      reason: `${actor.label}临${yao.spirit}，可参考：${getSixSpiritImage(yao.spirit)}`,
    };
  });
}
