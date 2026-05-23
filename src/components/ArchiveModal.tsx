import { Modal } from "antd-mobile";
import type { ChartSnapshot } from "../models/Gua";

export function ArchiveModal({
  item,
  onClose,
  onLoad,
}: {
  item: ChartSnapshot | null;
  onClose: () => void;
  onLoad: (item: ChartSnapshot) => void;
}) {
  return (
    <Modal
      visible={Boolean(item)}
      title={item?.title}
      closeOnMaskClick
      closeOnAction
      onClose={onClose}
      content={
        item ? (
          <div className="archive-preview">
            <p>
              {item.calendar.year}年（{(item.calendar.yearVoidBranches ?? item.calendar.voidBranches).join("")}）{" "}
              {item.calendar.month}月（{(item.calendar.monthVoidBranches ?? item.calendar.voidBranches).join("")}）{" "}
              {item.calendar.day}日（{(item.calendar.dayVoidBranches ?? item.calendar.voidBranches).join("")}）
            </p>
            <p>
              {item.originalName}（{item.palace}宫）变 {item.changedName}
            </p>
            <p>旬空：{item.calendar.voidBranches.join("、")}</p>
          </div>
        ) : null
      }
      actions={[
        { key: "cancel", text: "关闭" },
        {
          key: "load",
          text: "读档",
          primary: true,
          onClick: () => {
            if (item) onLoad(item);
          },
        },
      ]}
    />
  );
}
