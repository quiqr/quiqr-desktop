# Change: Refactor Main Process Bridge to Functional

## Why

The `frontend/src/utils/main-process-bridge.ts` module currently uses a class-based singleton pattern, which violates project conventions stated in `openspec/project.md` and the `frontend-components` spec:

> **Utility Module Pattern** - Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods or class-with-instance-methods patterns.

Current issues with the class-based approach:
- Uses singleton pattern (`export default new MainProcessBridge()`) inconsistent with functional patterns
- Class instance maintains private state (`_messageHandlers`) rather than using module-level closures
- Violates the Utility Module Pattern requirement in frontend-components spec
- Message handler system is currently untested, creating risk for future WebSocket integration
- HTTP request functionality lacks automated tests to ensure validation and error handling work correctly

Additionally, the bridge has zero test coverage despite being critical infrastructure:
- No tests for the message handler system (add/remove/dispatch)
- No tests for HTTP request handling and validation
- No tests for error scenarios and timeout behavior
- Testing requirements state: "Utility Functions MUST have comprehensive unit tests"

## What Changes

**Convert Class to Functional Module:**
- Remove class syntax and convert to functional module exports
- Replace `_messageHandlers` private property with module-level closure
- Maintain singleton behavior through module scope
- Export named functions: `addMessageHandler`, `removeMessageHandler`, `dispatchMessage`, `request`
- Keep `validateApiResponse` as-is (already a pure function)
- Maintain full backward compatibility - no breaking changes to API surface

**Add Comprehensive Test Coverage:**
- Create `frontend/test/utils/main-process-bridge.test.ts`
- Test message handler lifecycle (add, remove, dispatch)
- Test HTTP request functionality using MSW (Mock Service Worker)
- Test Zod validation with valid and invalid responses
- Test error handling and timeout scenarios
- Test multiple handler registration for same message type
- Follow patterns from existing tests (`debounce.test.ts`, `theme-api.test.ts`)

## Impact

- **Affected specs**: `frontend-components` (enforces existing Utility Module Pattern and adds testing requirements for API bridge utilities)
- **Affected code**:
  - `frontend/src/utils/main-process-bridge.ts` - Convert class to functional exports
  - `frontend/src/contexts/ConsoleContext.tsx` - Update import from default to named imports (no logic changes)
  - `frontend/src/api.ts` - Update import from default to named imports (no logic changes)
  - `frontend/test/utils/main-process-bridge.test.ts` - New comprehensive test file

- **Breaking changes**: None - this is a refactoring that maintains identical runtime behavior and API surface
- **Migration complexity**: Low - only import statement changes required in consuming code
- **Test coverage**: Increases from 0% to comprehensive coverage for critical infrastructure
