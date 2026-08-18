import {
  getISOWeek,
  getISOWeeksInYear,
  startOfISOWeek,
  endOfISOWeek,
  startOfWeek,
  endOfWeek,
  getWeek,
  getDayOfYear,
  isLeapYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  startOfYear,
} from 'date-fns';
import { WeekInfo } from '../types/calendar';

/**
 * Returns the week number based on ISO 8601 or custom start day.
 */
export function getWeekNumber(date: Date, firstDayOfWeek: 1 | 0 = 1): number {
  if (firstDayOfWeek === 1) {
    return getISOWeek(date);
  }
  return getWeek(date, { weekStartsOn: 0 });
}

/**
 * Returns total weeks in the given year.
 */
export function getTotalWeeksInYear(year: number, firstDayOfWeek: 1 | 0 = 1): number {
  const sampleDate = new Date(year, 5, 1);
  if (firstDayOfWeek === 1) {
    return getISOWeeksInYear(sampleDate);
  }
  const endYear = new Date(year, 11, 31);
  return getWeek(endYear, { weekStartsOn: 0 }) >= 52 ? getWeek(endYear, { weekStartsOn: 0 }) : 52;
}

/**
 * Returns week range info for a given date.
 */
export function getWeekInfo(date: Date, firstDayOfWeek: 1 | 0 = 1): WeekInfo {
  const weekNum = getWeekNumber(date, firstDayOfWeek);
  const start = firstDayOfWeek === 1 ? startOfISOWeek(date) : startOfWeek(date, { weekStartsOn: 0 });
  const end = firstDayOfWeek === 1 ? endOfISOWeek(date) : endOfWeek(date, { weekStartsOn: 0 });
  const today = new Date();

  return {
    weekNumber: weekNum,
    year: date.getFullYear(),
    startDate: start,
    endDate: end,
    isCurrentWeek: isSameWeek(date, today, { weekStartsOn: firstDayOfWeek === 1 ? 1 : 0 }),
  };
}

/**
 * Returns statistical progress metrics for the year.
 */
export function getYearMetrics(now: Date = new Date(), firstDayOfWeek: 1 | 0 = 1) {
  const year = now.getFullYear();
  const currentWeek = getWeekNumber(now, firstDayOfWeek);
  const totalWeeks = getTotalWeeksInYear(year, firstDayOfWeek);
  const dayOfYear = getDayOfYear(now);
  const totalDays = isLeapYear(now) ? 366 : 365;
  const yearProgressPercent = Math.min(100, Math.round((dayOfYear / totalDays) * 100));
  const weeksRemaining = Math.max(0, totalWeeks - currentWeek);
  const daysRemaining = Math.max(0, totalDays - dayOfYear);

  return {
    year,
    currentWeek,
    totalWeeks,
    dayOfYear,
    totalDays,
    yearProgressPercent,
    weeksRemaining,
    daysRemaining,
  };
}

export interface MonthGridRow {
  weekNumber: number;
  isCurrentWeek: boolean;
  startDate: Date;
  endDate: Date;
  days: {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isWeekend: boolean;
  }[];
}

export function generateMonthGrid(
  viewDate: Date,
  selectedDate: Date,
  firstDayOfWeek: 1 | 0 = 1
): MonthGridRow[] {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const today = new Date();

  const calendarStart = firstDayOfWeek === 1 
    ? startOfISOWeek(monthStart) 
    : startOfWeek(monthStart, { weekStartsOn: 0 });
  
  const calendarEnd = firstDayOfWeek === 1 
    ? endOfISOWeek(monthEnd) 
    : endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const rows: MonthGridRow[] = [];

  for (let i = 0; i < allDays.length; i += 7) {
    const weekDays = allDays.slice(i, i + 7);
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const weekNum = getWeekNumber(firstDay, firstDayOfWeek);

    rows.push({
      weekNumber: weekNum,
      isCurrentWeek: isSameWeek(firstDay, today, { weekStartsOn: firstDayOfWeek === 1 ? 1 : 0 }),
      startDate: firstDay,
      endDate: lastDay,
      days: weekDays.map((d) => {
        const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
        return {
          date: d,
          dayNumber: d.getDate(),
          isCurrentMonth: isSameMonth(d, viewDate),
          isToday: isSameDay(d, today),
          isSelected: isSameDay(d, selectedDate),
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        };
      }),
    });
  }

  return rows;
}

export interface QuarterWeeks {
  quarter: number;
  label: string;
  weeks: WeekInfo[];
}

export function getYearWeeksByQuarter(year: number, firstDayOfWeek: 1 | 0 = 1): QuarterWeeks[] {
  const totalWeeks = getTotalWeeksInYear(year, firstDayOfWeek);
  const quarters: QuarterWeeks[] = [
    { quarter: 1, label: 'Q1 (Jan - Mar)', weeks: [] },
    { quarter: 2, label: 'Q2 (Apr - Jun)', weeks: [] },
    { quarter: 3, label: 'Q3 (Jul - Sep)', weeks: [] },
    { quarter: 4, label: 'Q4 (Oct - Dec)', weeks: [] },
  ];

  let currentRef = startOfYear(new Date(year, 0, 4));
  if (firstDayOfWeek === 1) {
    currentRef = startOfISOWeek(currentRef);
  } else {
    currentRef = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 0 });
  }

  for (let w = 1; w <= totalWeeks; w++) {
    const weekInfo = getWeekInfo(currentRef, firstDayOfWeek);
    const midMonth = weekInfo.startDate.getMonth();
    const qIndex = Math.min(3, Math.floor(midMonth / 3));
    quarters[qIndex].weeks.push(weekInfo);

    currentRef = addWeeks(currentRef, 1);
  }

  return quarters;
}
