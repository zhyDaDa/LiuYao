import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { FullScreen, OffScreen } from "../icons/Icons";
import { TapButton } from "./TapButton";
import { captureElementScreenshot } from "../utils/captureElementScreenshot";
import styles from "./DrawingPanel.module.css";

const BRUSH_SIZE = 4;
const BRUSH_COLORS = ["#b94335", "#151311", "#317a56", "#a36a1d"];

interface DrawingPanelProps {
  expanded: boolean;
  onToggle: () => void;
  captureTargetRef: RefObject<HTMLDivElement | null>;
}

export function DrawingPanel({
  expanded,
  onToggle,
  captureTargetRef,
}: DrawingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const oldWidth = canvas.clientWidth;
      const oldHeight = canvas.clientHeight;
      const backupCanvas = document.createElement("canvas");
      backupCanvas.width = canvas.width;
      backupCanvas.height = canvas.height;

      const backupContext = backupCanvas.getContext("2d");
      backupContext?.drawImage(canvas, 0, 0);

      const ratio = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";

      if (backupCanvas.width > 0 && backupCanvas.height > 0) {
        context.drawImage(backupCanvas, 0, 0, oldWidth, oldHeight);
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [expanded]);

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    lastPointRef.current = point;
    drawPoint(point);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const lastPoint = lastPointRef.current;
    if (!lastPoint) return;

    const nextPoint = getCanvasPoint(event);
    drawLine(lastPoint, nextPoint);
    lastPointRef.current = nextPoint;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    lastPointRef.current = null;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  async function handleSave() {
    if (!captureTargetRef.current) return;

    try {
      setSaving(true);
      await captureElementScreenshot({
        target: captureTargetRef.current,
        drawingCanvas: canvasRef.current,
        fileName: `排盘标记-${formatFileTime(new Date())}.png`,
      });
    } finally {
      setSaving(false);
    }
  }

  function drawPoint(point: { x: number; y: number }) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.fillStyle = brushColor;
    context.beginPath();
    context.arc(point.x, point.y, BRUSH_SIZE / 2, 0, Math.PI * 2);
    context.fill();
  }

  function drawLine(
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.strokeStyle = brushColor;
    context.lineWidth = BRUSH_SIZE;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  return createPortal(
    <>
      {expanded ? (
        <div className={styles.drawingLayer}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      ) : null}

      <div
        className={[
          styles.controls,
          expanded ? styles.controlsExpanded : "",
        ].join(" ")}
      >
        <TapButton
          className={styles.toggleButton}
          shape="default"
          color="primary"
          onTap={onToggle}
        >
          {expanded ? OffScreen : FullScreen}
        </TapButton>

        {expanded ? (
          <div className={styles.toolbar}>
            <div className={styles.colors} aria-label="画笔颜色">
              {BRUSH_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={[
                    styles.colorButton,
                    color === brushColor ? styles.colorButtonActive : "",
                  ].join(" ")}
                  style={{ "--brush-color": color } as CSSProperties}
                  aria-label={`选择画笔颜色 ${color}`}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>

            <div className={styles.actions}>
              <TapButton size="small" fill="outline" onTap={handleClear}>
                清除
              </TapButton>
              <TapButton
                size="small"
                color="primary"
                disabled={saving}
                onTap={handleSave}
              >
                {saving ? "保存中" : "保存"}
              </TapButton>
            </div>
          </div>
        ) : null}
      </div>
    </>,
    document.body,
  );
}

function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
  const rect = event.currentTarget.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function formatFileTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}
