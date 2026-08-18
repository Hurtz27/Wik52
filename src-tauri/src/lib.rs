use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewWindow,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use std::fs;
use std::path::PathBuf;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

const DEFAULT_CONFIG_TEMPLATE: &str = r#"{
  "version": 1,
  "settings": {
    "theme": "dark",
    "accentColor": "blue",
    "firstDayOfWeek": 1,
    "use24HourFormat": false,
    "showWeekProgress": true,
    "highlightWorkingHours": true,
    "workingHoursStart": 8,
    "workingHoursEnd": 17,
    "pinnedOnTop": true,
    "launchOnStartup": true,
    "windowOpacity": 0.94,
    "trayIconStyle": "badge",
    "windowMode": "flyout",
    "savedTimezones": [
      {
        "id": "tz-monterrey",
        "name": "Local Time",
        "iana": "America/Monterrey",
        "flag": "📍",
        "country": "MX",
        "customLabel": "Local System",
        "isPrimary": true
      },
      {
        "id": "tz-rome",
        "name": "Italy",
        "iana": "Europe/Rome",
        "flag": "🇮🇹",
        "country": "IT",
        "customLabel": "Rome / Milan"
      },
      {
        "id": "tz-chicago",
        "name": "Chicago",
        "iana": "America/Chicago",
        "flag": "🇺🇸",
        "country": "US",
        "customLabel": "US Central"
      },
      {
        "id": "tz-houston",
        "name": "Houston",
        "iana": "America/Chicago",
        "flag": "🇺🇸",
        "country": "US",
        "customLabel": "Texas"
      },
      {
        "id": "tz-monterrey-local",
        "name": "Monterrey",
        "iana": "America/Monterrey",
        "flag": "🇲🇽",
        "country": "MX",
        "customLabel": "Mexico Central"
      },
      {
        "id": "tz-toronto",
        "name": "Toronto",
        "iana": "America/Toronto",
        "flag": "🇨🇦",
        "country": "CA",
        "customLabel": "Eastern Time"
      }
    ],
    "enabledHolidays": ["US", "MX", "CA", "IT"],
    "enabledHolidayTypes": ["public", "optional"]
  },
  "dayItems": [],
  "lastSaved": 0
}"#;

fn get_config_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir.push("wik52_config.json");
    Ok(dir)
}

#[tauri::command]
fn get_app_config(app: AppHandle) -> Result<Option<String>, String> {
    let path = get_config_file_path(&app)?;
    if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
        Ok(Some(content))
    } else {
        // Create initial physical config file on first installation/run
        let _ = fs::write(&path, DEFAULT_CONFIG_TEMPLATE);
        Ok(Some(DEFAULT_CONFIG_TEMPLATE.to_string()))
    }
}

#[tauri::command]
fn save_app_config(app: AppHandle, config_json: String) -> Result<(), String> {
    let path = get_config_file_path(&app)?;
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            let _ = fs::create_dir_all(parent);
        }
    }
    fs::write(&path, config_json).map_err(|e| format!("Failed to save config: {}", e))?;
    Ok(())
}

#[tauri::command]
fn open_config_folder(app: AppHandle) -> Result<String, String> {
    let path = get_config_file_path(&app)?;
    if let Some(parent) = path.parent() {
        #[cfg(target_os = "windows")]
        {
            let _ = std::process::Command::new("explorer")
                .arg(parent.to_str().unwrap_or(""))
                .spawn();
        }
        Ok(parent.to_string_lossy().to_string())
    } else {
        Err("No parent directory found".to_string())
    }
}

#[tauri::command]
fn open_taskbar_settings() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("cmd")
            .args(&["/c", "start", "ms-settings:taskbar"])
            .spawn();
    }
    Ok(())
}

fn sync_registry_startup(enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::env::current_exe;
        use std::process::Command;

        let exe_path = current_exe().map_err(|e| e.to_string())?;
        let exe_str = exe_path.to_str().ok_or("Invalid executable path")?;

        if enable {
            let formatted_val = format!("\"{}\"", exe_str);
            let _ = Command::new("reg")
                .args(&[
                    "add",
                    "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
                    "/v",
                    "Wik52",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &formatted_val,
                    "/f",
                ])
                .creation_flags(0x08000000) // CREATE_NO_WINDOW
                .output();
        } else {
            let _ = Command::new("reg")
                .args(&[
                    "delete",
                    "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
                    "/v",
                    "Wik52",
                    "/f",
                ])
                .creation_flags(0x08000000) // CREATE_NO_WINDOW
                .output();
        }
    }
    Ok(())
}

#[tauri::command]
fn set_launch_at_startup(enable: bool) -> Result<(), String> {
    sync_registry_startup(enable)
}

