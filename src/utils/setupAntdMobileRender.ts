import { unstableSetRender } from "antd-mobile";
import type { ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

const roots = new WeakMap<Element | DocumentFragment, Root>();
let isReady = false;

export function setupAntdMobileRender() {
  if (isReady) return;

  isReady = true;

  unstableSetRender((node: ReactElement, container) => {
    let root = roots.get(container);

    if (!root) {
      root = createRoot(container);
      roots.set(container, root);
    }

    root.render(node);

    return async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      root.unmount();
      roots.delete(container);
    };
  });
}
