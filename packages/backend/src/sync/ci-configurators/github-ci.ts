/**
 * GitHub CI Configurator
 *
 * Generates GitHub Actions workflow files for Hugo site builds.
 */

import path from 'path';
import fs from 'fs-extra';
import type { CIConfigurator, CIWorkflowOptions } from './index.js';

/**
 * GitHub Actions CI Configurator
 */
export class GithubCIConfigurator implements CIConfigurator {
  getName(): string {
    return 'GitHub Actions';
  }

  async writeWorkflow(destinationPath: string, options: CIWorkflowOptions): Promise<void> {
    const hugoVersion = options.hugoVersion || '0.81.0';
    const baseUrlArg = options.overrideBaseURL ? `--baseURL ${options.overrideBaseURL}` : '';

    const yaml = `name: Hugo Build and Deploy

on:
  push:
    branches:
      - ${options.branch}

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '${hugoVersion}'
          extended: true

      - name: Build
        run: hugo --minify ${baseUrlArg}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
`;

    await fs.ensureDir(path.join(destinationPath, '.github', 'workflows'));
    await fs.writeFile(
      path.join(destinationPath, '.github', 'workflows', 'hugo-build.yml'),
      yaml,
      'utf-8'
    );
  }
}