#[tauri::command]
fn get_launch_at_startup() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("reg")
            .args(&[
                "query",
                "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
                "/v",
                "Wik52",
            ])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output();

        if let Ok(out) = output {
            return Ok(out.status.success());
        }
    }
    Ok(false)
}

#[tauri::command]
fn position_bottom_right(window: WebviewWindow) -> Result<(), String> {
    if let Some(monitor) = window.primary_monitor().map_err(|e| e.to_string())? {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        let win_size = window.outer_size().unwrap_or(PhysicalSize::new(
            (430.0 * scale_factor) as u32,
            (690.0 * scale_factor) as u32,
        ));

        let margin_x = (16.0 * scale_factor) as i32;
        let margin_y = (60.0 * scale_factor) as i32;

        let x = (screen_size.width as i32) - (win_size.width as i32) - margin_x;
        let y = (screen_size.height as i32) - (win_size.height as i32) - margin_y;

        window
            .set_position(PhysicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn update_tray_icon(app: AppHandle, icon_base64: String, tooltip: Option<String>) -> Result<(), String> {
    let clean_base64 = if let Some(idx) = icon_base64.find(",") {
        &icon_base64[idx + 1..]
    } else {
        &icon_base64
    };

    let png_bytes = BASE64
        .decode(clean_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let img = tauri::image::Image::from_bytes(&png_bytes)
        .map_err(|e| format!("Failed to create image: {}", e))?;

    if let Some(tray) = app.tray_by_id("main-tray") {
        tray.set_icon(Some(img))
            .map_err(|e| format!("Failed to set tray icon: {}", e))?;
        if let Some(tip) = tooltip {
            let _ = tray.set_tooltip(Some(tip));
        }
    }
    Ok(())
}

#[tauri::command]
fn set_always_on_top(window: WebviewWindow, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_window_mode(window: WebviewWindow, mode: String) -> Result<(), String> {
    if let Some(monitor) = window.primary_monitor().map_err(|e| e.to_string())? {
        let scale_factor = monitor.scale_factor();
        let screen_size = monitor.size();

        match mode.as_str() {
            "widget" => {
                let w = (220.0 * scale_factor) as u32;
                let h = (48.0 * scale_factor) as u32;
                let _ = window.set_size(PhysicalSize::new(w, h));
                let _ = window.set_always_on_top(true);
            }
            "compact" => {
                let w = (325.0 * scale_factor) as u32;
                let h = (268.0 * scale_factor) as u32;
                let _ = window.set_size(PhysicalSize::new(w, h));
                let margin_x = (16.0 * scale_factor) as i32;
                let margin_y = (60.0 * scale_factor) as i32;
                let x = (screen_size.width as i32) - (w as i32) - margin_x;
                let y = (screen_size.height as i32) - (h as i32) - margin_y;
                let _ = window.set_position(PhysicalPosition::new(x, y));
            }
            _ => {
                let w = (430.0 * scale_factor) as u32;
                let h = (690.0 * scale_factor) as u32;
                let _ = window.set_size(PhysicalSize::new(w, h));
                let margin_x = (16.0 * scale_factor) as i32;
                let margin_y = (60.0 * scale_factor) as i32;
                let x = (screen_size.width as i32) - (w as i32) - margin_x;
                let y = (screen_size.height as i32) - (h as i32) - margin_y;
                let _ = window.set_position(PhysicalPosition::new(x, y));
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn start_drag(window: WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
fn hide_window(window: WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn show_window(window: WebviewWindow) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn toggle_window(window: WebviewWindow) -> Result<bool, String> {
    let is_visible = window.is_visible().unwrap_or(false);
    if is_visible {
        let _ = window.hide();
        Ok(false)
    } else {
        let _ = position_bottom_right(window.clone());
        let _ = window.show();
        let _ = window.set_focus();
        Ok(true)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_app_config,
            save_app_config,
            open_config_folder,
            open_taskbar_settings,
            set_launch_at_startup,
            get_launch_at_startup,
            position_bottom_right,
            update_tray_icon,
            set_always_on_top,
            set_window_mode,
            start_drag,
            hide_window,
            show_window,
            toggle_window
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Ensure Windows startup registry run key is registered
            let _ = sync_registry_startup(true);

            let quit_i = MenuItem::with_id(app, "quit", "Quit Wik52", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "toggle", "Open / Hide Wik52", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::with_id("main-tray")
                .menu(&tray_menu)
                .tooltip("Wik52 - Weeks & World Time")
                .icon(app.default_window_icon().unwrap().clone())
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = toggle_window(window);
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = toggle_window(window);
                        }
                    }
                })
                .build(app)?;

            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = position_bottom_right(window.clone());
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
