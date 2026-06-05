import {
  FIVE_ELEMENT_CONTROLS,
  FIVE_ELEMENT_GENERATES,
  type BranchName,
  type SKCHEffect,
} from "../types/basicTerms";
import { branch2Element } from "./branch2Element";

type BranchPair = readonly [BranchName, BranchName];

export const BRANCH_CLASH_PAIRS: BranchPair[] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

export const BRANCH_HARMONY_PAIRS: BranchPair[] = [
  ["子", "丑"],
  ["寅", "亥"],
  ["卯", "戌"],
  ["辰", "酉"],
  ["巳", "申"],
  ["午", "未"],
];

export function compareYaoForSKCH(
  sourceBranch: BranchName,
  targetBranch: BranchName,
): SKCHEffect {
  if (isBranchClash(sourceBranch, targetBranch)) {
    return "冲";
  }
  if (isBranchHarmony(sourceBranch, targetBranch)) {
    return "合";
  }

  const sourceElement = branch2Element(sourceBranch);
  const targetElement = branch2Element(targetBranch);

  if (FIVE_ELEMENT_GENERATES[sourceElement] === targetElement) {
    return "生";
  }
  if (FIVE_ELEMENT_CONTROLS[sourceElement] === targetElement) {
    return "克";
  }

  return "无";
}

export function isBranchClash(
  sourceBranch: BranchName,
  targetBranch: BranchName,
): boolean {
  return hasBranchPair(BRANCH_CLASH_PAIRS, sourceBranch, targetBranch);
}

export function isBranchHarmony(
  sourceBranch: BranchName,
  targetBranch: BranchName,
): boolean {
  return hasBranchPair(BRANCH_HARMONY_PAIRS, sourceBranch, targetBranch);
}

export function findBranchClash(branch: BranchName): BranchName | null {
  return findBranchPartner(branch, BRANCH_CLASH_PAIRS);
}

export function findBranchHarmony(branch: BranchName): BranchName | null {
  return findBranchPartner(branch, BRANCH_HARMONY_PAIRS);
}

function hasBranchPair(
  pairs: BranchPair[],
  sourceBranch: BranchName,
  targetBranch: BranchName,
): boolean {
  return pairs.some(
    ([left, right]) =>
      (left === sourceBranch && right === targetBranch) ||
      (left === targetBranch && right === sourceBranch),
  );
}

function findBranchPartner(
  branch: BranchName,
  pairs: BranchPair[],
): BranchName | null {
  const pair = pairs.find(
    ([left, right]) => left === branch || right === branch,
  );
  if (!pair) return null;
  return pair[0] === branch ? pair[1] : pair[0];
}
