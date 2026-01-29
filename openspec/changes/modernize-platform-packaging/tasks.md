# Tasks: Modernize Platform Packaging

**Change ID:** `modernize-platform-packaging`

## Overview

This document breaks down the packaging modernization into concrete, ordered work items. Tasks are grouped by capability but sequenced to deliver incremental value.

## Phase 1: Foundation & Desktop Expansion

### 1.1 Fix Existing CI Workflow
**Priority:** High  
**Estimated Effort:** 2 hours  
**Dependencies:** None

- [ ] Update `.github/workflows/build.yml` path references (`./frontend` → `packages/frontend`)
- [ ] Verify existing Windows, macOS, Linux builds still work
- [ ] Add workflow dispatch trigger for manual testing
- [ ] Test build on all three platforms via GitHub Actions

**Validation:** Existing formats (.exe, .dmg, .AppImage, .deb, .rpm) build and upload successfully

---

### 1.2 Add Windows Portable Build
**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Dependencies:** Task 1.1

- [ ] Add `portable` or `zip` target for Windows in electron-builder config
- [ ] Configure to include all dependencies in self-contained directory
- [ ] Test extraction and running from non-installed location
- [ ] Add to CI workflow
- [ ] Document portable usage (no installer required)

**Validation:** Unzip and run `quiqr.exe` without installation, app works normally

---

### 1.3 Improve macOS Packaging
**Priority:** Medium  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 1.1

- [ ] Verify code signing configuration (requires Apple Developer account)
- [ ] Add notarization step to CI workflow
- [ ] Test on multiple macOS versions (11+)
- [ ] Configure auto-update mechanism (electron-updater)
- [ ] Add universal binary support (x64 + arm64) if feasible

**Validation:** DMG opens on macOS without security warnings, passes Gatekeeper

---

## Phase 2: Server Mode Packaging

### 2.1 Analyze Server Adapter Requirements
**Priority:** High  
**Estimated Effort:** 2-3 hours  
**Dependencies:** None (parallel with Phase 1)

- [ ] Audit `packages/adapters/standalone` for packaging readiness
- [ ] Identify embgit bundling needs
- [ ] Verify Hugo dynamic download works in server mode
- [ ] Determine configuration file locations for server mode
- [ ] Document runtime requirements (Node.js version, environment variables)
- [ ] Define CLI interface for server startup (port, data path, etc.)

**Validation:** Clear specification document for server packaging requirements

---

### 2.2 Create Server Build Scripts
**Priority:** High  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 2.1

- [ ] Add `build:server` script to root package.json
- [ ] Build standalone adapter with all dependencies bundled
- [ ] Create platform-specific startup scripts (`quiqr-server`, `quiqr-server.bat`)
- [ ] Bundle embgit binary for server mode
- [ ] Ensure Hugo dynamic download works in server context
- [ ] Add version embedding for `--version` flag
- [ ] Test local builds for Linux, macOS, Windows

**Validation:** `npm run build:server` produces runnable server packages for each platform

---

### 2.3 Package Server as .tar.gz Archives
**Priority:** High  
**Estimated Effort:** 3-4 hours  
**Dependencies:** Task 2.2

- [ ] Create packaging script to generate `.tar.gz` for Linux/macOS
- [ ] Include startup script, embgit binary, config templates
- [ ] Add README with installation/usage instructions
- [ ] Create `.zip` equivalent for Windows
- [ ] Add to CI workflow
- [ ] Test extraction and running on clean systems

**Validation:** Extract archive, run `./quiqr-server`, access at http://localhost:3030

---

### 2.4 Create Debian/RPM Server Packages
**Priority:** Medium  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Task 2.2

- [ ] Create debian packaging files (control, postinst, prerm, systemd service)
- [ ] Use `fpm` or `electron-builder` equivalent for server mode
- [ ] Install to `/opt/quiqr-server` or `/usr/lib/quiqr-server`
- [ ] Add systemd service file for automatic startup
- [ ] Create RPM spec file (or use fpm conversion)
- [ ] Add to CI workflow
- [ ] Test installation on Debian/Ubuntu and Fedora/RHEL

**Validation:** `sudo apt install ./quiqr-server.deb && sudo systemctl start quiqr-server` works

---

### 2.5 Create Docker Image
**Priority:** Medium  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 2.2

