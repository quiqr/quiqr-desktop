/**
 * Embgit module
 */

export { Embgit } from './embgit.js';
export type { EmbgitUserConfig } from './embgit.js';

// Re-export embgit types from @quiqr/types for consumers
export type {
  QuiqrSiteRepoInfo,
  HugoThemeRepoInfo,
  CommitEntry,
  CommitLog
} from '@quiqr/types';
