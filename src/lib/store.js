import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Navigation
  currentView: 'dashboard',
  selectedHabitId: null,
  setView: (view, habitId = null) => set({ currentView: view, selectedHabitId: habitId }),

  // Theme
  colorMode: 'light',
  setColorMode: (mode) => set({ colorMode: mode }),

  // Auth
  isAuthenticated: false,
  passwordEnabled: false,
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setPasswordEnabled: (v) => set({ passwordEnabled: v }),

  // Tutorial
  tutorialDone: false,
  setTutorialDone: (v) => set({ tutorialDone: v }),

  // Data
  habits: [],
  completions: [],
  journalEntries: [],
  dayNotes: [],
  focusSessions: [],
  vacationPeriods: [],
  setHabits: (h) => set({ habits: h }),
  setCompletions: (c) => set({ completions: c }),
  setJournalEntries: (j) => set({ journalEntries: j }),
  setDayNotes: (n) => set({ dayNotes: n }),
  setFocusSessions: (f) => set({ focusSessions: f }),
  setVacationPeriods: (v) => set({ vacationPeriods: v }),

  // UI
  showCreateModal: false,
  showCommandPalette: false,
  showTemplateLibrary: false,
  showFocusTimer: false,
  showDayNoteModal: false,
  showCalendarModal: false,
  editingHabit: null,
  searchQuery: '',
  selectedCategory: 'All',
  heatmapView: 'year', // 'year', 'month', 'week'
  calendarMonth: new Date(),
  toasts: [],
  setShowCreateModal: (v) => set({ showCreateModal: v }),
  setShowCommandPalette: (v) => set({ showCommandPalette: v }),
  setShowTemplateLibrary: (v) => set({ showTemplateLibrary: v }),
  setShowFocusTimer: (v) => set({ showFocusTimer: v }),
  setShowDayNoteModal: (v) => set({ showDayNoteModal: v }),
  setShowCalendarModal: (v) => set({ showCalendarModal: v }),
  setEditingHabit: (h) => set({ editingHabit: h }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  setHeatmapView: (v) => set({ heatmapView: v }),
  setCalendarMonth: (m) => set({ calendarMonth: m }),

  addToast: (toast) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },

  // Vacation mode (global)
  globalVacationMode: false,
  setGlobalVacationMode: (v) => set({ globalVacationMode: v }),

  // Quick checkin
  quickCheckinMode: false,
  setQuickCheckinMode: (v) => set({ quickCheckinMode: v }),

  // XP / gamification
  xp: 0,
  level: 1,
  addXp: (amount) => {
    const newXp = get().xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    const oldLevel = get().level;
    set({ xp: newXp, level: newLevel });
    if (newLevel > oldLevel) {
      get().addToast({ type: 'success', message: `Level up! You are now level ${newLevel}` });
    }
  },

  // Achievements
  achievements: [],
  unlockAchievement: (id) => {
    if (!get().achievements.includes(id)) {
      set((s) => ({ achievements: [...s.achievements, id] }));
      get().addXp(50);
      get().addToast({ type: 'success', message: `Achievement unlocked! +50 XP` });
    }
  },

  // Focus timer state
  focusTimerHabitId: null,
  setFocusTimerHabitId: (id) => set({ focusTimerHabitId: id }),

  // Selected date for day note / calendar
  selectedDate: null,
  setSelectedDate: (d) => set({ selectedDate: d }),

  // Drag reorder
  reorderHabits: (fromIdx, toIdx) => {
    const h = [...get().habits];
    const [moved] = h.splice(fromIdx, 1);
    h.splice(toIdx, 0, moved);
    set({ habits: h });
  },
}));
