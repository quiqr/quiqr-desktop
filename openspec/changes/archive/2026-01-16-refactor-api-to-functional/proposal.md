# Change: Refactor API Module to Functional

## Why

The `frontend/src/api.ts` module currently uses a class-based singleton pattern, which violates project conventions stated in `openspec/project.md` and the `frontend-components` spec:

> **Utility Module Pattern** - Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods or class-with-instance-methods patterns.

Current issues with the class-based approach:
- Uses class syntax with 94 instance methods that are thin wrappers around `request()`
- Exports singleton instance (`export const instance = new API()`) inconsistent with functional patterns
- Violates the Utility Module Pattern requirement in frontend-components spec
- Creates unnecessary indirection layer between consumers and the request function
- All methods are stateless wrappers with no shared state, making the class structure unnecessary

Additionally, the API module has zero test coverage despite being a critical client layer:
- No tests for API method signatures and parameter passing
- No tests for timeout configurations on specific methods
- No verification that methods correctly map to backend endpoints
- Testing requirements state: "Utility Functions MUST have comprehensive unit tests"

## What Changes

**Convert Class to Functional Module:**
- Remove class syntax and convert to functional module exports
- Export each API method as a standalone named function
- Remove singleton instance pattern (`export const instance = new API()`)
- Maintain full backward compatibility through re-export pattern in service layer
- All 94 methods remain as pure functions wrapping `request()`

**Add Comprehensive Test Coverage:**
- Create `frontend/test/integration/api-client.test.ts`
- Test representative sample of API methods (workspace, single, collection, sync, preferences)
- Test parameter passing and endpoint mapping
- Test timeout configurations on specific methods
- Test deprecated method warnings
- Use MSW for HTTP mocking (following main-process-bridge pattern)

## Impact

- **Affected specs**: `frontend-components` (extends Utility Module Pattern to cover API client modules)
- **Affected code**:
  - `frontend/src/api.ts` - Convert class to functional exports
  - `frontend/src/services/api-service.ts` - Update to re-export individual functions (maintains backward compatibility)
  - `frontend/src/hooks/useApiQuery.ts` - Update type import (API type becomes import type)
  - `frontend/test/integration/api-client.test.ts` - New comprehensive test file

- **Breaking changes**: None - api-service.ts maintains backward compatibility by re-exporting all functions as named exports
- **Migration complexity**: Very low - existing `import { api } from 'services/api-service'` continues to work; direct imports from api.ts need minor updates
- **Test coverage**: Increases from 0% to comprehensive coverage for critical API client layer
