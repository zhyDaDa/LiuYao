import { BranchCycleTable } from "../components/BranchCycleTable";
import { GuaDict } from "../components/GuaDict";
import { LookupCard } from "../components/LookupCard";
import {
  RELATIVE_CHANGE_FEATURE_ROWS,
  RELATIVE_CHANGE_REFERENCE_ROWS,
  RELATIVE_IMAGE_ROWS,
} from "../models/RelativeImages";
import { enabledRuleExplanations } from "../models/Rules";
import {
  SIX_SPIRIT_IMAGE_ROWS,
  SIX_SPIRIT_START_RULES,
} from "../models/SixSpiritImages";

export function TablesPage() {
  return (
    <section className="page tables-page">
      <div className="page-title compact-title">
        <span className="eyebrow">速查表</span>
        <h1>基础规则</h1>
      </div>
      <BranchCycleTable />
      <GuaDict />
      <div className="lookup-grid">
        <LookupCard title="已启用规则集" rows={enabledRuleExplanations} />
        <LookupCard title="地支五行" rows={["亥子：水", "寅卯：木", "巳午：火", "申酉：金", "辰戌丑未：土"]} />
        <LookupCard title="六亲" rows={["生我：父母", "同我：兄弟", "我生：子孙", "我克：妻财", "克我：官鬼"]} />
        <LookupCard title="六亲取象" rows={RELATIVE_IMAGE_ROWS} />
        <LookupCard title="六亲互化特点" rows={RELATIVE_CHANGE_FEATURE_ROWS} />
        <LookupCard title="六亲互化取象" rows={RELATIVE_CHANGE_REFERENCE_ROWS} />
        <LookupCard title="旬空" rows={["甲子旬：戌亥", "甲戌旬：申酉", "甲申旬：午未", "甲午旬：辰巳", "甲辰旬：寅卯", "甲寅旬：子丑"]} />
        <LookupCard title="六神起法" rows={SIX_SPIRIT_START_RULES} />
        <LookupCard title="六神意象" rows={SIX_SPIRIT_IMAGE_ROWS} />
      </div>
    </section>
  );
}
