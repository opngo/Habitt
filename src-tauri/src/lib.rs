use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;
mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:habitt.db",
                    vec![
                        Migration {
                            version: 1,
                            description: "create initial tables",
                            sql: r#"
                                CREATE TABLE IF NOT EXISTS habits (
                                    id TEXT PRIMARY KEY,
                                    name TEXT NOT NULL,
                                    description TEXT DEFAULT '',
                                    icon TEXT DEFAULT 'Zap',
                                    color TEXT DEFAULT '#22c55e',
                                    category TEXT DEFAULT 'General',
                                    habit_type TEXT DEFAULT 'normal',
                                    frequency TEXT DEFAULT 'daily',
                                    schedule_type TEXT DEFAULT 'daily',
                                    schedule_value INTEGER DEFAULT 0,
                                    custom_days TEXT DEFAULT '',
                                    target_count INTEGER DEFAULT 1,
                                    unit TEXT DEFAULT '',
                                    checklist TEXT DEFAULT '[]',
                                    reminder_enabled INTEGER DEFAULT 0,
                                    reminder_time TEXT DEFAULT '',
                                    difficulty TEXT DEFAULT 'medium',
                                    notes_template TEXT DEFAULT '',
                                    created_at TEXT DEFAULT (datetime('now')),
                                    archived INTEGER DEFAULT 0,
                                    vacation_mode INTEGER DEFAULT 0,
                                    sort_order INTEGER DEFAULT 0
                                );

                                CREATE TABLE IF NOT EXISTS completions (
                                    id TEXT PRIMARY KEY,
                                    habit_id TEXT NOT NULL,
                                    date TEXT NOT NULL,
                                    count INTEGER DEFAULT 1,
                                    amount REAL DEFAULT 0,
                                    note TEXT DEFAULT '',
                                    checklist_done TEXT DEFAULT '[]',
                                    created_at TEXT DEFAULT (datetime('now')),
                                    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                                    UNIQUE(habit_id, date)
                                );

                                CREATE TABLE IF NOT EXISTS day_notes (
                                    id TEXT PRIMARY KEY,
                                    date TEXT NOT NULL UNIQUE,
                                    content TEXT DEFAULT '',
                                    created_at TEXT DEFAULT (datetime('now')),
                                    updated_at TEXT DEFAULT (datetime('now'))
                                );

                                CREATE TABLE IF NOT EXISTS journal_entries (
                                    id TEXT PRIMARY KEY,
                                    date TEXT NOT NULL UNIQUE,
                                    mood INTEGER DEFAULT 3,
                                    content TEXT DEFAULT '',
                                    gratitude TEXT DEFAULT '',
                                    sleep_hours REAL DEFAULT NULL,
                                    energy INTEGER DEFAULT 3,
                                    tags TEXT DEFAULT '',
                                    created_at TEXT DEFAULT (datetime('now')),
                                    updated_at TEXT DEFAULT (datetime('now'))
                                );

                                CREATE TABLE IF NOT EXISTS focus_sessions (
                                    id TEXT PRIMARY KEY,
                                    habit_id TEXT DEFAULT NULL,
                                    started_at TEXT NOT NULL,
                                    duration_minutes INTEGER NOT NULL,
                    completed INTEGER DEFAULT 0,
                                    notes TEXT DEFAULT '',
                                    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL
                                );

                                CREATE TABLE IF NOT EXISTS settings (
                                    key TEXT PRIMARY KEY,
                                    value TEXT NOT NULL
                                );

                                CREATE TABLE IF NOT EXISTS vacation_periods (
                                    id TEXT PRIMARY KEY,
                                    habit_id TEXT NOT NULL,
                                    start_date TEXT NOT NULL,
                                    end_date TEXT DEFAULT NULL,
                                    created_at TEXT DEFAULT (datetime('now')),
                                    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
                                );

                                CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, date);
                                CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
                                CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
                                CREATE INDEX IF NOT EXISTS idx_day_notes_date ON day_notes(date);
                                CREATE INDEX IF NOT EXISTS idx_focus_sessions_started ON focus_sessions(started_at);
                                CREATE INDEX IF NOT EXISTS idx_vacation_habit ON vacation_periods(habit_id);
                            "#,
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::hash_password,
            commands::verify_password,
            commands::get_app_settings,
            commands::save_app_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
