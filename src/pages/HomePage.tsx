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
  function showDebug() {
    Modal.show({
      title: "调试信息",
      content: (
        <div className="debug-list">
          <p>应用：周易六爻排盘系统</p>
          <p>版本：0.1.0-alpha</p>
          <p>UI：antd-mobile 优先</p>
          <p>档案数量：{archiveCount}</p>
          <p>规则状态：已接入基础排盘链路，旺衰规则可继续扩展</p>
        </div>
      ),
      closeOnMaskClick: true,
      closeOnAction: true,
      actions: [{ key: "ok", text: "知道了" }],
    });
  }

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
            当前版本 0.2.0-alpha，已包含:
            <ul>
              <li>自动起卦</li>
              <li>基本排盘</li>
              <li>存档管理</li>
              <li>速查表格</li>
            </ul>
          </Paragraph>
        </div>
        <div className="button-row">
          <TapButton color="primary" onTap={onCast}>
            起一卦
          </TapButton>
          <TapButton fill="outline" onTap={showDebug}>
            调试
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
