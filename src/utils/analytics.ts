import type { PageKey } from "../types/navigation";

export const PAGE_CONFIG: Record<PageKey, { path: string; title: string }> = {
  home: { path: "/home", title: "首页" },
  divine: { path: "/divine", title: "排盘" },
  archive: { path: "/archive", title: "档案" },
  tables: { path: "/tables", title: "速查" },
};

const APP_TITLE = "周易六爻排盘";

function getUmami(): Window["umami"] | undefined {
  if (typeof window === "undefined") return undefined;
  return window.umami;
}

export function trackPageview(pageKey: PageKey) {
  const umami = getUmami();
  if (!umami) return;

  const config = PAGE_CONFIG[pageKey];
  const title = `${config.title} - ${APP_TITLE}`;

  void umami.track((props) => ({
    ...props,
    url: config.path,
    title,
  }));
}

export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean | null | undefined>,
) {
  const umami = getUmami();
  if (!umami) return;

  const payload = data
    ? Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      )
    : undefined;

  void umami.track(name, payload);
}
