import { useRef, useState } from "react";
import type { BranchName, ElementName, YinYang } from "../types/basicTerms";
import { branch2Element } from "../utils/branch2Element";
import { findBranchClash, findBranchHarmony } from "../utils/SKCH";
import { SAN_HE_GROUPS } from "../models/rules/constants";
import { trackEvent } from "../utils/analytics";

interface BranchCell {
  name: BranchName;
  element: ElementName;
  yinYang: YinYang;
  row: number;
  col: number;
}

type BranchLayout = Omit<BranchCell, "element">;

const branchLayouts: BranchLayout[] = [
  { name: "巳", yinYang: "阴", row: 1, col: 1 },
  { name: "午", yinYang: "阳", row: 1, col: 2 },
  { name: "未", yinYang: "阴", row: 1, col: 3 },
  { name: "申", yinYang: "阳", row: 1, col: 4 },
  { name: "辰", yinYang: "阳", row: 2, col: 1 },
  { name: "酉", yinYang: "阴", row: 2, col: 4 },
  { name: "卯", yinYang: "阴", row: 3, col: 1 },
  { name: "戌", yinYang: "阳", row: 3, col: 4 },
  { name: "寅", yinYang: "阳", row: 4, col: 1 },
  { name: "丑", yinYang: "阴", row: 4, col: 2 },
  { name: "子", yinYang: "阳", row: 4, col: 3 },
  { name: "亥", yinYang: "阴", row: 4, col: 4 },
];

const branches: BranchCell[] = branchLayouts.map((branch) => ({
  ...branch,
  element: branch2Element(branch.name),
}));

export function BranchCycleTable() {
  const [active, setActive] = useState<BranchName | null>(null);
  const timerRef = useRef<number | null>(null);
  const selected = active
    ? branches.find((branch) => branch.name === active)
    : null;
  const clash = active ? findBranchClash(active) : null;
  const harmony = active ? findBranchHarmony(active) : null;
  const sanhe = active
    ? SAN_HE_GROUPS.find((group) => group.branches.includes(active))
    : null;

  function startPress(branch: BranchName) {
    stopPress();
    timerRef.current = window.setTimeout(() => setActive(branch), 420);
  }

  function stopPress() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <section className="branch-cycle-card">
      <div className="branch-cycle-head">
        <h2>十二地支</h2>
        <p>
          {selected
            ? `${selected.name}：${selected.yinYang}${selected.element}`
            : "长按或点击地支查看冲合"}
        </p>
      </div>
      <div className="branch-cycle-board">
        <svg className="branch-lines" viewBox="0 0 100 100" aria-hidden="true">
          {active && clash && (
            <RelationLine from={active} to={clash} kind="clash" />
          )}
          {active && harmony && (
            <RelationLine from={active} to={harmony} kind="harmony" />
          )}
          {active && sanhe && (
            <>
              <RelationLine
                from={sanhe.branches[0]}
                to={sanhe.branches[1]}
                kind="sanhe"
              />
              <RelationLine
                from={sanhe.branches[1]}
                to={sanhe.branches[2]}
                kind="sanhe"
              />
              <RelationLine
                from={sanhe.branches[2]}
                to={sanhe.branches[0]}
                kind="sanhe"
              />
            </>
          )}
        </svg>
        {branches.map((branch) => (
          <button
            type="button"
            key={branch.name}
            className={`branch-cell branch-${branch.element} ${active === branch.name ? "is-active" : ""}`}
            style={{ gridRow: branch.row, gridColumn: branch.col }}
            onClick={() => {
              trackEvent("branch_click", {
                branch: branch.name,
                element: branch.element,
                yinYang: branch.yinYang,
              });
              setActive(branch.name);
            }}
            onPointerDown={() => startPress(branch.name)}
            onPointerUp={stopPress}
            onPointerLeave={stopPress}
          >
            <span>{branch.name}</span>
            {active === branch.name ||
            branch.name === clash ||
            branch.name === harmony ? (
              <sup>
                {branch.yinYang}
                {branch.element}
              </sup>
            ) : null}
          </button>
        ))}
        <div className="branch-cycle-center">
          {active ? (
            <>
              <span>冲：{clash}</span>
              <span>合：{harmony}</span>
              <span>三合: {sanhe?.element}局</span>
            </>
          ) : (
            <span>冲合</span>
          )}
        </div>
      </div>
    </section>
  );
}

function RelationLine({
  from,
  to,
  kind,
}: {
  from: BranchName;
  to: BranchName;
  kind: "clash" | "harmony" | "sanhe";
}) {
  const fromPoint = getPoint(from);
  const toPoint = getPoint(to);

  return (
    <line
      className={`relation-line ${kind}`}
      x1={fromPoint.x}
      y1={fromPoint.y}
      x2={toPoint.x}
      y2={toPoint.y}
    />
  );
}

function getPoint(branchName: BranchName) {
  const branch = branches.find((item) => item.name === branchName);
  if (!branch) return { x: 50, y: 50 };
  return {
    x: (branch.col - 0.5) * 25,
    y: (branch.row - 0.5) * 25,
  };
}
