# Spec: ci-integration

**Status**: draft  
**Capability**: Continuous Integration and Deployment  
**Related To**: [docusaurus-setup], [ci-automation], [documentation]

---

## ADDED Requirements

### Requirement: Documentation Build in PR Checks

Pull request checks MUST build the Docusaurus documentation to validate changes.

**Rationale**: Building documentation in CI catches errors early, before they reach production. This ensures all merged documentation is valid and buildable.

#### Scenario: PR Check Documentation Build

**Given** a pull request with documentation changes  
**When** the PR check workflow runs  
**Then** a `docs-build` job executes  
**And** the job installs dependencies for `@quiqr/docs`  
**And** the job runs `npm run build -w @quiqr/docs`  
**And** the job reports success or failure to the PR

#### Scenario: Parallel Build Execution

**Given** a pull request triggers CI checks  
**When** the workflow runs  
**Then** documentation build runs in parallel with frontend tests  
**And** documentation build runs in parallel with backend tests  
**And** documentation build does not block other jobs

#### Scenario: Build Caching

**Given** multiple PR check runs for the same branch  
**When** the docs-build job runs  
**Then** `node_modules` for `@quiqr/docs` are cached  
**And** subsequent builds use cached dependencies  
**And** cache is keyed by `packages/docs/package-lock.json` hash

#### Scenario: Non-Blocking Build Failures

**Given** a pull request with documentation build errors  
**When** the PR checks complete  
**Then** documentation build failure is visible in PR status  
**And** PR can still be merged (non-blocking)  
**And** reviewers are alerted to documentation issues

**Note**: Build failures should be non-blocking initially to allow adoption period. This requirement may be changed to blocking in the future.

---

### Requirement: Documentation Deployment to GitHub Pages

The Docusaurus documentation MUST be automatically deployed to GitHub Pages on every push to main/ng branches.

**Rationale**: Automated deployment ensures documentation is always up-to-date with the latest code, without requiring manual intervention.

#### Scenario: Deployment Workflow Job

**Given** the `.github/workflows/deploy.yml` workflow  
**When** the workflow structure is examined  
**Then** a `publish-docs` job exists  
**And** the job runs on push to `main` or `ng` branches  
**And** the job builds the Docusaurus site  
**And** the job produces a deployment artifact

#### Scenario: Docusaurus Build in CI

**Given** the `publish-docs` job is running  
**When** the job builds the documentation  
**Then** the job installs dependencies for `@quiqr/docs`  
**And** the job runs `npm run build -w @quiqr/docs`  
**And** the build output is in `packages/docs/build/`  
**And** the build output is uploaded as a workflow artifact

#### Scenario: Deployment Timing

**Given** a push to the main branch  
**When** the deploy workflow runs  
**Then** documentation deployment completes within 5 minutes  
**And** the documentation site is accessible immediately after deployment

---

### Requirement: Multi-Resource GitHub Pages Deployment

GitHub Pages MUST serve Docusaurus documentation, OpenSpec UI, and coverage badge from a single site with path-based routing.

**Rationale**: Consolidating all project resources on a single GitHub Pages site simplifies deployment and provides a unified URL structure.

#### Scenario: Path-Based Resource Routing

**Given** the GitHub Pages site at `https://quiqr.github.io/quiqr-desktop/`  
**When** the site is deployed  
**Then** Docusaurus documentation is accessible at `/quiqr-desktop/docs/`  
**And** OpenSpec UI is accessible at `/quiqr-desktop/specs/`  
**And** coverage badge is accessible at `/quiqr-desktop/badges/coverage.svg`  
**And** each resource serves independently without conflicts

#### Scenario: Artifact Combination

**Given** the deploy workflow has completed all jobs  
**When** artifacts are prepared for deployment  
**Then** the `coverage` job artifact contains badge files in `badges/` directory  
**And** the `publish-openspec` job artifact contains OpenSpec UI in `specs/` directory  
**And** the `publish-docs` job artifact contains Docusaurus site in `docs/` directory  
**And** all artifacts are combined into a single deployment package

#### Scenario: Deployment Target

**Given** the combined deployment artifact  
**When** the deployment step executes  
**Then** the artifact is deployed to the `gh-pages` branch  
**And** GitHub Pages serves content from the `gh-pages` branch  
**And** deployment preserves existing files not in the artifact (idempotent)

#### Scenario: Deployment Validation

**Given** the deploy workflow has completed  
**When** deployment validation runs  
**Then** validation checks that all three resources are accessible:
- `https://quiqr.github.io/quiqr-desktop/docs/` returns HTTP 200
- `https://quiqr.github.io/quiqr-desktop/specs/` returns HTTP 200
- `https://quiqr.github.io/quiqr-desktop/badges/coverage.svg` returns HTTP 200

---

### Requirement: Build Performance

Documentation build in CI MUST complete in a reasonable time to maintain developer productivity.

**Rationale**: Slow builds frustrate developers and slow down the development cycle. Performance targets ensure CI remains efficient.

#### Scenario: Build Time Target

**Given** the documentation build job in CI  
**When** the job runs without cache  
**Then** the build completes in under 5 minutes  
**And** with cache, the build completes in under 3 minutes

#### Scenario: Build Parallelization

**Given** the CI workflow with multiple jobs  
**When** the workflow runs  
**Then** documentation build does not block other jobs  
**And** documentation build runs concurrently with test jobs  
**And** total workflow time is not significantly increased

---

### Requirement: Build Error Reporting

Documentation build errors MUST be clearly reported with actionable error messages.

**Rationale**: Clear error messages enable developers to quickly identify and fix documentation issues without deep debugging.

#### Scenario: Build Failure Reporting

**Given** a documentation build that fails  
**When** the build error occurs  
**Then** the error message identifies the failing file  
**And** the error message includes line number (when applicable)  
**And** the error message explains the type of error (broken link, invalid frontmatter, etc.)  
**And** the build logs are accessible in the GitHub Actions UI

#### Scenario: Link Validation Errors

**Given** a documentation page with a broken internal link  
**When** the Docusaurus build runs  
**Then** the build fails with an error message  
**And** the error message identifies the source page  
**And** the error message identifies the broken link target  
**And** the error message suggests possible corrections

---

## MODIFIED Requirements

### Requirement: GitHub Pages Deployment (from ci-automation spec)

GitHub Pages MUST serve coverage badge, OpenSpec UI, AND Docusaurus documentation with path-based routing.

**Original**: GitHub Pages serves coverage badge and OpenSpec UI  
**Modified**: GitHub Pages serves coverage badge, OpenSpec UI, AND Docusaurus documentation

**Rationale**: Extending the existing GitHub Pages deployment to include Docusaurus documentation alongside existing resources.

#### Scenario: Three-Resource Deployment

**Given** the `deploy.yml` workflow  
**When** the workflow completes successfully  
**Then** three distinct resources are deployed:
1. Coverage badge at `/badges/coverage.svg` (existing)
2. OpenSpec UI at `/specs/` (existing)
3. Docusaurus documentation at `/docs/` (new)

---

## REMOVED Requirements

*No existing requirements are removed by this capability.*
