import { Empty } from "antd-mobile";
import { TapButton } from "../components/TapButton";
import type { ChartSnapshot } from "../models/Gua";

export function ArchivePage({
  archive,
  onPreview,
  onLoad,
}: {
  archive: ChartSnapshot[];
  onPreview: (item: ChartSnapshot) => void;
  onLoad: (item: ChartSnapshot) => void;
}) {
  if (archive.length === 0) {
    return (
      <section className="page archive-page">
        <div className="page-title compact-title">
          <span className="eyebrow">档案库</span>
          <h1>暂无存档</h1>
        </div>
        <Empty description="在排盘页保存后，这里会出现历史卦例。" />
      </section>
    );
  }

  return (
    <section className="page archive-page">
      <div className="page-title compact-title">
        <span className="eyebrow">档案库</span>
        <h1>历史排盘</h1>
      </div>
      <div className="archive-list">
        {archive.map((item) => (
          <div className="archive-item" key={item.id}>
            <button type="button" onClick={() => onPreview(item)}>
              <strong>{item.title}</strong>
              <span>
                {item.originalName} → {item.changedName}
              </span>
            </button>
            <TapButton size="small" fill="outline" onTap={() => onLoad(item)}>
              读档
            </TapButton>
          </div>
        ))}
      </div>
    </section>
  );
}
