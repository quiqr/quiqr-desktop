# Design: Modernize Platform Packaging

**Change ID:** `modernize-platform-packaging`

## Architecture Overview

This design outlines the technical approach for expanding Quiqr's packaging to support comprehensive desktop distribution formats and a new headless server deployment mode.

### Current Architecture

```
┌─────────────────────────────────────┐
│     Root Package (workspace)        │
│  ├─ package.json (electron-builder) │
│  ├─ electron/main.js                │
│  └─ packages/                       │
│      ├─ frontend/                   │
│      ├─ backend/                    │
│      └─ adapters/                   │
│          ├─ electron/  ──────┐      │
│          └─ standalone/ ─────┤      │
└─────────────────────────────┼──────┘
                              │
                    ┌─────────┴─────────┐
                    │   Runtime Mode    │
                    ├─────────┬─────────┤
               Desktop        │     Server
         (Electron adapter)   │  (Standalone)
                              │
                    ┌─────────┴─────────┐
                    │   Backend Core    │
                    │  (@quiqr/backend) │
                    └───────────────────┘
```

**Current Build Process:**
1. `npm run build` → runs build chain
2. Build frontend (Vite) → `packages/frontend/dist`
3. Pack embedded Git resources → `resources/embgit.tar.gz`
4. electron-builder packages Electron main + frontend + backend + resources
5. Outputs: `.exe`, `.dmg`, `.AppImage`, `.deb`, `.rpm`

### Proposed Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Build Orchestration                    │
│                                                          │
│   ┌────────────────┐          ┌─────────────────┐      │
│   │ Desktop Build  │          │  Server Build   │      │
│   │                │          │                 │      │
│   │ electron-      │          │  Custom         │      │
│   │ builder        │          │  Packager       │      │
│   └────┬───────────┘          └────┬────────────┘      │
│        │                           │                    │
└────────┼───────────────────────────┼────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│ Desktop Formats │         │  Server Formats  │
│                 │         │                  │
│ • Windows NSIS  │         │ • .tar.gz        │
│ • Windows ZIP   │         │ • .deb           │
│ • macOS DMG     │         │ • .rpm           │
│ • Linux AppImage│         │ • Docker Image   │
│ • Linux .deb    │         │                  │
│ • Linux .rpm    │         │                  │
└─────────────────┘         └──────────────────┘
```

## Key Design Decisions

### 1. Dual Packaging Pipeline

**Decision:** Maintain separate build pipelines for desktop and server editions

**Rationale:**
- Desktop uses electron-builder (optimized for Electron apps)
- Server needs custom packaging (Node.js app without Electron overhead)
- Different resource requirements (desktop needs full UI, server is API-only)
- Allows independent versioning and release cycles in future

**Trade-offs:**
- **Pro:** Clear separation of concerns, optimized for each use case
- **Pro:** Server packages much smaller (~100MB vs ~300MB)
- **Con:** More CI complexity, two build matrices
- **Con:** Need to ensure feature parity between modes

**Implementation:**
- Desktop: Continue using electron-builder with expanded targets
- Server: Create custom packaging scripts using `pkg`, `ncc`, or manual bundling
- Shared: Backend core (`@quiqr/backend`) used by both adapters

---

### 2. Resource Bundling Strategy

**Decision:** Bundle embgit binary in all packages; Hugo is downloaded dynamically at runtime

**Rationale:**
- embgit ensures consistent Git operations without system dependencies
- Hugo dynamic download reduces package size and allows version flexibility
- Current approach with embgit works well, extend to new formats
- Users can choose Hugo version without repackaging

**Per-Format Strategy:**

| Format | embgit Location | Hugo Access |
|--------|----------------|-------------|
| NSIS/DMG/AppImage | `resources/embgit.tar.gz` | Downloaded to user data dir |
| Server .tar.gz | `./resources/embgit.tar.gz` | Downloaded to server data dir |
| Server .deb/.rpm | `/usr/lib/quiqr-server/resources/` | Downloaded to /var/lib/quiqr-server |
| Docker | `/app/resources/embgit.tar.gz` | Downloaded to /data volume |

**Adaptive Path Resolution:**
```javascript
// Pseudo-code for backend
function getEmbgitPath() {
  if (isElectron()) return path.join(app.getPath('resources'), 'embgit.tar.gz');
  if (isDocker()) return '/app/resources/embgit.tar.gz';
  return path.join(__dirname, '../resources/embgit.tar.gz');  // Fallback
}

