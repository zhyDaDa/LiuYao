import { Button, Modal } from "antd-mobile";

export function HomePage({ onCast, archiveCount }: { onCast: () => void; archiveCount: number }) {
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
        <h1>周易六爻排盘</h1>
        <p>移动端优先的起卦、排盘、归档与规则追踪原型。</p>
      </div>

      <div className="panel version-panel">
        <div>
          <h2>版本信息</h2>
          <p>当前版本 0.1.0-alpha，已包含基础模型、响应式盘面和规则说明入口。</p>
        </div>
        <div className="button-row">
          <Button color="primary" onClick={onCast}>
            起一卦
          </Button>
          <Button fill="outline" onClick={showDebug}>
            调试
          </Button>
        </div>
      </div>

      <div className="panel about-panel">
        <h2>关于与发布信息</h2>
        <p>这里预留作者介绍、联系方式、版本更新与发布说明。正式发布时可以接入网站链接或二维码。</p>
      </div>
    </section>
  );
}
