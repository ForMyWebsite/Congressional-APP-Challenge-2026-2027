import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
  server: { allowedHosts: ['.app.github.dev'], proxy: { '/api': 'http://127.0.0.1:3001' } },
});
