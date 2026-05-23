import type { BranchName, ElementName } from "../types/basicTerms";

const BRANCH_ELEMENT_MAP: Record<BranchName, ElementName> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

export function branch2Element(branch: BranchName): ElementName {
  return BRANCH_ELEMENT_MAP[branch];
}

export class BE_pair {
  branch: BranchName;
  element: ElementName;
  constructor(branch: BranchName) {
    this.branch = branch;
    this.element = branch2Element(branch);
  }
  toString() {
    return `${this.branch}${this.element}`;
  }
}
