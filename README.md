# Habitt.

A beautiful, privacy-first desktop habit tracker with heatmaps, journaling, and streaks.

## Features

- **📊 Visual Heatmaps** — GitHub-style contribution grids showing your habit consistency over the year
- **🔥 Streak Tracking** — Current and longest streaks for each habit
- **📝 Daily Journal** — Reflect on your day with mood tracking, gratitude, and free-form writing
- **🎨 Customizable Habits** — Icons, colors, categories, and flexible scheduling
- **📈 Detailed Stats** — Completion rates, history, and per-habit analytics
- **🔒 Optional Password** — Protect your habits and journal with a password
- **🌙 Dark Mode** — Easy on the eyes, day or night
- **💾 Local Storage** — All data stays on your device. No cloud, no tracking, no ads
- **📤 Export/Import** — Backup your data as JSON

## Screenshots

The app features a clean dashboard with habit cards, a year-at-a-glance heatmap, individual habit pages with detailed statistics, and a built-in journal for daily reflection.

## Download

### Windows
- **Installer:** Download `Habitt-Setup.exe` and run the setup wizard
- **Portable:** Download `Habitt_Portable.exe` — no installation required

### Linux
- **Debian/Ubuntu:** Download `habitt_amd64.deb` and install with `sudo dpkg -i habitt_amd64.deb`
- **AppImage (Portable):** Download `Habitt.AppImage`, make executable with `chmod +x`, and run

## Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- System dependencies for Tauri (see [Tauri docs](https://tauri.app/start/prerequisites/))

### Setup
```bash
npm install
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

Built artifacts will be in `src-tauri/target/release/bundle/`.

## Tech Stack

- **Frontend:** Svelte 5 + Vite
- **Backend:** Tauri 2 (Rust)
- **Database:** SQLite (local, via tauri-plugin-sql)
- **Build:** GitHub Actions (Windows + Linux)

## Project Structure

```
Habitt./
├── src/                      # Frontend (Svelte)
│   ├── App.svelte            # Main app with routing
│   ├── main.js               # Entry point
│   ├── styles/               # Global styles
│   └── lib/
│       ├── components/       # Reusable components
│       │   ├── Sidebar.svelte
│       │   ├── Heatmap.svelte
│       │   ├── HabitCard.svelte
│       │   ├── CreateHabitModal.svelte
│       │   └── PasswordGate.svelte
│       ├── views/            # Page views
│       │   ├── Dashboard.svelte
│       │   ├── HabitPage.svelte
│       │   ├── Journal.svelte
│       │   ├── SettingsView.svelte
│       │   └── Tutorial.svelte
│       ├── stores.js         # Svelte stores
│       ├── db.js             # Database operations
│       └── utils.js          # Utility functions
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
├── .github/workflows/        # CI/CD
│   ├── build-windows.yml
│   ├── build-linux.yml
│   └── release.yml
└── package.json
```

## License

MIT
