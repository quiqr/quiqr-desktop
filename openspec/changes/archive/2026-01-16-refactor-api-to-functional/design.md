# Design: Refactor API Module to Functional

## Overview

This design converts the class-based `API` client to a functional module with comprehensive test coverage while maintaining full backward compatibility through the service layer.

## Architecture Decisions

### 1. Direct Function Exports vs Class Methods

**Decision**: Export each API method as a standalone function instead of class methods.

**Rationale**:
- All 94 methods are stateless wrappers around `request()` with no shared state
- Class structure adds no value - no constructor logic, no private state, no inheritance
- Functional exports align with Utility Module Pattern used in main-process-bridge
- Simpler implementation without `this` binding concerns
- Consistent with other utility modules in the codebase

**Implementation**:
```typescript
// Before (class-based)
export class API {
  getConfigurations(options?: {invalidateCache: boolean}) {
    return request('getConfigurations', options);
  }
}
export const instance = new API();

// After (functional)
export function getConfigurations(options?: {invalidateCache: boolean}) {
  return request('getConfigurations', options);
}
```

### 2. Backward Compatibility Strategy

**Decision**: Maintain `api-service.ts` as the primary import point with re-exports of all functions.

**Rationale**:
- Most consuming code imports from `services/api-service` not directly from `api.ts`
- The service layer can re-export all functions, creating a namespace-like API
- Existing code `import { api } from 'services/api-service'` continues to work
- Zero breaking changes for majority of codebase (136 usage sites)
- Direct imports from `api.ts` are minimal and easily updated

**Migration Path**:
```typescript
// api-service.ts re-exports all functions
export * from '../api';

// Legacy usage continues to work:
import { api } from 'services/api-service';
api.getConfigurations(); // Still works through re-export

// New recommended usage:
import { getConfigurations } from 'services/api-service';
getConfigurations(); // Direct function call
```

### 3. Testing Strategy

**Decision**: Integration tests using MSW to verify API client behavior.

**Test Coverage Areas**:

#### API Method Categories (test representative samples)
- **Workspace operations**: getConfigurations, listWorkspaces, mountWorkspace
- **Single content**: getSingle, updateSingle, saveSingle
- **Collection operations**: listCollectionItems, getCollectionItem, createCollectionItemKey
- **Sync operations**: syncSite, syncPull, syncCommit
- **Preferences**: readConfKey, saveConfPrefKey, saveConfGeneralKey
- **Special cases**: Methods with custom timeouts (stopHugoServer, logToConsole)
- **Deprecated methods**: Verify deprecation warnings still present

#### Test Scenarios
- Method calls correctly map to backend endpoints
- Parameters are passed correctly in request body
- Return types are properly typed (Promise with correct response type)
- Custom timeout options are respected
- Deprecated methods include @deprecated JSDoc tags

**Rationale**:
- API module is a thin wrapper, so integration tests are most valuable
- MSW provides realistic HTTP mocking without network calls
- Testing representative samples (not all 94 methods) ensures pattern works
- Follows patterns from main-process-bridge tests
- Comprehensive tests prevent regressions and enable confident refactoring

### 4. Singleton Behavior

**Decision**: Remove singleton pattern - functions are stateless and don't require singleton behavior.

**Rationale**:
- All API methods are pure functions wrapping `request()`
- No shared state between methods that requires singleton pattern
- Each function call is independent and stateless
- Module scope (loaded once by Node.js) is sufficient
- Simpler than maintaining instance pattern

### 5. Type System Updates

**Decision**: Keep `API` type as interface for type inference, not class.

**Rationale**:
- `useApiQuery` hook uses `API` type for method name inference
- Can be converted to interface or type alias maintaining same type structure
- Type-only imports remain valid (`import type { API }`)
- No runtime impact, pure TypeScript compile-time feature

**Implementation**:
```typescript
// api.ts
export interface API {
  getConfigurations(options?: {invalidateCache: boolean}): Promise<Configurations>;
  listWorkspaces(siteKey: string): Promise<Workspace[]>;
  // ... all method signatures
}

// Individual function exports
export function getConfigurations(options?: {invalidateCache: boolean}) {
  return request('getConfigurations', options);
}
```

## Implementation Phases

### Phase 1: Add Comprehensive Tests (TDD Approach)
Write tests first against the current class-based implementation to:
- Document current behavior precisely
- Ensure we understand all edge cases
- Create regression safety net for refactoring

### Phase 2: Refactor to Functional
Convert implementation while keeping tests passing:
- Remove class syntax
- Export individual functions
- Update API type to interface
- Verify all tests still pass

### Phase 3: Update Direct Imports
Update the few files that import directly from api.ts:
- `api-service.ts` - re-export all functions
- `hooks/useApiQuery.ts` - update type import
- `hooks/useServiceData.ts` - update import pattern

### Phase 4: Validation
- Run full test suite
- Run TypeScript type checking
- Verify no runtime errors
- Confirm import changes are complete

## Risk Mitigation

**Risk**: Breaking existing functionality during refactoring
- **Mitigation**: TDD approach - write tests first, keep them green during refactoring

**Risk**: Import changes breaking consuming code
- **Mitigation**: api-service.ts re-exports maintain backward compatibility

**Risk**: Type signature changes breaking type inference
- **Mitigation**: Maintain exact same types as interface, verify with `tsc --noEmit`

**Risk**: Missing edge cases in API method behavior
- **Mitigation**: Test representative samples from each category (workspace, single, collection, sync, prefs)

## Success Criteria

1. All new tests pass (comprehensive coverage of API client layer)
2. All existing tests continue to pass (no regressions)
3. TypeScript compilation succeeds with no new errors
4. Application runs without errors in both Electron and standalone modes
5. All API calls still work (verified through existing integration tests)
6. Only minimal files changed their imports as expected
7. No performance degradation (functional exports are as fast as class methods)
