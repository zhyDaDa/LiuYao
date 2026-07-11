import { Modal, Toast, Dialog, Switch } from "antd-mobile";
import { useEffect, useState } from "react";
import {
  DEFAULT_AI_ENDPOINT,
  DEFAULT_AI_MODEL,
  type AiConfig,
} from "../models/AiConfig";
import { testAiConfig } from "../utils/deepseek";
import { TapButton } from "./TapButton";
import styles from "./AiConfigModal.module.css";

export function AiConfigModal({
  visible,
  config,
  onClose,
  onSave,
}: {
  visible: boolean;
  config: AiConfig | null;
  onClose: () => void;
  onSave: (config: AiConfig) => void;
}) {
  const [draft, setDraft] = useState<AiConfig>({
    useCustomModel: false,
    endpoint: DEFAULT_AI_ENDPOINT,
    model: DEFAULT_AI_MODEL,
    apiKey: "",
  });
  const [isDraftChanged, setIsDraftChanged] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(
        config ?? {
          useCustomModel: false,
          endpoint: DEFAULT_AI_ENDPOINT,
          model: DEFAULT_AI_MODEL,
          apiKey: "",
        },
      );
      setTestPassed(false);
      setTesting(false);
    }
  }, [visible, config]);

  function updateDraft<K extends keyof AiConfig>(key: K, value: AiConfig[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setTestPassed(false);
  }

  async function handleTest() {
    setTesting(true);
    try {
      await testAiConfig(draft);
      setTestPassed(true);
      Toast.show({ content: "连接测试通过" });
    } catch (error) {
      setTestPassed(false);
      Dialog.alert({
        title: "测试失败",
        content: error instanceof Error ? error.message : String(error),
        confirmText: "确定",
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    if (draft.useCustomModel && !testPassed) {
      Toast.show({ content: "请先通过接口测试!" });
      return;
    }
    onSave(draft);
  }

  return (
    <Modal
      visible={visible}
      title="配置 AI"
      bodyClassName={styles.modalBody}
      style={{
        "--max-width": "720px",
        "--min-width": "min(720px, calc(100vw - 16px))",
      }}
      closeOnMaskClick
      closeOnAction
      destroyOnClose
      onClose={onClose}
      content={
        <div className={styles.form}>
          <label className={styles.field}>
            <span>使用自定义模型</span>
            <span>
              <Switch
                checked={draft.useCustomModel}
                onChange={(checked) => {
                  updateDraft("useCustomModel", checked);
                  setIsDraftChanged(true);
                }}
              />
            </span>
          </label>

          {draft.useCustomModel && (
            <>
              <label className={styles.field}>
                <span>端点(deepseek接口格式)</span>
                <input
                  value={draft.endpoint}
                  placeholder="https://api.deepseek.com"
                  onChange={(event) => {
                    updateDraft("endpoint", event.target.value);
                    setIsDraftChanged(true);
                  }}
                />
              </label>

              <label className={styles.field}>
                <span>模型名称</span>
                <input
                  value={draft.model}
                  placeholder="deepseek-v4-flash"
                  onChange={(event) => {
                    updateDraft("model", event.target.value);
                    setIsDraftChanged(true);
                  }}
                />
              </label>

              <label className={styles.field}>
                <span>API 密钥</span>
                <input
                  type="password"
                  value={draft.apiKey}
                  placeholder="sk-..."
                  onChange={(event) => {
                    updateDraft("apiKey", event.target.value);
                    setIsDraftChanged(true);
                  }}
                />
              </label>
            </>
          )}

          <div className={styles.actions}>
            <TapButton fill="outline" onTap={onClose}>
              取消
            </TapButton>
            <TapButton fill="outline" onTap={handleTest} disabled={testing}>
              {testing ? "测试中..." : "测试"}
            </TapButton>
            <TapButton
              color="primary"
              onTap={handleSave}
              disabled={!isDraftChanged}
            >
              保存配置
            </TapButton>
          </div>
        </div>
      }
    />
  );
}
