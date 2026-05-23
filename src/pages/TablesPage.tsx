import { BranchCycleTable } from "../components/BranchCycleTable";
import { LookupCard } from "../components/LookupCard";

export function TablesPage() {
  return (
    <section className="page tables-page">
      <div className="page-title compact-title">
        <span className="eyebrow">速查表</span>
        <h1>基础规则</h1>
      </div>
      <BranchCycleTable />
      <div className="lookup-grid">
        <LookupCard title="地支五行" rows={["亥子：水", "寅卯：木", "巳午：火", "申酉：金", "辰戌丑未：土"]} />
        <LookupCard title="六亲" rows={["生我：父母", "同我：兄弟", "我生：子孙", "我克：妻财", "克我：官鬼"]} />
        <LookupCard title="旬空" rows={["甲子旬：戌亥", "甲戌旬：申酉", "甲申旬：午未", "甲午旬：辰巳", "甲辰旬：寅卯", "甲寅旬：子丑"]} />
        <LookupCard title="六神" rows={["甲乙：青龙起", "丙丁：朱雀起", "戊：勾陈起", "己：螣蛇起", "庚辛：白虎起", "壬癸：玄武起"]} />
      </div>
    </section>
  );
}
