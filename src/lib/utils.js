export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getDateRange(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function getYearDates(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return getDateRange(start, end);
}

export function getLast365Days() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 364);
  return getDateRange(start, end);
}

export function getWeekDates(weekStart) {
  const dates = [];
  const start = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export function isToday(date) {
  return date === getToday();
}

export function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date === yesterday.toISOString().split('T')[0];
}

export function getDayName(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonthName(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long' });
}

export function calculateCompletionRate(completions, startDate, endDate) {
  const dates = getDateRange(startDate, endDate);
  const completedDates = new Set(completions.map(c => c.date));
  const completed = dates.filter(d => completedDates.has(d)).length;
  return Math.round((completed / dates.length) * 100);
}

export function getLongestStreak(completions) {
  if (completions.length === 0) return 0;
  
  const sortedDates = completions.map(c => c.date).sort();
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
}

export function getCurrentStreak(completions) {
  if (completions.length === 0) return 0;
  
  const sortedDates = completions.map(c => c.date).sort().reverse();
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0) {
      // Allow today to be incomplete
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export const HABIT_ICONS = [
  '💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🎯',
  '✍️', '🎨', '🎵', '💻', '🌱', '☀️', '🌙', '❤️',
  '🧠', '🎓', '💼', '🏠', '🚶', '🚴', '🏊', '⚡',
  '🔥', '⭐', '✨', '🌟', '🎉', '🎊', '🏆', '🎖️'
];

export const HABIT_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const CATEGORIES = [
  'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity',
  'Social', 'Creative', 'Finance', 'General'
];
