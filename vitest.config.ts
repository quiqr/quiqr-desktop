import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: './coverage',
    },
    projects: [
      './packages/types/vitest.config.ts',
      './packages/backend/vitest.config.ts',
      './packages/frontend/vitest.config.ts',
      './packages/adapters/electron/vitest.config.ts',
      './packages/adapters/standalone/vitest.config.ts',
    ],
  },
});
