# Tasks: restore-scaffold-model

## Phase 1: Core Service Implementation

- [x] **1.1** Create `packages/backend/src/services/scaffold-model/` directory structure
- [x] **1.2** Implement `types.ts` with TypeScript interfaces (ScaffoldResult, FieldDefinition, etc.)
- [x] **1.3** Implement `field-inferrer.ts` with field type inference logic
- [x] **1.4** Implement `scaffold-model-service.ts` main service class
- [x] **1.5** Create `index.ts` with re-exports

## Phase 2: API Integration

- [x] **2.1** Create `packages/backend/src/api/handlers/scaffold-handlers.ts`
- [x] **2.2** Register scaffold handlers in `router.ts`
- [x] **2.3** Add scaffold service factory method to container

## Phase 3: Frontend Integration

- [x] **3.1** Add Zod schemas for scaffold API responses in `@quiqr/types`
- [x] **3.2** Add scaffold API methods to `packages/frontend/src/api.ts`

## Phase 4: Testing & Validation

- [x] **4.1** Create unit tests for field inference logic (16 tests)
- [x] **4.2** Create integration tests for scaffold service (7 tests)
- [x] **4.3** Manual testing with sample YAML, TOML, JSON, and Markdown files
- [x] **4.4** Verify TypeScript compilation succeeds

## Phase 5: Menu Integration

- [x] **5.1** Add scaffold menu items to Electron menu (`packages/adapters/electron/src/ui-managers/menu-manager.ts`)
  - Add "Scaffold Single from File..." menu item in File menu
  - Add "Scaffold Collection from File..." menu item in File menu
  - Items should be enabled only when a site is selected
  - Click handler calls `container.getScaffoldModelService()` and executes scaffold
  
- [x] **5.2** Add scaffold menu items to standalone adapter (`packages/adapters/standalone/src/adapters/menu-adapter.ts`)
  - Add same menu items with `action: 'scaffoldSingle'` and `action: 'scaffoldCollection'`
  - Items enabled based on `siteSelected` state

- [x] **5.3** Add scaffold action handlers to menu-handlers.ts (`packages/backend/src/api/handlers/menu-handlers.ts`)
  - Handle `scaffoldSingle` action → call scaffoldSingleFromFile()
  - Handle `scaffoldCollection` action → call scaffoldCollectionFromFile()
  - Return appropriate WebMenuActionResult (success with refresh, or error)

- [x] **5.4** Test menu integration
  - TypeScript compilation succeeds for all adapters
  - All scaffold tests pass (23 tests)

## Dependencies

- Tasks 1.1-1.5 can be done in parallel
- Task 2.1 depends on 1.4
- Tasks 2.2-2.3 depend on 2.1
- Tasks 3.1-3.2 depend on 2.1
- Phase 4 depends on Phases 1-3
- Phase 5 depends on Phase 2 (API handlers must exist)

## Verification

All phases verified:
- Phase 1: TypeScript compilation succeeds ✓
- Phase 2: API endpoints registered in router ✓
- Phase 3: Frontend builds without scaffold-related errors ✓
- Phase 4: All 23 tests pass ✓
- Phase 5: Menu integration complete, TypeScript compiles ✓

## Files Created/Modified

### New Files
- `packages/backend/src/services/scaffold-model/types.ts`
- `packages/backend/src/services/scaffold-model/field-inferrer.ts`
- `packages/backend/src/services/scaffold-model/scaffold-model-service.ts`
- `packages/backend/src/services/scaffold-model/index.ts`
- `packages/backend/src/api/handlers/scaffold-handlers.ts`
- `packages/backend/src/services/scaffold-model/__tests__/field-inferrer.test.ts`
- `packages/backend/src/services/scaffold-model/__tests__/scaffold-model-service.test.ts`

### Modified Files
- `packages/backend/src/config/container.ts` - Added getScaffoldModelService method
- `packages/backend/src/api/router.ts` - Registered scaffold handlers
- `packages/types/src/schemas/api.ts` - Added scaffoldResultSchema
- `packages/frontend/src/api.ts` - Added scaffold API methods

### Phase 5 Files (complete)
- `packages/adapters/electron/src/ui-managers/menu-manager.ts` - Added scaffold submenu in File menu
- `packages/adapters/standalone/src/adapters/menu-adapter.ts` - Added scaffold submenu for browser mode
- `packages/backend/src/api/handlers/menu-handlers.ts` - Added scaffoldSingle/scaffoldCollection action handlers
