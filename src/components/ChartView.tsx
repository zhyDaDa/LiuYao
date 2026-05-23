import { CalendarPanel } from "./CalendarPanel";
import { GuaBoard } from "./GuaBoard";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";

export function ChartView({
  snapshot,
  onInspect,
  expanded,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  expanded: boolean;
}) {
  return (
    <div className={expanded ? "chart-stage expanded-stage" : "chart-stage"}>
      <div className="chart-layout">
        <CalendarPanel snapshot={snapshot} />
        <GuaBoard snapshot={snapshot} onInspect={onInspect} />
      </div>
    </div>
  );
}
