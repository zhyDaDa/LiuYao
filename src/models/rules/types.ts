import type { CalendarInfo } from "../Calendar";
import type { YaoPositionCategory } from "../YaoPositionImages";
import type {
  BranchName,
  ElementName,
  RelativeName,
  SixSpiritName,
  SKCHEffect,
  TrigramName,
  VoidBranches,
} from "../../types/basicTerms";
import type { BE_pair } from "../../utils/branch2Element";

export type RuleActorKind = "yao" | "changedYao" | "month" | "day" | "void";
export type RuleEffect =
  | Exclude<SKCHEffect, "无">
  | "空亡"
  | "暗动"
  | "三合局"
  | "值月"
  | "值日"
  | "比扶"
  | "长生"
  | "帝旺"
  | "墓"
  | "绝"
  | "进神"
  | "退神"
  | "冲实"
  | "冲开"
  | "参考";

export interface RuleActor {
  id: string;
  kind: RuleActorKind;
  label: string;
  position?: number;
  be_pair?: BE_pair;
}

export interface CreateActorOptions {
  position?: number;
  branch?: BranchName;
  label?: string;
  voidBranches?: VoidBranches;
}

export interface RuleTrace {
  title: string;
  source: RuleActor | RuleActor[];
  target: RuleActor | RuleActor[];
  effect: RuleEffect;
  score: number;
  reason: string;
}

export interface RuleYaoContext {
  position: number;
  spirit: SixSpiritName;
  branch: BranchName;
  element: ElementName;
  relative: RelativeName;
  changedBranch: BranchName;
  changedElement: ElementName;
  changedRelative: RelativeName;
  isMoving: boolean;
  isDarkMoving: boolean;
}

export interface RuleContext {
  calendar: CalendarInfo;
  palace: TrigramName;
  palaceElement: ElementName;
  changedPalace: TrigramName;
  changedPalaceElement: ElementName;
  yaos: RuleYaoContext[];
  month: {
    branch: BranchName;
    element: ElementName;
  };
  day: {
    branch: BranchName;
    element: ElementName;
  };
  voidBranches: VoidBranches;
  yaoPositionCategory?: YaoPositionCategory;
}

export type RuleResult = RuleTrace | RuleTrace[] | null;
export type Rule = (context: RuleContext) => RuleResult;
export type ContextRule = (context: RuleContext) => RuleEvaluation;
export type RuleEntry<T> = readonly [rule: T, explanation: string];

export interface RuleEvaluation {
  context: RuleContext;
  traces: RuleTrace[];
}

export interface SanHeGroup {
  branches: readonly [BranchName, BranchName, BranchName];
  element: ElementName;
}

export interface SanHeParticipant {
  branch: BranchName;
  element: ElementName;
  actor: RuleActor;
  priority: number;
  isYaoRelated: boolean;
  isActivatedByYao: boolean;
}

export type SKCHSource = "月建" | "日辰" | "动爻" | "回头";

export interface CreateSKCHTraceOptions {
  context?: RuleContext;
  targetYao?: RuleYaoContext;
  scoreBase?: number;
}
