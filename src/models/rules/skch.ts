import type { SKCHEffect } from "../../types/basicTerms";
import { compareYaoForSKCH } from "../../utils/SKCH";
import { FOUNDATION_SCORE } from "./constants";
import { getDefaultSourceScore, isYaoStrongForDayClash } from "./scoring";
import type {
  CreateSKCHTraceOptions,
  RuleActor,
  RuleTrace,
  SKCHSource,
} from "./types";

export function createSKCHTrace(
  source: SKCHSource,
  sourceActor: RuleActor,
  targetActor: RuleActor,
  options: CreateSKCHTraceOptions = {},
): RuleTrace | null {
  if (!sourceActor.be_pair || !targetActor.be_pair) return null;

  const sourceBE = sourceActor.be_pair;
  const targetBE = targetActor.be_pair;
  const skch = compareYaoForSKCH(sourceBE.branch, targetBE.branch);

  if (skch === "无") return null;

  return {
    title: getSKCHTitle(source, skch, options),
    source: sourceActor,
    target: targetActor,
    effect: skch,
    score: getSKCHScore(source, skch, options),
    reason: getSKCHReason(
      source,
      skch,
      sourceActor,
      targetActor,
      sourceBE.toString(),
      targetBE.toString(),
      options,
    ),
  };
}

function getSKCHTitle(
  source: SKCHSource,
  skch: Exclude<SKCHEffect, "无">,
  options: CreateSKCHTraceOptions = {},
): string {
  if (source === "月建" && skch === "冲") return "临月破";
  if (source === "月建" && skch === "生") return "临月建";
  if (source === "日辰" && skch === "冲") {
    if (
      options.targetYao &&
      options.context?.voidBranches.includes(options.targetYao.branch)
    ) {
      return "日辰冲空";
    }
    if (
      options.targetYao &&
      isYaoStrongForDayClash(options.targetYao, options.context)
    ) {
      return "日辰冲动";
    }
    return "临日破";
  }
  if (source === "日辰" && skch === "生") return "临日辰";
  if (source === "回头") return `${source}${skch}`;
  if (source === "动爻" && skch === "生") return "动爻帮扶";
  return `${source}${skch}`;
}

function getSKCHReason(
  source: SKCHSource,
  skch: Exclude<SKCHEffect, "无">,
  sourceActor: RuleActor,
  targetActor: RuleActor,
  sourceBE: string,
  targetBE: string,
  options: CreateSKCHTraceOptions = {},
): string {
  if (source === "月建" && skch === "冲") {
    return `${targetActor.label}[${targetBE}]被${sourceActor.label}[${sourceBE}]冲破`;
  }
  if (source === "日辰" && skch === "冲") {
    if (
      options.targetYao &&
      options.context?.voidBranches.includes(options.targetYao.branch)
    ) {
      return `${targetActor.label}[${targetBE}]逢旬空，被${sourceActor.label}[${sourceBE}]冲起，按冲空则实`;
    }
    if (
      options.targetYao &&
      isYaoStrongForDayClash(options.targetYao, options.context)
    ) {
      return `${targetActor.label}[${targetBE}]静而有气，受${sourceActor.label}[${sourceBE}]冲动；旺者冲之愈动`;
    }
    return `${targetActor.label}[${targetBE}]休囚无气，被${sourceActor.label}[${sourceBE}]冲破，作日破参考`;
  }
  if (source === "回头") {
    return `${sourceActor.label}[${sourceBE}]回头${skch}${targetActor.label}[${targetBE}]`;
  }
  if (skch === "克") {
    return `${targetActor.label}[${targetBE}]被${sourceActor.label}[${sourceBE}]克`;
  }
  return `${sourceActor.label}[${sourceBE}]${skch}${targetActor.label}[${targetBE}]`;
}

function getSKCHScore(
  source: SKCHSource,
  skch: Exclude<SKCHEffect, "无">,
  options: CreateSKCHTraceOptions = {},
): number {
  const base = options.scoreBase ?? getDefaultSourceScore(source);

  if (source === "日辰" && skch === "冲") {
    if (
      options.targetYao &&
      options.context?.voidBranches.includes(options.targetYao.branch)
    ) {
      return FOUNDATION_SCORE;
    }
    return options.targetYao &&
      isYaoStrongForDayClash(options.targetYao, options.context)
      ? Math.max(2, Math.round(base * 0.75))
      : -base;
  }

  if (skch === "克" || skch === "冲") return -base;
  if (skch === "合") return Math.max(1, Math.round(base * 0.75));
  return base;
}
