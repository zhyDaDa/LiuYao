import { Button } from "antd-mobile";
import type { CSSProperties, ReactNode } from "react";

type TapButtonColor = "default" | "primary" | string;
type TapButtonFill = "solid" | "outline" | "none";
type TapButtonSize = "mini" | "small" | "middle" | "large";
type TapButtonShape = "default" | "rounded" | "rectangular";

interface TapButtonProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: TapButtonColor;
  fill?: TapButtonFill;
  size?: TapButtonSize;
  shape?: TapButtonShape;
  block?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onTap: () => void;
}

export function TapButton({
  children,
  className = "",
  color = "default",
  fill = "solid",
  size = "middle",
  shape = "default",
  block = false,
  disabled = false,
  type = "button",
  style,
  onTap,
}: TapButtonProps) {
  function handleClick() {
    if (disabled) return;
    onTap();
  }

  return (
    <Button
      type={type}
      className={[
        "tap-button",
        `tap-button-${color}`,
        `tap-button-fill-${fill}`,
        `tap-button-size-${size}`,
        `tap-button-shape-${shape}`,
        block ? "tap-button-block" : "",
        className,
      ].join(" ")}
      style={style}
      disabled={disabled}
      onClick={handleClick}
    >
      <span className="tap-button-content">{children}</span>
    </Button>
  );
}
