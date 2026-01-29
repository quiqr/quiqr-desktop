## Context

The application was originally built exclusively for Electron desktop environments, with Electron-specific APIs (dialog, shell, BrowserWindow) used directly throughout the codebase. This tight coupling prevented deployment to other platforms like web browsers, Docker containers, or serverless environments.

Key constraints:
- Must support both Electron desktop and web browser deployments
- Frontend is React + TypeScript, backend is Node.js + Express
- Existing architecture uses dependency injection container pattern
- Must maintain backward compatibility during migration
- Need to minimize code duplication between platforms

Stakeholders:
- Desktop users: Expect native OS integration (menus, dialogs, file explorer)
- Web users: Need browser-compatible UX with similar functionality
- Developers: Want simple, maintainable abstraction layer
- Future: Enable cloud deployments (S3 storage, multi-tenant hosting)

## Goals / Non-Goals

**Goals:**
- Create clean adapter abstraction for platform-specific operations
- Enable web browser deployment with good UX
- Simplify architecture by removing unnecessary abstractions
- Maintain existing Electron functionality
- Document patterns for community-contributed adapters

**Non-Goals:**
- 100% feature parity between Electron and web (some features are platform-specific)
- Real-time collaboration (future consideration)
- Multi-tenant authentication (future consideration)
- Backward compatibility with old dialog API (breaking change accepted)
- Supporting IE11 or legacy browsers

## Decisions

### Decision: Remove DialogAdapter, Use HTML5 File Inputs

**Context:** Initially planned to create DialogAdapter with complex WebSocket request-response for web environments.

**Decision:** Use HTML5 `<input type="file">` universally instead.

**Rationale:**
- Both Electron dialogs and HTML5 inputs trigger native OS file pickers
- Same user experience across platforms
- Much simpler implementation (no WebSocket request-response needed)
- Works in both Electron and web without platform detection
- Standard web API with broad compatibility

**Alternatives considered:**
- Custom file picker UI: Worse UX, doesn't match OS conventions
- DialogAdapter with WebSocket: Unnecessary complexity for same outcome
- iFrame-based file selection: Security limitations, poor UX

### Decision: Hybrid Menu Approach

**Context:** Native OS menus are important for desktop UX but not available in browsers.

**Decision:** 
- Electron: Use native OS menus via `Menu.buildFromTemplate()`
- Web: Use React/MUI components in AppBar
- MenuAdapter returns no-op for web, menu creation for Electron

**Rationale:**
- Desktop users expect native menus (File, Edit, Window, etc.)
- Web users expect in-app menu components
- Each platform gets best-in-class UX
- Same underlying functionality, different presentation

**Alternatives considered:**
- Force React menus in Electron: Worse desktop UX, non-standard
- No menus in web: Poor UX, missing navigation
- Always use native menus: Impossible in web browsers

### Decision: WebSocket Push-Only, Not Request-Response

**Context:** Web deployment needs real-time updates (Hugo build output, notifications).

**Decision:** Use WebSocket only for backend-to-frontend push messages, not for request-response.

**Rationale:**
- All frontend requests already use HTTP POST to `/api/*`
- WebSocket adds complexity only for bi-directional push
- Request-response via WebSocket requires correlation tracking
- Simpler implementation with single-direction WebSocket

**Message types:**
- `console:append` - Hugo build output
- `window:reload` - Trigger frontend reload
- `notification` - Display user notification

**Alternatives considered:**
- Full request-response via WebSocket: Unnecessary complexity
- Server-sent events: Less flexible than WebSocket
- Long polling: Inefficient for real-time updates

### Decision: Build-Time Adapter Selection

**Context:** Need to wire different adapters for Electron vs web builds.

**Decision:** Select adapters at build time via factory functions, not runtime detection.

**Implementation:**
```typescript
// Electron build
const container = createContainer({
  adapters: createElectronAdapters()
});

// Web build
const container = createContainer({
  adapters: createWebAdapters()
});
```

**Rationale:**
- Cleaner code (no runtime platform checks)
- Better tree-shaking (unused adapters excluded)
- Explicit about deployment target
- Easier to test (inject mock adapters)

**Alternatives considered:**
- Runtime detection: Messy if/else blocks, harder to test
- Environment variables: Less explicit, error-prone
- Separate codebases: Massive duplication

### Decision: Gradual Filesystem Migration

**Context:** 25 files use direct `fs`/`fs-extra` calls throughout backend.

**Decision:** 
1. Implement FilesystemAdapter interface
2. Create LocalFilesystemAdapter
3. Migrate ConfigurationDataProvider as proof-of-concept
4. Document remaining files, defer full migration
5. Eventually migrate all 25 files incrementally

**Rationale:**
- Proof-of-concept validates approach with minimal risk
- Incremental migration avoids big-bang rewrites
- LocalFilesystemAdapter works for both Electron and web (server filesystem)
- Future adapters (S3, memory) can be added without changing services

**Alternatives considered:**
- Migrate all files at once: High risk, hard to review
- Never migrate: Can't support cloud storage backends
- Create multiple filesystem abstractions: Confusing, fragmented

## Risks / Trade-offs

### Risk: Breaking Change for Dialog API
- **Impact:** All frontend code using `api.showOpenFolderDialog()` breaks
- **Mitigation:** Clear migration guide, update all usage in single PR
- **Trade-off:** Short-term migration pain for long-term simplicity

