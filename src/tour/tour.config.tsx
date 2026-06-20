// tour.config.tsx
import type { TourProps } from "antd";

type AppTourStep = {
  key: string;
} & Omit<NonNullable<TourProps["steps"]>[number], "target">;

export const appTourSteps: AppTourStep[] = [
  {
    key: "start-cast",
    title: "项目模块",
    description: "这里是项目相关功能入口。",
    placement: "right",
  },
];
