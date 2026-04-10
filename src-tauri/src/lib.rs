use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg(target_os = "windows")]
use window_vibrancy::apply_acrylic;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Remember window size & position across launches
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // On first launch (no saved state), position window on the right side
            let state_dir = app
                .path()
                .app_local_data_dir()
                .expect("could not get app local data dir");
            let first_launch_marker = state_dir.join(".dailydo_launched");

            if !first_launch_marker.exists() {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen = monitor.size();
                    let scale = monitor.scale_factor();
                    // Use logical pixels for positioning
                    let screen_w = screen.width as f64 / scale;
                    let win_w = 380_f64;
                    let padding = 20_f64;
                    let x = screen_w - win_w - padding;
                    let y = 80_f64;
                    let _ = window.set_position(tauri::LogicalPosition::new(x, y));
                }
                // Create marker so next launch uses the plugin's saved state
                let _ = std::fs::create_dir_all(&state_dir);
                let _ = std::fs::write(&first_launch_marker, "");
            }

            // ── macOS: frosted glass (Sidebar material + rounded corners) ──
            #[cfg(target_os = "macos")]
            {
                apply_vibrancy(
                    &window,
                    NSVisualEffectMaterial::Sidebar,
                    None,
                    None,
                )
                .expect("Failed to apply macOS vibrancy");
            }

            // ── Windows: Acrylic blur ──
            #[cfg(target_os = "windows")]
            {
                apply_acrylic(&window, Some((240, 240, 240, 200)))
                    .expect("Failed to apply Windows acrylic");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DailyDo");
}
