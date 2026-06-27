// tour.config.tsx
import type { TourProps } from "antd";

type AppTourStep = {
  key: string;
} & Omit<NonNullable<TourProps["steps"]>[number], "target">;

export const appTourSteps: AppTourStep[] = [
  {
    key: "start-cast",
    title: "首页起卦",
    description: "从首页可以开始起卦",
    placement: "right",
  },
  {
    key: "divine-page",
    title: "排盘界面",
    description: "主要的排盘界面, 在起卦或载入档案后显示完整排盘信息",
    placement: "top",
  },
  {
    key: "archive-page",
    title: "存档界面",
    description: "存档界面, 可以删改之前保存的排盘信息, 也支持存档的导入和导出",
    placement: "top",
  },
  {
    key: "reference-page",
    title: "参考资料",
    description: "参考资料速查, 一些有用的可交互的基本知识",
  },
];
