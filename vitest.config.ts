import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts — the electron plugin can't run in Vitest's
// Node.js environment, so we use a minimal config here.
export default defineConfig({
  test: {
    environment: 'node',
  },
})
