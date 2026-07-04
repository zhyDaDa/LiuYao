// tour.config.tsx
import { Typography, type TourProps } from "antd";

type AppTourStep = {
  key: string;
} & Omit<NonNullable<TourProps["steps"]>[number], "target">;

const { Text, Paragraph } = Typography;

/**
 * 引导分组: 每个分组用一个 tourId 标识, 互相独立, 不会打架.
 * 调用 startTour(tourId) 时只会播放对应分组的步骤.
 *
 * 注意: 同一分组内 step 的 key 需保持唯一, 用于和 registerTarget 注册的 DOM 节点对应.
 */
export const appTourGroups = {
  // 页面基本引导
  "page-basic": [
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
      description:
        "存档界面, 可以删改之前保存的排盘信息, 也支持存档的导入和导出",
      placement: "top",
    },
    {
      key: "reference-page",
      title: "参考资料",
      description: "参考资料速查, 一些有用的可交互的基本知识",
      placement: "top",
    },
    {
      key: "",
      title: "页面引导",
      description: "基本页面引导结束, 点击其他问号图标可以查看更详细的功能引导",
    },
  ],
  "toast-drawer": [
    {
      key: "theme",
      title: "占事主题",
      description: "占事的主要内容，言简意赅，建议控制在 15 个字以内",
      placement: "right",
    },
    {
      key: "time",
      title: "起卦时间",
      description: "起卦的时间, 对于六爻精确到时辰足矣",
    },
    {
      key: "",
      title: "起卦方式",
      description: "自动和手动任选其一即可",
    },
    {
      key: "auto-toast",
      title: "自动起卦",
      description: "一键随机起卦, 简单快捷",
    },
    {
      key: "simulation-toast",
      title: "模拟起卦",
      description:
        "使用3d模型来模拟投币的过程, 每次的结果将自动填到下方手动起卦的表单",
    },
    {
      key: "manual-toast",
      title: "手动起卦",
      description: (
        <>
          <Paragraph>
            适合手头有真实硬币的情况, 自行投掷，然后将结果记录;
          </Paragraph>
          <Paragraph>
            值得注意的是，第一次的结果要记在初爻, 再是二爻, 以此类推, 顺序不要错
          </Paragraph>
        </>
      ),
    },
    {
      key: "end",
      title: "开始排盘",
      description: "信息填写无误之后，点击开始排盘，就会跳转到排盘界面",
    },
  ],
  // 排盘界面详解
  "divine-detail": [
    {
      key: "",
      title: "排盘界面",
      description: "这里是完整的排盘界面, 下面逐一介绍几个主要板块",
    },
    {
      key: "divine-title-actions",
      title: "题目操作",
      description: "在占事题目右侧可以重新起卦, 或将当前排盘存档",
      placement: "bottom",
    },
    {
      key: "divine-actions",
      title: "本卦范畴",
      description: "切换本卦范畴, 系统会根据不同占事类别给出取象建议",
      placement: "bottom",
    },
    {
      key: "divine-calendar",
      title: "万年历",
      description: (
        <Paragraph>
          起卦时间对应的 <Text strong>干支</Text> 年月日 与 旬空
        </Paragraph>
      ),
      placement: "bottom",
    },
    {
      key: "divine-summary",
      title: "本卦与变卦",
      description: (
        <>
          <Paragraph>本卦、变卦及所属卦宫五行</Paragraph>
          <Paragraph>
            点击可查看卦变化的概览与<Text strong>特殊变化提示</Text>
          </Paragraph>
        </>
      ),
      placement: "bottom",
    },
    {
      key: "divine-board",
      title: "六爻排盘",
      description: (
        <>
          <Paragraph>六神、本卦、动象、变卦逐爻排列</Paragraph>
          <Paragraph>
            点击某一爻查看详情，<Text strong>长按</Text>可设为
            <Text strong>用神</Text>
          </Paragraph>
        </>
      ),
      placement: "top",
    },

    {
      key: "divine-notepad",
      title: "备注",
      description: "记录断卦思路与心得, 点击铅笔编辑, 内容会随存档一起保存",
      placement: "top",
    },
    {
      key: "divine-ai-analysis",
      title: "AI 分析",
      description: (
        <>
          <Paragraph>配置 API 后, 可一键让 AI 基于当前排盘生成分析</Paragraph>
          <Paragraph type="secondary">
            也可先复制上下文, 再粘贴到自己喜欢的大模型中使用
          </Paragraph>
        </>
      ),
      placement: "top",
    },
    {
      key: "divine-drawing",
      title: "全屏手写",
      description: "展开全屏画板, 可手写标记、切换画笔颜色, 并随手速查地支",
      placement: "left",
    },
  ],
} satisfies Record<string, AppTourStep[]>;

export type TourId = keyof typeof appTourGroups;
