import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Mark <html> when running inside Tauri so CSS can branch
if (typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
  document.documentElement.dataset.tauri = '1';
  // Detect macOS so CSS can account for the native traffic-light buttons
  // (titleBarStyle:"overlay" overlays them on the content at top-left)
  const ua = navigator.userAgent;
  if (ua.includes('Macintosh')) {
    document.documentElement.dataset.platform = 'macos';
  } else if (ua.includes('Windows')) {
    document.documentElement.dataset.platform = 'windows';
  } else {
    document.documentElement.dataset.platform = 'linux';
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
