use tauri::Manager;
use tauri_plugin_window_state::StateFlags;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg(target_os = "windows")]
use window_vibrancy::apply_acrylic;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Persist window position & size — exclude MAXIMIZED/FULLSCREEN so an
        // old full-screen state is never restored.
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(StateFlags::SIZE | StateFlags::POSITION)
                .build(),
        )
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Safety clamp: reset if a stale oversized state was saved.
            if let (Ok(size), Ok(scale)) = (window.inner_size(), window.scale_factor()) {
                let logical_w = size.width as f64 / scale;
                let logical_h = size.height as f64 / scale;
                if logical_w > 600.0 || logical_h > 900.0 {
                    let _ = window.set_size(tauri::LogicalSize::new(300_f64, 360_f64));
                }
            }

            // Pin to all macOS Spaces — the window persists when switching apps
            // and shows on every virtual desktop, like a pinned desktop widget.
            let _ = window.set_visible_on_all_workspaces(true);

            // First launch: place window in the top-right corner
            let state_dir = app
                .path()
                .app_local_data_dir()
                .expect("could not get app local data dir");
            let first_launch_marker = state_dir.join(".dailydo_launched");

            if !first_launch_marker.exists() {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen = monitor.size();
                    let scale = monitor.scale_factor();
                    let screen_w = screen.width as f64 / scale;
                    let win_w = 300_f64;
                    let padding = 20_f64;
                    let x = screen_w - win_w - padding;
                    let y = 80_f64;
                    let _ = window.set_position(tauri::LogicalPosition::new(x, y));
                }
                let _ = std::fs::create_dir_all(&state_dir);
                let _ = std::fs::write(&first_launch_marker, "");
            }

            // ── macOS: dark frosted-glass (HudWindow = always dark) ──────
            #[cfg(target_os = "macos")]
            {
                apply_vibrancy(
                    &window,
                    NSVisualEffectMaterial::HudWindow,
                    None,
                    None,
                )
                .expect("Failed to apply macOS vibrancy");
            }

            // ── Windows: Acrylic blur ────────────────────────────────────
            #[cfg(target_os = "windows")]
            {
                apply_acrylic(&window, Some((18, 18, 26, 200)))
                    .expect("Failed to apply Windows acrylic");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DailyDo");
}
