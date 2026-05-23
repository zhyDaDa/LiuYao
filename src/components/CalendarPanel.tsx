import type { ChartSnapshot } from "../models/Gua";

export function CalendarPanel({ snapshot }: { snapshot: ChartSnapshot }) {
  return (
    <div className="chart-side">
      <div className="calendar-band">
        <div>
          <span>{snapshot.calendar.year}年</span>
          <strong>{snapshot.calendar.yearVoidBranches.join("")}</strong>
        </div>
        <div>
          <span>{snapshot.calendar.month}月</span>
          <strong>{snapshot.calendar.monthVoidBranches.join("")}</strong>
        </div>
        <div>
          <span>{snapshot.calendar.day}日</span>
          <strong>{snapshot.calendar.dayVoidBranches.join("")}</strong>
        </div>
        <div>
          <span>日旬空</span>
          <strong>{snapshot.calendar.voidBranches.join("、")}</strong>
        </div>
      </div>

      <div className="gua-summary">
        <div>
          <span>本卦</span>
          <strong>{snapshot.originalName}</strong>
          <em>{snapshot.palace}宫 {snapshot.palaceElement}</em>
        </div>
        <div>
          <span>变卦</span>
          <strong>{snapshot.changedName}</strong>
          <em>{snapshot.changedPalace}宫 {snapshot.changedPalaceElement}</em>
        </div>
      </div>

      <p className="calendar-note">{snapshot.calendar.note}</p>
    </div>
  );
}
