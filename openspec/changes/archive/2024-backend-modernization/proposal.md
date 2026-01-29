# Change: Backend Modernization to TypeScript + ESM

## Why

The backend was tightly coupled to Electron using CommonJS and JavaScript, preventing:
- Platform independence (cannot run as standalone server)
- Type safety across frontend-backend boundaries
- Code reusability and testability
- Clean separation of concerns
- Future deployment options (web, Docker, serverless)

## What Changes

This proposal modernizes the backend architecture through four major transformations:

- **TypeScript + ESM** - Convert entire backend from CommonJS/JavaScript to TypeScript/ESM
- **Shared Types Package** - Extract all Zod schemas to `@quiqr/types` for frontend-backend contract
- **Dependency Injection** - Replace global state (`global.pogoconf`) with DI container pattern
- **Adapter Pattern** - Decouple platform-specific operations (Electron) via adapter interfaces
- **NPM Workspaces** - Organize as monorepo with clean package boundaries

### Architecture Transformation

**Before:**
```
/backend/ (CommonJS, JS, Electron-coupled)
/frontend/ (TypeScript, ESM)
/electron/ (mixed with backend logic)
```

**After:**
```
packages/
├── types/          # @quiqr/types - Shared Zod schemas
├── backend/        # @quiqr/backend - Platform-agnostic TS+ESM
├── frontend/       # @quiqr/frontend - React app
└── adapters/
    └── electron/   # @quiqr/adapter-electron - Electron wrapper
```

## Impact

- **Affected specs**: backend-architecture, type-system, dependency-injection, electron-integration
- **Affected code**: Entire backend (~25 files), all API handlers (~82 endpoints), global state management
- **Breaking changes**: **BREAKING** - Global state removed, requires new DI container initialization
- **Migration required**: Electron main process must instantiate adapters and inject into backend

## Implementation Phases

### Phase 1: Extract Shared Types Package ✅ COMPLETE
- Create `@quiqr/types` workspace with Zod schemas
- Migrate all schemas from `frontend/types.ts`
- Update frontend to import from `@quiqr/types`
- Build system with TypeScript compilation

### Phase 2: Modernize Backend Package (67% COMPLETE)
- Create `@quiqr/backend` workspace structure
- Define adapter interfaces (DialogAdapter, ShellAdapter, WindowAdapter, etc.)
- Migrate utilities to TypeScript + ESM
- Replace `global.pogoconf` with AppConfig + AppState + DI container
- Migrate services incrementally (workspace, site, library, Hugo, sync)
- Convert API handlers from `api-main.js` to typed handlers
- **Status**: Services migrated, API handlers stubbed (not wired)

### Phase 3: Create Electron Adapter Package
- Create `@quiqr/adapter-electron` workspace
- Implement all adapter interfaces using Electron APIs
- Migrate UI managers (window, menu, log, screenshot)
- Create new Electron main process entry point
- Wire adapters to backend via DI container
- Remove old Electron-coupled code

### Phase 4: Testing & Validation
- Test development environment (`npm run dev`)
- Test production build (`npm run build`)
- Validate all features work in Electron
- Update documentation (AGENTS.md, READMEs)
- Clean up old backend code

### Phase 5: Standalone Server Adapter (FUTURE)
- Create `@quiqr/adapter-standalone` for web deployment
- Implement web-based adapters (WebSocket, file uploads)
- Add authentication system
- Enable Docker/cloud deployment

## Long-term Benefits

- Standalone server deployment without Electron
- Full type safety across frontend-backend boundary
- Clean imports (`@quiqr/backend` vs `../../../backend/`)
- Platform independence (easy to add mobile, cloud adapters)
- Testable backend without Electron dependencies
- Shared type definitions (single source of truth)
