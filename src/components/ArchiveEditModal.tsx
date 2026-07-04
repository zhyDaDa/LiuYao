import { Modal } from "antd-mobile";
import { useEffect, useState } from "react";
import {
  ARCHIVE_YAO_OPTIONS,
  applyArchiveDraft,
  snapshotToArchiveDraft,
  type ArchiveEditDraft,
  type ArchiveYaoValue,
} from "../models/Archive";
import type { ChartSnapshot } from "../models/Gua";
import { MAX_QUESTION_LENGTH } from "../models/Gua";
import styles from "./ArchiveEditModal.module.css";
import { YAO_NAMES } from "../types/basicTerms";

export function ArchiveEditModal({
  item,
  onClose,
  onSave,
}: {
  item: ChartSnapshot | null;
  onClose: () => void;
  onSave: (item: ChartSnapshot) => void;
}) {
  const [draft, setDraft] = useState<ArchiveEditDraft | null>(null);

  useEffect(() => {
    setDraft(item ? snapshotToArchiveDraft(item) : null);
  }, [item]);

  function updateDraft<K extends keyof ArchiveEditDraft>(
    key: K,
    value: ArchiveEditDraft[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateYao(position: number, value: ArchiveYaoValue) {
    setDraft((current) => {
      if (!current) return current;
      const yaos = [...current.yaos];
      yaos[position] = value;

      return { ...current, yaos };
    });
  }

  function saveDraft() {
    if (!item || !draft) return;
    onSave(applyArchiveDraft(item, draft));
  }

  return (
    <Modal
      visible={Boolean(item)}
      title="编辑历史排盘"
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
        draft ? (
          <div className={styles.form}>
            <label className={styles.field}>
              <span>排盘名称</span>
              <input
                value={draft.question}
                maxLength={MAX_QUESTION_LENGTH}
                placeholder="例如：工作选择"
                onChange={(event) =>
                  updateDraft(
                    "question",
                    event.target.value.slice(0, MAX_QUESTION_LENGTH),
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>起卦时间</span>
              <input
                type="datetime-local"
                value={draft.createdAt}
                onChange={(event) =>
                  updateDraft("createdAt", event.target.value)
                }
              />
            </label>

            <div className={styles.yaoList}>
              {draft.yaos.map((value, position) => (
                <label className={styles.yaoField} key={YAO_NAMES[position]}>
                  <span>{YAO_NAMES[position]}</span>
                  <select
                    value={value}
                    onChange={(event) =>
                      updateYao(position, event.target.value as ArchiveYaoValue)
                    }
                  >
                    {ARCHIVE_YAO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}（{option.description}）
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <label className={styles.field}>
              <span>备注</span>
              <textarea
                value={draft.remark}
                rows={3}
                maxLength={200}
                placeholder="可记录当时的问题背景、断语或后续反馈"
                onChange={(event) => updateDraft("remark", event.target.value)}
              />
            </label>
          </div>
        ) : null
      }
      actions={[
        { key: "cancel", text: "取消" },
        {
          key: "save",
          text: "保存",
          primary: true,
          onClick: saveDraft,
        },
      ]}
    />
  );
}
