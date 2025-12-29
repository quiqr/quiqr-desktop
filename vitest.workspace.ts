import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/types/vitest.config.ts',
  'packages/backend/vitest.config.ts',
  'frontend/vitest.config.ts',
]);
