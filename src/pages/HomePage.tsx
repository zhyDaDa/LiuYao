import { Modal } from "antd-mobile";
import { TapButton } from "../components/TapButton";
import { Typography } from "antd";

const { Paragraph, Title, Text, Link } = Typography;

export function HomePage({
  onCast,
  archiveCount,
}: {
  onCast: () => void;
  archiveCount: number;
}) {
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
            当前版本 0.3.0-alpha，已包含:
            <ul>
              <li>自动/手动/模拟起卦</li>
              <li>基本排盘</li>
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
          <TapButton color="primary" onTap={onCast}>
            起一卦
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
