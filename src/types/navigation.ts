export type PageKey = "home" | "divine" | "archive" | "tables";

export const tabs: Array<{ key: PageKey; title: string; icon: string; tourKey?: string}> = [
  { key: "home", title: "首页", icon: "首" },
  { key: "divine", title: "排盘", icon: "卦", tourKey: "divine-page" },
  { key: "archive", title: "档案", icon: "册", tourKey: "archive-page"},
  { key: "tables", title: "速查", icon: "表", tourKey: "reference-page" },
];
