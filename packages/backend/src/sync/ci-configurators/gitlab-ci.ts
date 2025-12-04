/**
 * GitLab CI Configurator
 *
 * Generates GitLab CI/CD pipeline files for Hugo site builds.
 */

import path from 'path';
import fs from 'fs-extra';
import type { CIConfigurator, CIWorkflowOptions } from './index.js';

/**
 * GitLab CI/CD Configurator
 */
export class GitlabCIConfigurator implements CIConfigurator {
  getName(): string {
    return 'GitLab CI/CD';
  }

  async writeWorkflow(destinationPath: string, options: CIWorkflowOptions): Promise<void> {
    const hugoVersion = options.hugoVersion || '0.81.0';
    const baseUrlArg = options.overrideBaseURL ? `--baseURL ${options.overrideBaseURL}` : '';

    const yaml = `image: registry.gitlab.com/pages/hugo/hugo_extended:${hugoVersion}

variables:
  GIT_SUBMODULE_STRATEGY: recursive

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - hugo --minify ${baseUrlArg}
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "${options.branch}"

pages:
  stage: deploy
  script:
    - echo "Deploying to GitLab Pages"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "${options.branch}"
`;

    await fs.writeFile(
      path.join(destinationPath, '.gitlab-ci.yml'),
      yaml,
      'utf-8'
    );
  }
}
