import { DatePicker, Input, Switch } from "antd-mobile";
import { useEffect } from "react";
import type { CastInfo } from "../types/cast";
import { TapButton } from "./TapButton";
import { useAppTour } from "../tour/tourProvider";
import { MAX_QUESTION_LENGTH } from "../models/Gua";
import styles from "./CastPopup.module.css";

interface CastBasicInfoProps {
  info: CastInfo;
  useCurrentTime: boolean;
  onInfoChange: (info: CastInfo | ((current: CastInfo) => CastInfo)) => void;
  onUseCurrentTimeChange: (checked: boolean) => void;
}

export function CastBasicInfo({
  info,
  useCurrentTime,
  onInfoChange,
  onUseCurrentTimeChange,
}: CastBasicInfoProps) {
  const { registerTarget } = useAppTour();

  useEffect(() => {
    if (!useCurrentTime) return;

    const timer = window.setInterval(() => {
      onInfoChange((current) => ({ ...current, castAt: new Date() }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onInfoChange, useCurrentTime]);

  function updateQuestion(question: string) {
    onInfoChange({
      ...info,
      question: question.slice(0, MAX_QUESTION_LENGTH),
    });
  }

  function updateCastAt(castAt: Date) {
    onInfoChange({ ...info, castAt });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>基本信息</div>
      <div className={styles.fieldList}>
        <label className={styles.fieldRow} ref={registerTarget("theme")}>
          <span>占事主题(限15字)</span>
          <Input
            value={info.question}
            placeholder="请输入本次占事主题"
            clearable
            maxLength={MAX_QUESTION_LENGTH}
            onChange={updateQuestion}
          />
        </label>

        <div className={styles.timeGroup} ref={registerTarget("time")}>
          <div className={styles.timeSwitchRow}>
            <span>使用当前时间</span>
            <Switch
              checked={useCurrentTime}
              onChange={(checked) => {
                onUseCurrentTimeChange(checked);
                if (checked) {
                  updateCastAt(new Date());
                }
              }}
            />
          </div>

          <DatePicker
            precision="minute"
            value={info.castAt}
            onConfirm={updateCastAt}
          >
            {(_, actions) => (
              <button
                type="button"
                className={styles.timeButton}
                disabled={useCurrentTime}
                onClick={() => {
                  if (!useCurrentTime) {
                    actions.open();
                  }
                }}
              >
                <span>起卦时间</span>
                <strong>{formatCastTime(info.castAt)}</strong>
              </button>
            )}
          </DatePicker>
          {!useCurrentTime && (
            <TapButton fill="outline" onTap={() => updateCastAt(new Date())}>
              填入当前时间
            </TapButton>
          )}
        </div>
      </div>
    </section>
  );
}

function formatCastTime(date: Date) {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
