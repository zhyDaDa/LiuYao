import { YAO_NAMES } from "../../types/basicTerms";
import { BE_pair } from "../../utils/branch2Element";
import type { CreateActorOptions, RuleActor, RuleActorKind } from "./types";

export function createActor(
  kind: RuleActorKind,
  options: CreateActorOptions = {},
): RuleActor {
  if (kind === "month") {
    return {
      id: "month",
      kind,
      label: options.label ?? "月建",
      ...(options.branch ? { be_pair: new BE_pair(options.branch) } : {}),
    };
  }

  if (kind === "day") {
    return {
      id: "day",
      kind,
      label: options.label ?? "日辰",
      ...(options.branch ? { be_pair: new BE_pair(options.branch) } : {}),
    };
  }

  if (kind === "void") {
    return {
      id: "void",
      kind,
      label: options.label ?? `旬空(${options.voidBranches?.join("") ?? ""})`,
    };
  }

  const position = options.position ?? 0;
  const defaultLabel =
    kind === "changedYao" ? `${YAO_NAMES[position]}变` : YAO_NAMES[position];

  return {
    id: kind === "changedYao" ? `changed-yao-${position}` : `yao-${position}`,
    kind,
    label: options.label ?? defaultLabel,
    position,
    ...(options.branch ? { be_pair: new BE_pair(options.branch) } : {}),
  };
}
