import { Popup } from "antd-mobile";
import type { YaoSnapshot } from "../models/Gua";
import type { RuleActor, RuleTrace } from "../models/Rules";
import { TapButton } from "./TapButton";

export function YaoDrawer({ yao, onClose }: { yao: YaoSnapshot | null; onClose: () => void }) {
  return (
    <Popup visible={Boolean(yao)} onMaskClick={onClose} position="right" bodyClassName="rule-drawer">
      {yao && (
        <div className="drawer-content">
          <div className="drawer-title">
            <span>{yao.spirit}</span>
            <h2>
              {yao.name} · {yao.relative}{yao.branch}{yao.element}
            </h2>
            <p>
              当前判断：{yao.strengthLabel}，综合分 {yao.strength}
              {yao.isDarkMoving ? "，暗动" : ""}
            </p>
          </div>
          <div className="trace-list">
            {yao.traces.map((trace, index) => (
              <div className="trace-item" key={index}>
                <strong>
                  {trace.title}
                  <em>{trace.score > 0 ? `+${trace.score}` : trace.score}</em>
                </strong>
                <p>
                  {formatRuleActors(trace.source)} → {formatRuleActors(trace.target)}
                  {" · "}
                  {trace.effect}
                </p>
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

function formatRuleActors(actor: RuleTrace["source"] | RuleTrace["target"]) {
  const actors = Array.isArray(actor) ? actor : [actor];
  return actors.map(formatRuleActor).join("、");
}

function formatRuleActor(actor: RuleActor) {
  return actor.be_pair ? `${actor.label}${actor.be_pair}` : actor.label;
}