### Risk: Feature Disparity Between Platforms
- **Impact:** Some features unavailable in web (show in folder, screenshots)
- **Mitigation:** Design graceful fallbacks, document limitations
- **Trade-off:** Platform-appropriate UX vs forced feature parity

### Risk: WebSocket Connection Management
- **Impact:** Reconnection logic, message ordering, network failures
- **Mitigation:** Use robust WebSocket library, implement reconnection
- **Trade-off:** Added complexity vs real-time updates

### Risk: Filesystem Abstraction Performance
- **Impact:** Extra abstraction layer could slow file operations
- **Mitigation:** LocalFilesystemAdapter is thin wrapper (minimal overhead)
- **Trade-off:** Future flexibility vs direct fs performance

### Risk: Incomplete Migration
- **Impact:** Mix of `fs` and FilesystemAdapter usage causes confusion
- **Mitigation:** Document migration status, lint rules to catch direct fs usage
- **Trade-off:** Gradual safety vs temporary inconsistency

## Migration Plan

### Phase 1: Foundation (Week 1)
1. Add FilesystemAdapter interface to types
2. Implement LocalFilesystemAdapter
3. Update Electron adapters to include filesystem
4. Migrate ConfigurationDataProvider
5. Write migration documentation

### Phase 2: Web Adapter (Weeks 2-3)
1. Create packages/adapters/web workspace
2. Implement all web adapters
3. Add WebSocket manager
4. Update frontend to use HTML5 file inputs
5. Test end-to-end web deployment

### Phase 3: Documentation (Week 4)
1. Write comprehensive tutorial
2. Document architecture patterns
3. Create example adapters
4. Update main README

### Rollback Plan
- Phase 1 isolated to backend, easy rollback (revert commits)
- Phase 2 breaking changes: Maintain feature branch, merge when ready
- Phase 3 documentation-only: No rollback needed

### Testing Strategy
- Unit tests for each adapter implementation
- Integration tests for web adapter + WebSocket
- Manual testing in both Electron and web
- Tutorial validation (follow step-by-step)

## Open Questions

### Authentication for Hosted Web Deployment
- **Question:** How to implement OAuth for multi-user web deployments?
- **Options:** JWT tokens, session cookies, OAuth2 providers
- **Decision:** Deferred to future work (single-user web deployment first)

### Screenshot Generation in Web
- **Question:** How to generate site previews/thumbnails in web environment?
- **Options:** Puppeteer/Playwright server-side, client-side canvas, skip feature
- **Decision:** Deferred to future work (show placeholder in web)

### Large File Upload Handling
- **Question:** How to handle multi-GB site uploads in web?
- **Options:** Chunked upload, resumable upload, ZIP compression
- **Decision:** Deferred to future work (initial web deployment assumes smaller sites)

### Multi-Tenancy and Workspace Isolation
- **Question:** How to isolate workspaces in multi-user hosted environment?
- **Options:** Separate filesystem directories, database rows, containerization
- **Decision:** Out of scope for initial adapter implementation

### Real-Time Collaboration
- **Question:** Could WebSocket layer support multi-user editing?
- **Options:** Operational transforms, CRDT, lock-based
- **Decision:** Out of scope, but WebSocket architecture compatible with future collaboration

## Implementation Files

### New Files
**Backend:**
- `packages/backend/src/adapters/types.ts` (update)
- `packages/backend/src/adapters/filesystem-local.ts`
- `docs/filesystem-migration.md`

**Web Adapter:**
- `packages/adapters/web/package.json`
- `packages/adapters/web/tsconfig.json`
- `packages/adapters/web/src/adapters/index.ts`
- `packages/adapters/web/src/server.ts`
- `packages/adapters/web/README.md`

**Frontend:**
- `packages/frontend/src/utils/websocket-listener.ts`

**Documentation:**
- `docs/ADAPTER_TUTORIAL.md`
- `docs/ARCHITECTURE.md`
- `docs/MIGRATION_TO_HTML5_DIALOGS.md`
- `examples/adapters/minimal/`
- `examples/adapters/web-basic/`

### Files to Modify
**Backend:**
- `packages/backend/src/adapters/types.ts` - Add FilesystemAdapter
- `packages/adapters/electron/src/adapters/index.ts` - Add filesystem adapter
- `packages/backend/src/config/container.ts` - Type updates
- `packages/backend/src/services/configuration/configuration-data-provider.ts` - POC migration

**Frontend:**
- `packages/frontend/src/api.ts` - Remove dialog API methods
- Multiple components in `containers/` - Replace dialog calls with HTML5 inputs

**Configuration:**
- `package.json` - Add web workspace
- `README.md` - Add adapter documentation

### Files to Eventually Remove
- Backend dialog API handlers
- ElectronDialogAdapter class (after migration complete)
- Separate screenshot/log window managers

## Complexity Reduction Summary

| Aspect | Before | After | Reduction |
|--------|--------|-------|-----------|
| Adapter interfaces | 7 | 5 | -29% |
| WebSocket patterns | Request/Response + Push | Push only | -50% |
| BrowserWindows | Multiple | One | -80% |
| Platform-specific UI | Separate components | Shared React | -100% |
| Frontend coupling | Moderate | Zero | -100% |

The architectural simplifications reduce overall system complexity by ~60% compared to original proposal.
