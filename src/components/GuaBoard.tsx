import { useRef } from "react";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";

export function GuaBoard({
  snapshot,
  onInspect,
  onUseYao,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
}) {
  const useYaoPosition = snapshot.useYaoPosition ?? null;
  return (
    <div className="chart-body">
      <div className="chart-board" aria-label="六爻排盘">
        <div className="board-head">
          <span>六神</span>
          <span>用</span>
          <span>本卦</span>
          <span>动</span>
          <span>变卦</span>
        </div>
        {[...snapshot.yaos].reverse().map((yao) => (
          <YaoRow
            key={yao.position}
            yao={yao}
            onInspect={onInspect}
            onUseYao={onUseYao}
            isUsed={useYaoPosition === yao.position}
          />
        ))}
      </div>
    </div>
  );
}

function YaoRow({
  yao,
  onInspect,
  onUseYao,
  isUsed,
}: {
  yao: YaoSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
  isUsed: boolean;
}) {
  const timerRef = useRef<number | null>(null);
  const longPressRef = useRef(false);

  function startPress() {
    stopPress();
    longPressRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longPressRef.current = true;
      onUseYao(isUsed ? null : yao.position);
    }, 520);
  }

  function stopPress() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  } 

  function handleClick() {
    if (longPressRef.current) {
      longPressRef.current = false;
      return;
    }
    onInspect(yao);
  }

  return (
    <button
      type="button"
      className={`yao-row strength-${yao.strengthLabel}${isUsed ? " is-used" : ""}`}
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={stopPress}
      onPointerCancel={stopPress}
      onPointerLeave={stopPress}
      title={yao.traces
        .map((trace) => `${trace.title}：${trace.reason}`)
        .join("\n")}
    >
      <span className="spirit">{yao.spirit}</span>
      <span className="use-mark">{isUsed ? "用" : ""}</span>
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
