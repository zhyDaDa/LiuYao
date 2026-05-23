import { Button } from "antd-mobile";
import { createPortal } from "react-dom";
import { FullScreen, OffScreen } from "../icons/Icons";

export function FixedExpandButton({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return createPortal(
    <Button
      className={expanded ? "expand-button is-expanded-button" : "expand-button"}
      shape="default"
      color="primary"
      onClick={onClick}
      
    >
      {expanded ? OffScreen : FullScreen}
    </Button>,
    document.body,
  );
}
