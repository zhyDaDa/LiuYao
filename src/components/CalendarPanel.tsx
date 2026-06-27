import { Tag } from "antd-mobile";
import type { SimpleInfo } from "../App";
import type { ChartSnapshot } from "../models/Gua";
import { TwelveLifeStages } from "./TwelveLifeStages";
import { specialGuaChangeKnowledges } from "../models/RuleKnowledge";
import { useAppTour } from "../tour/tourProvider";

export function CalendarPanel({
  snapshot,
  onSimpleInfo,
}: {
  snapshot: ChartSnapshot;
  onSimpleInfo: (info: SimpleInfo) => void;
}) {
  const { registerTarget } = useAppTour();
  const selectedUseYao = snapshot.yaos.find(
    (yao) => yao.position === snapshot.useYaoPosition,
  );
  const lifeStageElement = selectedUseYao?.element ?? snapshot.palaceElement;
  const handleGuaSummaryInfo = () => {
    const { originalName, originalType, changedName, changedType } = snapshot;
    const changeMode = `${originalType}变${changedType}`;
    let specialChangeKnowledge = specialGuaChangeKnowledges[changeMode];
    if (!specialChangeKnowledge) {
      specialChangeKnowledge =
        specialGuaChangeKnowledges[`${originalType}`] ||
        specialGuaChangeKnowledges[`${changedType}`];
    }
    onSimpleInfo(
      <>
        <h3>概览</h3>
        <p>
          <Tag>{originalName}</Tag> 变 <Tag>{changedName}</Tag>
        </p>
        {specialChangeKnowledge && (
          <>
            <h3>特殊变化</h3>
            <p>{specialChangeKnowledge}</p>
          </>
        )}
      </>,
    );
  };

  return (
    <div className="chart-side">
      <div className="calendar-band" ref={registerTarget("divine-calendar")}>
        <div>
          <strong>{snapshot.calendar.year}</strong>
          <span>年</span>
        </div>
        <div>
          <strong>{snapshot.calendar.month}</strong>
          <span>月</span>
        </div>
        <div>
          <strong>{snapshot.calendar.day}</strong>
          <span>日</span>
        </div>
        <div>
          <span>旬空：</span>
          <strong>{snapshot.calendar.dayVoidBranches.join("")}</strong>
        </div>
      </div>

      <TwelveLifeStages element={lifeStageElement} />

      <button
        type="button"
        className="gua-summary"
        onClick={handleGuaSummaryInfo}
        ref={registerTarget("divine-summary")}
      >
        <div>
          <span>本卦</span>
          <strong>
            {snapshot.originalName}
            {snapshot.originalType === "" ? "" : `(${snapshot.originalType})`}
          </strong>

          <em>
            {snapshot.palace}宫 {snapshot.palaceElement}
          </em>
        </div>
        <div>
          <span>变卦</span>
          <strong>
            {snapshot.changedName}
            {snapshot.changedType === "" ? "" : `(${snapshot.changedType})`}
          </strong>

          <em>
            {snapshot.changedPalace}宫 {snapshot.changedPalaceElement}
          </em>
        </div>
      </button>
    </div>
  );
}
