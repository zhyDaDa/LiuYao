import { createPortal } from "react-dom";
import { ColorPicker } from "antd";
import type { ColorPickerProps } from "antd";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BranchCycleTable } from "./BranchCycleTable";
import { FullScreen, OffScreen } from "../icons/Icons";
import { TapButton } from "./TapButton";
import styles from "./DrawingPanel.module.css";

const BRUSH_SIZE = 4;
const BRUSH_COLORS = ["#b94335", "#151311", "#317a56", "#a36a1d"];
const DRAWING_PANEL_STORAGE_KEY = "liuyao:drawing-panel-image";
const BRUSH_COLOR_PRESETS: Required<ColorPickerProps>["presets"] = [
  {
    label: "常用",
    colors: BRUSH_COLORS,
    key: "brush",
  },
];

interface DrawingPanelProps {
  expanded: boolean;
  onToggle: () => void;
}

export function DrawingPanel({ expanded, onToggle }: DrawingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const savedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);
  const [branchLookupOpen, setBranchLookupOpen] = useState(false);

  useEffect(() => {
    if (!expanded) {
      document.body.classList.remove("drawing-panel-locked");
      return;
    }

    function preventSelection(event: Event) {
      event.preventDefault();
    }

    function clearSelection() {
      window.getSelection()?.removeAllRanges();
    }

    document.body.classList.add("drawing-panel-locked");
    document.addEventListener("selectstart", preventSelection);
    document.addEventListener("selectionchange", clearSelection);

    return () => {
      document.body.classList.remove("drawing-panel-locked");
      document.removeEventListener("selectstart", preventSelection);
      document.removeEventListener("selectionchange", clearSelection);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) {
      saveCanvasSnapshot();
      setBranchLookupOpen(false);
      return;
    }

    function resizeCanvas(shouldBackupCurrent = true) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (shouldBackupCurrent) {
        saveCanvasSnapshot();
      }

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

      restoreCanvasSnapshot();
    }

    restoreCanvasSnapshotFromStorage(() => resizeCanvas(false));
    const handleResize = () => resizeCanvas(true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      saveCanvasSnapshot();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
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
    saveCanvasSnapshot();
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    savedCanvasRef.current = null;
    hasDrawingRef.current = false;
    window.localStorage.removeItem(DRAWING_PANEL_STORAGE_KEY);
  }

  function toggleExpanded() {
    if (expanded) {
      saveCanvasSnapshot();
      setBranchLookupOpen(false);
    }

    onToggle();
  }

  function drawPoint(point: { x: number; y: number }) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.fillStyle = brushColor;
    context.beginPath();
    context.arc(point.x, point.y, BRUSH_SIZE / 2, 0, Math.PI * 2);
    context.fill();
    hasDrawingRef.current = true;
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
    hasDrawingRef.current = true;
  }

  function saveCanvasSnapshot() {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      canvas.width <= 0 ||
      canvas.height <= 0 ||
      !hasDrawingRef.current
    ) {
      return;
    }

    const snapshot = savedCanvasRef.current ?? document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
    savedCanvasRef.current = snapshot;
    persistCanvasSnapshot(snapshot);
  }

  function restoreCanvasSnapshot() {
    const canvas = canvasRef.current;
    const snapshot = savedCanvasRef.current;
    if (!canvas || !snapshot || snapshot.width <= 0 || snapshot.height <= 0) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(
      snapshot,
      0,
      0,
      snapshot.width,
      snapshot.height,
      0,
      0,
      canvas.clientWidth,
      canvas.clientHeight,
    );
  }

  function restoreCanvasSnapshotFromStorage(onRestored: () => void) {
    const storedImage = window.localStorage.getItem(DRAWING_PANEL_STORAGE_KEY);
    if (!storedImage) {
      onRestored();
      return;
    }

    const image = new Image();
    image.onload = () => {
      const snapshot = document.createElement("canvas");
      snapshot.width = image.naturalWidth;
      snapshot.height = image.naturalHeight;
      snapshot.getContext("2d")?.drawImage(image, 0, 0);
      savedCanvasRef.current = snapshot;
      hasDrawingRef.current = true;
      onRestored();
    };
    image.onerror = () => {
      window.localStorage.removeItem(DRAWING_PANEL_STORAGE_KEY);
      onRestored();
    };
    image.src = storedImage;
  }

  function persistCanvasSnapshot(canvas: HTMLCanvasElement) {
    try {
      window.localStorage.setItem(
        DRAWING_PANEL_STORAGE_KEY,
        canvas.toDataURL("image/png"),
      );
    } catch {
      // Ignore storage quota errors; the in-memory canvas still works in session.
    }
  }

  return createPortal(
    <div className={styles.root}>
      {expanded ? (
        <div
          className={styles.drawingLayer}
          onContextMenu={(event) => event.preventDefault()}
        >
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
        onContextMenu={(event) => event.preventDefault()}
      >
        <TapButton
          className={styles.toggleButton}
          shape="default"
          color="primary"
          onTap={toggleExpanded}
        >
          {expanded ? OffScreen : FullScreen}
        </TapButton>

        {expanded ? (
          <div className={styles.toolbar}>
            <ColorPicker
              value={brushColor}
              presets={BRUSH_COLOR_PRESETS}
              onChange={(color) => setBrushColor(color.toHexString())}
            />

            <div className={styles.actions}>
              <TapButton size="small" fill="outline" onTap={handleClear}>
                清除
              </TapButton>
              <TapButton
                size="small"
                fill="outline"
                onTap={() => setBranchLookupOpen((value) => !value)}
              >
                地支速查
              </TapButton>
            </div>
          </div>
        ) : null}
      </div>

      {expanded && branchLookupOpen ? (
        <div className={styles.branchLookupPanel}>
          <div className={styles.branchLookupHead}>
            <span>地支速查</span>
            <TapButton
              size="small"
              fill="outline"
              onTap={() => setBranchLookupOpen(false)}
            >
              关闭
            </TapButton>
          </div>
          <BranchCycleTable />
        </div>
      ) : null}
    </div>,
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
