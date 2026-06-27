import { Picker, Popup, Toast } from "antd-mobile";
import { useEffect, useState } from "react";
import type { CastInfo, CastSubmitPayload } from "../types/cast";
import { YAO_NAMES } from "../types/basicTerms";
import { CastBasicInfo } from "./CastBasicInfo";
import { CoinTossCanvas } from "./coin-toss/CoinTossCanvas";
import { TapButton } from "./TapButton";
import { useAppTour } from "../tour/tourProvider";
import { Help } from "../icons/Icons";
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
  onAutoCast: (info: CastInfo) => void;
  onManualCast: (payload: CastSubmitPayload) => void;
}) {
  const { startTour, registerTarget } = useAppTour();
  const [castInfo, setCastInfo] = useState<CastInfo>(() => ({
    question: "",
    castAt: new Date(),
  }));
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [manualValues, setManualValues] = useState<(string | null)[]>(
    () => Array.from({ length: 6 }, () => null),
  );

  useEffect(() => {
    if (visible) {
      setCastInfo({
        question: "",
        castAt: new Date(),
      });
      setUseCurrentTime(true);
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

  function getCastInfo() {
    return {
      ...castInfo,
      question: castInfo.question.trim() || "未命名占事",
      castAt: useCurrentTime ? new Date() : castInfo.castAt,
    };
  }

  function handleAutoConfirm() {
    onAutoCast(getCastInfo());
  }

  function handleManualConfirm() {
    if (!isManualReady) {
      Toast.show({ content: "请先填写六次铜币结果" });
      return;
    }
    onManualCast({
      ...getCastInfo(),
      coinTotals: manualValues.map((value) => Number(value)),
    });
  }

  function fillNextManualValue(total: number) {
    const nextPosition = manualValues.findIndex((value) => !value);
    if (nextPosition < 0) {
      Toast.show({ content: "六爻结果已经填满" });
      return;
    }

    updateManualValue(nextPosition, String(total));
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
        <div className={styles.headerTitleRow}>
          <h2>选择起卦方式</h2>
          <button
            type="button"
            className={styles.helpButton}
            onClick={() => startTour("toast-drawer")}
            aria-label="查看起卦引导"
          >
            {Help}
          </button>
        </div>
        <p>先填写占事主题与时间，再选择自动、模拟或手动起卦。</p>
      </div>

      <CastBasicInfo
        info={castInfo}
        useCurrentTime={useCurrentTime}
        onInfoChange={setCastInfo}
        onUseCurrentTimeChange={setUseCurrentTime}
      />

      <section className={styles.section} ref={registerTarget("auto-toast")}>
        <div className={styles.sectionTitle}>自动起卦</div>
        <p className={styles.sectionDesc}>系统随机生成排盘数据。</p>
        <TapButton color="primary" onTap={handleAutoConfirm}>
          自动起卦
        </TapButton>
      </section>

      <section
        className={styles.section}
        ref={registerTarget("simulation-toast")}
      >
        <div className={styles.sectionTitle}>模拟起卦</div>
        <p className={styles.sectionDesc}>
          每次投掷三枚铜钱，动画停止后会按初爻到上爻填入第一个空位。
        </p>
        <CoinTossCanvas
          disabled={isManualReady}
          onResult={(result) => fillNextManualValue(result.total)}
        />
      </section>

      <section className={styles.section} ref={registerTarget("manual-toast")}>
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
          <span ref={registerTarget("end")} style={{ display: "inline-block" }}>
            <TapButton
              color="primary"
              onTap={handleManualConfirm}
              disabled={!isManualReady}
            >
              开始排盘
            </TapButton>
          </span>
        </div>
      </section>
    </Popup>
  );
}
