import { useEffect, useRef } from "react";
import { trackPageview } from "../utils/analytics";
import type { PageKey } from "../types/navigation";

export function usePageTracking(activeKey: PageKey) {
  const lastKeyRef = useRef<PageKey | null>(null);

  useEffect(() => {
    if (lastKeyRef.current === activeKey) return;
    lastKeyRef.current = activeKey;
    trackPageview(activeKey);
  }, [activeKey]);
}
