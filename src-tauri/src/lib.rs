// Habitt desktop shell.
//
// The entire app logic (state, streaks, persistence) lives in the React
// frontend and is stored locally via the webview's storage, so the Rust side
// stays a zero-plugin window — small, fast, and impossible for the UI to
// "not work" because of a missing native bridge.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Habitt");
}
