// Habitt desktop shell.
//
// The entire app logic lives in the React frontend. The Rust side is a
// zero-plugin window plus two file commands that persist the state to
//   ~/.habbitt/habits.json
// (folder auto-created on first launch). The UI never hard-depends on the
// bridge: in a browser it transparently falls back to local storage.
use std::fs;
use std::path::PathBuf;

fn data_dir() -> PathBuf {
    let home = std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    home.join(".habbitt")
}

fn data_file() -> PathBuf {
    data_dir().join("habits.json")
}

#[tauri::command]
fn data_path() -> String {
    data_file().display().to_string()
}

#[tauri::command]
fn read_data() -> Result<String, String> {
    match fs::read_to_string(data_file()) {
        Ok(s) => Ok(s),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn write_data(content: String) -> Result<String, String> {
    let dir = data_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = data_file();
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, content.as_bytes()).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Seed the file/folder on first launch so it exists even before the first save.
    let _ = (|| -> Result<(), String> {
        fs::create_dir_all(data_dir()).map_err(|e| e.to_string())?;
        if !data_file().exists() {
            fs::write(&data_file(), "{}").map_err(|e| e.to_string())?;
        }
        Ok(())
    })();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![data_path, read_data, write_data])
        .run(tauri::generate_context!())
        .expect("error while running Habitt");
}
