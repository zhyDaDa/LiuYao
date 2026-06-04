import { ChartView } from "../components/ChartView";
import { FixedExpandButton } from "../components/FixedExpandButton";
import { TapButton } from "../components/TapButton";
import type { ChartSnapshot, YaoSnapshot } from "../models/Gua";
import type { YaoPositionCategory } from "../models/YaoPositionImages";
import { YAO_POSITION_CATEGORY_OPTIONS } from "../models/YaoPositionImages";

export function DivinePage({
  snapshot,
  onCast,
  onSave,
  onInspect,
  onUseYao,
  yaoPositionCategory,
  onYaoPositionCategoryChange,
  expanded,
  onToggleExpanded,
}: {
  snapshot: ChartSnapshot | null;
  onCast: () => void;
  onSave: () => void;
  onInspect: (yao: YaoSnapshot) => void;
  onUseYao: (position: number | null) => void;
  yaoPositionCategory: YaoPositionCategory;
  onYaoPositionCategoryChange: (category: YaoPositionCategory) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <section className="page divine-page">
      <div className="page-title compact-title">
        <span className="eyebrow">排盘</span>
        <h1>{snapshot?.question ?? "等待起卦"}</h1>
      </div>

      <div className="action-strip">
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

      {snapshot ? (
        <>
          <ChartView
            snapshot={snapshot}
            onInspect={onInspect}
            onUseYao={onUseYao}
            expanded={expanded}
          />
          <FixedExpandButton expanded={expanded} onClick={onToggleExpanded} />
        </>
      ) : (
        <div className="panel empty-cast-panel">
          <h2>还没有当前排盘</h2>
          <p>
            可以先随机起一卦，之后这里会显示万年历信息、本卦、变卦、六神、六亲、世应和每爻力量来源。
          </p>
          <TapButton color="primary" onTap={onCast}>
            开始起卦
          </TapButton>
        </div>
      )}
    </section>
  );
}
