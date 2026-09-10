import {
  format, startOfYear, endOfYear, eachDayOfInterval, subDays, addDays,
  isSameDay, isToday, isYesterday, startOfWeek, endOfWeek, getDay,
  differenceInDays, parseISO, isWithinInterval, startOfMonth, endOfMonth
} from 'date-fns';

export const formatDate = (d) => format(typeof d === 'string' ? parseISO(d) : d, 'yyyy-MM-dd');
export const formatDisplay = (d) => format(typeof d === 'string' ? parseISO(d) : d, 'EEEE, MMMM d, yyyy');
export const formatShort = (d) => format(typeof d === 'string' ? parseISO(d) : d, 'MMM d');
export const formatMonthYear = (d) => format(typeof d === 'string' ? parseISO(d) : d, 'MMMM yyyy');
export const getToday = () => format(new Date(), 'yyyy-MM-dd');
export const getYear = () => new Date().getFullYear();
export const toStr = (d) => format(d, 'yyyy-MM-dd');

export function getLast365Days() {
  const end = new Date();
  const start = subDays(end, 364);
  return eachDayOfInterval({ start, end });
}

export function getLast7Days() {
  const end = new Date();
  return eachDayOfInterval({ start: subDays(end, 6), end });
}

export function getLast30Days() {
  const end = new Date();
  return eachDayOfInterval({ start: subDays(end, 29), end });
}

export function getYearDays(year) {
  return eachDayOfInterval({ start: startOfYear(new Date(year, 0)), end: endOfYear(new Date(year, 0)) });
}

export function getWeeksFromDays(days) {
  const weeks = [];
  let currentWeek = [];
  const firstDay = getDay(days[0]);
  for (let i = 0; i < firstDay; i++) currentWeek.push(null);
  days.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

export function getCompletionIntensity(count) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function getCurrentStreak(habitCompletions) {
  if (!habitCompletions.length) return 0;
  const dates = new Set(habitCompletions.map(c => c.date));
  let streak = 0;
  let d = new Date();
  for (let i = 0; i < 1000; i++) {
    const ds = toStr(d);
    if (dates.has(ds)) { streak++; d = subDays(d, 1); }
    else if (i === 0) { d = subDays(d, 1); }
    else break;
  }
  return streak;
}

export function getLongestStreak(habitCompletions) {
  if (!habitCompletions.length) return 0;
  const sorted = habitCompletions.map(c => c.date).sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i-1]));
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else if (diff > 1) cur = 1;
  }
  return max;
}

export function getCompletionRate(completions, days) {
  if (!days.length) return 0;
  const set = new Set(completions.map(c => c.date));
  const done = days.filter(d => set.has(toStr(d))).length;
  return Math.round((done / days.length) * 100);
}

export function getDayOfWeekStats(completions) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const counts = [0,0,0,0,0,0,0];
  completions.forEach(c => { counts[getDay(parseISO(c.date))]++; });
  return days.map((name, i) => ({ name, count: counts[i] }));
}

export function getBestDay(completions) {
  const dayMap = {};
  completions.forEach(c => {
    if (!dayMap[c.date]) dayMap[c.date] = 0;
    dayMap[c.date]++;
  });
  let best = null, max = 0;
  Object.entries(dayMap).forEach(([date, count]) => {
    if (count > max) { max = count; best = date; }
  });
  return { date: best, count: max };
}

export function getMonthlyData(completions, year) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const start = startOfMonth(new Date(year, m));
    const end = endOfMonth(new Date(year, m));
    const days = eachDayOfInterval({ start, end });
    const rate = getCompletionRate(completions, days);
    months.push({ month: format(start, 'MMM'), rate, count: completions.filter(c => {
      const d = parseISO(c.date);
      return d >= start && d <= end;
    }).length });
  }
  return months;
}

export { isToday, isYesterday, isSameDay, subDays, addDays, parseISO, differenceInDays, format };
