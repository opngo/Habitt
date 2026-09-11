import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  uid, nowISO, getToday, toStr, getCurrentStreak,
  expectedOnDate, amountOf,
} from './utils';
import { hybridStorage } from './storage';

export const useStore = create(
  persist(
    (set, get) => ({
      // ── persisted data ──
      habits: [],
      completions: [],
      journalEntries: [],
      dayNotes: [],
      focusSessions: [],
      vacationPeriods: [],
      tasks: [],
      notes: [],
      homework: [],
      subjects: [],
      settings: { theme: undefined, sidebarCollapsed: false, ollamaEnabled: false, ollamaModel: '' },

      // ── UI state (session only) ──
      currentView: 'dashboard',
      selectedHabitId: null,
      quickCheckinMode: false,
      showCreateModal: false,
      editingHabit: null,
      showTemplates: false,
      showCommandPalette: false,
      focusTimerHabitId: null,
      searchQuery: '',
      selectedCategory: 'All',
      heatmapRange: 'year', // day | week | month | year
      heatmapAnchor: null,   // Date for month/week navigation
      selectedDay: null,     // day picked in calendar/heatmap → todo panel
      journalDate: getToday(),
      toasts: [],

      setView: (v, id = null) => set({ currentView: v, selectedHabitId: id, quickCheckinMode: false }),
      setUI: (patch) => set(patch),
      toggleSidebar: () => set((s) => ({ settings: { ...s.settings, sidebarCollapsed: !s.settings.sidebarCollapsed } })),
      toggleTheme: () => {
        const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        set((s) => ({ settings: { ...s.settings, theme: next } }));
      },

      addToast: (t) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

      // ── Habits ──
      addHabit: (data) => {
        const habit = {
          id: uid(),
          name: (data.name || '').trim(),
          description: data.description || '',
          icon: data.icon || 'Zap',
          color: data.color || '#22c55e',
          category: data.category || 'General',
          habit_type: data.habit_type || 'normal',
          frequency: data.schedule_type || 'daily',
          schedule_type: data.schedule_type || 'daily',
          schedule_value: data.schedule_value || 0,
          custom_days: data.custom_days || '',
          target_count: data.target_count || 1,
          unit: data.unit || '',
          checklist: data.checklist || [],
          tags: data.tags || [],
          difficulty: data.difficulty || 'medium',
          archived: false,
          created_at: nowISO(),
          sort_order: get().habits.length,
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        get().addToast({ type: 'success', message: `Habit "${habit.name}" created` });
        return habit;
      },

      updateHabit: (id, patch) => {
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
        get().addToast({ type: 'success', message: 'Habit updated' });
      },

      deleteHabit: (id) => {
        const h = get().habits.find((x) => x.id === id);
        set((s) => ({
          habits: s.habits.filter((x) => x.id !== id),
          completions: s.completions.filter((c) => c.habit_id !== id),
          vacationPeriods: s.vacationPeriods.filter((v) => v.habit_id !== id),
          selectedHabitId: s.selectedHabitId === id ? null : s.selectedHabitId,
          currentView: s.selectedHabitId === id ? 'dashboard' : s.currentView,
        }));
        get().addToast({ type: 'info', message: `Deleted "${h?.name || 'habit'}"` });
      },

      toggleArchiveHabit: (id) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)) })),

      moveHabit: (id, dir) => {
        const habits = [...get().habits].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const i = habits.findIndex((h) => h.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= habits.length) return;
        [habits[i], habits[j]] = [habits[j], habits[i]];
        set({ habits: habits.map((h, idx) => ({ ...h, sort_order: idx })) });
      },

      // ── Completions ──
      /** Toggle "today" (or any date). Returns true when newly logged. */
      toggleCompletion: (habitId, dateStr = getToday()) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return false;
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        if (existing) {
          set({ completions: s.completions.filter((c) => c.id !== existing.id) });
          return false;
        }
        const comp = {
          id: uid(),
          habit_id: habitId,
          date: dateStr,
          count: 1,
          amount: habit.habit_type === 'amount' ? Math.min(habit.target_count || 1, 1) : 0,
          note: '',
          checklist_done: [],
          created_at: nowISO(),
        };
        set({ completions: [...s.completions, comp] });
        if (habit.habit_type !== 'avoid' && dateStr === getToday()) {
          const streak = getCurrentStreak(habit, [...s.completions.filter((c) => c.habit_id === habitId), comp], s.vacationPeriods);
          get().addToast({ type: 'success', message: streak > 1 ? `${habit.name} logged — day ${streak} in a row` : `${habit.name} logged` });
        } else {
          get().addToast({ type: 'success', message: `${habit.name} logged for ${dateStr === getToday() ? 'today' : dateStr}` });
        }
        return true;
      },

      adjustAmount: (habitId, dateStr = getToday(), delta = 1) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const target = habit.target_count || 1;
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        if (existing) {
          const newAmount = Math.max(0, amountOf(existing) + delta);
          if (newAmount === 0) {
            set({ completions: s.completions.filter((c) => c.id !== existing.id) });
            return;
          }
          set({
            completions: s.completions.map((c) =>
              c.id === existing.id ? { ...c, amount: newAmount, count: Math.max(1, newAmount) } : c
            ),
          });
        } else if (delta > 0) {
          const comp = { id: uid(), habit_id: habitId, date: dateStr, count: 1, amount: Math.min(Math.abs(delta), target), note: '', checklist_done: [], created_at: nowISO() };
          set({ completions: [...s.completions, comp] });
        }
      },

      setAmount: (habitId, dateStr, value) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const target = habit.target_count || 1;
        const v = Math.max(0, Math.min(Number(value) || 0, target * 4));
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        if (v === 0) {
          if (existing) set({ completions: s.completions.filter((c) => c.id !== existing.id) });
          return;
        }
        if (existing) set({ completions: s.completions.map((c) => (c.id === existing.id ? { ...c, amount: v, count: Math.max(1, v) } : c)) });
        else set({ completions: [...s.completions, { id: uid(), habit_id: habitId, date: dateStr, count: Math.max(1, v), amount: v, note: '', checklist_done: [], created_at: nowISO() }] });
      },

      setCompletionNote: (habitId, dateStr, note) =>
        set((s) => ({
          completions: s.completions.map((c) => (c.habit_id === habitId && c.date === dateStr ? { ...c, note } : c)),
        })),

      toggleChecklistItem: (habitId, dateStr, item) => {
        const s = get();
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        const done = new Set(existing?.checklist_done || []);
        if (done.has(item)) done.delete(item); else done.add(item);
        const list = [...done];
        if (existing) set({ completions: s.completions.map((c) => (c.id === existing.id ? { ...c, checklist_done: list } : c)) });
        else set({ completions: [...s.completions, { id: uid(), habit_id: habitId, date: dateStr, count: 1, amount: 0, note: '', checklist_done: list, created_at: nowISO() }] });
      },

      // ── Day notes ──
      saveDayNote: (dateStr, content, tags = []) => {
        const s = get();
        const existing = s.dayNotes.find((n) => n.date === dateStr);
        if (content.trim() === '') {
          if (existing) set({ dayNotes: s.dayNotes.filter((n) => n.date !== dateStr) });
          return;
        }
        if (existing) set({ dayNotes: s.dayNotes.map((n) => (n.date === dateStr ? { ...n, content, tags, updated_at: nowISO() } : n)) });
        else set({ dayNotes: [{ id: uid(), date: dateStr, content, tags, created_at: nowISO() }, ...s.dayNotes] });
      },

      // ── Journal ──
      saveJournalEntry: (dateStr, patch) => {
        const s = get();
        const existing = s.journalEntries.find((j) => j.date === dateStr);
        if (existing) {
          set({ journalEntries: s.journalEntries.map((j) => (j.date === dateStr ? { ...j, ...patch, updated_at: nowISO() } : j)) });
        } else {
          set({ journalEntries: [{ id: uid(), date: dateStr, mood: 3, energy: 3, sleep_hours: null, gratitude: '', content: '', tags: [], ai_summary: '', created_at: nowISO(), ...patch }, ...s.journalEntries] });
        }
      },
      deleteJournalEntry: (dateStr) => set((s) => ({ journalEntries: s.journalEntries.filter((j) => j.date !== dateStr) })),

      // ── Focus sessions & timer ──
      saveFocusSession: (sess) => {
        set((s) => ({ focusSessions: [{ id: uid(), started_at: nowISO(), completed: true, ...sess }, ...s.focusSessions] }));
        get().addToast({ type: 'success', message: `Focus session saved — ${sess.duration_minutes} min` });
      },

      timer: null,
      startTimer: (preset, habitId = null) =>
        set({
          timer: {
            phase: 'work', running: true, round: 1, habitId,
            preset, sound: null,
            endsAt: Date.now() + preset.work * 60000,
            _phaseLen: preset.work * 60000,
            startedAt: nowISO(),
          },
        }),
      pauseResumeTimer: () => {
        const t = get().timer;
        if (!t) return;
        if (t.running) set({ timer: { ...t, running: false, remainingMs: Math.max(0, t.endsAt - Date.now()) } });
        else set({ timer: { ...t, running: true, endsAt: Date.now() + (t.remainingMs || 1000) } });
      },
      setTimerSound: (kind) => { const t = get().timer; if (t) set({ timer: { ...t, sound: kind } }); },
      timerAdvance: () => {
        const t = get().timer;
        if (!t) return;
        if (t.phase === 'work') {
          get().saveFocusSession({ habit_id: t.habitId, duration_minutes: t.preset.work, notes: `Round ${t.round}/${t.preset.rounds} — ${t.preset.name}` });
          if (t.round >= t.preset.rounds) {
            set({ timer: null });
            get().addToast({ type: 'success', message: `All ${t.preset.rounds} rounds complete — session done` });
            return;
          }
          const breakMin = t.preset.shortBreak;
          set({ timer: { ...t, phase: 'break', breakKind: 'short', endsAt: Date.now() + breakMin * 60000, _phaseLen: breakMin * 60000, running: true } });
          get().addToast({ type: 'info', message: `Break time — ${breakMin} min` });
        } else {
          set({ timer: { ...t, phase: 'work', round: t.round + 1, breakKind: null, endsAt: Date.now() + t.preset.work * 60000, _phaseLen: t.preset.work * 60000, running: true } });
          get().addToast({ type: 'info', message: `Round ${t.round + 1} of ${t.preset.rounds}` });
        }
      },
      timerSkip: () => {
        const t = get().timer;
        if (!t) return;
        if (t.phase === 'work') {
          const elapsedInPhase = Math.min(t.preset.work, Math.max(1, Math.round((t.preset.work * 60000 - (t.running ? Math.max(0, t.endsAt - Date.now()) : t.remainingMs || 0)) / 60000)));
          get().saveFocusSession({ habit_id: t.habitId, duration_minutes: elapsedInPhase, notes: `Skipped — ${t.preset.name}`, completed: false });
        }
        get().timerAdvance();
      },
      stopTimer: () => set({ timer: null }),
      tickTimer: () => {
        const t = get().timer;
        if (!t || !t.running) return;
        if (Date.now() >= t.endsAt) {
          try { import('./sound').then((m) => m.playChime()); } catch { /* noop */ }
          get().timerAdvance();
        }
      },

      // ── Vacation ──
      startVacation: (habitId) => {
        set((s) => ({ vacationPeriods: [{ id: uid(), habit_id: habitId, start_date: getToday(), end_date: null }, ...s.vacationPeriods] }));
        get().addToast({ type: 'info', message: 'Vacation mode on — streak protected' });
      },
      endVacation: (habitId) => {
        set((s) => ({
          vacationPeriods: s.vacationPeriods.map((v) => (v.habit_id === habitId && !v.end_date ? { ...v, end_date: getToday() } : v)),
        }));
        get().addToast({ type: 'info', message: 'Welcome back — vacation mode off' });
      },

      // ── Tasks (Reminders-style) ──
      addTask: (t) => {
        const task = { id: uid(), title: t.title.trim(), description: t.description || '', parent_id: t.parent_id || null, priority: t.priority || 'medium', status: 'todo', due_date: t.due_date || null, tags: t.tags || [], created_at: nowISO(), completed_at: null, sort_order: get().tasks.length };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id && t.parent_id !== id) })),
      toggleTask: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        const done = t.status !== 'done';
        set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, status: done ? 'done' : 'todo', completed_at: done ? nowISO() : null } : x)) }));
      },

      // ── Homework ──
      addHomework: (h) => {
        const hw = { id: uid(), title: h.title.trim(), description: h.description || '', subject_id: h.subject_id || null, due_date: h.due_date || null, status: 'pending', priority: h.priority || 'medium', tags: h.tags || [], created_at: nowISO(), completed_at: null };
        set((s) => ({ homework: [...s.homework, hw] }));
        return hw;
      },
      updateHomework: (id, patch) => set((s) => ({ homework: s.homework.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteHomework: (id) => set((s) => ({ homework: s.homework.filter((x) => x.id !== id) })),
      toggleHomework: (id) => {
        const h = get().homework.find((x) => x.id === id);
        if (!h) return;
        const done = h.status !== 'completed';
        set((s) => ({ homework: s.homework.map((x) => (x.id === id ? { ...x, status: done ? 'completed' : 'pending', completed_at: done ? nowISO() : null } : x)) }));
      },

      // ── Subjects ──
      addSubject: (sub) => set((s) => ({ subjects: [...s.subjects, { id: uid(), name: sub.name.trim(), color: sub.color || '#3b82f6', icon: sub.icon || 'BookOpen' }] })),
      updateSubject: (id, patch) => set((s) => ({ subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((x) => x.id !== id),
          homework: s.homework.filter((h) => h.subject_id !== id),
        })),

      // ── Notes (editor-style) ──
      addNote: (n = {}) => {
        const note = { id: uid(), title: n.title?.trim() || '', content: '', tags: n.tags || [], color: n.color || '#6366f1', icon: n.icon || 'FileText', pinned: false, created_at: nowISO(), updated_at: nowISO() };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },
      updateNote: (id, patch) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updated_at: nowISO() } : n)) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePinNote: (id) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),

      // ── Settings / data ──
      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      clearAllData: () => {
        set({
          habits: [], completions: [], journalEntries: [], dayNotes: [], focusSessions: [],
          vacationPeriods: [], tasks: [], notes: [], homework: [], subjects: [],
        });
        get().addToast({ type: 'info', message: 'All data cleared. Fresh start' });
      },
      importData: (data) => {
        const keys = ['habits', 'completions', 'journalEntries', 'dayNotes', 'focusSessions', 'vacationPeriods', 'tasks', 'notes', 'homework', 'subjects', 'settings'];
        const patch = {};
        keys.forEach((k) => { if (k in data) patch[k] = data[k]; });
        set(patch);
        get().addToast({ type: 'success', message: 'Data imported' });
      },
      exportSnapshot: () => {
        const s = get();
        const keys = ['habits', 'completions', 'journalEntries', 'dayNotes', 'focusSessions', 'vacationPeriods', 'tasks', 'notes', 'homework', 'subjects', 'settings'];
        const out = { app: 'habitt', version: 3, exported_at: nowISO() };
        keys.forEach((k) => (out[k] = s[k]));
        return out;
      },
    }),
    {
      name: 'habitt-v2',
      version: 3,
      storage: createJSONStorage(() => hybridStorage),
      partialize: (s) => ({
        habits: s.habits, completions: s.completions, journalEntries: s.journalEntries,
        dayNotes: s.dayNotes, focusSessions: s.focusSessions, vacationPeriods: s.vacationPeriods,
        tasks: s.tasks, notes: s.notes, homework: s.homework, subjects: s.subjects,
        settings: s.settings,
      }),
      migrate: (persisted, version) => {
        if (persisted && typeof persisted === 'object') {
          delete persisted.xp;
          delete persisted.achievements;
          const settings = { ...(persisted.settings || {}) };
          delete settings.exported;
          persisted.settings = settings;
        }
        return persisted;
      },
    }
  )
);

export function initTheme() {
  const t = useStore.getState().settings?.theme;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const theme = t || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const apply = (e) => {
    if (!useStore.getState().settings?.theme) document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  };
  window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', apply);
  return () => window.matchMedia?.('(prefers-color-scheme: dark)')?.removeEventListener?.('change', apply);
}

// test / debug hook
if (typeof window !== 'undefined') window.__habitt = useStore;
