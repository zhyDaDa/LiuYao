import { Flex, Typography } from "antd";
import { useState } from "react";
import { ChartView } from "../components/ChartView";
import { DrawingPanel } from "../components/DrawingPanel";
import { TapButton } from "../components/TapButton";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";
import type { YaoPositionCategory } from "../models/YaoPositionImages";
import { YAO_POSITION_CATEGORY_OPTIONS } from "../models/YaoPositionImages";
import { NotePad } from "../components/NotePad";
import type { SimpleInfo } from "../App";
import { Help } from "../icons/Icons";
import { useAppTour } from "../tour/tourProvider";

const { Paragraph } = Typography;

export function DivinePage({
  snapshot,
  onCast,
  onSave,
  onRename,
  onEditRemark,
  onInspect,
  onSimpleInfo,
  onUseYao,
  yaoPositionCategory,
  onYaoPositionCategoryChange,
}: {
  snapshot: ChartSnapshot | null;
  onCast: () => void;
  onSave: () => void;
  onRename: (name: string) => void;
  onEditRemark: (remark: string) => void;
  onInspect: (yao: YaoSnapshot) => void;
  onSimpleInfo: (info: SimpleInfo) => void;
  onUseYao: (position: number | null) => void;
  yaoPositionCategory: YaoPositionCategory;
  onYaoPositionCategoryChange: (category: YaoPositionCategory) => void;
}) {
  const { startTour, registerTarget } = useAppTour();
  const [expanded, setExpanded] = useState(false);

  if (!snapshot) {
    return (
      <section className="page divine-page">
        <div className="page-title compact-title">
          <span className="eyebrow">排盘</span>
          <Paragraph className="editable-chart-title">{"等待起卦"}</Paragraph>
        </div>

        <div className="panel empty-cast-panel">
          <h2>还没有当前排盘</h2>
          <p>
            可以先随机起一卦，之后这里会显示万年历信息、本卦、变卦、六神、六亲、世应和每爻力量来源。
          </p>
          <TapButton color="primary" onTap={onCast}>
            开始起卦
          </TapButton>
        </div>
      </section>
    );
  }

  return (
    <section className="page divine-page">
      <div className="page-title compact-title">
        <span className="eyebrow">排盘</span>
        <Flex justify="space-between">
          <Paragraph
            className="editable-chart-title"
            editable={{
              tooltip: "修改排盘名称",
              onChange: onRename,
            }}
          >
            {snapshot.question}
          </Paragraph>
          <button
            type="button"
            className="title-help-button"
            onClick={() => startTour("divine-detail")}
            aria-label="查看排盘界面引导"
          >
            {Help}
          </button>
        </Flex>
      </div>
      <div className="action-strip" ref={registerTarget("divine-actions")}>
        <TapButton color="primary" onTap={onCast}>
          重新起卦
        </TapButton>
        <TapButton fill="outline" onTap={onSave}>
          存档
        </TapButton>
        <label className="category-select">
          <span>本卦范畴</span>
          <select
            value={yaoPositionCategory}
            onChange={(event) =>
              onYaoPositionCategoryChange(
                event.target.value as YaoPositionCategory,
              )
            }
          >
            {YAO_POSITION_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ChartView
        snapshot={snapshot}
        onInspect={onInspect}
        onSimpleInfo={onSimpleInfo}
        onUseYao={onUseYao}
        expanded={expanded}
      />
      <NotePad snapshot={snapshot} onEditRemark={onEditRemark} />
      <DrawingPanel
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
    </section>
  );
}
