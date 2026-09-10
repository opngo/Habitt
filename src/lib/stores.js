import { writable, derived } from 'svelte/store';

// Current view/page
export const currentView = writable('dashboard'); // dashboard, habit, journal, settings, tutorial
export const selectedHabitId = writable(null);

// Theme
export const theme = writable('light');

// Password protection
export const isAuthenticated = writable(false);
export const passwordEnabled = writable(false);

// Tutorial state
export const tutorialCompleted = writable(false);
export const currentTutorialStep = writable(0);

// Data stores
export const habits = writable([]);
export const completions = writable([]);
export const journalEntries = writable([]);
export const settings = writable({});

// UI state
export const showCreateHabit = writable(false);
export const showEditHabit = writable(false);
export const editingHabit = writable(null);
export const searchQuery = writable('');
export const selectedCategory = writable('All');

// Derived stores
export const categories = derived(habits, ($habits) => {
  const cats = new Set($habits.map(h => h.category));
  return ['All', ...Array.from(cats).sort()];
});

export const filteredHabits = derived(
  [habits, searchQuery, selectedCategory],
  ([$habits, $searchQuery, $selectedCategory]) => {
    return $habits.filter(h => {
      if (h.archived) return false;
      const matchesSearch = h.name.toLowerCase().includes($searchQuery.toLowerCase()) ||
                           h.description.toLowerCase().includes($searchQuery.toLowerCase());
      const matchesCategory = $selectedCategory === 'All' || h.category === $selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }
);

// Stats
export const todayCompletions = derived(completions, ($completions) => {
  const today = new Date().toISOString().split('T')[0];
  return $completions.filter(c => c.date === today);
});

export const currentStreaks = derived([habits, completions], ([$habits, $completions]) => {
  const streaks = {};
  $habits.forEach(habit => {
    streaks[habit.id] = calculateStreak(habit.id, $completions);
  });
  return streaks;
});

function calculateStreak(habitId, completions) {
  const habitCompletions = completions
    .filter(c => c.habit_id === habitId)
    .map(c => c.date)
    .sort()
    .reverse();
  
  if (habitCompletions.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (habitCompletions.includes(dateStr)) {
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
