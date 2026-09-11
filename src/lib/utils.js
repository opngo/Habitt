import { DAILY_QUOTES } from './constants';
import {
  format, parseISO, differenceInCalendarDays, addDays, subDays,
  startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval,
  getDay, getMonth, getYear, startOfWeek, endOfWeek, isSameDay,
} from 'date-fns';

export const toDate = (d) =>
  typeof d === 'string'
    ? parseISO(d.length === 10 ? d + 'T12:00:00' : d)
    : d;

export const toStr = (d) => format(d, 'yyyy-MM-dd');
export const formatDate = (d) => toStr(toDate(d));
export const getToday = () => format(new Date(), 'yyyy-MM-dd');
export const formatDisplay = (d) => format(toDate(d), 'EEEE, MMMM d, yyyy');
export const formatShort = (d) => format(toDate(d), 'MMM d');
export const formatMonthYear = (d) => format(toDate(d), 'MMMM yyyy');

export const uid = () =>
  globalThis.crypto?.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);

export const nowISO = () => new Date().toISOString();

export function getLast7Days() { return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }); }
export function getLast30Days() { return eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() }); }
export function getLast365Days() { return eachDayOfInterval({ start: subDays(new Date(), 364), end: new Date() }); }
export function getYearDays(year) { return eachDayOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 0, 1)) }); }
export function getMonthDays(year, month) { return eachDayOfInterval({ start: startOfMonth(new Date(year, month, 1)), end: endOfMonth(new Date(year, month, 1)) }); }

/** Build heatmap weeks (Sun-aligned columns) from a sorted list of Date objects */
export function getWeeksFromDays(days) {
  const weeks = [];
  let cur = [];
  for (let i = 0; i < getDay(days[0]); i++) cur.push(null);
  days.forEach((d) => {
    cur.push(d);
    if (cur.length === 7) { weeks.push(cur); cur = []; }
  });
  if (cur.length) weeks.push(cur);
  return weeks;
}

export function getCompletionIntensity(count) {
  if (!count) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

// ── Schedule ──
export function scheduleTypeOf(habit) { return habit.schedule_type || habit.frequency || 'daily'; }

export function isHabitScheduledOnDate(habit, dateStr) {
  const d = toDate(dateStr);
  const dow = getDay(d);
  switch (scheduleTypeOf(habit)) {
    case 'daily': return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekends': return dow === 0 || dow === 6;
    case 'custom_days': return (habit.custom_days || '').split(',').filter(Boolean).map(Number).includes(dow);
    case 'x_per_week':
    case 'x_per_month': return true;
    case 'every_n_days': {
      const n = Math.max(1, Number(habit.schedule_value) || 2);
      const diff = differenceInCalendarDays(d, toDate(habit.created_at));
      return diff % n === 0;
    }
    default: return true;
  }
}

export function isOnVacation(habit, vacationPeriods, dateStr) {
  if (!vacationPeriods?.length) return false;
  const d = toDate(dateStr);
  return vacationPeriods
    .filter((v) => v.habit_id === habit.id)
    .some((v) => {
      const start = toDate(v.start_date);
      const end = v.end_date ? toDate(v.end_date) : new Date();
      return d >= start && d <= end;
    });
}

export function expectedOnDate(habits, vacationPeriods, dateStr) {
  return habits.filter(
    (h) =>
      h.habit_type !== 'avoid' &&
      !h.archived &&
      !isOnVacation(h, vacationPeriods, dateStr) &&
      toStr(toDate(h.created_at)) <= dateStr &&
      isHabitScheduledOnDate(h, dateStr)
  );
}

export function completionsOn(completions, dateStr) {
  return completions.filter((c) => c.date === dateStr);
}

export function isCompleted(completions, habitId, dateStr) {
  const c = completions.find((x) => x.habit_id === habitId && x.date === dateStr);
  if (!c) return false;
  if (c.habit_type === 'avoid') return true; // slips are "logged", not "done" — caller decides
  return true;
}

// ── Streaks ──
/** Current streak: consecutive scheduled days with completions, counting back from today (today optional) */
export function getCurrentStreak(habit, habitCompletions, vacationPeriods = []) {
  if (habit.habit_type === 'avoid') return cleanDaysForAvoid(habit, habitCompletions, vacationPeriods);
  const dates = new Set(habitCompletions.filter((c) => (c.amount || c.count || 1) >= (habit.habit_type === 'amount' ? (habit.target_count || 1) : 1)).map((c) => c.date));
  if (!dates.size) return 0;
  let streak = 0;
  let d = new Date();
  if (!dates.has(toStr(d)) && !isHabitScheduledOnDate(habit, toStr(d))) { /* not scheduled today */ }
  if (!dates.has(toStr(d))) d = subDays(d, 1); // grace for today
  for (let i = 0; i < 3660; i++) {
    const ds = toStr(d);
    if (isOnVacation(habit, vacationPeriods, ds)) { d = subDays(d, 1); continue; }
    if (dates.has(ds)) { streak++; d = subDays(d, 1); }
    else if (isHabitScheduledOnDate(habit, ds)) break;
    else d = subDays(d, 1);
  }
  return streak;
}

export function getLongestStreak(habit, habitCompletions, vacationPeriods = []) {
  if (habit.habit_type === 'avoid') return cleanDaysForAvoid(habit, habitCompletions, vacationPeriods);
  const dates = [...new Set(habitCompletions.filter((c) => (c.amount || c.count || 1) >= (habit.habit_type === 'amount' ? (habit.target_count || 1) : 1)).map((c) => c.date))].sort();
  if (!dates.length) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = differenceInCalendarDays(toDate(dates[i]), toDate(dates[i - 1]));
    if (gap === 1) { cur++; max = Math.max(max, cur); }
    else if (gap > 1) {
      // allow gaps of unscheduled days for non-daily habits
      let unscheduledOnly = false;
      if (scheduleTypeOf(habit) !== 'daily') {
        unscheduledOnly = true;
        for (let k = 1; k < gap; k++) {
          const mid = toStr(addDays(toDate(dates[i - 1]), k));
          if (isHabitScheduledOnDate(habit, mid) && !isOnVacation(habit, vacationPeriods, mid)) { unscheduledOnly = false; break; }
        }
      }
      if (unscheduledOnly) cur += 1;
      else cur = 1;
    }
  }
  return max;
}

