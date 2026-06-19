import type {
  BranchName,
  GanZhiName,
  LifeStageMatches,
  StemName,
  VoidBranches,
} from "../types/basicTerms";
import {
  BRANCH_NAMES,
  ELEMENT_NAMES,
  LIFE_STAGE_BRANCHES,
  LIFE_STAGE_NAMES,
  STEM_NAMES,
} from "../types/basicTerms";

export interface CalendarInfo {
  createdAt: string;
  year: GanZhiName;
  month: GanZhiName;
  day: GanZhiName;
  hour: GanZhiName;
  yearBranch: BranchName;
  monthBranch: BranchName;
  dayBranch: BranchName;
  hourBranch: BranchName;
  yearVoidBranches: VoidBranches;
  monthVoidBranches: VoidBranches;
  dayVoidBranches: VoidBranches;
  hourVoidBranches: VoidBranches;
  voidBranches: VoidBranches;
  dayLifeStages: LifeStageMatches;
}

const JIA_ZI: GanZhiName[] = Array.from(
  { length: 60 },
  (_, index) =>
    `${STEM_NAMES[index % 10]}${BRANCH_NAMES[index % 12]}` as GanZhiName,
);

const COMMON_YEAR_MONTH_DAYS = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;

export class LiuYaoTime {
  public readonly date: Date;

  constructor(date = new Date()) {
    this.date = date;
  }

  toCalendarInfo(): CalendarInfo {
    // ==================== 基础日期信息 ====================
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;

    // ==================== 年柱计算 ====================
    const yearGanZhiIndexValue = mod(year - 4, 60);
    const yearGanZhi = JIA_ZI[yearGanZhiIndexValue];
    const yearBranch = getGanZhiBranch(yearGanZhi);
    const yearStem = getGanZhiStem(yearGanZhi);

    // ==================== 月柱计算 ====================
    const monthBranchIndex = mod(month, 12);
    const monthBranch = BRANCH_NAMES[monthBranchIndex];
    const monthStemStartByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    const monthStemIndex =
      (monthStemStartByYearStem[STEM_NAMES.indexOf(yearStem)] +
        monthBranchIndex -
        2) %
      10;
    const monthGanZhi =
      `${STEM_NAMES[mod(monthStemIndex, 10)]}${BRANCH_NAMES[monthBranchIndex]}` as GanZhiName;

    // ==================== 日柱计算 ====================
    const dayGanZhiIndex = getDayGanZhiIndex(this.date);
    const dayGanZhi = JIA_ZI[dayGanZhiIndex];
    const dayBranch = getGanZhiBranch(dayGanZhi);
    const dayStemIndex = dayGanZhiIndex % 10;

    // ==================== 时柱计算 ====================
    const hourBranchIndex = Math.floor(((this.date.getHours() + 1) % 24) / 2);
    const hourBranch = BRANCH_NAMES[hourBranchIndex];
    const hourStemStart = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const hourStemIndex = (hourStemStart + hourBranchIndex) % 10;
    const hourGanZhi =
      `${STEM_NAMES[hourStemIndex]}${BRANCH_NAMES[hourBranchIndex]}` as GanZhiName;

    return {
      createdAt: this.date.toISOString(),
      year: yearGanZhi,
      month: monthGanZhi,
      day: dayGanZhi,
      hour: hourGanZhi,
      yearBranch: yearBranch,
      monthBranch: monthBranch,
      dayBranch: dayBranch,
      hourBranch: hourBranch,
      yearVoidBranches: getVoidBranches(yearGanZhiIndexValue),
      monthVoidBranches: getVoidBranches(JIA_ZI.indexOf(monthGanZhi)),
      dayVoidBranches: getVoidBranches(dayGanZhiIndex),
      hourVoidBranches: getVoidBranches(JIA_ZI.indexOf(hourGanZhi)),
      voidBranches: getVoidBranches(dayGanZhiIndex),
      dayLifeStages: getLifeStageMatches(dayBranch),
    };
  }
}

function mod(value: number, base: number) {
  return ((value % base) + base) % base;
}

function getVoidBranches(ganZhiIndex: number): VoidBranches {
  const voidStart = ganZhiIndex - (ganZhiIndex % 10);
  const voidBranchStart = voidStart % 12;
  return [
    BRANCH_NAMES[(voidBranchStart + 10) % 12],
    BRANCH_NAMES[(voidBranchStart + 11) % 12],
  ];
}

function getDayGanZhiIndex(date: Date) {
  const yearLastTwoDigits = mod(date.getFullYear(), 100);
  const janFirstBase =
    ((yearLastTwoDigits + 7) * 5 +
      15 +
      Math.floor((yearLastTwoDigits + 19) / 4)) %
    60;
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

function getGanZhiBranch(ganZhi: GanZhiName): BranchName {
  return ganZhi[1] as BranchName;
}

// 获取日干支对应的五行阶段
function getLifeStageMatches(branch: BranchName): LifeStageMatches {
  return ELEMENT_NAMES.reduce<LifeStageMatches>(
    (matches, element) => {
      const stage =
        LIFE_STAGE_NAMES.find(
          (stageName) => LIFE_STAGE_BRANCHES[element][stageName] === branch,
        ) ?? "";
      return {
        ...matches,
        [element]: stage,
      };
    },
    {
      木: "",
      火: "",
      土: "",
      金: "",
      水: "",
    },
  );
}
