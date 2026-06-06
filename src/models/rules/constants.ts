import type {
  BranchName,
  LifeStageName,
  StemName,
} from "../../types/basicTerms";
import type { SanHeGroup } from "./types";

export const FOUNDATION_SCORE = 8;
export const MOVING_SCORE = 4;
export const SAN_HE_SCORE = 5;

export const SAN_HE_GROUPS: readonly SanHeGroup[] = [
  { branches: ["亥", "卯", "未"], element: "木" },
  { branches: ["寅", "午", "戌"], element: "火" },
  { branches: ["巳", "酉", "丑"], element: "金" },
  { branches: ["申", "子", "辰"], element: "水" },
];

export const PROGRESSIVE_BRANCH_PAIRS: readonly (readonly [
  BranchName,
  BranchName,
])[] = [
  ["亥", "子"],
  ["寅", "卯"],
  ["巳", "午"],
  ["申", "酉"],
  ["丑", "辰"],
  ["辰", "未"],
  ["未", "戌"],
  ["戌", "丑"],
];

export const LIFE_STAGE_SCORES: Record<LifeStageName, number> = {
  长生: 3,
  帝旺: 4,
  墓: -3,
  绝: -4,
};

export const NOBLE_BRANCHES_BY_STEM: Record<StemName, readonly BranchName[]> = {
  甲: ["丑", "未"],
  乙: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  戊: ["丑", "未"],
  己: ["子", "申"],
  庚: ["丑", "未"],
  辛: ["午", "寅"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};

export const LU_BRANCH_BY_STEM: Record<StemName, BranchName> = {
  甲: "寅",
  乙: "卯",
  丙: "巳",
  丁: "午",
  戊: "巳",
  己: "午",
  庚: "申",
  辛: "酉",
  壬: "亥",
  癸: "子",
};

export const HORSE_BRANCH_GROUPS: readonly {
  branches: readonly BranchName[];
  horse: BranchName;
}[] = [
  { branches: ["申", "子", "辰"], horse: "寅" },
  { branches: ["巳", "酉", "丑"], horse: "亥" },
  { branches: ["寅", "午", "戌"], horse: "申" },
  { branches: ["亥", "卯", "未"], horse: "巳" },
];

export const TIAN_XI_BY_SEASON: readonly {
  months: readonly BranchName[];
  branch: BranchName;
}[] = [
  { months: ["寅", "卯", "辰"], branch: "戌" },
  { months: ["巳", "午", "未"], branch: "丑" },
  { months: ["申", "酉", "戌"], branch: "辰" },
  { months: ["亥", "子", "丑"], branch: "未" },
];
