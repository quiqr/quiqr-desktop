# Design: Refactor Main Process Bridge to Functional

## Overview

This design converts the class-based `MainProcessBridge` to a functional module with comprehensive test coverage while maintaining full backward compatibility.

## Architecture Decisions

### 1. Module-Level State vs Class Instance State

**Decision**: Use module-level closure for message handler storage instead of class private property.

**Rationale**:
- Aligns with functional programming patterns used elsewhere in the codebase
- Maintains singleton behavior through module scope (loaded once by Node.js module system)
- Simpler implementation without `this` binding concerns
- Consistent with other utility modules like `utils/validation.ts`

**Implementation**:
```typescript
// Module-level state (private to this module)
const messageHandlers: { [key: string]: Array<(data: any) => void> } = {};

// Exported functions operate on module state
export function addMessageHandler(type: string, handler: (data: any) => void) {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  messageHandlers[type].push(handler);
}
```

### 2. Named Exports vs Default Export

**Decision**: Export all functions as named exports, remove default export singleton.

**Rationale**:
- Follows project convention: "Use namespace imports or destructured imports"
- Makes it clear what functionality is being used at import sites
- Easier to tree-shake unused functions
- More discoverable with IDE autocomplete
- Aligns with Utility Module Pattern requirement

**Migration Path**:
```typescript
// Old (2 locations)
import mainProcessBridge from './utils/main-process-bridge';
mainProcessBridge.request('method', data);
mainProcessBridge.addMessageHandler('console', handler);

// New
import { request, addMessageHandler } from './utils/main-process-bridge';
request('method', data);
addMessageHandler('console', handler);
```

### 3. Backward Compatibility Strategy

**Decision**: Update imports but maintain exact same API signatures and behavior.

**Rationale**:
- Zero risk of runtime behavior changes
- Only 2 files need import updates (ConsoleContext.tsx, api.ts)
- No changes to calling code beyond imports
- All parameters, return types, and error handling remain identical

**Verification**:
- Existing integration tests continue to pass
- New unit tests verify exact same behavior
- Type signatures remain identical

### 4. Testing Strategy

**Decision**: Comprehensive unit tests using vitest + MSW for HTTP mocking.

**Test Coverage Areas**:

#### Message Handler Tests
- Add single handler for a message type
- Add multiple handlers for same message type
- Remove specific handler from message type
- Dispatch message to all registered handlers
- Handle dispatch when no handlers registered
- Multiple message types operate independently
- Remove handler that doesn't exist (no-op)

#### HTTP Request Tests
- Successful request with valid response
- Successful request with validation
- Request timeout handling
- Network error handling
- Zod validation failure with detailed error
- Schema not found warning (logs but doesn't fail)
- Custom timeout option
- Correct endpoint construction (hostname + port)

**Rationale**:
- Message handlers are currently untested but will be critical for future WebSocket implementation
- HTTP requests are infrastructure code that must be reliable
- MSW provides realistic HTTP mocking without network calls
- Vitest patterns already established in codebase (`debounce.test.ts`, `theme-api.test.ts`)
- Comprehensive tests prevent regressions and enable confident refactoring

### 5. File Organization

**Decision**: Keep in `frontend/src/utils/main-process-bridge.ts`, add tests in `frontend/test/utils/`.

**Rationale**:
- File is already correctly located as a utility module
- Test location mirrors source structure (project convention)
- Name accurately describes functionality (bridge between frontend and main process)

## Implementation Phases

### Phase 1: Add Comprehensive Tests (TDD Approach)
Write tests first against the current class-based implementation to:
- Document current behavior precisely
- Ensure we understand all edge cases
- Create regression safety net for refactoring

### Phase 2: Refactor to Functional
Convert implementation while keeping tests passing:
- Remove class syntax
- Move to module-level state
- Export named functions
- Verify all tests still pass

### Phase 3: Update Imports
Update the 2 consuming files:
- `frontend/src/contexts/ConsoleContext.tsx`
- `frontend/src/api.ts`

### Phase 4: Validation
- Run full test suite
- Run TypeScript type checking
- Verify no runtime errors
- Confirm import changes are complete

## Risk Mitigation

**Risk**: Breaking existing functionality during refactoring
- **Mitigation**: TDD approach - write tests first, keep them green during refactoring

**Risk**: Missing edge cases in tests
- **Mitigation**: Review existing usage patterns in ConsoleContext to ensure coverage

**Risk**: Import changes not complete
- **Mitigation**: Search codebase for all imports before and after: `rg "from.*main-process-bridge"`

**Risk**: Type signature changes breaking consumers
- **Mitigation**: Maintain exact same types, verify with `tsc --noEmit`

## Success Criteria

1. All new tests pass (100% coverage of main-process-bridge functions)
2. All existing tests continue to pass (no regressions)
3. TypeScript compilation succeeds with no new errors
4. Application runs without errors in both Electron and standalone modes
5. Console output still works (tests the message handler system)
6. API calls still work (tests the request function)
7. Only 2 files changed their imports as expected
8. No performance degradation (module-level state is as fast as class instance)
