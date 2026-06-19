import type { ChartSnapshot } from "./Gua";
import { LiuYaoChart, Yao } from "./Gua";

const ARCHIVE_KEY = "liuyao.archive.v1";

export type ArchiveYaoValue = "oldYang" | "youngYang" | "youngYin" | "oldYin";

export interface ArchiveEditDraft {
  question: string;
  createdAt: string;
  yaos: ArchiveYaoValue[];
  remark: string;
}

export const ARCHIVE_YAO_OPTIONS: {
  label: string;
  value: ArchiveYaoValue;
  description: string;
}[] = [
  { label: "老阳", value: "oldYang", description: "九，阳爻动" },
  { label: "少阳", value: "youngYang", description: "七，阳爻静" },
  { label: "老阴", value: "oldYin", description: "六，阴爻动" },
  { label: "少阴", value: "youngYin", description: "八，阴爻静" },
];

export function readArchive(): ChartSnapshot[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? (JSON.parse(raw) as ChartSnapshot[]) : [];
  } catch {
    return [];
  }
}

export function writeArchive(items: ChartSnapshot[]) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items));
}

export function snapshotToArchiveDraft(
  snapshot: ChartSnapshot,
): ArchiveEditDraft {
  return {
    question: snapshot.question,
    createdAt: formatDateTimeInput(new Date(snapshot.calendar.createdAt)),
    yaos: snapshot.yaos.map((yao) =>
      yaoToArchiveYaoValue(yao.isYang, yao.isMoving),
    ),
    remark: snapshot.remark ?? "",
  };
}

export function applyArchiveDraft(
  snapshot: ChartSnapshot,
  draft: ArchiveEditDraft,
): ChartSnapshot {
  const chart = new LiuYaoChart(
    draft.yaos.map((value, position) => archiveYaoValueToYao(value, position)),
    draft.question.trim() || "未命名占事",
    parseDateTimeInput(draft.createdAt, new Date(snapshot.calendar.createdAt)),
    snapshot.id,
    draft.remark.trim(),
  );

  return {
    ...chart.toSnapshot(
      snapshot.useYaoPosition ?? null,
      snapshot.yaoPositionCategory,
    ),
  };
}

function archiveYaoValueToYao(value: ArchiveYaoValue, position: number) {
  const isYang = value === "oldYang" || value === "youngYang";
  const isMoving = value === "oldYang" || value === "oldYin";

  return new Yao(position, isYang, isMoving);
}

function yaoToArchiveYaoValue(
  isYang: boolean,
  isMoving: boolean,
): ArchiveYaoValue {
  if (isYang && isMoving) return "oldYang";
  if (isYang) return "youngYang";
  if (isMoving) return "oldYin";
  return "youngYin";
}

function formatDateTimeInput(date: Date) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hour = padDatePart(date.getHours());
  const minute = padDatePart(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function parseDateTimeInput(value: string, fallback: Date) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}