function getHugoPath() {
  // Hugo is downloaded to user data directory, not bundled
  const dataDir = getUserDataDir();
  return path.join(dataDir, 'hugo', 'hugo-binary');
}
```

---

### 3. Server Mode Architecture

**Decision:** Package standalone adapter as independent Node.js application

**Current Standalone Adapter:**
- Express server in `packages/adapters/standalone`
- Depends on `@quiqr/backend` for business logic
- Entry point: `dist/main.js` (compiled TypeScript)
- Listens on port 3030 (configurable)

**Packaging Approach:**

**Option A: Bundle with webpack/esbuild**
- Single file output: `quiqr-server.js`
- All dependencies inlined
- Requires Node.js runtime on target system

**Option B: Use `pkg` to create standalone binary**
- No Node.js required on target
- Larger file size (~50MB)
- Platform-specific binaries

**Option C: Ship with node_modules (current)**
- `npm install --production` in package
- Smaller size with external Node.js
- Standard Node.js deployment

**Recommendation:** Option C for initial release (simpler, proven), Option B for future enhancement

**Server Startup:**
```bash
# .tar.gz extraction
tar -xzf quiqr-server_1.0.0_linux_x64.tar.gz
cd quiqr-server
./quiqr-server --port 3030 --data-dir ~/quiqr-data

# .deb installation
sudo apt install ./quiqr-server_1.0.0_amd64.deb
sudo systemctl start quiqr-server
# Runs on http://localhost:3030

# Docker
docker run -d -p 3030:3030 -v ~/quiqr-data:/data quiqr/server:1.0.0
```

---

### 4. CI/CD Build Matrix

**Decision:** Use GitHub Actions matrix strategy with platform-specific runners

**Matrix Dimensions:**

```yaml
strategy:
  matrix:
    include:
      # Desktop builds
      - os: windows-latest
        edition: desktop
        formats: [nsis, portable]
      - os: macos-latest
        edition: desktop
        formats: [dmg]
      - os: ubuntu-latest
        edition: desktop
        formats: [AppImage, deb, rpm]
      
      # Server builds
      - os: ubuntu-latest
        edition: server
        formats: [tar.gz, deb, rpm, docker]
      - os: windows-latest
        edition: server
        formats: [zip]
      - os: macos-latest
        edition: server
        formats: [tar.gz]
```

**Build Flow:**
1. Checkout code
2. Setup Node.js 22
3. Install dependencies (`npm ci`)
4. Build frontend (if desktop edition)
5. Build backend/adapter
6. Package for each format in matrix
7. Run smoke tests
8. Upload artifacts
9. (On tag) Create GitHub release

**Parallelization:**
- All matrix combinations run in parallel
- Total build time ~15-20 minutes (vs ~5 minutes currently)
- Can optimize with caching (npm, electron-builder cache)

---

### 5. Version Management

**Decision:** Single source of truth in root `package.json`, propagate to all packages

**Current State:**
- Root package.json: 1.0.0-beta.1
- Workspaces inherit version
- electron-builder reads from package.json

**Requirement:**
- Git tag triggers release (e.g., `v1.0.0-beta.2`)
- Tag must match package.json version
- All packages should embed version string

**Implementation:**
1. Pre-build step validates tag matches package.json
2. CI fails early if mismatch detected
3. Version embedded in:
   - File names: `quiqr-desktop_1.0.0_windows_x64.exe`
   - Package metadata (deb, rpm)
   - Application "About" dialog
   - Server `--version` flag output
   - Docker image tags

**Script:**
```javascript
// scripts/validate-version.js
const packageVersion = require('./package.json').version;
const gitTag = process.env.GITHUB_REF_NAME; // e.g., "v1.0.0-beta.2"

