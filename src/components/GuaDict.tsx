import { useState } from "react";
import { Picker } from "antd-mobile";
import type { TrigramName } from "../types/basicTerms";
import { GUA_NAMES, getGuaSpecialType } from "../models/Gua";

interface TrigramMeta {
  name: TrigramName;
  /** 卦象（天泽火雷风水山地） */
  nature: string;
  element: string;
  /** 自上而下的三爻，true 为阳爻（实线） */
  lines: readonly [boolean, boolean, boolean];
}

const TRIGRAMS: readonly TrigramMeta[] = [
  { name: "乾", nature: "天", element: "金", lines: [true, true, true] },
  { name: "兑", nature: "泽", element: "金", lines: [false, true, true] },
  { name: "离", nature: "火", element: "火", lines: [true, false, true] },
  { name: "震", nature: "雷", element: "木", lines: [false, false, true] },
  { name: "巽", nature: "风", element: "木", lines: [true, true, false] },
  { name: "坎", nature: "水", element: "水", lines: [false, true, false] },
  { name: "艮", nature: "山", element: "土", lines: [true, false, false] },
  { name: "坤", nature: "地", element: "土", lines: [false, false, false] },
];

const TRIGRAM_COLUMN = TRIGRAMS.map((trigram) => ({
  label: `${trigram.name}（${trigram.nature}）`,
  value: trigram.name,
}));

function findTrigram(name: TrigramName): TrigramMeta {
  return TRIGRAMS.find((trigram) => trigram.name === name) ?? TRIGRAMS[0];
}

export function GuaDict() {
  const [upper, setUpper] = useState<TrigramName>("乾");
  const [lower, setLower] = useState<TrigramName>("乾");

  const upperMeta = findTrigram(upper);
  const lowerMeta = findTrigram(lower);
  const guaName = GUA_NAMES[upper + lower] ?? `${upper}上${lower}下`;
  const special = getGuaSpecialType(guaName);

  return (
    <section className="gua-dict-card">
      <div className="gua-dict-head">
        <h2>六十四卦速查</h2>
        <p>选择外卦与内卦，查看对应卦名</p>
      </div>
      <div className="gua-dict-body">
        <div className="gua-dict-selectors">
          <TrigramPicker
            label="外卦"
            meta={upperMeta}
            value={upper}
            onChange={setUpper}
          />
          <TrigramPicker
            label="内卦"
            meta={lowerMeta}
            value={lower}
            onChange={setLower}
          />
        </div>
        <div className="gua-dict-result">
          <div className="gua-dict-hexagram">
            <TrigramLines lines={upperMeta.lines} />
            <TrigramLines lines={lowerMeta.lines} />
          </div>
          <div className="gua-dict-name">
            <strong>{guaName}</strong>
            {special && <span className="gua-dict-tag">{special}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrigramPicker({
  label,
  meta,
  value,
  onChange,
}: {
  label: string;
  meta: TrigramMeta;
  value: TrigramName;
  onChange: (name: TrigramName) => void;
}) {
  return (
    <Picker
      columns={[TRIGRAM_COLUMN]}
      value={[value]}
      onConfirm={(selected) => {
        const picked = selected[0];
        if (picked) {
          onChange(picked as TrigramName);
        }
      }}
    >
      {(_, actions) => (
        <button
          type="button"
          className="gua-dict-trigram"
          onClick={actions.open}
        >
          <span className="gua-dict-trigram-label">{label}</span>
          <TrigramLines lines={meta.lines} />
          <span className="gua-dict-trigram-name">
            {meta.name}
            <small>{meta.nature}</small>
          </span>
        </button>
      )}
    </Picker>
  );
}

function TrigramLines({ lines }: { lines: readonly boolean[] }) {
  return (
    <span className="gua-dict-lines">
      {lines.map((isYang, index) => (
        <span
          key={index}
          className={`gua-dict-line ${isYang ? "is-yang" : "is-yin"}`}
        >
          <i />
          {!isYang && <i />}
        </span>
      ))}
    </span>
  );
}
