import type { GanZhiName, StemName, VoidBranches } from "../types/basicTerms";
import { BRANCH_NAMES, STEM_NAMES } from "../types/basicTerms";

export interface CalendarInfo {
  createdAt: string;
  year: GanZhiName;
  month: GanZhiName;
  day: GanZhiName;
  hour: GanZhiName;
  yearVoidBranches: VoidBranches;
  monthVoidBranches: VoidBranches;
  dayVoidBranches: VoidBranches;
  hourVoidBranches: VoidBranches;
  voidBranches: VoidBranches;
  note: string;
}

const JIA_ZI: GanZhiName[] = Array.from(
  { length: 60 },
  (_, index) => `${STEM_NAMES[index % 10]}${BRANCH_NAMES[index % 12]}` as GanZhiName,
);

const COMMON_YEAR_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export class LiuYaoTime {
  public readonly date: Date;

  constructor(date = new Date()) {
    this.date = date;
  }

  toCalendarInfo(): CalendarInfo {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const dayGanZhiIndex = getDayGanZhiIndex(this.date);
    const dayStemIndex = dayGanZhiIndex % 10;
    const hourBranchIndex = Math.floor(((this.date.getHours() + 1) % 24) / 2);
    const hourStemStart = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const hourStemIndex = (hourStemStart + hourBranchIndex) % 10;
    const hourGanZhi = `${STEM_NAMES[hourStemIndex]}${BRANCH_NAMES[hourBranchIndex]}` as GanZhiName;
    const yearGanZhiIndexValue = mod(year - 4, 60);
    const yearGanZhi = JIA_ZI[yearGanZhiIndexValue];
    const monthBranchIndex = mod(month, 12);
    const monthStemStartByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    const yearStem = getGanZhiStem(yearGanZhi);
    const monthStemIndex =
      (monthStemStartByYearStem[STEM_NAMES.indexOf(yearStem)] + monthBranchIndex - 2) % 10;
    const monthGanZhi = `${STEM_NAMES[mod(monthStemIndex, 10)]}${BRANCH_NAMES[monthBranchIndex]}` as GanZhiName;

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

function getVoidBranches(ganZhiIndex: number): VoidBranches {
  const voidStart = ganZhiIndex - (ganZhiIndex % 10);
  const voidBranchStart = voidStart % 12;
  return [BRANCH_NAMES[(voidBranchStart + 10) % 12], BRANCH_NAMES[(voidBranchStart + 11) % 12]];
}

function getDayGanZhiIndex(date: Date) {
  const yearLastTwoDigits = mod(date.getFullYear(), 100);
  const janFirstBase =
    ((yearLastTwoDigits + 7) * 5 + 15 + Math.floor((yearLastTwoDigits + 19) / 4)) % 60;
  const serial = mod(janFirstBase + getDayOfYear(date), 60);

  return serial === 0 ? 59 : serial - 1;
}

function getDayOfYear(date: Date) {
  const monthIndex = date.getMonth();
  const daysBeforeMonth = COMMON_YEAR_MONTH_DAYS.slice(0, monthIndex).reduce(
    (sum, days) => sum + days,
    0,
  );
  const leapDay = isLeapYear(date.getFullYear()) && monthIndex > 1 ? 1 : 0;

  return daysBeforeMonth + leapDay + date.getDate();
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getGanZhiStem(ganZhi: GanZhiName): StemName {
  return ganZhi[0] as StemName;
}
