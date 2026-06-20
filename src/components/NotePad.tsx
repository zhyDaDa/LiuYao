import { Typography } from "antd";
import type { ChartSnapshot } from "../models/Gua";
import { useRef, useState } from "react";

export const NotePad = ({
  snapshot,
  onEditRemark,
}: {
  snapshot: ChartSnapshot;
  onEditRemark: (remark: string) => void;
}) => {
  const [remark, setRemark] = useState(snapshot.remark);
  const remarkRef = useRef(snapshot.remark);
  return (
    <div className="notepad-wrapper">
      <Typography.Paragraph
        copyable
        editable={{
          text: remark,
          autoSize: { minRows: 3, maxRows: 5 },
          onChange: (nextRemark) => {
            remarkRef.current = nextRemark;
            setRemark(nextRemark);
          },
          onEnd: () => {
            const latestRemark = remarkRef.current;
            onEditRemark(latestRemark ? latestRemark.trim() : "");
          },
          triggerType: ["icon"],
        }}
        type={remark ? undefined : "secondary"}
      >
        {remark ? remark : "可以在这里添加备注..."}
      </Typography.Paragraph>
    </div>
  );
};
