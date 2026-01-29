## Context

The Quiqr Desktop backend was originally built as a tightly-coupled Electron application using CommonJS and JavaScript. The codebase had several architectural issues:

Key constraints:
- Backend code directly imported Electron APIs (`require('electron')`)
- Global state management (`global.pogoconf`, `global.currentSiteKey`)
- No type safety between frontend and backend
- Cannot run backend without launching Electron
- Cross-directory imports with `../../../` paths
- Types duplicated across frontend and backend

Stakeholders:
- Developers: Need type safety, clean architecture, testable code
- Desktop users: Expect existing Electron functionality to continue working
- Future users: Will benefit from web deployment options

## Goals / Non-Goals

**Goals:**
- Convert entire backend to TypeScript + ESM
- Decouple backend from Electron via adapter pattern
- Establish shared type package for frontend-backend contract
- Enable standalone server deployment
- Clean up import paths with NPM workspaces
- Replace global state with dependency injection

**Non-Goals:**
- Changing frontend architecture (already TypeScript + ESM)
- Rewriting business logic (keep functionality identical)
- Immediate web deployment (Phase 5 is future work)
- Breaking existing Electron features
- Changing API surface for frontend

## Decisions

### Decision: NPM Workspaces Monorepo

**Context:** Need to organize code into separate packages with clean boundaries.

**Decision:** Use NPM workspaces with packages:
- `@quiqr/types` - Shared schemas
- `@quiqr/backend` - Platform-agnostic server
- `@quiqr/frontend` - React app
- `@quiqr/adapter-electron` - Electron-specific code

**Rationale:**
- Clean import paths (`@quiqr/backend` vs `../../../backend/`)
- Development mode: workspace links resolve to `src/`
- Production mode: same imports resolve to `dist/`
- No conditional paths needed
- Easy to add more adapters later
- IDE autocomplete works across packages

**Alternatives considered:**
- Monolith: Maintains tight coupling, cannot deploy standalone
- Separate repos: Too much overhead, harder to coordinate changes
- Lerna/Turborepo: Overkill for 4-5 packages

### Decision: Extract Types to Separate Package First (Phase 1)

**Context:** Both frontend and backend need shared type definitions.

**Decision:** Create `@quiqr/types` as first phase before touching backend.

**Rationale:**
- Foundation for everything else
- Establishes type contract early
- Can validate Phase 1 in isolation (frontend still works)
- Minimizes risk - pure extraction, no logic changes
- Zod schemas provide runtime validation + TypeScript inference

**Alternatives considered:**
- Migrate backend first: Would need to keep types in sync manually
- Keep types in frontend: Backend can't import from frontend in clean way

### Decision: Incremental Service Migration (Phase 2)

**Context:** Backend has ~25 files and complex interdependencies.

**Decision:** Migrate services incrementally: utilities → config → services → API layer

**Rationale:**
- Reduces risk of breaking everything at once
- Can test each service migration independently
- Utilities have fewest dependencies (start here)
- API layer depends on services (do last)
- Can keep .js and .ts files side-by-side during migration

**Alternatives considered:**
- Big bang rewrite: Too risky, hard to debug failures
- Separate codebase: Would need to maintain both during transition

### Decision: Dependency Injection Container Pattern

**Context:** Need to replace global state (`global.pogoconf`, etc.).

**Decision:** Create AppContainer with config, state, and adapters:
```typescript
interface AppContainer {
  config: AppConfig
  state: AppState  
  adapters: PlatformAdapters
}
```