if (gitTag && gitTag !== `v${packageVersion}`) {
  console.error(`Version mismatch: package.json=${packageVersion}, tag=${gitTag}`);
  process.exit(1);
}
```

---

## Testing Strategy

### 1. Build Validation
- All formats build without errors
- Checksums generated for each artifact
- File sizes within expected ranges

### 2. Installation Testing
- Desktop: Install, launch, verify UI loads
- Server: Install, start, curl `/api/health`, expect 200 OK
- Platform-specific: Test on clean VM/container for each target

### 3. Functional Smoke Tests
- Desktop: Open workspace, create site, render Hugo preview
- Server: API call to create site, verify filesystem changes

### 4. Regression Prevention
- Existing formats (exe, dmg, AppImage) still work
- Resource bundling (Hugo, Git) functional in all formats
- No breaking changes to configuration paths

---

## Security Considerations

### Code Signing
- **macOS:** Requires Apple Developer account, add notarization to CI
- **Windows:** Optional but recommended (EV cert for SmartScreen bypass)
- **Linux:** AppImage, deb, rpm can be signed with GPG

### Security Considerations

- Server mode should run as unprivileged user
- Docker image should use non-root user

### Supply Chain
- Pin all dependencies (npm, electron-builder plugins)
- Verify integrity of embgit binary before bundling
- SBOM (Software Bill of Materials) for transparency
- Hugo downloads should verify checksums from official releases

---

## Migration Path

### For Users
- **Desktop:** No migration needed, install new format if preferred
- **Server:** New deployment option, documentation provided

### For Developers
- CI updates transparent (same tag-based release process)
- Build scripts backward compatible (`npm run build` still works)
- New scripts: `npm run build:server`, `npm run build:portable`, etc.

### Rollout Plan
1. **Phase 1:** Fix CI, add portable Windows package (low risk, additive)
2. **Phase 2:** Add server packaging (independent of desktop)
3. **Phase 3:** Improve code signing and distribution

---

## Open Questions for Stakeholders

1. **Branding:** Should server edition have different name/icon?
2. **Licensing:** Same license for server? Any enterprise edition plans?
3. **Support:** What platforms/formats are "officially supported" vs. community?
4. **Auto-updates:** Implement electron-updater for desktop?
5. **Hugo versions:** Allow users to specify Hugo version for dynamic download?
6. **Windows signing:** Purchase code signing certificate? (Costs ~$400/year)

---

## Alternatives Considered

### Alternative 1: Use a single universal package format
**Example:** Electron-builder's universal binary for all platforms

**Rejected because:**
- No universal format exists (AppImage is Linux-only, exe is Windows-only)
- Platform conventions matter (users expect .dmg on macOS, .deb on Ubuntu)
- Distribution requires native formats for each platform

### Alternative 2: Server-only focus, deprecate desktop
**Example:** Force users to run server + browser

**Rejected because:**
- Desktop app is core value proposition
- Users want native app experience
- Server is supplementary option, not replacement

### Alternative 3: Use Docker Compose for everything
**Example:** Package desktop as Docker container with VNC

**Rejected because:**
- Poor UX for non-technical users
- Defeats purpose of native desktop app
- Acceptable for server, overkill for desktop

---

## Success Metrics

- **Coverage:** 9 distribution formats supported (currently 5)
- **CI Reliability:** >95% build success rate on tagged releases
- **Install Success:** >90% of test installs launch successfully
- **Adoption:** Server packages used in at least 10% of deployments within 6 months

---

## References

- electron-builder config: https://www.electron.build/configuration/configuration
- GitHub Actions matrix: https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs
- FPM (packaging tool): https://github.com/jordansissel/fpm
