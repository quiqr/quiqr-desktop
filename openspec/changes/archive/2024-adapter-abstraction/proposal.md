# Change: Platform Adapter Abstraction

## Why

The application needs to run in multiple environments beyond Electron (web browsers, Docker, serverless platforms). The existing architecture tightly couples Electron-specific APIs throughout the codebase, making it difficult to support alternative deployment targets.

## What Changes

This proposal establishes a platform adapter abstraction layer to enable multi-platform deployments:

- **Filesystem Abstraction** - Interface for storage providers (local, S3, databases)
- **Simplified Adapter System** - Eliminate obsolete adapters (DialogAdapter), keep essential ones
- **HTML5 File APIs** - Replace native dialogs with standard HTML5 `<input type="file">` for universal compatibility
- **Hybrid Menu System** - Native OS menus in Electron, React/MUI menus in web
- **WebSocket Push Notifications** - Backend-to-frontend communication for real-time updates
- **Dependency Injection** - Build-time adapter selection via container pattern

### Architecture Simplifications

**Removed/Obsolete**:
- ❌ DialogAdapter - Replaced with HTML5 file inputs
- ❌ ScreenshotWindowManager - Moved to backend service
- ❌ Complex WebSocket request/response - Simplified to push-only

**Essential Adapters**:
- ✅ FilesystemAdapter - Backend file operations
- ✅ ShellAdapter - Platform-specific operations (showItemInFolder, openExternal)
- ✅ AppInfoAdapter - Platform paths, version info
- ✅ OutputConsole - Hugo output streaming
- ✅ MenuAdapter (Hybrid) - Native in Electron, React in web
- ✅ WindowAdapter (Minimal) - Reload/redirect only

## Impact

- **Affected specs**: adapters, filesystem-operations, ui-dialogs, communication-layer
- **Affected code**: 
  - All backend services using direct `fs` calls (~25 files)
  - Frontend dialog usage across containers
  - Electron main process initialization
  - Menu system implementation
- **Breaking changes**: **BREAKING** - Dialog API methods removed, replaced with client-side file inputs
- **Migration required**: Frontend components using `api.showOpenFolderDialog()` must be updated

## Implementation Phases

### Phase 1: Filesystem Abstraction
- Add FilesystemAdapter interface to backend
- Implement LocalFilesystemAdapter wrapping fs-extra
- Migrate proof-of-concept service (ConfigurationDataProvider)
- Document migration strategy for remaining 24 files

### Phase 2: Web Adapter Implementation
- Create packages/adapters/web workspace
- Implement simplified web adapters
- Add WebSocket push notification layer
- Replace dialog API calls with HTML5 file inputs

### Phase 3: Documentation
- Write comprehensive adapter tutorial
- Document architecture and patterns
- Create example adapters (minimal, web-basic, web-full)

### Phase 4: Testing & Validation
- Unit tests for filesystem adapter
- Integration tests for web adapter
- Tutorial validation

## Feature Parity Expectations

| Feature | Electron | Web |
|---------|----------|-----|
| File dialogs | Native OS dialogs | HTML5 file inputs |
| Menus | Native OS menus | React/MUI menus |
| Hugo preview | Local server | Server-side build + iframe |
| Show in folder | Native file explorer | Download or path display |
| Window management | Min/max/close | Browser controls |
| Screenshots | Direct capture | Puppeteer/Playwright (future) |

**Goal**: Best UX for each platform, not 100% feature parity.

## Long-term Benefits

- Web deployment (Vercel, Cloudflare Workers, AWS Lambda)
- Docker containers with S3 backend
- CLI-only mode for automation
- Community-contributed adapters
- Multi-tenant hosted deployments
- Real-time collaboration features
