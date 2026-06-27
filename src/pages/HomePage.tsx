import { TapButton } from "../components/TapButton";
import { Typography } from "antd";
import { useAppTour } from "../tour/tourProvider";
import { Help } from "../icons/Icons";

const { Paragraph, Title, Text, Link } = Typography;

export function HomePage({ onCast }: { onCast: () => void }) {
  const { startTour, registerTarget } = useAppTour();
  return (
    <section className="page home-page">
      <div className="page-title">
        <span className="eyebrow">LiuYao</span>
        <Title level={1}>周易六爻排盘</Title>
        <Text type="secondary">
          移动端优先的起卦、排盘、归档与规则追踪原型。
        </Text>
      </div>

      <div className="panel version-panel">
        <div>
          <Title level={2}>版本信息</Title>
          <Paragraph>
            当前版本 0.4.2-alpha，已包含:
            <ul>
              <li>用户引导</li>
              <li>自动/手动/模拟起卦</li>
              <li>完整排盘</li>
              <li>排盘显示优化</li>
              <li>排盘分析草稿</li>
              <li>十二长生</li>
              <li>存档管理</li>
              <li>存档导入/导出</li>
              <li>速查表格</li>
              <li>规则集优化[增删全内容]</li>
            </ul>
          </Paragraph>
        </div>
        <div className="button-row">
          <span
            ref={registerTarget("start-cast")}
            style={{ display: "inline-block" }}
          >
            <TapButton color="primary" onTap={onCast}>
              起一卦
            </TapButton>
          </span>
          <TapButton color="secondary" onTap={() => startTour("page-basic")}>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {Help}
              使用引导
            </span>
          </TapButton>
        </div>
      </div>

      <div className="panel about-panel">
        <Title level={2}>关于与发布信息</Title>
        <Paragraph>
          作者: <Text strong>zhyDaDa</Text>
        </Paragraph>
        <Paragraph>
          官网: <Link href="origin.zhydada.com">origin.zhyDaDa.com</Link>
        </Paragraph>
      </div>
    </section>
  );
}
