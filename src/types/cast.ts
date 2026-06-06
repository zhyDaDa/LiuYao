export interface CastInfo {
  question: string;
  castAt: Date;
}

export interface CastSubmitPayload extends CastInfo {
  coinTotals: number[];
}
