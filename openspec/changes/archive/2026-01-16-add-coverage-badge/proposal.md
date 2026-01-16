# Change: Add Code Coverage Badge to README

## Why

The project currently has comprehensive test coverage (111 tests in frontend package) but no visible indicator of coverage percentage in the README. Code coverage badges provide:

- **Transparency** - Users and contributors can immediately see test coverage quality
- **Motivation** - Visible metrics encourage maintaining or improving coverage
- **Project Health** - Coverage badges signal code quality and maintenance standards
- **Trust** - Higher coverage builds confidence for users evaluating the project

The project already has:
- ✅ Vitest configured with coverage support (`test:coverage` script)
- ✅ JSON summary reporter configured (`vitest.config.ts`)
- ✅ GitHub Actions test workflow (`.github/workflows/test.yml`)
- ✅ GitHub Pages enabled (required for badge hosting)

Adding a coverage badge is a natural next step to showcase test quality.

**Scope:** ng branch only - The `ng` branch is the Next Generation branch that will eventually replace `main`. The coverage badge will be added to the ng branch README and will only update on ng branch pushes. This allows testing the badge setup before it's added to main.

## What Changes

**Add Coverage Badge Automation:**
1. Create `gh-pages` branch if it doesn't exist (for badge SVG hosting)
2. Update test workflow to generate coverage on ng branch pushes only
3. Add coverage badge action to update badge SVG on GitHub Pages (ng branch only)
4. Add badge to README.md on ng branch that displays coverage percentage

**Update Test Workflow:**
- Modify `.github/workflows/test.yml` to run coverage generation
- Add `we-cli/coverage-badge-action@main` step (after tests)
- Only run badge update on ng branch (not main, not PRs)

**Update Documentation:**
- Add coverage badge to README.md (at top with logo/links)
- Document coverage requirements in CI automation spec

## Impact

- **Affected specs**: `ci-automation` - Add coverage badge requirement
- **Affected files**:
  - `.github/workflows/test.yml` - Add coverage generation and badge update (ng branch only)
  - `README.md` - Add coverage badge at top (ng branch only)
  - `packages/frontend/vitest.config.ts` - Already configured correctly (no changes needed)
- **Breaking changes**: None
- **New dependencies**: Uses GitHub Action `we-cli/coverage-badge-action@main` (no package.json changes)
- **Prerequisites**: 
  - GitHub Pages must be enabled on `gh-pages` branch with `/ (root)` directory
  - Workflow permissions must have "Read and write permissions" enabled
- **Migration complexity**: Low - purely additive change on ng branch only
- **Branch scope**: ng branch only - main branch is unaffected
