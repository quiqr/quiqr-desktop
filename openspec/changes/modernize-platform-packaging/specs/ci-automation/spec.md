# Spec: CI Automation

**Capability ID:** `ci-automation`  
**Change:** `modernize-platform-packaging`  
**Version:** 1.0

## Overview

This capability modernizes the CI/CD pipeline to build all desktop and server packages reliably, with automated testing and consistent artifact management across platforms.

---

## ADDED Requirements

### Requirement: Build Matrix for Multi-Platform Packaging
**Priority:** High  
**Rationale:** A matrix strategy enables building all formats in parallel, reducing total build time.

The CI workflow SHALL use a matrix strategy to build all desktop and server formats in parallel. Each matrix job MUST produce the specified artifacts for its platform.

#### Scenario: CI builds all desktop formats

**Given** a developer pushes a git tag `v1.0.0`  
**When** the CI workflow triggers  
**Then** builds execute in parallel on `windows-latest`, `macos-latest`, and `ubuntu-latest` runners  
**And** Windows builds produce: `quiqr-desktop_1.0.0_windows_x64.exe`, `quiqr-desktop_1.0.0_windows_x64_portable.zip`  
**And** macOS builds produce: `quiqr-desktop_1.0.0_macos_universal.dmg`  
**And** Linux builds produce: `quiqr-desktop_1.0.0_linux_x64.AppImage`, `.deb`, `.rpm`  

#### Scenario: CI builds all server formats

**Given** the same CI workflow is triggered  
**When** server build jobs execute  
**Then** Linux builds produce: `quiqr-server_1.0.0_linux_x64.tar.gz`, `.deb`, `.rpm`  
**And** Windows builds produce: `quiqr-server_1.0.0_windows_x64.zip`  
**And** macOS builds produce: `quiqr-server_1.0.0_macos_universal.tar.gz`  
**And** Docker image `quiqr/server:1.0.0` is built and pushed  

---

### Requirement: Automated Package Testing
**Priority:** High  
**Rationale:** Broken packages should be detected before release to avoid user frustration.

The CI workflow MUST test each built package by installing and launching it. Desktop packages SHALL be tested in headless mode, and server packages SHALL be verified via HTTP health check.

#### Scenario: CI tests desktop packages after build

**Given** a desktop package is built (e.g., `.AppImage`)  
**When** the CI runs post-build tests  
**Then** the package is installed/extracted in a clean environment  
**And** the application launches in headless mode (e.g., with `xvfb-run`)  
**And** the process stays running for at least 10 seconds  
**And** `--version` flag outputs the expected version  
**And** embgit binary is accessible (verify with `git --version`)  
**And** the test passes or the workflow fails  

#### Scenario: CI tests server packages after build

**Given** a server package is built (e.g., `.deb`)  
**When** the CI runs post-build tests  
**Then** the package is installed in a clean container  
**And** the server starts (via systemd or direct execution)  
**And** `curl http://localhost:3030/api/health` returns HTTP 200  
**And** the response body indicates the server is healthy  
**And** the test passes or the workflow fails  

---

### Requirement: Version Consistency Validation
**Priority:** Medium  
**Rationale:** Version mismatches between git tag and package.json cause confusion and broken releases.

The CI workflow SHALL validate that the git tag matches package.json version before building. All built packages MUST embed the correct version string in filenames and metadata.

#### Scenario: CI validates version before building

**Given** a developer pushes git tag `v1.0.0`  
**When** the CI workflow starts  
**Then** a validation step runs before builds  
**And** checks that root `package.json` version is `1.0.0`  
**And** checks that workspace packages inherit the correct version  
**And** fails the entire workflow if any mismatch is found  

#### Scenario: Embedded version strings match

**Given** packages are built successfully  
**When** CI inspects the built packages  
**Then** package filenames contain `_1.0.0_`  
**And** package metadata (deb, rpm, snap, flatpak) specifies version `1.0.0`  
**And** running the built application with `--version` outputs `1.0.0`  

---

### Requirement: Artifact Management and Checksums
**Priority:** High  
**Rationale:** Users need to verify package integrity; maintainers need organized releases.

The CI workflow SHALL generate SHA256 checksums for all packages and MUST upload all artifacts to GitHub Releases with the checksums file.

#### Scenario: CI generates checksums for all packages

**Given** all builds complete successfully  
**When** artifacts are collected  
**Then** a `SHA256SUMS` file is generated  
**And** contains one line per artifact: `<hash>  <filename>`  
**And** the checksums file is uploaded alongside packages  

#### Scenario: CI uploads artifacts to GitHub Release

**Given** a git tag `v1.0.0` triggers the workflow  
**When** all builds and tests pass  
**Then** a GitHub Release is created (or updated if exists) for tag `v1.0.0`  
**And** all desktop and server packages are attached as release assets  
**And** the `SHA256SUMS` file is attached  
**And** a release notes file (auto-generated or from changelog) is included  

---

### Requirement: Workflow Optimization
**Priority:** Medium  
**Rationale:** Faster builds improve developer productivity.

The CI workflow SHALL cache npm dependencies and electron-builder downloads. The total workflow execution time MUST not exceed 25 minutes.

#### Scenario: CI caches dependencies

**Given** the CI workflow runs  
**When** npm dependencies are installed  
**Then** `node_modules` is cached based on `package-lock.json` hash  
**And** subsequent runs restore the cache if unchanged  
**And** electron-builder download cache is also cached  

#### Scenario: Parallel jobs reduce total build time

**Given** the build matrix has 8 jobs (desktop + server for each platform)  
**When** all jobs run in parallel  
**Then** total workflow time is under 25 minutes  
**And** individual jobs complete within 5-15 minutes each  

---

### Requirement: Build Logs and Debugging
**Priority:** Medium  
**Rationale:** Failed builds need clear diagnostics.

Build tools MUST output verbose logs that include error messages, file paths, and environment context. The CI SHALL preserve build logs for at least 90 days.

#### Scenario: CI outputs verbose build logs

**Given** a package build fails  
**When** a developer inspects the CI logs  
**Then** electron-builder or custom build scripts output verbose logs  
**And** error messages clearly indicate the failure reason  
**And** file paths, environment variables, and versions are logged  

---

## MODIFIED Requirements

### Requirement: Existing Build Workflow (Existing)
**Priority:** High  
**Change:** Fix outdated paths and expand to new formats

The existing CI workflow MUST be updated to use correct paths (`packages/frontend` instead of `./frontend`) and SHALL support the expanded format matrix.

#### Scenario: Updated workflow uses correct frontend path

**Given** the CI workflow is updated  
**When** the frontend build step runs  
**Then** it uses `packages/frontend` instead of `./frontend`  
**And** the build succeeds on all platforms  

---

## REMOVED Requirements

_No requirements removed in this capability._

---

## Related Capabilities

- **`desktop-builds`**: CI builds all desktop formats defined in that spec
- **`server-builds`**: CI builds all server formats defined in that spec

---

## Acceptance Criteria

- [ ] CI workflow builds all desktop formats on respective platforms
- [ ] CI workflow builds all server formats
- [ ] Automated tests run and pass for each package type
- [ ] Version validation catches mismatches before building
- [ ] All artifacts upload to GitHub Releases on tagged commits
- [ ] SHA256SUMS file generated and included in release
- [ ] Workflow completes in under 25 minutes on average
- [ ] Failed builds provide clear, actionable error messages
- [ ] Cache strategy reduces build time by at least 30% on repeated runs
- [ ] Manual workflow dispatch allows testing builds without tagging
