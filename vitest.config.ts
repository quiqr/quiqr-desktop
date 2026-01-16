import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './packages/types/vitest.config.ts',
      './packages/backend/vitest.config.ts',
      './packages/frontend/vitest.config.ts',
    ],
  },
});
