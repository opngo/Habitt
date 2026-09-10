use sha2::{Sha256, Digest};
use std::collections::HashMap;

#[tauri::command]
pub fn hash_password(password: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hex::encode(hasher.finalize())
}

#[tauri::command]
pub fn verify_password(password: String, hash: String) -> bool {
    let computed = hash_password(password);
    computed == hash
}

#[tauri::command]
pub async fn get_app_settings(app: tauri::AppHandle) -> Result<HashMap<String, String>, String> {
    // Settings are managed through the SQL plugin from the frontend
    Ok(HashMap::new())
}

#[tauri::command]
pub async fn save_app_setting(key: String, value: String) -> Result<(), String> {
    Ok(())
}
