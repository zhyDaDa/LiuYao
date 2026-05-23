import type { ChartSnapshot } from "./Gua";

const ARCHIVE_KEY = "liuyao.archive.v1";

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
