export const YAO_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
export const STEM_NAMES = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;
export type StemName = (typeof STEM_NAMES)[number];

export const BRANCH_NAMES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;
export type BranchName = (typeof BRANCH_NAMES)[number];

export type GanZhiName = `${StemName}${BranchName}`;
export type VoidBranches = [BranchName, BranchName];

export const ELEMENT_NAMES = ["木", "火", "土", "金", "水"] as const;
export type ElementName = (typeof ELEMENT_NAMES)[number];

export const YIN_YANG_NAMES = ["阳", "阴"] as const;
export type YinYang = (typeof YIN_YANG_NAMES)[number];

export const RELATIVE_NAMES = ["父母", "兄弟", "子孙", "妻财", "官鬼"] as const;
export type RelativeName = (typeof RELATIVE_NAMES)[number];

export const SIX_SPIRIT_NAMES = [
  "青龙",
  "朱雀",
  "勾陈",
  "螣蛇",
  "白虎",
  "玄武",
] as const;
export type SixSpiritName = (typeof SIX_SPIRIT_NAMES)[number];

export const YAO_ROLES = ["世", "应", ""] as const;
export type YaoRole = (typeof YAO_ROLES)[number];

export const STRENGTH_LABELS = ["旺", "平", "衰"] as const;
export type StrengthLabel = (typeof STRENGTH_LABELS)[number];

export const SKCH_EFFECTS = ["无", "生", "克", "冲", "合"] as const;
export type SKCHEffect = (typeof SKCH_EFFECTS)[number];

export const LIU_CHONG_GUA_NAMES = new Set<string>([
  "乾为天",
  "坤为地",
  "震为雷",
  "艮为山",
  "巽为风",
  "离为火",
  "坎为水",
  "兑为泽",
]);

export const LIU_HE_GUA_NAMES = new Set<string>([
  "天地否",
  "地天泰",
  "地雷复",
  "雷地豫",
  "山火贲",
  "火山旅",
  "水泽节",
  "泽水困",
]);

export const YOU_HUN_GUA_NAMES = new Set<string>([
  "火地晋",
  "水天需",
  "泽风大过",
  "山雷颐",
  "地火明夷",
  "天水讼",
  "风泽中孚",
  "雷山小过",
]);

export const GUI_HUN_GUA_NAMES = new Set<string>([
  "火天大有",
  "水地比",
  "泽雷随",
  "山风蛊",
  "地水师",
  "天火同人",
  "风山渐",
  "雷泽归妹",
]);

export const TRIGRAM_NAMES = [
  "乾",
  "兑",
  "离",
  "震",
  "巽",
  "坎",
  "艮",
  "坤",
] as const;
export type TrigramName = (typeof TRIGRAM_NAMES)[number];

export const FIVE_ELEMENT_GENERATES: Record<ElementName, ElementName> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

export const FIVE_ELEMENT_CONTROLS: Record<ElementName, ElementName> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

export type GuaSpecialType = "六合" | "六冲" | "游魂" | "归魂" | "";
