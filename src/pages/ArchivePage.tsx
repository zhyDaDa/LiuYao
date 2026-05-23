import { Empty } from "antd-mobile";
import { TapButton } from "../components/TapButton";
import type { ChartSnapshot } from "../models/Gua";

export function ArchivePage({
  archive,
  onPreview,
  onLoad,
  onEdit,
  onDelete,
}: {
  archive: ChartSnapshot[];
  onPreview: (item: ChartSnapshot) => void;
  onLoad: (item: ChartSnapshot) => void;
  onEdit: (item: ChartSnapshot) => void;
  onDelete: (item: ChartSnapshot) => void;
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
            <div className="archive-actions">
              <TapButton size="small" fill="outline" onTap={() => onLoad(item)}>
                读档
              </TapButton>
              <TapButton size="small" fill="outline" onTap={() => onEdit(item)}>
                编辑
              </TapButton>
              <TapButton size="small" fill="none" onTap={() => onDelete(item)}>
                删除
              </TapButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
