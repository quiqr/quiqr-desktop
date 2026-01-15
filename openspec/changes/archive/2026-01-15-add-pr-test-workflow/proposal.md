# Change: Add GitHub Actions Test Workflow for Pull Requests

## Why

Currently, the project has a `build.yml` workflow that only runs on version tags (releases). There is no automated testing on pull requests, meaning:
- Code quality issues may not be caught before merging
- Manual testing is required for every PR
- Regression bugs can slip into the main and ng (Next Generation) branches
- Contributors don't get immediate feedback on test failures

The existing build workflow has commented-out PR triggers, suggesting this was planned but never implemented.

## What Changes

- Add a new GitHub Actions workflow (`test.yml`) that runs on pull requests to `main` and `ng` branches
- Run frontend tests using the existing vitest test suite
- Run TypeScript type checking to catch type errors
- Enable local testing using `act` tool before pushing
- Provide clear test results in PR checks

## Impact

- **Affected specs**: New capability `ci-automation` will be created
- **Affected code**:
  - `.github/workflows/test.yml` - New workflow file
  - No changes to existing code or workflows

- **Benefits**:
  - Automated quality gates for all PRs
  - Faster feedback for contributors
  - Prevents broken code from merging
  - Documents testing requirements in CI

- **Testing**: Can be tested locally with `act pull_request` before committing
