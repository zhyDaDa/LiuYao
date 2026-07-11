import { useRef } from "react";
import type { CSSProperties } from "react";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";
import { Flex } from "antd";
import { useAppTour } from "../tour/tourProvider";

export function GuaBoard({
  snapshot,
  onInspect,
  onUseYao,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
}) {
  const { registerTarget } = useAppTour();
  const useYaoPosition = snapshot.useYaoPosition ?? null;
  return (
    <div className="chart-body">
      <div
        className="chart-board"
        aria-label="六爻排盘"
        ref={registerTarget("divine-board")}
      >
        <div className="board-head">
          <span>六神</span>
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
      <GuaLineCell yao={yao} />
      <span
        className={
          yao.isMoving || yao.isDarkMoving ? "move-mark is-moving" : "move-mark"
        }
      >
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
  const strengthClass =
    !changed && yao.useSpiritRole && yao.strength !== 0
      ? `force-${getStrengthTone(yao.strength)}`
      : "";
  const useSpiritClass = !changed && yao.useSpiritRole ? "has-use-spirit" : "";
  const useSpiritMarkClass =
    !changed && yao.useSpiritRole
      ? getUseSpiritMarkClass(yao.useSpiritRole)
      : "";

  // 常用信息已在 YaoSnapshot 中计算好
  const monthEffect = changed ? yao.changedMonthEffect : yao.monthEffect;
  const dayEffect = changed ? yao.changedDayEffect : yao.dayEffect;
  const isVoid = changed ? yao.changedIsVoid : yao.isVoid;

  return (
    <span className={`gua-line-cell ${strengthClass} ${useSpiritClass}`}>
      <span
        className={`gua-text ${useSpiritMarkClass}`}
        data-use-spirit-role={
          !changed && yao.useSpiritRole ? yao.useSpiritRole : undefined
        }
        style={getStrengthStyle(yao, changed)}
      >
        <Flex className="tags upper" justify="space-between">
          {monthEffect === "无" ? (
            <span />
          ) : (
            <span className="month">月{monthEffect}</span>
          )}
          {isVoid && <span className="void">空</span>}
          {dayEffect === "无" ? (
            <span />
          ) : (
            <span className="day">日{dayEffect}</span>
          )}
        </Flex>
        <b>
          {changed ? yao.changedRelative : yao.relative}
          {changed ? yao.changedBranch : yao.branch}
          {changed ? yao.changedElement : yao.element}
        </b>
        <Flex className="tags lower" justify="space-between">
          {!changed && yao.hiddenSpirit && (
            <span className="hidden-spirit">
              伏：{yao.hiddenSpirit.relative}
              {yao.hiddenSpirit.branch}
              {yao.hiddenSpirit.element}
            </span>
          )}
        </Flex>
        <Flex></Flex>
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
  if (yao.isDarkMoving) return "暗";
  if (!yao.isMoving) return "";
  return yao.isYang ? "○" : "×";
}

function getStrengthStyle(
  yao: YaoSnapshot,
  changed: boolean,
): CSSProperties | undefined {
  if (changed || !yao.useSpiritRole || yao.strength === 0) {
    return undefined;
  }

  return {
    "--force-opacity": getStrengthOpacity(yao.strength),
  } as CSSProperties;
}

function getStrengthTone(strength: number) {
  return strength > 0 ? "旺" : "衰";
}

function getStrengthOpacity(strength: number) {
  const level = Math.min(Math.max(Math.abs(strength), 1), 10);
  return `${level * 10}%`;
}

function getUseSpiritMarkClass(role: YaoSnapshot["useSpiritRole"]) {
  switch (role) {
    case "用":
      return "is-use-role";
    case "元":
      return "is-origin-role";
    case "忌":
    case "仇":
      return "is-counter-role";
    default:
      return "";
  }
}
