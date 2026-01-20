# Change: Add Build Status Badge to README

## Why

The README currently displays a code coverage badge but lacks a build/test status badge that shows whether the latest tests are passing or failing. Adding a build status badge provides immediate visibility into the health of the codebase and reassures users and contributors that the project is well-tested.

## What Changes

- Add a GitHub Actions workflow status badge to the root README.md
- Badge will display the pass/fail status of the "Test Pull Request" workflow
- Badge will be placed near the existing coverage badge for consistency
- Badge will link to the workflow runs page for detailed test results

## Impact

- Affected specs: ci-automation
- Affected code: README.md (lines 12-16, where badges are displayed)
- No changes to existing CI workflow required
- Visual change only, no functional changes
