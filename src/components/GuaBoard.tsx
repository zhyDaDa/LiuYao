import { useRef } from "react";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";

export function GuaBoard({
  snapshot,
  onInspect,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
}) {
  return (
    <div className="chart-body">
      <div className="chart-board" aria-label="六爻排盘">
        <div className="board-head">
          <span>六神</span>
          <span>本卦</span>
          <span>动</span>
          <span>变卦</span>
        </div>
        {[...snapshot.yaos].reverse().map((yao) => (
          <YaoRow key={yao.position} yao={yao} onInspect={onInspect} />
        ))}
      </div>
    </div>
  );
}

function YaoRow({
  yao,
  onInspect,
}: {
  yao: YaoSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
}) {
  const timerRef = useRef<number | null>(null);

  function startPress() {
    stopPress();
    timerRef.current = window.setTimeout(() => onInspect(yao), 520);
  }

  function stopPress() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <button
      type="button"
      className={`yao-row strength-${yao.strengthLabel}`}
      onClick={() => onInspect(yao)}
      onPointerDown={startPress}
      onPointerUp={stopPress}
      onPointerLeave={stopPress}
      title={yao.traces
        .map((trace) => `${trace.title}：${trace.reason}`)
        .join("\n")}
    >
      <span className="spirit">{yao.spirit}</span>
      <GuaLineCell yao={yao} />
      <span className={yao.isMoving ? "move-mark is-moving" : "move-mark"}>
        {getMoveMark(yao)}
      </span>
      <GuaLineCell yao={yao} changed />
      <span className="hover-tip">{yao.traces[0]?.reason}</span>
    </button>
  );
}

function GuaLineCell({
  yao,
  changed = false,
}: {
  yao: YaoSnapshot;
  changed?: boolean;
}) {
  const strengthClass = !changed ? `force-${yao.strengthLabel}` : "";
  return (
    <span className={`gua-line-cell ${strengthClass}`}>
      <span className="gua-text">
        <b>
          {changed ? yao.changedRelative : yao.relative}
          {changed ? yao.changedBranch : yao.branch}
          {changed ? yao.changedElement : yao.element}
        </b>
      </span>
      <LineMark isYang={changed ? yao.changedIsYang : yao.isYang} />
      <span className="role-mark">{changed ? yao.changedRole : yao.role}</span>
    </span>
  );
}

function LineMark({ isYang }: { isYang: boolean }) {
  return (
    <span className={isYang ? "line yang-line" : "line yin-line"}>
      <i />
      {!isYang && <i />}
    </span>
  );
}

function getMoveMark(yao: YaoSnapshot) {
  if (!yao.isMoving) return "";
  return yao.isYang ? "○" : "×";
}