/** Avoid-habits: number of consecutive slip-free days since last slip (or creation) */
export function cleanDaysForAvoid(habit, habitCompletions, vacationPeriods = []) {
  const slips = habitCompletions.map((c) => c.date).sort();
  const from = slips.length ? toDate(slips[slips.length - 1]) : toDate(habit.created_at);
  let days = differenceInCalendarDays(new Date(), from);
  return Math.max(0, days);
}

export function getCompletionRate(habits, completions, vacationPeriods, days) {
  let expected = 0, done = 0;
  days.forEach((d) => {
    const ds = toStr(d);
    const exp = expectedOnDate(habits, vacationPeriods, ds);
    expected += exp.length;
    exp.forEach((h) => { if (completions.some((c) => c.habit_id === h.id && c.date === ds)) done++; });
  });
  return expected ? Math.round((done / expected) * 100) : 0;
}

export function getDayOfWeekStats(habits, completions, vacationPeriods) {
  const stats = [];
  for (let i = 0; i < 7; i++) {
    const dayHabits = habits.filter((h) => !h.archived);
    let expected = 0, done = 0;
    for (let w = 0; w < 12; w++) {
      const d = subDays(new Date(), w * 7);
      if (getDay(d) !== i) continue;
      const ds = toStr(d);
      const exp = expectedOnDate(dayHabits, vacationPeriods, ds);
      expected += exp.length;
      exp.forEach((h) => { if (completions.some((c) => c.habit_id === h.id && c.date === ds)) done++; });
    }
    stats.push({ index: i, expected, done, rate: expected ? Math.round((done / expected) * 100) : 0 });
  }
  return stats;
}

export function getMonthlyData(habits, completions, vacationPeriods, year) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const days = getMonthDays(year, m);
    const count = completions.filter((c) => getYear(toDate(c.date)) === year && getMonth(toDate(c.date)) === m).length;
    months.push({ month: format(startOfMonth(new Date(year, m, 1)), 'MMM'), count, rate: getCompletionRate(habits, completions, vacationPeriods, days) });
  }
  return months;
}

export function getBestDay(completions) {
  const map = {};
  completions.forEach((c) => { map[c.date] = (map[c.date] || 0) + 1; });
  let best = null, max = 0;
  Object.entries(map).forEach(([date, count]) => { if (count > max) { max = count; best = date; } });
  return { date: best, count: max };
}

/** Loop-style habit strength with ~3%/day decay */
export function getHabitStrength(habitCompletions) {
  if (!habitCompletions.length) return 0;
  const dates = new Set(habitCompletions.map((c) => c.date));
  const first = toDate([...dates].sort()[0]);
  const total = Math.min(400, differenceInCalendarDays(new Date(), first));
  let strength = 0;
  for (let i = total; i >= 0; i--) {
    const ds = toStr(subDays(new Date(), i));
    strength = dates.has(ds) ? Math.min(100, strength + 6) : strength * 0.97;
  }
  return Math.round(strength);
}

/** Weekly progress for x_per_week habits */
export function weekProgress(habit, habitCompletions, vacationPeriods) {
  if (scheduleTypeOf(habit) !== 'x_per_week') return null;
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const target = Math.max(1, Number(habit.schedule_value) || 3);
  const done = habitCompletions.filter((c) => toDate(c.date) >= start && toDate(c.date) <= end).length;
  return { done, target, met: done >= target };
}

export function monthProgress(habit, habitCompletions) {
  if (scheduleTypeOf(habit) !== 'x_per_month') return null;
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const target = Math.max(1, Number(habit.schedule_value) || 10);
  const done = habitCompletions.filter((c) => toDate(c.date) >= start && toDate(c.date) <= end).length;
  return { done, target, met: done >= target };
}

export function amountOf(completion) { return completion?.amount || completion?.count || 0; }

export function getQuoteOfDay() {
  const day = differenceInCalendarDays(new Date(), new Date(2024, 0, 1));
  return DAILY_QUOTES[((day % DAILY_QUOTES.length) + DAILY_QUOTES.length) % DAILY_QUOTES.length];
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Winding down';
}

export function isToday(dateStr) { return dateStr === getToday(); }

export function differenceInCalendarDaysSafe(a, b) {
  try { return differenceInCalendarDays(toDate(a), toDate(b)); } catch { return 0; }
}

// re-exports for components that want date-fns primitives through one door
export { differenceInCalendarDays, subDays, addDays, getDay, startOfMonth, endOfMonth };
