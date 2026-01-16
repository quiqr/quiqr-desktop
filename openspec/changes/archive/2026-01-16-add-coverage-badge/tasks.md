# Implementation Tasks

## Phase 1: Prerequisites Setup

### 1. Verify and setup gh-pages branch

- [x] 1.1 Check if `gh-pages` branch exists: `git branch -r | grep gh-pages`
- [x] 1.2 If not exists, create orphan `gh-pages` branch (manual step required):
  ```bash
  git switch --orphan gh-pages
  git commit --allow-empty -m "Initial commit for GitHub Pages"
  git push -u origin gh-pages
  git switch ng
  ```
- [x] 1.3 Verify GitHub Pages is enabled in repository Settings (manual step required)
- [x] 1.4 Verify Pages source is set to `gh-pages` branch and `/ (root)` directory (manual step required)
- [x] 1.5 Verify workflow permissions: Settings → Actions → General → "Read and write permissions" (manual step required)

## Phase 2: Update Test Workflow

### 2. Modify .github/workflows/test.yml

- [x] 2.1 Add coverage generation step after "Run frontend tests"
- [x] 2.2 Change test command from `npm test` to `npm run test:coverage`
- [x] 2.3 Add coverage badge action step (only on ng branch)
- [x] 2.4 Configure badge action with branch condition: `if: github.ref == 'refs/heads/ng'`
- [x] 2.5 Verify workflow syntax is valid

## Phase 3: Update README

### 3. Add coverage badge to README.md

- [x] 3.1 Determine badge placement (top of README after logo/title)
- [x] 3.2 Add badge markdown with correct repository path
- [x] 3.3 Format: `[![cov](https://mipmip.github.io/quiqr-desktop/badges/coverage.svg)](https://github.com/mipmip/quiqr-desktop/actions)`
- [x] 3.4 Verify badge URL matches repository structure
- [x] 3.5 Add newline/spacing for proper formatting

## Phase 4: Update Specification

### 4. Add coverage badge requirement to ci-automation spec

- [x] 4.1 Create spec delta in `openspec/changes/add-coverage-badge/specs/ci-automation/spec.md`
- [x] 4.2 Add "ADDED Requirements" section
- [x] 4.3 Add "Code Coverage Badge" requirement with scenarios:
  - Coverage badge displays in README
  - Badge updates automatically on push to ng
  - Badge shows accurate coverage percentage
  - Badge links to GitHub Actions
- [x] 4.4 Ensure each scenario has proper GIVEN/WHEN/THEN format

## Phase 5: Testing and Validation

### 5. Test the implementation (manual steps after gh-pages setup)

- [x] 5.1 Push changes to the ng branch
- [ ] 5.2 Create a pull request to ng to verify workflow runs tests
- [ ] 5.3 Merge to ng and verify coverage badge generation
- [ ] 5.4 Check that `gh-pages` branch contains `badges/coverage.svg`
- [ ] 5.5 Verify badge displays correctly in README on GitHub (ng branch)
- [ ] 5.6 Verify badge shows correct coverage percentage
- [ ] 5.7 Verify badge link redirects to Actions page
- [ ] 5.8 Verify badge does NOT update when pushing to main branch

### 6. Documentation

- [x] 6.1 Verify workflow comments explain coverage badge setup
- [x] 6.2 Verify README badge is properly documented
- [x] 6.3 Update any contributor documentation if needed

## Phase 6: Validation

### 7. OpenSpec validation

- [x] 7.1 Run `openspec validate add-coverage-badge --strict`
- [x] 7.2 Resolve any validation errors
- [x] 7.3 Verify spec deltas are properly formatted
- [x] 7.4 Verify all scenarios include GIVEN/WHEN/THEN blocks

