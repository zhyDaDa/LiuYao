interface CaptureElementScreenshotOptions {
  target: HTMLElement;
  drawingCanvas?: HTMLCanvasElement | null;
  fileName?: string;
  backgroundColor?: string;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

export async function captureElementScreenshot({
  target,
  drawingCanvas,
  fileName = "drawing-panel.png",
  backgroundColor = "#f4f7f7",
}: CaptureElementScreenshotOptions) {
  const targetRect = target.getBoundingClientRect();
  const width = Math.round(targetRect.width);
  const height = Math.round(targetRect.height);

  if (width <= 0 || height <= 0) {
    throw new Error("无法保存空白截图");
  }

  const clonedTarget = cloneElementWithInlineStyles(target, width, height);
  const htmlWrapper = document.createElement("div");
  htmlWrapper.setAttribute("xmlns", XHTML_NAMESPACE);
  htmlWrapper.style.width = `${width}px`;
  htmlWrapper.style.height = `${height}px`;
  htmlWrapper.style.overflow = "hidden";
  htmlWrapper.appendChild(clonedTarget);

  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("xmlns", SVG_NAMESPACE);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const foreignObject = document.createElementNS(SVG_NAMESPACE, "foreignObject");
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  foreignObject.appendChild(htmlWrapper);
  svg.appendChild(foreignObject);

  const svgText = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgText], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = Math.round(width * ratio);
    outputCanvas.height = Math.round(height * ratio);

    const context = outputCanvas.getContext("2d");
    if (!context) {
      throw new Error("当前浏览器不支持保存截图");
    }

    context.scale(ratio, ratio);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    if (drawingCanvas) {
      const drawingRect = drawingCanvas.getBoundingClientRect();
      context.drawImage(
        drawingCanvas,
        drawingRect.left - targetRect.left,
        drawingRect.top - targetRect.top,
        drawingRect.width,
        drawingRect.height,
      );
    }

    downloadDataUrl(outputCanvas.toDataURL("image/png"), fileName);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function cloneElementWithInlineStyles(
  source: HTMLElement,
  width: number,
  height: number,
) {
  const clone = source.cloneNode(true) as HTMLElement;
  inlineStyles(source, clone);
  clone.style.position = "relative";
  clone.style.inset = "auto";
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.overflow = "hidden";

  return clone;
}

function inlineStyles(source: Element, clone: Element) {
  if (source instanceof HTMLElement && clone instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(source);
    const styleText = Array.from(computedStyle)
      .map(
        (property) =>
          `${property}:${computedStyle.getPropertyValue(property)};`,
      )
      .join("");

    clone.setAttribute("style", styleText);
  }

  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    clone.setAttribute("value", source.value);
  }

  if (
    source instanceof HTMLTextAreaElement &&
    clone instanceof HTMLTextAreaElement
  ) {
    clone.textContent = source.value;
  }

  if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
    clone.value = source.value;
  }

  Array.from(source.children).forEach((child, index) => {
    const clonedChild = clone.children.item(index);
    if (clonedChild) {
      inlineStyles(child, clonedChild);
    }
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("截图内容加载失败"));
    image.src = src;
  });
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