- [ ] Create `Dockerfile` for server mode
- [ ] Base on node:22-alpine or similar
- [ ] Copy built server, resources, and dependencies
- [ ] Expose port 3030
- [ ] Add volume mounts for data persistence
- [ ] Configure HEALTHCHECK
- [ ] Add docker-compose.yml example
- [ ] Build and push to registry in CI

**Validation:** `docker run -p 3030:3030 quiqr/server:latest` starts and serves at localhost:3030

---

## Phase 3: CI/CD Improvements

### 3.1 Create Build Matrix
**Priority:** High  
**Estimated Effort:** 3-4 hours  
**Dependencies:** Tasks 1.2, 1.3, 2.3, 2.4

- [ ] Define matrix dimensions: platform (windows, macos, linux), edition (desktop, server), format (nsis, dmg, appimage, deb, rpm, tar.gz)
- [ ] Implement conditional steps based on matrix variables
- [ ] Configure artifact naming: `quiqr-${edition}_${version}_${platform}_${arch}.${format}`
- [ ] Parallelize independent builds where possible
- [ ] Add timeout controls

**Validation:** Matrix expands correctly, all combinations build in parallel

---

### 3.2 Add Package Testing
**Priority:** High  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Task 3.1

- [ ] Create test scripts for each package format
- [ ] Desktop: Install, launch headless, verify process starts, check version
- [ ] Server: Install, start service, curl health endpoint, check response
- [ ] Run tests in CI after build step
- [ ] Fail workflow if any package test fails
- [ ] Add smoke test coverage (basic API endpoint checks)

**Validation:** All packages pass automated installation and startup tests in CI

---

### 3.3 Implement Artifact Management
**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Dependencies:** Task 3.1

- [ ] Consolidate all artifacts for upload in single step
- [ ] Add checksums (SHA256) for all packages
- [ ] Generate `PACKAGES.md` with download links and checksums
- [ ] Upload to GitHub Releases with consistent naming
- [ ] Add retention policy for non-release builds
- [ ] Document manual download and verification process

**Validation:** Release page contains all formats with checksums, PACKAGES.md is complete

---

### 3.4 Add Version Consistency Checks
**Priority:** Low  
**Estimated Effort:** 2 hours  
**Dependencies:** None (can run in parallel)

- [ ] Add CI step to verify package.json versions match across workspaces
- [ ] Verify embedded version strings in built packages
- [ ] Check git tag matches package version on release builds
- [ ] Fail early if version mismatches detected

**Validation:** CI fails if versions are inconsistent before starting builds

---

## Phase 4: Documentation & Publishing

### 4.1 Update Installation Documentation
**Priority:** High  
**Estimated Effort:** 4-5 hours  
**Dependencies:** All packaging tasks complete

- [ ] Document installation for each platform/format
- [ ] Add Linux repository setup instructions (when available)
- [ ] Document server installation and configuration
- [ ] Create quickstart for Docker deployment
- [ ] Add troubleshooting section
- [ ] Update README.md with "Installation" section

**Validation:** Users can follow docs to install on any supported platform

---

### 4.2 Set Up Distribution Channels
**Priority:** Medium  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 2.5 (Docker)

- [ ] Set up Docker Hub or GHCR organization
- [ ] Configure automated publishing in CI
- [ ] Document manual publishing process as backup

**Validation:** Packages available via `docker pull quiqr/server`

---

## Summary

**Total Estimated Effort:** 42-56 hours across 15 tasks

**Critical Path:**
1. Fix CI (1.1) → Desktop formats (1.2, 1.3) → Testing (3.2) → Docs (4.1)
2. Server analysis (2.1) → Server build (2.2) → Server packages (2.3-2.5) → Testing (3.2) → Docs (4.1)

**Parallel Work Opportunities:**
- Phase 1 (Desktop) and Phase 2 (Server) can proceed simultaneously after Task 1.1
- Tasks 1.2 and 1.3 can be parallelized among multiple developers
- Tasks 2.3, 2.4, 2.5 can be parallelized once 2.2 is complete

**Incremental Delivery:**
- After 1.1: Existing packages build reliably
- After 1.2-1.3: Enhanced desktop platform coverage
- After 2.3: Server deployable via archives
- After 2.4-2.5: Server available in native formats
- After 3.2: Quality assurance via automated testing
- After 4.2: Docker images discoverable in registries
