export type CoinFace = "heads" | "tails";

export interface CoinTossResult {
  faces: CoinFace[];
  total: number;
  label: string;
}

const FACE_VALUES: Record<CoinFace, number> = {
  heads: 3,
  tails: 2,
};

const RESULT_LABELS: Record<number, string> = {
  6: "老阴（6）",
  7: "少阳（7）",
  8: "少阴（8）",
  9: "老阳（9）",
};

export function createCoinTossResult(faces: CoinFace[]): CoinTossResult {
  const total = faces.reduce((sum, face) => sum + FACE_VALUES[face], 0);

  return {
    faces,
    total,
    label: RESULT_LABELS[total] ?? `${total}`,
  };
}

export function formatCoinFace(face: CoinFace) {
  return face === "heads" ? "正" : "背";
}
