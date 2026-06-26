import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/main.jsx', 'src/App.tsx']
    }
  }
});