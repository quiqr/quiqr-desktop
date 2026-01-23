# Design: OpenSpec UI Publishing

## Context
The Quiqr Desktop project uses OpenSpec for spec-driven development, with all specifications stored in the `openspec/` directory. Currently, these specs are only accessible by cloning the repository and reading Markdown files. The `openspecui` package provides a way to generate an interactive, browsable website from OpenSpec directories.

A fork of `openspecui` has been created that adds static export functionality, which is required for CI/CD deployment. The fork is available at `github:mipmip/openspecui/feature/nixFlake` and provides an `export` command that generates a complete static website from OpenSpec directories. This fork uses Nix flakes for packaging and distribution.

GitHub Pages is already configured for this repository with a `gh-pages` branch that hosts code coverage badges at `/badges/coverage.svg`. We need to add OpenSpec UI publishing without disrupting this existing setup.

### Stakeholders
- **Development team**: Primary consumers of specs during implementation
- **Contributors**: Need to understand project requirements
- **Project maintainers**: Need automated documentation updates

### Constraints
- Must not break existing coverage badge deployment
- Must work within GitHub Actions free tier limits
- Must be maintainable without deep CI expertise

## Goals / Non-Goals

### Goals
- Automatically publish OpenSpec UI on every push to `main` or `ng` branches
- Make specifications easily browsable via GitHub Pages
- Maintain separation between coverage badges and OpenSpec UI content
- Keep CI execution time reasonable (< 2 minutes for publishing step)

### Non-Goals
- Versioned documentation for multiple releases (future enhancement)
- Custom domain configuration
- Integration with external documentation platforms
- Branch-specific OpenSpec UI (only publish from `main` and `ng`)

## Decisions

### Decision 1: Use Nix-based OpenSpecUI Fork for Static Export
**Choice**: Use the `github:mipmip/openspecui/feature/nixFlake` fork which provides static export functionality via Nix flakes

**Rationale**: 
- The official `openspecui` package doesn't support static export mode (designed as a live server only)
- This fork adds an `export` command specifically for CI/CD use cases
- Nix provides reproducible builds and dependency management
- GitHub Actions has good support for Nix through community actions

**Command usage**:
```bash
nix run github:mipmip/openspecui/feature/nixFlake -- export --dir . --clean ./output-dir
```

**Alternatives considered**:
- Using official `openspecui` as a server: Not suitable for static hosting on GitHub Pages
- Building from source in CI: More complex, slower, less reproducible

### Decision 2: Use GitHub Actions Artifact + Pages Deploy Action
**Choice**: Use a two-step approach with GitHub's official actions:
1. Generate OpenSpec UI static export using Nix-based fork
2. Use `actions/upload-pages-artifact` and `actions/deploy-pages` for deployment

**Rationale**: 
- GitHub's official Pages deployment action handles subdirectory merging correctly
- Better than manually managing `gh-pages` branch with git operations
- Separates concerns: generation vs. deployment
- Easier to maintain and debug

**Alternatives considered**:
- Manual `gh-pages` branch push: More complex, risk of conflicts with existing badge workflow
- Third-party actions (peaceiris/actions-gh-pages): Adds external dependency, official action is better supported

### Decision 2: Deploy OpenSpec UI to Root Path
**Choice**: Deploy generated OpenSpec UI to the root path on GitHub Pages, with coverage badges maintained in `/badges/` subdirectory

**Rationale**:
- Cleaner URL: `https://quiqr.github.io/quiqr-desktop/` instead of `/specs/`
- The openspecui fork's `--base-path` option has build issues currently
- Coverage badge at `/badges/coverage.svg` is maintained separately and won't conflict
- Simpler configuration and routing

**Alternatives considered**:
- `/specs/` path: Would require `--base-path=/specs/` which currently fails during build
- `/openspec/` path: More verbose, less clean for end users
- `/docs/` path: Could conflict if we add other documentation later

**Note**: If the `--base-path` functionality is fixed in the upstream fork, this decision can be revisited to move OpenSpec UI to `/specs/` subdirectory.

### Decision 3: Add to Existing test.yml Workflow
**Choice**: Add OpenSpec UI publishing as a new job in `.github/workflows/test.yml`

**Rationale**:
- Already triggers on push to `main` and `ng` branches
- Consolidates CI logic in fewer files
- Can reuse Node.js setup steps

**Alternatives considered**:
- Separate `docs.yml` workflow: Adds complexity, would duplicate trigger conditions
- Combined with build workflow: Build workflow only runs on tags, not suitable

### Decision 4: Use Nix in GitHub Actions
**Choice**: Install and configure Nix in GitHub Actions using the `cachix/install-nix-action`

**Rationale**:
- Required to run the Nix-based openspecui fork
- `cachix/install-nix-action` is the de facto standard for Nix in GitHub Actions
- Supports flakes and nix-command features out of the box
- Provides caching for faster subsequent runs

**Configuration**:
```yaml
- uses: cachix/install-nix-action@v24
  with:
    nix_path: nixpkgs=channel:nixos-unstable
    extra_nix_config: |
      experimental-features = nix-command flakes
```

