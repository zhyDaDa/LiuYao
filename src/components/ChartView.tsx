import { CalendarPanel } from "./CalendarPanel";
import { GuaBoard } from "./GuaBoard";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";
import type { SimpleInfo } from "../App";

export function ChartView({
  snapshot,
  onInspect,
  onSimpleInfo,
  onUseYao,
  expanded,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onSimpleInfo: (info: SimpleInfo) => void;
  onUseYao: (position: number | null) => void;
  expanded: boolean;
}) {
  return (
    <div className={expanded ? "chart-stage expanded-stage" : "chart-stage"}>
      <div className="chart-layout">
        <CalendarPanel snapshot={snapshot} onSimpleInfo={onSimpleInfo} />
        <GuaBoard
          snapshot={snapshot}
          onInspect={onInspect}
          onUseYao={onUseYao}
        />
      </div>
    </div>
  );
}
