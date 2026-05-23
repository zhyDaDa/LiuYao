import { Popup } from "antd-mobile";
import type { YaoSnapshot } from "../models/Gua";
import { TapButton } from "./TapButton";

export function YaoDrawer({ yao, onClose }: { yao: YaoSnapshot | null; onClose: () => void }) {
  return (
    <Popup visible={Boolean(yao)} onMaskClick={onClose} position="right" bodyClassName="rule-drawer">
      {yao && (
        <div className="drawer-content">
          <div className="drawer-title">
            <span>{yao.spirit}</span>
            <h2>
              {yao.name} · {yao.relative}{yao.element}{yao.branch}
            </h2>
            <p>
              当前判断：{yao.strengthLabel}，综合分 {yao.strength}
            </p>
          </div>
          <div className="trace-list">
            {yao.traces.map((trace) => (
              <div className="trace-item" key={trace.title + trace.reason}>
                <strong>
                  {trace.title}
                  <em>{trace.effect > 0 ? `+${trace.effect}` : trace.effect}</em>
                </strong>
                <p>{trace.reason}</p>
              </div>
            ))}
          </div>
          <TapButton block color="primary" onTap={onClose}>
            关闭
          </TapButton>
        </div>
      )}
    </Popup>
  );
}
