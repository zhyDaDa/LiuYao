import type { ChartSnapshot } from "../models/Gua";
import { TwelveLifeStages } from "./TwelveLifeStages";

export function CalendarPanel({ snapshot }: { snapshot: ChartSnapshot }) {
  const selectedUseYao = snapshot.yaos.find(
    (yao) => yao.position === snapshot.useYaoPosition,
  );
  const lifeStageElement = selectedUseYao?.element ?? snapshot.palaceElement;

  return (
    <div className="chart-side">
      <div className="calendar-band">
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

      <TwelveLifeStages
        element={lifeStageElement}
      />

      <div className="gua-summary">
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
      </div>
    </div>
  );
}
