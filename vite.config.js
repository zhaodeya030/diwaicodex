import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri needs a fixed port and specific server config
  clearScreen: false,
  server: {
    host: host || false,
    port: 5173,
    strictPort: true,
    hmr: host
      ? { protocol: 'ws', host, port: 5183 }
      : undefined,
    watch: {
      // Don't watch the Rust source to avoid infinite recompile loops
      ignored: ['**/src-tauri/**'],
    },
  },
})
