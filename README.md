# Habitt.

A beautiful, privacy-first **habit tracker** — desktop app (Tauri) and web app from one codebase.
Everything renders and works with zero setup: run it in a browser and every feature below works,
with all data persisted locally.

```bash
npm install
npm run dev        # → http://localhost:1420  (works in any browser)
```

## Features

### Habits & tracking
- **📊 Year heatmap** — GitHub-style contribution grid (+ a month view, click any day for a day-note)
- **🔥 Streaks** — current & longest per habit, streak-aware schedules (rest days & vacations don't break them)
- **🧩 Three habit types** — normal check-off, amount goals (with +/- steppers), and *avoid* habits (slip logging + clean-day counters)
- **📅 Flexible schedules** — daily, weekdays, weekends, X per week, X per month, specific days, every-N-days
- **✅ Step checklists** — multi-step routines inside a single habit
- **🏖️ Vacation mode** — pause a habit, your streak is protected
- **💪 Habit strength** — Loop-style consistency score with ~3%/day decay
- **⚡ Quick check-in mode** — one screen, one tap per habit (Ctrl+Q)
- **🎨 Full customization** — searchable Lucide icon picker, custom colors, 11 categories, difficulty → XP
- **🎯 40 one-click templates** — from "Drink Water" to "Evening Routine" checklists

### Your day, all in one place
- **📝 Daily journal** — mood, energy, sleep hours, gratitude, free-form page, per-day navigation, autosave
- **🧠 Daily reflection** — uses **local Ollama** when it's running; falls back to a built-in on-device insight engine. Never sends anything anywhere
- **🗒️ Day notes** — a note on any day, straight from the heatmap or calendar
- **☑️ Tasks** — kanban with drag & drop, priorities, due dates, tags, unlimited subtasks
- **🎓 Homework** — per-subject, due-date sorted, overdue & this-week counters; manage subjects inline
- **📌 Notes** — pinned, color/icon-tagged cards with search
- **⏱️ Focus timer** — Pomodoro/Deep Work/custom presets, round tracking, linked habits, procedural ambient sounds (rain, ocean, brown noise…) generated with WebAudio — no audio files, works offline

### Motivation mechanics
- **🏆 XP, levels & 28 achievements** — every check-in, task, session earns XP; streak milestones explode confetti
- **📈 Statistics** — completion rates (7d/30d), monthly trend chart, day-of-week pattern, category breakdown
- **😊 Mood ↔ habit correlation** — do you execute better on good days? The app knows
- **📊 Streak leaderboard** — your habits, ranked
- **🎉 Confetti celebrations** — on perfect days, level-ups and streaks

### App
- **🌙 Dark mode** — follows system by default, manual override, no flash on load
- **🔍 Command palette** — Ctrl+K: jump anywhere, toggle any habit from the keyboard
- **⌨️ Shortcuts** — Ctrl+N new habit · Ctrl+Q quick check-in · Ctrl+J journal · Ctrl+F focus · Esc back
- **🔔 Toasts** — feedback for every action
- **📤 Export / import** — full JSON backup & restore, **plus an Obsidian-vault Markdown export** (daily notes, habit histories, tasks)
- **🔒 Privacy** — no accounts, no cloud, no telemetry, no ad SDKs. Not even a font request

> Removed from v1 by design: the onboarding tutorial and the password gate.

## Storage

- **Web / preview:** everything lives in the browser's local storage (key `habitt-v2`), versioned + migration-safe.
- **Desktop (Tauri):** same web UI inside a Rust window — data persists in the app's webview storage.
  The Tauri side is a zero-plugin shell on purpose: there is no native bridge that can fail and "break the UI".

## Tech

React 18 · Vite 5 · Zustand (persist) · Lucide icons · date-fns · canvas-confetti · WebAudio · Tauri 2 · custom CSS design system (no component-library dependency)

## Quality gate

```bash
npm run build     # production bundle
npm run smoke     # headless jsdom test that boots the app and exercises:
                  # creating habits, check-offs, XP, achievements, templates,
                  # amount steppers, every view, palette, theme, timer, journal
```

## Desktop builds (Windows / Linux)

```bash
npm run tauri build
```

Needs [Rust](https://rustup.rs) + [Tauri prerequisites](https://tauri.app/start/prerequisites/).
Output: NSIS installer + portable EXE (Windows), AppImage + .deb (Linux).

GitHub Actions does this for you — push a tag:

```bash
git tag v2.0.0 && git push origin v2.0.0
```

…or run the **"Release installers"** workflow manually from the Actions tab.

## License

MIT
