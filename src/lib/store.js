import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  uid, nowISO, getToday, toStr, formatDate, getCurrentStreak, getLongestStreak,
  expectedOnDate, isOnVacation, scheduleTypeOf, amountOf, isHabitScheduledOnDate,
  differenceInCalendarDaysSafe,
} from './utils';
import { ACHIEVEMENTS, DIFFICULTIES, XP_PER_LEVEL } from './constants';
import { fireConfetti, fireBigConfetti } from './celebrate';

const levelFor = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

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
      settings: { theme: undefined, ollamaEnabled: false, ollamaModel: '', weekStartsOnMonday: true },
      xp: 0,
      achievements: [],

      // ── UI state (not persisted) ──
      currentView: 'dashboard',
      selectedHabitId: null,
      quickCheckinMode: false,
      showCreateModal: false,
      editingHabit: null,
      showTemplates: false,
      showCommandPalette: false,
      showFocusTimer: false,
      focusTimerHabitId: null,
      showDayNoteModal: false,
      dayNoteDate: null,
      searchQuery: '',
      selectedCategory: 'All',
      heatmapYear: new Date().getFullYear(),
      journalDate: getToday(),
      toasts: [],

      setView: (v, id = null) => set({ currentView: v, selectedHabitId: id, quickCheckinMode: false }),
      setUI: (patch) => set(patch),
      toggleTheme: () => {
        const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        set((s) => ({ settings: { ...s.settings, theme: next } }));
        get().checkAchievements();
      },

      addToast: (t) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3600);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

      addXp: (n, silent = false) => {
        const { xp } = get();
        const nx = Math.max(0, xp + n);
        const before = levelFor(xp);
        const after = levelFor(nx);
        set({ xp: nx });
        if (after > before && !silent) {
          get().addToast({ type: 'success', message: `Level up! You are now level ${after} 🎉` });
          fireConfetti();
        }
      },

      // ── Habits ──
      addHabit: (data) => {
        const habit = {
          id: uid(),
          name: data.name.trim(),
          description: data.description || '',
          icon: data.icon || 'Zap',
          color: data.color || '#22c55e',
          category: data.category || 'General',
          habit_type: data.checklist?.length ? 'normal' : data.habit_type || 'normal',
          frequency: data.schedule_type || 'daily',
          schedule_type: data.schedule_type || 'daily',
          schedule_value: data.schedule_value || 0,
          custom_days: data.custom_days || '',
          target_count: data.target_count || 1,
          unit: data.unit || '',
          checklist: data.checklist || [],
          tags: data.tags || [],
          difficulty: data.difficulty || 'medium',
          reminder_time: data.reminder_time || '',
          archived: false,
          created_at: nowISO(),
          sort_order: get().habits.length,
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        get().addToast({ type: 'success', message: `Habit "${habit.name}" created` });
        get().checkAchievements();
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
      /** Returns true if now complete, false if unchecked */
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
        get().afterCompletion(habit, comp, dateStr);
        return true;
      },

      afterCompletion: (habit, comp, dateStr) => {
        const s = get();
        const diff = DIFFICULTIES.find((d) => d.value === habit.difficulty) || DIFFICULTIES[1];
        get().addXp(diff.xp, true);
        s.addToast({
          type: 'success',
          message: `${habit.name} — done! +${diff.xp} XP`,
          icon: habit.icon,
          color: habit.color,
        });
        // streak milestones
        if (habit.habit_type !== 'avoid' && dateStr === getToday()) {
          const hc = s.completions.filter((c) => c.habit_id === habit.id);
          const streak = getCurrentStreak(habit, [...hc, comp], s.vacationPeriods);
          if ([3, 7, 30, 100, 365].includes(streak)) {
            fireConfetti();
            s.addToast({ type: 'success', message: `🔥 ${streak}-day streak on ${habit.name}!` });
          }
        }
        // perfect day?
        const active = expectedOnDate(get().habits, get().vacationPeriods, getToday());
        if (active.length && dateStr === getToday()) {
          const doneAll = active.every((h) =>
            get().completions.some((c) => c.habit_id === h.id && c.date === getToday() && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)))
          );
          if (doneAll) { fireBigConfetti(); s.addToast({ type: 'success', message: 'Perfect day — every habit complete! 🎉' }); }
        }
        get().checkAchievements();
      },

      adjustAmount: (habitId, dateStr = getToday(), delta = 1) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const target = habit.target_count || 1;
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        if (existing) {
          const newAmount = Math.max(0, (existing.amount || existing.count || 0) + delta);
          if (newAmount === 0) {
            set({ completions: s.completions.filter((c) => c.id !== existing.id) });
            return;
          }
          const wasMet = amountOf(existing) >= target;
          const isMet = newAmount >= target;
          set({
            completions: s.completions.map((c) =>
              c.id === existing.id ? { ...c, amount: newAmount, count: Math.max(1, newAmount) } : c
            ),
          });
          if (!wasMet && isMet && dateStr === getToday()) get().afterCompletion(habit, { ...existing, amount: newAmount }, dateStr);
        } else if (delta > 0) {
          const comp = { id: uid(), habit_id: habitId, date: dateStr, count: 1, amount: delta, note: '', checklist_done: [], created_at: nowISO() };
          set({ completions: [...s.completions, comp] });
          if (new_goalMet(habit, delta)) get().afterCompletion(habit, comp, dateStr);
        }
      },

      setCompletionNote: (habitId, dateStr, note) =>
        set((s) => ({
          completions: s.completions.map((c) => (c.habit_id === habitId && c.date === dateStr ? { ...c, note } : c)),
        })),

      toggleChecklistItem: (habitId, dateStr, item) => {
        const s = get();
        const habit = s.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const existing = s.completions.find((c) => c.habit_id === habitId && c.date === dateStr);
        const done = new Set(existing?.checklist_done || []);
        if (done.has(item)) done.delete(item); else done.add(item);
        const list = [...done];
        if (existing) {
          set({ completions: s.completions.map((c) => (c.id === existing.id ? { ...c, checklist_done: list } : c)) });
        } else {
          set({ completions: [...s.completions, { id: uid(), habit_id: habitId, date: dateStr, count: 1, amount: 0, note: '', checklist_done: list, created_at: nowISO() }] });
        }
        if (habit.checklist?.length && list.length === habit.checklist.length) {
          if (!existing || (existing.checklist_done || []).length !== list.length) {
            get().addXp(10, true);
            s.addToast({ type: 'success', message: `All steps of ${habit.name} complete! +10 XP` });
            get().checkAchievements();
          }
        }
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
        get().checkAchievements();
      },

      deleteJournalEntry: (dateStr) => set((s) => ({ journalEntries: s.journalEntries.filter((j) => j.date !== dateStr) })),

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
        get().checkAchievements();
      },

      // ── Focus sessions ──
      saveFocusSession: (sess) => {
        set((s) => ({ focusSessions: [{ id: uid(), started_at: nowISO(), completed: true, ...sess }, ...s.focusSessions] }));
        get().addXp(Math.max(5, Math.round((sess.duration_minutes || 25) / 5)) * 2, true);
        get().addToast({ type: 'success', message: `Focus session saved — +${Math.max(5, Math.round((sess.duration_minutes || 25) / 5)) * 2} XP` });
        get().checkAchievements();
      },

      // ── Focus timer (kept in the store so it survives navigation) ──
      timer: null,
      startTimer: (preset, habitId = null) =>
        set({
          timer: {
            phase: 'work', running: true, round: 1, habitId,
            preset, sound: null,
            endsAt: Date.now() + preset.work * 60000,
            startedAt: nowISO(),
          },
          showFocusTimer: true, focusTimerHabitId: habitId,
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
          const finishedAll = t.round >= t.preset.rounds;
          if (finishedAll) {
            get().stopTimer(true);
            get().addToast({ type: 'success', message: `All ${t.preset.rounds} rounds done — session complete!` });
            return;
          }
          const breakMin = t.preset.shortBreak;
          set({ timer: { ...t, phase: 'break', breakKind: 'short', endsAt: Date.now() + breakMin * 60000, running: true } });
          get().addToast({ type: 'info', message: `Break time — ${breakMin} min` });
        } else {
          set({ timer: { ...t, phase: 'work', round: t.round + 1, breakKind: null, endsAt: Date.now() + t.preset.work * 60000, running: true } });
          get().addToast({ type: 'info', message: `Round ${t.round + 1} of ${t.preset.rounds} — focus!` });
        }
      },
      timerSkip: () => {
        const t = get().timer;
        if (!t) return;
        if (t.phase === 'work') {
          const elapsedInPhase = Math.min(t.preset.work, Math.max(1, Math.round((t.preset.work * 60000 - (t.running ? t.endsAt - Date.now() : t.remainingMs)) / 60000)));
          if (elapsedInPhase >= 1) get().saveFocusSession({ habit_id: t.habitId, duration_minutes: elapsedInPhase, notes: `Skipped — ${t.preset.name}`, completed: false });
        }
        get().timerAdvance();
      },
      stopTimer: (silent = false) => {
        const t = get().timer;
        if (t && t.phase === 'work' && !silent) {
          const elapsedInPhase = Math.min(t.preset.work, Math.max(0, Math.round((t.preset.work * 60000 - (t.running ? Math.max(0, t.endsAt - Date.now()) : t.remainingMs || 0)) / 60000)));
          if (elapsedInPhase >= 1) get().saveFocusSession({ habit_id: t.habitId, duration_minutes: elapsedInPhase, notes: `Stopped early — ${t.preset.name}`, completed: false });
        }
        set({ timer: null, showFocusTimer: false, focusTimerHabitId: null });
      },
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
        get().checkAchievements();
      },
      endVacation: (habitId) => {
        set((s) => ({
          vacationPeriods: s.vacationPeriods.map((v) => (v.habit_id === habitId && !v.end_date ? { ...v, end_date: getToday() } : v)),
        }));
        get().addToast({ type: 'info', message: 'Welcome back — vacation mode off' });
      },

      // ── Tasks ──
      addTask: (t) => {
        const task = { id: uid(), title: t.title.trim(), description: t.description || '', parent_id: t.parent_id || null, priority: t.priority || 'medium', status: 'todo', due_date: t.due_date || null, tags: t.tags || [], created_at: nowISO(), completed_at: null, sort_order: get().tasks.length };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id && t.parent_id !== id) })),
      toggleTask: (id) => {
        const s = get();
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return;
        const done = t.status !== 'done';
        set({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, status: done ? 'done' : 'todo', completed_at: done ? nowISO() : null } : x)) });
        if (done) { get().addXp(5, true); s.addToast({ type: 'success', message: `${t.title} completed! +5 XP` }); }
      },
      cycleTaskStatus: (id) => {
        const order = ['todo', 'in_progress', 'done'];
        const s = get();
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return;
        const next = order[(order.indexOf(t.status) + 1) % 3];
        set({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, status: next, completed_at: next === 'done' ? nowISO() : null } : x)) });
        if (next === 'done') { get().addXp(5, true); s.addToast({ type: 'success', message: `${t.title} completed! +5 XP` }); }
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
        const s = get();
        const h = s.homework.find((x) => x.id === id);
        if (!h) return;
        const done = h.status !== 'completed';
        set({ homework: s.homework.map((x) => (x.id === id ? { ...x, status: done ? 'completed' : 'pending', completed_at: done ? nowISO() : null } : x)) });
        if (done) { get().addXp(10, true); s.addToast({ type: 'success', message: `${h.title} done! +10 XP` }); }
      },

      // ── Subjects ──
      addSubject: (sub) => set((s) => ({ subjects: [...s.subjects, { id: uid(), name: sub.name.trim(), color: sub.color || '#3b82f6', icon: sub.icon || 'BookOpen' }] })),
      updateSubject: (id, patch) => set((s) => ({ subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((x) => x.id !== id),
          homework: s.homework.filter((h) => h.subject_id !== id),
        })),

      // ── Notes ──
      addNote: (n) => {
        const note = { id: uid(), title: n.title.trim() || 'Untitled', content: n.content || '', tags: n.tags || [], color: n.color || '#6366f1', icon: n.icon || 'FileText', pinned: !!n.pinned, created_at: nowISO(), updated_at: nowISO() };
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
          xp: 0, achievements: [],
        });
        get().addToast({ type: 'info', message: 'All data cleared. Fresh start!' });
      },
      importData: (data) => {
        const keys = ['habits', 'completions', 'journalEntries', 'dayNotes', 'focusSessions', 'vacationPeriods', 'tasks', 'notes', 'homework', 'subjects', 'settings', 'xp', 'achievements'];
        const patch = {};
        keys.forEach((k) => { if (k in data) patch[k] = data[k]; });
        set(patch);
        get().addToast({ type: 'success', message: 'Data imported successfully' });
      },
      exportSnapshot: () => {
        const s = get();
        const keys = ['habits', 'completions', 'journalEntries', 'dayNotes', 'focusSessions', 'vacationPeriods', 'tasks', 'notes', 'homework', 'subjects', 'settings', 'xp', 'achievements'];
        const out = { app: 'habitt', version: 2, exported_at: nowISO() };
        keys.forEach((k) => (out[k] = s[k]));
        return out;
      },

      // ── Achievements ──
      unlockAchievement: (id) => {
        if (get().achievements.includes(id)) return false;
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        set((s) => ({ achievements: [...s.achievements, id] }));
        get().addXp(50, true);
        get().addToast({ type: 'success', message: `Achievement unlocked: ${a?.name || id} (+50 XP)` });
        fireConfetti();
        return true;
      },

      checkAchievements: () => {
        const s = get();
        const habits = s.habits.filter((h) => !h.archived);
        const unlocked = [];
        const today = getToday();

        if (s.habits.length >= 1) unlocked.push('first_habit');
        if (s.habits.length >= 5) unlocked.push('five_habits');
        if (s.habits.length >= 10) unlocked.push('ten_habits');
        if (s.completions.length >= 1) unlocked.push('first_checkin');
        if (s.completions.length >= 50) unlocked.push('completions_50');
        if (s.completions.length >= 200) unlocked.push('completions_200');
        if (s.completions.length >= 1000) unlocked.push('completions_1000');
        if (s.journalEntries.length >= 1) unlocked.push('journal_1');
        if (s.journalEntries.length >= 30) unlocked.push('journal_30');
        if (s.focusSessions.length >= 1) unlocked.push('focus_session');
        if (s.focusSessions.length >= 10) unlocked.push('focus_10');
        if (s.vacationPeriods.length >= 1) unlocked.push('vacation_mode');
        if (s.dayNotes.length >= 1) unlocked.push('day_note');
        if (s.settings.exported) unlocked.push('export_data');
        if (s.settings.theme === 'dark') unlocked.push('dark_mode');
        if (new Set(habits.map((h) => h.category)).size >= 5) unlocked.push('all_categories');

        // streaks
        const streaks = habits.map((h) => Math.max(getCurrentStreak(h, s.completions.filter((c) => c.habit_id === h.id), s.vacationPeriods), getLongestStreak(h, s.completions.filter((c) => c.habit_id === h.id), s.vacationPeriods)));
        if (streaks.some((x) => x >= 3)) unlocked.push('streak_3');
        if (streaks.some((x) => x >= 7)) unlocked.push('streak_7');
        if (streaks.some((x) => x >= 30)) unlocked.push('streak_30');
        if (streaks.some((x) => x >= 100)) unlocked.push('streak_100');
        if (streaks.some((x) => x >= 365)) unlocked.push('streak_365');

        // early bird / night owl
        for (const c of s.completions) {
          if (!c.created_at) continue;
          const h = new Date(c.created_at).getHours();
          if (h < 7) { unlocked.push('early_bird'); break; }
        }
        for (const c of s.completions) {
          if (!c.created_at) continue;
          const h = new Date(c.created_at).getHours();
          if (h >= 22) { unlocked.push('night_owl'); break; }
        }

        // amount goal / checklist / avoid
        for (const c of s.completions) {
          const hb = s.habits.find((h) => h.id === c.habit_id);
          if (!hb) continue;
          if (hb.habit_type === 'amount' && amountOf(c) >= (hb.target_count || 1)) { unlocked.push('amount_goal'); break; }
        }
        for (const c of s.completions) {
          const hb = s.habits.find((h) => h.id === c.habit_id);
          if (hb?.checklist?.length && (c.checklist_done || []).length === hb.checklist.length) { unlocked.push('checklist_done'); break; }
        }
        for (const hb of s.habits.filter((h) => h.habit_type === 'avoid')) {
          const slips = s.completions.filter((c) => c.habit_id === hb.id);
          const clean = slips.length
            ? differenceInCalendarDaysSafe(new Date(), new Date(slips.map((x) => x.date).sort().pop()))
            : differenceInCalendarDaysSafe(new Date(), new Date(hb.created_at));
          if (clean >= 7) { unlocked.push('avoid_success'); break; }
        }

        // perfect week + perfect day
        const last7 = Array.from({ length: 7 }, (_, i) => toStr(new Date(new Date().setDate(new Date().getDate() - i))));
        const allDoneOn = (ds) => {
          const exp = expectedOnDate(s.habits, s.vacationPeriods, ds);
          if (!exp.length) return false;
          return exp.every((h) => s.completions.some((c) => c.habit_id === h.id && c.date === ds && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1))));
        };
        if (last7.every(allDoneOn)) unlocked.push('perfect_week');
        if (allDoneOn(today)) unlocked.push('all_done');

        unlocked.forEach((id) => get().unlockAchievement(id));
      },
    }),
    {
      name: 'habitt-v2',
      version: 2,
      partialize: (s) => ({
        habits: s.habits, completions: s.completions, journalEntries: s.journalEntries,
        dayNotes: s.dayNotes, focusSessions: s.focusSessions, vacationPeriods: s.vacationPeriods,
        tasks: s.tasks, notes: s.notes, homework: s.homework, subjects: s.subjects,
        settings: s.settings, xp: s.xp, achievements: s.achievements,
      }),
    }
  )
);

function new_goalMet(habit, amount) {
  return amount >= (habit.target_count || 1);
}

// theme bootstrap — resolved outside persist to avoid SSR/localStorage edge cases
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

export { levelFor, XP_PER_LEVEL };
