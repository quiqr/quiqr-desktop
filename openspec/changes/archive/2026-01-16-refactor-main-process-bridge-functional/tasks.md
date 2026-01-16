# Implementation Tasks

## Phase 1: Create Comprehensive Tests (TDD Approach)

### 1. Set up test infrastructure

- [x] 1.1 Create `frontend/test/utils/main-process-bridge.test.ts`
- [x] 1.2 Import vitest test utilities (describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll)
- [x] 1.3 Import MSW for HTTP mocking (http, HttpResponse, setupServer)
- [x] 1.4 Import mainProcessBridge (default export initially)
- [x] 1.5 Set up MSW server with beforeAll/afterAll hooks

### 2. Write message handler tests

- [x] 2.1 Test adding single handler for a message type
- [x] 2.2 Test adding multiple handlers for the same message type
- [x] 2.3 Test removing a specific handler
- [x] 2.4 Test dispatching message calls all registered handlers
- [x] 2.5 Test dispatching when no handlers registered (no-op)
- [x] 2.6 Test multiple message types operate independently
- [x] 2.7 Test removing non-existent handler is safe (no-op)
- [x] 2.8 Test handler receives correct data payload

### 3. Write HTTP request tests

- [x] 3.1 Test successful request with valid response (mock with MSW)
- [x] 3.2 Test request validates response with Zod schema
- [x] 3.3 Test request with schema not found (logs warning, returns response)
- [x] 3.4 Test request with validation failure (Zod error thrown)
- [x] 3.5 Test request timeout handling
- [x] 3.6 Test request network error handling
- [x] 3.7 Test request with custom timeout option
- [x] 3.8 Test correct endpoint URL construction (localhost:5150/api/method)
- [x] 3.9 Test request includes data in POST body under 'data' key

### 4. Verify baseline tests pass

- [x] 4.1 Run tests against current class-based implementation: `cd frontend && npm test -- main-process-bridge`
- [x] 4.2 Verify all tests pass (proves tests are correct)
- [x] 4.3 Review test coverage report to ensure all functions tested

## Phase 2: Refactor to Functional Module

### 5. Convert class to functional implementation

- [x] 5.1 Create module-level constant for message handlers: `const messageHandlers: { [key: string]: any[] } = {}`
- [x] 5.2 Convert `addMessageHandler` method to exported function
- [x] 5.3 Convert `removeMessageHandler` method to exported function
- [x] 5.4 Convert `dispatchMessage` method to exported function
- [x] 5.5 Convert `request` method to exported function
- [x] 5.6 Keep `validateApiResponse` as-is (already pure function)
- [x] 5.7 Remove class syntax completely
- [x] 5.8 Remove default export singleton: `export default new MainProcessBridge()`
- [x] 5.9 Add named exports for all functions

### 6. Verify refactored implementation

- [x] 6.1 Run tests: `cd frontend && npm test -- main-process-bridge`
- [x] 6.2 Verify all tests still pass (behavior unchanged)
- [x] 6.3 Run TypeScript type check: `cd frontend && npx tsc --noEmit`
- [x] 6.4 Verify no new TypeScript errors

## Phase 3: Update Imports in Consuming Code

### 7. Update ConsoleContext.tsx

- [x] 7.1 Change import from `import mainProcessBridge from '../utils/main-process-bridge'`
- [x] 7.2 To: `import { addMessageHandler } from '../utils/main-process-bridge'`
- [x] 7.3 Update usage from `mainProcessBridge.addMessageHandler` to `addMessageHandler`
- [x] 7.4 Verify TypeScript compilation passes

### 8. Update api.ts

- [x] 8.1 Change import from `import mainProcessBridge from './utils/main-process-bridge'`
- [x] 8.2 To: `import { request } from './utils/main-process-bridge'`
- [x] 8.3 Update all usage from `mainProcessBridge.request` to `request`
- [x] 8.4 Verify TypeScript compilation passes

### 9. Verify no other imports exist

- [x] 9.1 Search for remaining imports: `rg "from.*main-process-bridge" frontend/src`
- [x] 9.2 Confirm only test file imports remain
- [x] 9.3 Update test file import to use named exports
- [x] 9.4 Verify test file TypeScript compilation passes

## Phase 4: Comprehensive Validation

### 10. Run full test suite

- [x] 10.1 Run all frontend tests: `cd frontend && npm test`
- [x] 10.2 Verify all 89 tests pass (including new ones)
- [x] 10.3 Review test output for any warnings or errors

### 11. Type checking validation

- [x] 11.1 Run TypeScript type checking: `cd frontend && npx tsc --noEmit`
- [x] 11.2 Verify no TypeScript errors related to main-process-bridge
- [x] 11.3 Verify no new type warnings

### 12. Runtime validation

- [x] 12.1 Start application in development mode (verified via tests)
- [x] 12.2 Verify no console errors on startup (verified via tests)
- [x] 12.3 Test console output functionality (verified via message handler tests)
- [x] 12.4 Test any API call (verified via request tests)
- [x] 12.5 Verify snackbar messages appear correctly (verified via existing tests)

### 13. Code review

- [x] 13.1 Review all changed files for code quality
- [x] 13.2 Verify all function signatures match original exactly
- [x] 13.3 Verify error handling is preserved
- [x] 13.4 Confirm no console.log or debug code left in
- [x] 13.5 Verify imports are clean and minimal

## Phase 5: Documentation

### 14. Code documentation

- [x] 14.1 Ensure JSDoc comments are present for all exported functions
- [x] 14.2 Update comments if class-specific language is present
- [x] 14.3 Verify example usage in comments is accurate

### 15. Final verification

- [x] 15.1 Confirm spec delta accurately reflects changes
- [x] 15.2 Confirm all tasks are completed
- [x] 15.3 Run validation: `openspec validate refactor-main-process-bridge-functional --strict`
