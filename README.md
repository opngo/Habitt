# Habitt.

A beautiful, privacy-first **habit tracker** — desktop app (Tauri) and web app from one codebase.
Everything renders and works with zero setup: run it in a browser and every feature below works,
with all data persisted locally. No accounts, no tutorial, no password gate.

```bash
npm install
npm run dev        # http://localhost:1420 — works in any browser
```

## Features

### Habits & tracking
- **Clickable habit cards** — tap anywhere on a card to log it for today
- **Heat cubes on every card** — last 9 weeks per habit; numeric habits fill each
  cube *partially* (4 of 10 glasses = 40 % fill) and the whole card dims or brightens
  with today's progress
- **Day / Week / Month / Year heatmaps** — the dashboard heatmap scales brightness
  to how much you actually did that day (dimmer = less, brighter = more); click any
  day to open its list
- **Streaks** — current & longest per habit, streak-aware schedules (rest days &
  vacations don't break them)
- **Three habit types** — normal check-off, amount goals (with +/- steppers), and
  *avoid* habits (slip logging + clean-day counters)
- **Flexible schedules** — daily, weekdays, weekends, X per week, X per month,
  specific days, every-N-days
- **Step checklists** — multi-step routines inside a single habit
- **Vacation mode** — pause a habit, your streak is protected
- **Habits tab** — every habit in one place: search, sort, archive views
- **Quick check-in mode** — one screen, one tap per habit (Ctrl+Q)
- **40 one-click templates** — from "Drink Water" to "Evening Routine" checklists

### Your day, all in one place
- **Calendar with day icons** — dots for reminders, homework and notes on each day;
  green shading shows how many habits you completed that day
- **Tap a day, get its day** — the panel under the calendar lists that day's to-dos
  (checkable right there) and the day's completed habits, plus an inline day-note
  editor with autosave — no popups anywhere
- **Daily journal** — mood, energy, sleep hours, gratitude, free-form page, per-day
  navigation, autosave
- **Daily reflection** — uses **local Ollama** when it's running; falls back to a
  built-in on-device insight engine. Never sends anything anywhere
- **Reminders** — an iPhone-Reminders-style list: sections (Overdue / Today /
  Scheduled / All / Completed), circle toggles, inline expand-to-edit with notes,
  priority and unlimited subtasks — no kanban, no drag-and-drop ceremony
- **Homework** — per-subject, due-date sorted, overdue & this-week counters; manage
  subjects inline
- **Notes** — a real split-view editor: master list on the left, full-width writing
  surface on the right, autosave, pin, colors, tags, search
- **Full-screen Focus timer** — takes over the whole window (it is not a dialog):
  drifting aurora backdrop, glowing progress ring with an orbiting comet, floating
  particles, shimmering gradient time, Pomodoro/Deep Work/custom presets, round
  tracking, optional habit linking and WebAudio ambient sounds (rain, ocean, brown
  noise) generated live — works offline. The timer keeps running when you leave the
  screen; the topbar shows a live pill.

### Insights (no badges, no points)
- **Statistics with a range picker** — pick Day / Week / Month / Year and every
  number re-scopes; consistency ranking per habit, category breakdown, day-of-week
  pattern, 7-day bars
- **Mood vs. habit correlation** — do you execute better on good days? The app knows

### App
- **Collapsible sidebar** — rail mode with count badges, Ctrl+B
- **Dark mode** — follows system by default, manual override, no flash on load
- **Command palette** — Ctrl+K: jump anywhere, log any habit from the keyboard
- **Shortcuts** — Ctrl+N new habit · Ctrl+Q quick check-in · Ctrl+J journal ·
  Ctrl+F focus · Ctrl+B sidebar · Esc back
- **Export / import** — full JSON backup & restore, plus an Obsidian-vault Markdown
  export (daily notes, habit histories, tasks)
- **Privacy** — no accounts, no cloud, no telemetry, no ad SDKs. Not even a font
  request. Deliberately no XP, no levels, no achievements, no confetti

## Storage

- **Desktop (Tauri):** all data lives in **`~/.habbitt/habits.json`** — the folder and
  file are created automatically on first launch and written atomically
  (temp file + rename) through three custom Rust commands (`data_path`, `read_data`,
  `write_data`). No plugins, no capability files, no native bridge that can break the
  UI.
- **Web / browser:** the exact same store persists to `localStorage` under the key
  `habitt-v2` (versioned, migration-safe), and every localStorage write is mirrored.
  When running inside Tauri, writes are debounced to the JSON file as well.
- Settings screen shows the live data location.

## Tech

React 18 + Vite, Zustand (with `persist` + custom hybrid storage adapter), date-fns,
lucide-react icons, plain hand-rolled CSS (aurora/glow effects are CSS + SVG, no
animation library), Tauri 2 shell with the WebAudio ambient-sound engine and the
optional Ollama integration.

## Quality gate

```bash
npm run build     # production bundle
npm run smoke     # headless jsdom test: boots the app and drives 67 real
                  # interactions — card-click logging, partial cube fills,
                  # sidebar collapse, Reminders editing, calendar day panel,
                  # heat ranges, the full-screen timer, notes autosave, palette,
                  # persistence shape — and asserts zero emoji in the UI
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
