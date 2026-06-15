import { CalendarPanel } from "./CalendarPanel";
import { GuaBoard } from "./GuaBoard";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";
import type { Ref } from "react";

export function ChartView({
  snapshot,
  onInspect,
  onUseYao,
  expanded,
  stageRef,
}: {
  snapshot: ChartSnapshot;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
  expanded: boolean;
  stageRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={stageRef}
      className={expanded ? "chart-stage expanded-stage" : "chart-stage"}
    >
      <div className="chart-layout">
        <CalendarPanel snapshot={snapshot} />
        <GuaBoard snapshot={snapshot} onInspect={onInspect} onUseYao={onUseYao} />
      </div>
    </div>
  );
}
