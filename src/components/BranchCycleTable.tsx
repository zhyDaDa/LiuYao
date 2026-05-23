import { useRef, useState } from "react";
import type { BranchName, ElementName, YinYang } from "../types/basicTerms";

interface BranchCell {
  name: BranchName;
  element: ElementName;
  yinYang: YinYang;
  row: number;
  col: number;
}

const branches: BranchCell[] = [
  { name: "巳", element: "火", yinYang: "阴", row: 1, col: 1 },
  { name: "午", element: "火", yinYang: "阳", row: 1, col: 2 },
  { name: "未", element: "土", yinYang: "阴", row: 1, col: 3 },
  { name: "申", element: "金", yinYang: "阳", row: 1, col: 4 },
  { name: "辰", element: "土", yinYang: "阳", row: 2, col: 1 },
  { name: "酉", element: "金", yinYang: "阴", row: 2, col: 4 },
  { name: "卯", element: "木", yinYang: "阴", row: 3, col: 1 },
  { name: "戌", element: "土", yinYang: "阳", row: 3, col: 4 },
  { name: "寅", element: "木", yinYang: "阳", row: 4, col: 1 },
  { name: "丑", element: "土", yinYang: "阴", row: 4, col: 2 },
  { name: "子", element: "水", yinYang: "阳", row: 4, col: 3 },
  { name: "亥", element: "水", yinYang: "阴", row: 4, col: 4 },
];

const clashPairs: Array<[BranchName, BranchName]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

const harmonyPairs: Array<[BranchName, BranchName]> = [
  ["子", "亥"],
  ["寅", "卯"],
  ["巳", "午"],
  ["申", "酉"],
  ["辰", "丑"],
  ["戌", "未"],
];

export function BranchCycleTable() {
  const [active, setActive] = useState<BranchName | null>(null);
  const timerRef = useRef<number | null>(null);
  const selected = active ? branches.find((branch) => branch.name === active) : null;
  const clash = active ? findPartner(active, clashPairs) : null;
  const harmony = active ? findPartner(active, harmonyPairs) : null;

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
        <p>{selected ? `${selected.name}：${selected.yinYang}${selected.element}` : "长按或点击地支查看冲合"}</p>
      </div>
      <div className="branch-cycle-board">
        <svg className="branch-lines" viewBox="0 0 100 100" aria-hidden="true">
          {active && clash && <RelationLine from={active} to={clash} kind="clash" />}
          {active && harmony && <RelationLine from={active} to={harmony} kind="harmony" />}
        </svg>
        {branches.map((branch) => (
          <button
            type="button"
            key={branch.name}
            className={`branch-cell branch-${branch.element} ${active === branch.name ? "is-active" : ""}`}
            style={{ gridRow: branch.row, gridColumn: branch.col }}
            onClick={() => setActive(branch.name)}
            onPointerDown={() => startPress(branch.name)}
            onPointerUp={stopPress}
            onPointerLeave={stopPress}
          >
            <span>{branch.name}</span>
            {active === branch.name || branch.name === clash || branch.name === harmony ? (
              <sup>{branch.yinYang}{branch.element}</sup>
            ) : null}
          </button>
        ))}
        <div className="branch-cycle-center">
          {active ? (
            <>
              <span>冲：{clash}</span>
              <span>合：{harmony}</span>
            </>
          ) : (
            <span>冲合</span>
          )}
        </div>
      </div>
    </section>
  );
}

function RelationLine({ from, to, kind }: { from: BranchName; to: BranchName; kind: "clash" | "harmony" }) {
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

function findPartner(branch: BranchName, pairs: Array<[BranchName, BranchName]>) {
  const pair = pairs.find(([left, right]) => left === branch || right === branch);
  if (!pair) return null;
  return pair[0] === branch ? pair[1] : pair[0];
}

function getPoint(branchName: BranchName) {
  const branch = branches.find((item) => item.name === branchName);
  if (!branch) return { x: 50, y: 50 };
  return {
    x: (branch.col - 0.5) * 25,
    y: (branch.row - 0.5) * 25,
  };
}
