import { Picker, Popup, Toast } from "antd-mobile";
import { useEffect, useState } from "react";
import { YAO_NAMES } from "../types/basicTerms";
import { TapButton } from "./TapButton";
import styles from "./CastPopup.module.css";

const COIN_COLUMNS: Array<Array<{ label: string; value: string }>> = [
  [
    { label: "老阴（6）", value: "6" },
    { label: "少阳（7）", value: "7" },
    { label: "少阴（8）", value: "8" },
    { label: "老阳（9）", value: "9" },
  ],
];

const COIN_LABELS: Record<string, string> = {
  6: "老阴（6）",
  7: "少阳（7）",
  8: "少阴（8）",
  9: "老阳（9）",
};

const DISPLAY_ORDER = [5, 4, 3, 2, 1, 0];

export function CastPopup({
  visible,
  onClose,
  onAutoCast,
  onManualCast,
}: {
  visible: boolean;
  onClose: () => void;
  onAutoCast: () => void;
  onManualCast: (coinTotals: number[]) => void;
}) {
  const [manualValues, setManualValues] = useState<(string | null)[]>(
    () => Array.from({ length: 6 }, () => null),
  );

  useEffect(() => {
    if (visible) {
      setManualValues(Array.from({ length: 6 }, () => null));
    }
  }, [visible]);

  const isManualReady = manualValues.every((value) => Boolean(value));

  function updateManualValue(position: number, value: string | null) {
    setManualValues((current) => {
      const next = [...current];
      next[position] = value;
      return next;
    });
  }

  function handleManualConfirm() {
    if (!isManualReady) {
      Toast.show({ content: "请先填写六次铜币结果" });
      return;
    }
    onManualCast(manualValues.map((value) => Number(value)));
  }

  return (
    <Popup
      visible={visible}
      position="bottom"
      onClose={onClose}
      onMaskClick={onClose}
      bodyStyle={{ height: "80vh" }}
      bodyClassName={styles.popupBody}
      showCloseButton
    >
      <div className={styles.header}>
        <span className={styles.eyebrow}>起卦</span>
        <h2>选择起卦方式</h2>
        <p>自动起卦会随机生成六爻；手动起卦需要输入 6 次铜币结果。</p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>自动起卦</div>
        <p className={styles.sectionDesc}>系统随机生成排盘数据。</p>
        <TapButton color="primary" onTap={onAutoCast}>
          自动起卦
        </TapButton>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>手动起卦</div>
        <p className={styles.sectionDesc}>初爻在下，六爻在上。请依次填写。</p>
        <div className={styles.manualList}>
          {DISPLAY_ORDER.map((position) => {
            const value = manualValues[position];
            const display = value ? COIN_LABELS[value] : "请填写结果";

            return (
              <div className={styles.manualRow} key={YAO_NAMES[position]}>
                <div className={styles.manualLabel}>{YAO_NAMES[position]}</div>
                <Picker
                  columns={COIN_COLUMNS}
                  value={value ? [value] : []}
                  onConfirm={(selected) => {
                    const picked = selected[0];
                    updateManualValue(
                      position,
                      picked === null || picked === undefined
                        ? null
                        : String(picked),
                    );
                  }}
                >
                  {(_, actions) => (
                    <TapButton
                      fill="outline"
                      onTap={actions.open}
                      className={styles.manualButton}
                    >
                      {display}
                    </TapButton>
                  )}
                </Picker>
              </div>
            );
          })}
        </div>
        <div className={styles.manualActions}>
          <TapButton
            color="primary"
            onTap={handleManualConfirm}
            disabled={!isManualReady}
          >
            开始排盘
          </TapButton>
        </div>
      </section>
    </Popup>
  );
}
