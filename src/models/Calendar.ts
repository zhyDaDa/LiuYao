export interface CalendarInfo {
  createdAt: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  yearVoidBranches: [string, string];
  monthVoidBranches: [string, string];
  dayVoidBranches: [string, string];
  hourVoidBranches: [string, string];
  voidBranches: [string, string];
  note: string;
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const JIA_ZI = Array.from({ length: 60 }, (_, index) => STEMS[index % 10] + BRANCHES[index % 12]);

export class LiuYaoTime {
  public readonly date: Date;

  constructor(date = new Date()) {
    this.date = date;
  }

  toCalendarInfo(): CalendarInfo {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const dayIndex = daysBetween(new Date(1900, 0, 1), startOfDay(this.date));
    const dayGanZhiIndex = mod(35 + dayIndex, 60);
    const dayStemIndex = dayGanZhiIndex % 10;
    const hourBranchIndex = Math.floor(((this.date.getHours() + 1) % 24) / 2);
    const hourStemStart = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const hourStemIndex = (hourStemStart + hourBranchIndex) % 10;
    const hourGanZhi = STEMS[hourStemIndex] + BRANCHES[hourBranchIndex];
    const yearGanZhiIndexValue = mod(year - 4, 60);
    const yearGanZhi = JIA_ZI[yearGanZhiIndexValue];
    const monthBranchIndex = mod(month, 12);
    const monthStemStartByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    const monthStemIndex =
      (monthStemStartByYearStem[STEMS.indexOf(yearGanZhi[0])] + monthBranchIndex - 2) % 10;
    const monthGanZhi = STEMS[mod(monthStemIndex, 10)] + BRANCHES[monthBranchIndex];

    return {
      createdAt: this.date.toISOString(),
      year: yearGanZhi,
      month: monthGanZhi,
      day: JIA_ZI[dayGanZhiIndex],
      hour: hourGanZhi,
      yearVoidBranches: getVoidBranches(yearGanZhiIndexValue),
      monthVoidBranches: getVoidBranches(JIA_ZI.indexOf(monthGanZhi)),
      dayVoidBranches: getVoidBranches(dayGanZhiIndex),
      hourVoidBranches: getVoidBranches(JIA_ZI.indexOf(hourGanZhi)),
      voidBranches: getVoidBranches(dayGanZhiIndex),
      note: "月柱暂按公历月份近似，后续可接入精确节气库。",
    };
  }
}

function mod(value: number, base: number) {
  return ((value % base) + base) % base;
}

function getVoidBranches(ganZhiIndex: number): [string, string] {
  const voidStart = ganZhiIndex - (ganZhiIndex % 10);
  const voidBranchStart = voidStart % 12;
  return [BRANCHES[(voidBranchStart + 10) % 12], BRANCHES[(voidBranchStart + 11) % 12]];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}
