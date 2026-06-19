import {
  Button,
  Dialog,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  TextArea,
  Toast,
} from "antd-mobile";
import { TapButton } from "../components/TapButton";
import { LiuYaoChart, type ChartSnapshot } from "../models/Gua";
import { Flex, Button as AntdButton, Typography, Space } from "antd";

const handleExport = (archive: ChartSnapshot) => {
  const code = LiuYaoChart.fromSnapshot(archive).exportToCode();
  Modal.show({
    title: "导出存档",
    content: (
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <h3>存档代码</h3>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: true,
            symbol: "",
          }}
          copyable={{}}
        >
          {code}
        </Typography.Paragraph>
        <h3>图片分享</h3>
        <Typography.Text type="secondary">功能开发中!</Typography.Text>
      </div>
    ),
    closeOnMaskClick: true,
    closeOnAction: true,
    actions: [{ key: "ok", text: "OK!" }],
  });
};

export function ArchivePage({
  archive,
  onPreview,
  onLoad,
  onEdit,
  onDelete,
  onSave,
}: {
  archive: ChartSnapshot[];
  onPreview: (item: ChartSnapshot) => void;
  onLoad: (item: ChartSnapshot) => void;
  onEdit: (item: ChartSnapshot) => void;
  onDelete: (item: ChartSnapshot) => void;
  onSave: (item: ChartSnapshot) => void;
}) {
  const handleImportArchive = (values: any) => {
    Modal.clear();
    try {
      if (values.archiveCode) {
        const importedSnapshort = LiuYaoChart.importFromCode(
          values.archiveCode,
        ).toSnapshot();
        onSave(importedSnapshort);
      } else if (values.aiText) {
        const importedSnapshort = LiuYaoChart.importFromText(
          values.aiText,
        ).toSnapshot();
        onSave(importedSnapshort);
      } else {
        throw new Error("请输入内容");
      }

      Toast.show("导入成功");
    } catch (e) {
      Dialog.alert({
        title: "导入失败",
        content: String(e),
        confirmText: "好的吧...",
      });
    }
  };
  const showImportModal = () => {
    Modal.show({
      title: "导入存档",
      content: (
        <div>
          <Form name="form" onFinish={handleImportArchive} layout="horizontal">
            <Form.Item label="存档代码" name="archiveCode">
              <Input
                id="archive-code"
                placeholder="请输入存档代码"
                defaultValue=""
              />
            </Form.Item>
            <Button block type="submit" color="primary" size="small">
              导入
            </Button>
          </Form>
          <Divider>
            <span>或</span>
          </Divider>
          <Form name="form" onFinish={handleImportArchive} layout="vertical">
            <Form.Item label="AI读档" name="aiText">
              <TextArea
                id="ai-code"
                placeholder="请输入描述(卦的基本信息) 此功能尚待开发!!!"
                defaultValue=""
                autoSize={{ minRows: 3, maxRows: 8 }}
              />
            </Form.Item>
            <Button block type="submit" color="primary" size="small">
              尝试解析
            </Button>
          </Form>
        </div>
      ),
      closeOnMaskClick: true,
      closeOnAction: true,
      actions: [{ key: "close", text: "关闭" }],
    });
  };

  if (archive.length === 0) {
    return (
      <section className="page archive-page">
        <div className="page-title compact-title">
          <span className="eyebrow">档案库</span>
          <Flex justify="space-between">
            <h1>暂无存档</h1>
            <TapButton color="primary" onTap={showImportModal}>
              导入存档
            </TapButton>
          </Flex>
        </div>
        <Empty description="在排盘页保存后，这里会出现历史卦例。" />
      </section>
    );
  }

  return (
    <section className="page archive-page">
      <div className="page-title compact-title">
        <span className="eyebrow">档案库</span>
        <Flex justify="space-between">
          <h1>历史排盘</h1>
          <TapButton color="primary" onTap={showImportModal}>
            导入存档
          </TapButton>
        </Flex>
      </div>
      <div className="archive-list">
        {archive.map((item) => (
          <div className="archive-item" key={item.id}>
            <button type="button" onClick={() => onPreview(item)}>
              <strong>{item.title}</strong>
              <span>
                {item.originalName} → {item.changedName}
              </span>
            </button>
            <Space.Compact>
              <AntdButton size="medium" onClick={() => onLoad(item)}>
                读档
              </AntdButton>
              <AntdButton size="medium" onClick={() => onEdit(item)}>
                编辑
              </AntdButton>
              <AntdButton size="medium" onClick={() => handleExport(item)}>
                导出
              </AntdButton>
              <AntdButton size="medium" onClick={() => onDelete(item)}>
                删除
              </AntdButton>
            </Space.Compact>
          </div>
        ))}
      </div>
    </section>
  );
}
