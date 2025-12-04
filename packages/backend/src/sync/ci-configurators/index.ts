/**
 * CI Configurators Module
 *
 * Provider-specific CI/CD workflow generators for Hugo sites.
 * Each configurator knows how to generate workflow files for its platform.
 */

import type { GitProvider } from '@quiqr/types';
import { GithubCIConfigurator } from './github-ci.js';
import { GitlabCIConfigurator } from './gitlab-ci.js';
import { ForgejoCIConfigurator } from './forgejo-ci.js';

/**
 * Options for CI workflow generation
 */
export interface CIWorkflowOptions {
  branch: string;
  hugoVersion?: string;
  overrideBaseURL?: string;
}

/**
 * CI Configurator interface
 */
export interface CIConfigurator {
  /**
   * Write CI workflow files to the destination directory
   */
  writeWorkflow(destinationPath: string, options: CIWorkflowOptions): Promise<void>;

  /**
   * Get the name of this CI provider
   */
  getName(): string;
}

/**
 * Get the appropriate CI configurator for a git provider
 */
export function getCIConfigurator(provider: GitProvider): CIConfigurator | null {
  switch (provider) {
    case 'github':
      return new GithubCIConfigurator();
    case 'gitlab':
      return new GitlabCIConfigurator();
    case 'forgejo':
      return new ForgejoCIConfigurator();
    case 'generic':
    default:
      return null;
  }
}

export { GithubCIConfigurator } from './github-ci.js';
export { GitlabCIConfigurator } from './gitlab-ci.js';
export { ForgejoCIConfigurator } from './forgejo-ci.js';
