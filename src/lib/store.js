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
  setHabits: (h) => set({ habits: h }),
  setCompletions: (c) => set({ completions: c }),
  setJournalEntries: (j) => set({ journalEntries: j }),

  // UI
  showCreateModal: false,
  showCommandPalette: false,
  showTemplateLibrary: false,
  editingHabit: null,
  searchQuery: '',
  selectedCategory: 'All',
  toasts: [],
  setShowCreateModal: (v) => set({ showCreateModal: v }),
  setShowCommandPalette: (v) => set({ showCommandPalette: v }),
  setShowTemplateLibrary: (v) => set({ showTemplateLibrary: v }),
  setEditingHabit: (h) => set({ editingHabit: h }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),

  addToast: (toast) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
  },

  // Vacation mode
  vacationMode: false,
  setVacationMode: (v) => set({ vacationMode: v }),

  // Quick checkin
  quickCheckinMode: false,
  setQuickCheckinMode: (v) => set({ quickCheckinMode: v }),

  // XP / gamification
  xp: 0,
  level: 1,
  addXp: (amount) => {
    const newXp = get().xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    set({ xp: newXp, level: newLevel });
  },

  // Achievements
  achievements: [],
  unlockAchievement: (id) => {
    if (!get().achievements.includes(id)) {
      set((s) => ({ achievements: [...s.achievements, id] }));
      get().addXp(50);
      get().addToast({ type: 'success', message: `🏆 Achievement unlocked! +50 XP` });
    }
  },
}));
