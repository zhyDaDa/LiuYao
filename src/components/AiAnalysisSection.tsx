import { Flex, Typography, Spin } from "antd";
import { Dialog, Toast } from "antd-mobile";
import { useMemo, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { LiuYaoChart } from "../models/Gua";
import type { ChartSnapshot } from "../models/Gua";
import { isAiConfigValid, type AiConfig } from "../models/AiConfig";
import { streamAnalysis, type ChatMessage } from "../utils/deepseek";
import { AiConfigModal } from "./AiConfigModal";
import { TapButton } from "./TapButton";
import styles from "./AiAnalysisSection.module.css";

const { Paragraph, Text } = Typography;

const SYSTEM_PROMPT =
  "你是一位精通《增删卜易》《黄金策》《卜筮正宗》的六爻占卜分析助手。请根据用户提供的排盘信息，用中文给出结构化、专业、易懂的分析。先分析用神、世应、旺衰、动变，再综合日辰月建、旬空、伏神、六神等要素给出断语，最后给出简明建议。";

export function AiAnalysisSection({
  snapshot,
  aiConfig,
  onAiConfigChange,
}: {
  snapshot: ChartSnapshot;
  aiConfig: AiConfig | null;
  onAiConfigChange: (config: AiConfig) => void;
}) {
  const [configVisible, setConfigVisible] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [output, setOutput] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const promptContext = useMemo(() => {
    const chart = LiuYaoChart.fromSnapshot(snapshot);
    return chart.toPromptContext();
  }, [snapshot]);

  const configured = isAiConfigValid(aiConfig);

  async function copyContext() {
    try {
      await navigator.clipboard.writeText(promptContext);
      Toast.show({ content: "已复制上下文" });
    } catch {
      Toast.show({ content: "复制失败" });
    }
  }

  const handleAnalyze = useCallback(() => {
    if (!configured || !aiConfig) return;

    setOutput("");
    setReasoning("");
    setHasResult(false);
    setAnalyzing(true);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `请分析以下六爻排盘：\n${promptContext}`,
      },
    ];

    streamAnalysis(
      aiConfig,
      messages,
      (chunk) => {
        flushSync(() => {
          setOutput((current) => current + chunk);
        });
      },
      (chunk) => {
        flushSync(() => {
          setReasoning((current) => current + chunk);
        });
      },
      () => {
        setAnalyzing(false);
        setHasResult(true);
      },
      (error) => {
        setAnalyzing(false);
        Dialog.alert({
          title: "分析失败",
          content: error.message,
          confirmText: "确定",
        });
      },
    );
  }, [aiConfig, configured, promptContext]);

  function resetAnalysis() {
    setOutput("");
    setReasoning("");
    setHasResult(false);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Flex justify="space-between" align="center" className={styles.header}>
          <span className={styles.title}>AI分析 (仅支持Deepseek Api)</span>
        </Flex>

        {!hasResult && !analyzing && (
          <Flex gap="small" className={styles.actions}>
            <TapButton fill="outline" size="small" onTap={copyContext}>
              复制上下文
            </TapButton>
            <TapButton
              color="primary"
              size="small"
              onTap={handleAnalyze}
              disabled={!configured}
            >
              执行分析
            </TapButton>
            <TapButton
              fill="outline"
              size="small"
              onTap={() => setConfigVisible(true)}
            >
              配置AI
            </TapButton>
          </Flex>
        )}

        {(analyzing || hasResult) && (
          <div className={styles.outputArea}>
            {Boolean(reasoning) && (
              <div className={styles.reasoningBox}>
                <Text type="secondary" className={styles.reasoningLabel}>
                  思考过程
                </Text>
                <Text type="secondary" className={styles.reasoning}>
                  {reasoning}
                </Text>
              </div>
            )}

            <Paragraph className={styles.output}>
              {output || (analyzing ? "AI 正在思考，请稍候..." : "")}
              {analyzing && <Spin size="small" className={styles.spin} />}
            </Paragraph>

            {!analyzing && (
              <Flex gap="small" className={styles.resultActions}>
                <TapButton
                  fill="outline"
                  size="small"
                  onTap={() => setConfigVisible(true)}
                >
                  配置AI
                </TapButton>
                <TapButton color="primary" size="small" onTap={resetAnalysis}>
                  重新分析
                </TapButton>
              </Flex>
            )}
          </div>
        )}
      </div>

      <AiConfigModal
        visible={configVisible}
        config={aiConfig}
        onClose={() => setConfigVisible(false)}
        onSave={(config) => {
          onAiConfigChange(config);
          setConfigVisible(false);
          Toast.show({ content: "配置已保存" });
        }}
      />
    </>
  );
}