**Rationale:**
- Explicit dependencies (no hidden globals)
- Testable (inject mock adapters)
- Type-safe (TypeScript knows what's available)
- Clean separation of concerns
- Easy to understand service dependencies

**Alternatives considered:**
- Keep global state: Maintains coupling, hard to test
- Service locator pattern: Less explicit, harder to track dependencies
- Individual injection per service: Too much boilerplate

### Decision: Adapter Interfaces for Platform Operations

**Context:** Backend directly uses Electron APIs, preventing standalone deployment.

**Decision:** Define adapter interfaces (DialogAdapter, ShellAdapter, etc.) that backend depends on, with Electron implementations in separate package.

**Rationale:**
- Backend becomes platform-agnostic
- Can test backend with mock adapters
- Easy to add web adapters later (Phase 5)
- Clear boundary between business logic and platform
- Same backend code works with different adapters

**Alternatives considered:**
- Conditional runtime checks: Messy if/else, harder to test
- Separate backend versions: Massive code duplication
- Remove all platform features: Would break desktop UX

### Decision: Stub API Handlers, Wire Later

**Context:** 82 API endpoints need migration from `api-main.js`.

**Decision:** Create all handler stubs that throw errors, wire to services incrementally.

**Rationale:**
- Backend compiles successfully (catches type errors early)
- Clear TODO list of what needs wiring
- Can wire handlers as services become available
- Fails fast with clear error if called before wiring

**Alternatives considered:**
- Wire as you go: Would block on service migrations
- Copy-paste old implementations: Would ship untested code

## Risks / Trade-offs

### Risk: Large-Scale Refactoring

- **Impact:** Breaking changes across entire backend
- **Mitigation:** Incremental phases, test after each service migration, git branches
- **Trade-off:** Short-term development slowdown vs long-term maintainability

### Risk: TypeScript Learning Curve

- **Impact:** More complex type definitions, generics, etc.
- **Mitigation:** Use `@ts-expect-error` temporarily, document patterns
- **Trade-off:** Upfront complexity vs long-term type safety

### Risk: Build Configuration Complexity

- **Impact:** Multiple package.json files, tsconfig files, workspace links
- **Mitigation:** Clear documentation, shared base configs
- **Trade-off:** Configuration complexity vs clean architecture

### Risk: Import Path Changes Throughout Codebase

- **Impact:** Many files need import updates
- **Mitigation:** Do incrementally, test after each batch
- **Trade-off:** Churn vs clean imports

### Risk: Electron Integration After Separation

- **Impact:** Need to correctly wire adapters, may miss features
- **Mitigation:** Comprehensive testing checklist, verify all UI managers work
- **Trade-off:** Adapter complexity vs platform independence

## Migration Plan

### Phase 1: Foundation (Week 1) ✅ COMPLETE
1. Create `@quiqr/types` package
2. Extract all Zod schemas from `frontend/types.ts`
3. Update frontend to import from `@quiqr/types`
4. Build and test

### Phase 2: Backend Transformation (Weeks 2-3) ⏳ 67% COMPLETE
1. Setup `@quiqr/backend` package structure
2. Define adapter interfaces
3. Migrate utilities (no dependencies)
4. Create DI container (AppConfig, AppState)
5. Migrate services incrementally
6. Stub all API handlers
7. Wire handlers to services (IN PROGRESS)

### Phase 3: Electron Adapter (Week 4)
1. Create `@quiqr/adapter-electron` package
2. Implement all adapter interfaces using Electron APIs
3. Migrate UI managers
4. Create new main.ts entry point
5. Wire everything together
6. Test all features

### Phase 4: Validation & Documentation (Week 5)
1. Test dev environment
2. Test production build
3. Verify all features work
4. Update documentation
5. Clean up old code

### Rollback Plan
- Phase 1: Simple revert (no dependencies)
- Phase 2: Keep in feature branch until complete
- Phase 3: Can temporarily point to old main.js if adapter fails
- Phase 4: Only documentation, no rollback needed

### Testing Strategy
- Unit tests for utilities and services (future)
- Integration tests with mock adapters
- Manual testing checklist for Electron features
- Production build testing on target platforms

## Open Questions

### How to Handle Async Service Initialization?

**Question:** Some services need async initialization (loading config, etc.). How to handle in DI container?

**Options:**
1. Async container creation: `await createContainer()`
2. Lazy initialization: Services init on first use
3. Manual init step: `container.init()` after creation

**Current Approach:** Manual init in Electron main.ts after container creation

### Should We Add Unit Tests During Migration?

**Question:** Migration is already complex. Should we add tests now or later?

**Decision:** Deferred to post-migration. Focus on getting existing functionality working first.

**Rationale:** Tests would slow down migration significantly. Better to add tests once architecture is stable.

### How to Handle Backend Dev Server Hot Reload?

**Question:** Frontend has hot reload. Should backend too?

**Options:**
1. Use nodemon/ts-node-dev: Restart server on changes
2. No hot reload: Manual restart (simpler)
3. Full HMR: Complex for backend

**Decision:** No hot reload (manual restart documented in dev workflow)

### How to Package Backend Dist in Electron Installer?

**Question:** electron-builder needs to include compiled backend. How?

**Solution:** Add `packages/backend/dist/**/*` to `files` array in electron-builder config.

**Status:** Addressed in Phase 3 tasks

## Implementation Files

### New Files Created

**Phase 1:**
- `packages/types/src/schemas/*.ts`
- `packages/types/package.json`
- `packages/types/tsconfig.json`
- `tsconfig.base.json`

**Phase 2:**
- `packages/backend/src/adapters/types.ts`
- `packages/backend/src/config/app-config.ts`
- `packages/backend/src/config/app-state.ts`
- `packages/backend/src/container.ts`
- `packages/backend/src/utils/*.ts` (all utilities)
- `packages/backend/src/services/**/*.ts` (all services)
- `packages/backend/src/api/server.ts`
- `packages/backend/src/api/handlers/*.ts`
- `packages/backend/src/index.ts`
- `packages/backend/package.json`
- `packages/backend/tsconfig.json`

**Phase 3:**
- `packages/adapters/electron/src/adapters/*.ts`
- `packages/adapters/electron/src/ui-managers/*.ts`
- `packages/adapters/electron/src/main.ts`
- `packages/adapters/electron/package.json`
- `packages/adapters/electron/tsconfig.json`

### Files to Remove

**After Phase 3:**
- `backend/src-main/` (entire old backend)
- `backend/bridge/` (old API handlers)
- `electron/` (old Electron code, moved to adapter)
- `backend/dist/` (failed migration attempt)

### Files to Modify

**Phase 1:**
- `frontend/types.ts` (now re-exports from `@quiqr/types`)
- `package.json` (add workspaces)

**Phase 3:**
- Root `package.json` (update main entry point, scripts)
- Electron builder config (update files array)

**Phase 4:**
- `AGENTS.md` (update architecture documentation)
- README files for all packages

## Progress Summary

**Completed:**
- ✅ Phase 1: Types package (100%)
- ✅ Phase 2: Backend structure, adapters, DI, services (67%)

**In Progress:**
- ⏳ Phase 2: API handler wiring (~35% operational)

**Remaining:**
- ❌ Phase 2: Sync modules migration
- ❌ Phase 2: Complete API handler wiring
- ❌ Phase 3: Electron adapter package
- ❌ Phase 4: Testing and documentation
- ❌ Phase 5: Standalone adapter (future)

**Estimated Completion:**
- Phase 2: 1 more week
- Phase 3: 1 week
- Phase 4: 1 week
- **Total: ~3 weeks remaining**
