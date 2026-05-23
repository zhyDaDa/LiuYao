export type PageKey = "home" | "divine" | "archive" | "tables";

export const tabs: Array<{ key: PageKey; title: string; icon: string }> = [
  { key: "home", title: "首页", icon: "首" },
  { key: "divine", title: "排盘", icon: "卦" },
  { key: "archive", title: "档案", icon: "册" },
  { key: "tables", title: "速查", icon: "表" },
];
