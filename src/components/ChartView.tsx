import { CalendarPanel } from "./CalendarPanel";
import { GuaBoard } from "./GuaBoard";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";

export function ChartView({
  snapshot,
  onInspect,
  onUseYao,
  expanded,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
  expanded: boolean;
}) {
  return (
    <div className={expanded ? "chart-stage expanded-stage" : "chart-stage"}>
      <div className="chart-layout">
        <CalendarPanel snapshot={snapshot} />
        <GuaBoard snapshot={snapshot} onInspect={onInspect} onUseYao={onUseYao} />
      </div>
    </div>
  );
}
