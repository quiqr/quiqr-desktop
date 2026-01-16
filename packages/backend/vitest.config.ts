import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'backend',
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', '**/__tests__/**', '**/*.test.ts'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
  },
});
