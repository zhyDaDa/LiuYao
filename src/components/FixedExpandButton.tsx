import { createPortal } from "react-dom";
import { FullScreen, OffScreen } from "../icons/Icons";
import { TapButton } from "./TapButton";

export function FixedExpandButton({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return createPortal(
    <TapButton
      className={expanded ? "expand-button is-expanded-button" : "expand-button"}
      shape="default"
      color="primary"
      onTap={onClick}
    >
      {expanded ? OffScreen : FullScreen}
    </TapButton>,
    document.body,
  );
}
