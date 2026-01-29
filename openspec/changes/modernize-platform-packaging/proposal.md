# Change: Modernize Platform Packaging

## Why

Quiqr Desktop needs comprehensive multi-platform packaging to improve distribution reach and enable headless server deployments for remote/NAS installations.

## What Changes

- **Add** portable Windows package (ZIP) for no-install usage
- **Improve** macOS DMG with code signing and notarization
- **Add** server packaging: .tar.gz archives, .deb/.rpm packages, and Docker image
- **Fix** CI workflow paths (`./frontend` → `packages/frontend`)
- **Expand** CI matrix to build all desktop and server formats
- **Add** automated package testing and version validation
- **Add** SHA256 checksums for all release artifacts

## Impact

**Affected specs:**
- Creates new capability: `desktop-builds` (portable, improved signing)
- Creates new capability: `server-builds` (archives, packages, Docker)
- Creates new capability: `ci-automation` (matrix, testing, artifacts)

**Affected code:**
- `package.json` - electron-builder configuration expansion
- `.github/workflows/build.yml` - matrix strategy and testing
- `packages/adapters/standalone/` - server packaging scripts
- `resources/` - embgit binary bundling

**User-facing changes:**
- Windows users can run portable version without admin rights
- Improved macOS installation experience (notarized)
- Server deployments possible via Docker or native packages

## Scope

This change introduces three new capabilities to enable comprehensive multi-platform distribution.

## Success Criteria

- [ ] All target desktop formats build successfully on respective platforms
- [ ] Server packages install and run on clean systems
- [ ] CI workflow produces artifacts for all formats on tagged releases
- [ ] Version numbers consistently embedded in all packages
- [ ] All packages verified to launch and display version info correctly
- [ ] Automated tests pass for each package type

## Dependencies & Constraints

**Dependencies:**
- electron-builder v26.3.3 (existing)
- GitHub Actions runners (ubuntu-latest, windows-latest, macos-latest)

**Constraints:**
- Must not break existing build scripts (backward compatible)
- embgit (Git binary) bundling must work for all formats
- Hugo is downloaded dynamically at runtime (not packaged)
- macOS code signing requires Apple Developer account

## Open Questions

1. Should we implement auto-updates for desktop builds using electron-updater?
2. What is the server distribution priority? (Docker first vs. native packages first)
3. Should we support older platforms (e.g., Windows 7, macOS < 11)?

