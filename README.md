# Habitt.

A beautiful, privacy-first desktop habit tracker built with React, Reshaped UI, Lucide Icons, and Tauri.

## Features

### Core
- **📊 Visual Heatmaps** — GitHub-style contribution grids showing your habit consistency over the year
- **🔥 Streak Tracking** — Current and longest streaks per habit with visual progress bars
- **📝 Daily Journal** — Mood, energy, sleep hours, gratitude, and free-form writing
- **🎨 Customizable Habits** — Icons, colors, categories, difficulty levels, and flexible scheduling
- **📈 Detailed Statistics** — Completion rates, day-of-week patterns, monthly trends, category breakdowns
- **🔒 Optional Password** — Protect your habits and journal with SHA-256 hashing
- **🌙 Dark Mode** — Automatic light/dark theme support
- **💾 Local SQLite Storage** — All data stays on your device. No cloud, no tracking, no ads
- **📤 Export/Import** — Backup your data as JSON

### Advanced
- **🏆 Gamification** — XP system, levels, 20+ unlockable achievements
- **⚡ Quick Check-in Mode** — One-screen rapid habit logging
- **🔍 Command Palette** — Ctrl+K for instant navigation and actions
- **🎯 Habit Templates** — 40+ pre-built templates to get started fast
- **🎉 Confetti Celebrations** — Animations on streak milestones
- **📊 Streak Leaderboard** — Rank your habits by current streak
- **😊 Mood Correlation** — Track mood alongside habits to find patterns
- **📅 Day-of-Week Patterns** — See which days you're most productive
- **📈 Monthly Trend Charts** — Bar chart visualization per month
- **🔔 Toast Notifications** — Feedback on every action
- **⌨️ Keyboard Shortcuts** — Ctrl+N for new habit, Ctrl+K for commands, Esc to close

### UI/UX
- **Reshaped UI** — Professional 60+ component library
- **Lucide Icons** — Beautiful, consistent icon set
- **Smooth Animations** — Fade-in, slide-up, scale-in, stagger effects
- **Hover Effects** — Cards lift with shadows on hover
- **Gradient Accents** — Beautiful color gradients throughout
- **Responsive Grid** — Adapts to window size

## Download

### Windows
- **Installer:** `Habitt-Setup.exe` (NSIS installer)
- **Portable:** `Habitt_Portable.exe` (no installation required)

### Linux
- **Debian/Ubuntu:** `habitt_amd64.deb`
- **AppImage (Portable):** `Habitt.AppImage`

## Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- System dependencies for [Tauri](https://tauri.app/start/prerequisites/)

### Setup
```bash
npm install
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

## Tech Stack

- **Frontend:** React 18 + Vite
- **UI Library:** [Reshaped](https://reshaped.so) (60+ components)
- **Icons:** [Lucide](https://lucide.dev)
- **State:** Zustand
- **Animations:** CSS animations + canvas-confetti
- **Backend:** Tauri 2 (Rust)
- **Database:** SQLite (local, via tauri-plugin-sql)
- **Dates:** date-fns
- **Build:** GitHub Actions (Windows + Linux)

## Project Structure

```
Habitt./
├── src/                           # Frontend (React)
│   ├── App.jsx                    # Main app shell
│   ├── main.jsx                   # Entry point
│   ├── styles.css                 # Global styles + animations
│   ├── lib/
│   │   ├── store.js               # Zustand global state
│   │   ├── db.js                  # Database operations
│   │   ├── utils.js               # Date helpers, streak calc
│   │   └── constants.js           # Templates, achievements, colors
│   └── components/
│       ├── Layout/Sidebar.jsx     # Navigation sidebar
│       ├── Heatmap/YearHeatmap.jsx # GitHub-style heatmap
│       ├── Habits/
│       │   ├── Dashboard.jsx      # Main dashboard
│       │   ├── HabitCard.jsx      # Habit card with mini-heatmap
│       │   ├── HabitDetailPage.jsx # Full habit analytics
│       │   ├── CreateHabitModal.jsx # Create/edit form
│       │   └── QuickCheckin.jsx   # Rapid check-in mode
│       ├── Journal/JournalPage.jsx # Journal with mood/energy
│       ├── Stats/StatsDashboard.jsx # Analytics + achievements
│       ├── Settings/SettingsPage.jsx
│       ├── Tutorial/Tutorial.jsx  # 6-step onboarding
│       └── Shared/
│           ├── PasswordGate.jsx   # Login screen
│           ├── CommandPalette.jsx # Ctrl+K palette
│           └── ToastContainer.jsx # Notifications
├── src-tauri/                     # Backend (Rust)
├── .github/workflows/             # CI/CD
│   ├── build-windows.yml          # Portable + NSIS installer
│   ├── build-linux.yml            # AppImage + .deb installer
│   └── release.yml                # Trigger both on tags
└── package.json
```

## License

MIT