**Alternatives considered**:
- Using DeterminateSystems/nix-installer-action: Similar functionality, but cachix action is more widely used
- Building without Nix: Would require significant rework of the openspecui fork

### Decision 5: Conditional Execution (Push Only, Not PRs)
**Choice**: Use `if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/ng')` condition

**Rationale**:
- PRs should not publish to GitHub Pages (avoid preview pollution)
- Only publish when code is merged to protected branches
- Consistent with existing coverage badge behavior

## Implementation Details

### Workflow Structure
```yaml
jobs:
  # ... existing test job ...
  
  publish-openspec:
    name: Publish OpenSpec UI
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/ng')
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Install Nix
        uses: cachix/install-nix-action@v24
        with:
          nix_path: nixpkgs=channel:nixos-unstable
          extra_nix_config: |
            experimental-features = nix-command flakes
      
      - name: Generate OpenSpec UI
        run: |
          nix run github:mipmip/openspecui/feature/nixFlake -- export \
            --dir . \
            --clean \
            ./openspec-export
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./openspec-export
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### GitHub Pages Configuration
The repository settings must have:
- **Pages source**: GitHub Actions (not "Deploy from branch")
- **gh-pages branch**: Must exist (already does)
- **Workflow permissions**: "Read and write permissions"

### Directory Structure on gh-pages
```
gh-pages branch (via GitHub Pages deployment):
├── badges/
│   └── coverage.svg          # Existing coverage badge (separate workflow)
├── index.html                # OpenSpec UI root
├── assets/                   # OpenSpec UI assets
├── data.json                 # OpenSpec data snapshot
├── routes.json               # Routing configuration
└── _redirects                # Fallback routing
```

## Risks / Trade-offs

### Risk 1: Deployment Conflicts Between Badge and OpenSpec UI
**Mitigation**: Use GitHub's official Pages deployment action which properly handles multiple deployments to the same site. The action merges content from different workflow runs.

**Fallback**: If conflicts occur, split into separate workflows with coordinated deployment timing.

### Risk 2: OpenSpecUI Fork Breaking Changes
**Mitigation**: The Nix flake reference `github:mipmip/openspecui/feature/nixFlake` can be pinned to a specific commit hash if stability issues arise. Test updates in feature branches before merging.

**Monitoring**: Check deployment logs for errors after merging. Watch the upstream PR for merge status.

### Risk 3: Increased CI Time
**Impact**: Adds ~1-2 minutes per push to `main`/`ng` branches (not PRs) due to Nix installation and openspecui export

**Mitigation**: Run as separate job in parallel with tests. Nix provides binary caching which speeds up subsequent runs.

### Risk 4: Nix Installation Overhead in CI
**Impact**: Installing Nix adds ~30-60 seconds to the workflow

**Mitigation**: 
- Use `cachix/install-nix-action` which provides optimized Nix installation
- Enable Nix binary caching to speed up package downloads
- Run job in parallel with tests to minimize total CI time

**Monitoring**: Track workflow execution time in GitHub Actions

### Risk 5: GitHub Pages Quota Limits
**Current status**: Free tier allows 100 GB bandwidth/month, 1 GB storage

**Mitigation**: OpenSpec UI export is small (~0.5 MB data + ~12 MB assets), well within limits. Monitor Pages analytics if issues arise.

## Migration Plan

### Phase 1: Implementation (PR)
1. Add workflow job to generate and publish OpenSpec UI
2. Test on feature branch with push to verify deployment
3. Verify coverage badge remains accessible
4. Merge to `ng` branch first for validation

### Phase 2: Validation (Post-Merge)
1. Confirm OpenSpec UI accessible at expected URL
2. Verify coverage badge still works
3. Monitor workflow execution time
4. Gather team feedback on documentation usability

### Phase 3: Documentation Update
1. Add link to published OpenSpec UI in README (optional)
2. Update contribution guidelines to reference specs website
3. Document for future maintainers in workflow comments

### Rollback Plan
If deployment causes issues:
1. Revert the workflow changes via `git revert`
2. Manually clean up `gh-pages` branch if needed
3. Re-enable existing badge-only deployment
4. Investigate issues offline before retry

## Open Questions
1. **URL format**: Should we use branch-specific paths (e.g., `/ng/` vs `/main/`)? 
   - **Answer**: Start with single root path showing latest merged state. Can add branch separation later if needed.

2. **README badge**: Should we add a "View Specs" badge to README?
   - **Answer**: Defer to maintainer preference during PR review.

3. **Custom 404 page**: Should OpenSpec UI include a custom 404 handler?
   - **Answer**: The fork includes a `404.html` and `_redirects` file for proper SPA routing.

4. **Base path support**: Should we wait for `--base-path` fix before deploying?
   - **Answer**: No, deploy to root path now. Can migrate to `/specs/` subdirectory later if base-path support is fixed.

5. **Fork upstream status**: Should we wait for the PR to be merged?
   - **Answer**: No, use the fork directly via Nix flakes. Can switch to official package once PR is merged.
