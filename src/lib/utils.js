import {
  format, startOfYear, endOfYear, eachDayOfInterval, subDays, addDays,
  isSameDay, isToday, isYesterday, startOfWeek, endOfWeek, getDay,
  differenceInDays, parseISO, startOfMonth, endOfMonth, getMonth, getYear,
  addMonths, subMonths, setDay as setDateDay, isWithinInterval
} from 'date-fns';

export const formatDate = (d) => format(toDate(d), 'yyyy-MM-dd');
export const formatDisplay = (d) => format(toDate(d), 'EEEE, MMMM d, yyyy');
export const formatShort = (d) => format(toDate(d), 'MMM d');
export const formatMonthYear = (d) => format(toDate(d), 'MMMM yyyy');
export const getToday = () => format(new Date(), 'yyyy-MM-dd');
export const getYearNum = () => new Date().getFullYear();
export const toStr = (d) => format(d, 'yyyy-MM-dd');
export const toDate = (d) => typeof d === 'string' ? parseISO(d + (d.length === 10 ? 'T12:00:00' : '')) : d;

export function getLast365Days() {
  return eachDayOfInterval({ start: subDays(new Date(), 364), end: new Date() });
}
export function getLast7Days() {
  return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
}
export function getLast30Days() {
  return eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
}
export function getYearDays(year) {
  return eachDayOfInterval({ start: startOfYear(new Date(year, 0)), end: endOfYear(new Date(year, 0)) });
}
export function getMonthDays(year, month) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
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
  return Math.round((days.filter(d => set.has(toStr(d))).length / days.length) * 100);
}

export function getDayOfWeekStats(completions) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const counts = [0,0,0,0,0,0,0];
  completions.forEach(c => { counts[getDay(parseISO(c.date))]++; });
  return days.map((name, i) => ({ name, count: counts[i] }));
}

export function getHourlyStats(completions) {
  // Track what hours completions were created
  const hours = new Array(24).fill(0);
  completions.forEach(c => {
    if (c.created_at) {
      const h = new Date(c.created_at).getHours();
      hours[h]++;
    }
  });
  return hours.map((count, hour) => ({ hour, count }));
}

export function getMonthlyData(completions, year) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const start = startOfMonth(new Date(year, m));
    const end = endOfMonth(new Date(year, m));
    const count = completions.filter(c => {
      const d = parseISO(c.date);
      return d >= start && d <= end;
    }).length;
    const days = eachDayOfInterval({ start, end });
    const rate = getCompletionRate(completions, days);
    months.push({ month: format(start, 'MMM'), rate, count });
  }
  return months;
}

export function getBestDay(completions) {
  const dayMap = {};
  completions.forEach(c => { dayMap[c.date] = (dayMap[c.date] || 0) + 1; });
  let best = null, max = 0;
  Object.entries(dayMap).forEach(([date, count]) => { if (count > max) { max = count; best = date; } });
  return { date: best, count: max };
}

// ── Habit Strength (inspired by Loop/uhabits) ──
// Uses exponential decay: each completion adds strength, each miss reduces it
export function getHabitStrength(completions, daysSinceCreated) {
  if (!completions.length || !daysSinceCreated) return 0;
  const completionDates = new Set(completions.map(c => c.date));
  let strength = 0;
  const decayFactor = 0.97; // ~3% decay per day missed

  for (let i = daysSinceCreated; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const ds = toStr(d);
    if (completionDates.has(ds)) {
      strength = Math.min(100, strength + 6);
    } else {
      strength *= decayFactor;
    }
  }
  return Math.round(Math.max(0, Math.min(100, strength)));
}

// ── Streak History (for charting) ──
export function getStreakHistory(completions, numDays = 90) {
  const dates = new Set(completions.map(c => c.date));
  const history = [];
  let streak = 0;

  for (let i = numDays; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const ds = toStr(d);
    if (dates.has(ds)) {
      streak++;
    } else {
      streak = 0;
    }
    history.push({ date: ds, streak });
  }
  return history;
}

// ── Schedule checking ──
export function isHabitScheduledOnDate(habit, dateStr) {
  const d = toDate(dateStr);
  const dayOfWeek = getDay(d);

  // Check vacation
  if (habit.vacation_mode) return false;

  switch (habit.schedule_type || habit.frequency || 'daily') {
    case 'daily': return true;
    case 'weekdays': return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends': return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom_days': {
      const days = (habit.custom_days || '').split(',').map(Number);
      return days.includes(dayOfWeek);
    }
    case 'x_per_week':
    case 'x_per_month':
      return true; // These are flexible - any day counts
    case 'every_n_days': {
      // Check if this date falls on the N-day cycle from creation
      const created = toDate(habit.created_at);
      const diff = differenceInDays(d, created);
      const n = habit.schedule_value || 2;
      return diff % n === 0;
    }
    default: return true;
  }
}

// ── Check vacation ──
export function isOnVacation(habit, vacationPeriods, dateStr) {
  if (!vacationPeriods?.length) return false;
  const d = toDate(dateStr);
  return vacationPeriods
    .filter(v => v.habit_id === habit.id)
    .some(v => {
      const start = toDate(v.start_date);
      const end = v.end_date ? toDate(v.end_date) : new Date();
      return d >= start && d <= end;
    });
}

// ── Completion amounts ──
export function getCompletionAmount(completion) {
  return completion?.amount || completion?.count || 0;
}

export function isAmountGoalMet(completion, target) {
  return getCompletionAmount(completion) >= target;
}

export { isToday, isYesterday, isSameDay, subDays, addDays, parseISO, differenceInDays, format,
  startOfMonth, endOfMonth, addMonths, subMonths, getMonth, getYear, getDay, eachDayOfInterval };
