/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5179,
    strictPort: true,
    allowedHosts: ['.ts.net'],
  },
  test: {
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
  },
})
