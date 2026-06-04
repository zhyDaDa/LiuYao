import type { RelativeName } from "../types/basicTerms";
import { RELATIVE_NAMES } from "../types/basicTerms";

export const RELATIVE_IMAGE_MAP: Record<RelativeName, string> = {
  父母: "帮助我的、庇护我的、给予我能量；也常取长辈、文书、房子、车子、票据、项目、保护、依靠等象。",
  兄弟: "与我相同、代替我的、辅助我的；也常取同辈、朋友、竞争者、阻隔、破财、事情不顺等象。",
  子孙: "我帮助的、我庇护的、消耗我能量；也常取医药、福气、开心快乐、子女、食物、财源等象。",
  妻财: "我拥有的、我控制的、我克制的；也常取财富财产、对象、饮食、血液、食道、尿液、生殖器等象。",
  官鬼: "克制我的、管控我的、伤害我的；也常取疾病、灾祸、烦恼、盗贼、鬼怪、官司、压力、规则等象。",
};

export const RELATIVE_IMAGE_ROWS = RELATIVE_NAMES.map(
  (relative) => `${relative}取象：${RELATIVE_IMAGE_MAP[relative]}`,
);

export const RELATIVE_CHANGE_FEATURE_ROWS = [
  "六亲互化可以辅助表示吉凶，如化回头生、化回头克、化进化退、化月建、化死墓绝空破等。",
  "六亲互化可以辅助表示时间和应期，如化太岁、化月建、化日辰，或化前后临近年月日。",
  "六亲互化表示事物变化过程：动爻为开始，变爻为结束。",
  "六亲互化可传递信息，辅助判断事情的原因、性质和走向。",
];

const SPECIFIC_RELATIVE_CHANGE_MAP: Partial<Record<string, string>> = {
  兄弟化兄弟:
    "同类竞争、阻隔、破财之象延续或加重；若兼化进神，多主竞争者多、开销大、疾病费用高，若兼化退神，则有逐步缓和、修复、减少之象。",
  兄弟化父母:
    "由同辈、竞争、破财之象转向父母文书房车之象；可参考长辈、房子、车子、票据、项目、诉讼文书、住院医疗等因素介入。",
  兄弟化妻财:
    "由同辈、竞争、破财之象转向财富对象饮食之象；可参考竞争者有对象、朋友介绍、贷款借钱、投机合伙、饮食排泄等信息。",
};

export const RELATIVE_CHANGE_REFERENCE_ROWS = RELATIVE_NAMES.flatMap(
  (fromRelative) =>
    RELATIVE_NAMES.map(
      (toRelative) =>
        `${fromRelative}化${toRelative}：${getRelativeChangeReference(fromRelative, toRelative)}`,
    ),
);

export function getRelativeChangeReference(
  fromRelative: RelativeName,
  toRelative: RelativeName,
): string {
  const key = `${fromRelative}化${toRelative}`;
  const specificReference = SPECIFIC_RELATIVE_CHANGE_MAP[key];
  if (specificReference) return specificReference;

  if (fromRelative === toRelative) {
    return `${RELATIVE_IMAGE_MAP[fromRelative]} 同类六亲互化，主此类信息延续、反复或加重，具体吉凶仍需结合旺衰、进退、空破和生克判断。`;
  }

  return `动爻为开始，变爻为结束；可参考由“${RELATIVE_IMAGE_MAP[fromRelative]}”转向“${RELATIVE_IMAGE_MAP[toRelative]}”。此条只作取象提示，不直接决定生克冲合。`;
}
