/**
 * Forgejo CI Configurator
 *
 * Generates Forgejo Actions workflow files for Hugo site builds.
 * Forgejo Actions are compatible with GitHub Actions format but use different directories.
 * Also works with Gitea.
 */

import path from 'path';
import fs from 'fs-extra';
import type { CIConfigurator, CIWorkflowOptions } from './index.js';

/**
 * Forgejo Actions CI Configurator
 */
export class ForgejoCIConfigurator implements CIConfigurator {
  getName(): string {
    return 'Forgejo Actions';
  }

  async writeWorkflow(destinationPath: string, options: CIWorkflowOptions): Promise<void> {
    const hugoVersion = options.hugoVersion || '0.81.0';
    const baseUrlArg = options.overrideBaseURL ? `--baseURL ${options.overrideBaseURL}` : '';

    // Forgejo Actions use GitHub Actions-compatible syntax
    // but are placed in .forgejo/workflows/ directory
    const yaml = `name: Hugo Build and Deploy

on:
  push:
    branches:
      - ${options.branch}

jobs:
  deploy:
    runs-on: docker
    container:
      image: klakegg/hugo:${hugoVersion}-ext-alpine
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0

      - name: Build
        run: hugo --minify ${baseUrlArg}

      - name: Deploy to Pages
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./public
`;

    // Forgejo uses .forgejo/workflows, but also supports .gitea/workflows
    await fs.ensureDir(path.join(destinationPath, '.forgejo', 'workflows'));
    await fs.writeFile(
      path.join(destinationPath, '.forgejo', 'workflows', 'hugo-build.yml'),
      yaml,
      'utf-8'
    );
  }
}
