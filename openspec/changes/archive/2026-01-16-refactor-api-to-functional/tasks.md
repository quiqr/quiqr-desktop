# Implementation Tasks

## Phase 1: Create Comprehensive Tests (TDD Approach)

### 1. Set up test infrastructure

- [x] 1.1 Create `frontend/test/integration/api-client.test.ts`
- [x] 1.2 Import vitest test utilities (describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll)
- [x] 1.3 Import MSW for HTTP mocking (http, HttpResponse, setupServer)
- [x] 1.4 Import API class instance (current implementation)
- [x] 1.5 Set up MSW server with beforeAll/afterAll hooks

### 2. Write workspace operation tests

- [x] 2.1 Test getConfigurations method with options parameter
- [x] 2.2 Test listWorkspaces method with siteKey parameter
- [x] 2.3 Test mountWorkspace method with correct endpoint mapping
- [x] 2.4 Test getWorkspaceDetails with siteKey and workspaceKey
- [x] 2.5 Verify parameters are passed in request body under 'data' key

### 3. Write single content operation tests

- [x] 3.1 Test getSingle method with siteKey, workspaceKey, singleKey
- [x] 3.2 Test updateSingle method with document parameter
- [x] 3.3 Test saveSingle method with document parameter
- [x] 3.4 Test openSingleInEditor method
- [x] 3.5 Verify correct endpoint URLs are constructed

### 4. Write collection operation tests

- [x] 4.1 Test listCollectionItems with siteKey, workspaceKey, collectionKey
- [x] 4.2 Test getCollectionItem method
- [x] 4.3 Test createCollectionItemKey with all required parameters
- [x] 4.4 Test deleteCollectionItem method
- [x] 4.5 Test renameCollectionItem method

### 5. Write sync operation tests

- [x] 5.1 Test syncSite method endpoint mapping
- [x] 5.2 Test syncPull method
- [x] 5.3 Test syncCommit method with message parameter
- [x] 5.4 Test syncPush method

### 6. Write preferences operation tests

- [x] 6.1 Test readConfKey with generic type inference
- [x] 6.2 Test saveConfPrefKey method
- [x] 6.3 Test saveConfGeneralKey method
- [x] 6.4 Verify type-safe return types

### 7. Write special case tests

- [x] 7.1 Test stopHugoServer with custom timeout (100000ms)
- [x] 7.2 Test logToConsole with custom timeout (1000ms)
- [x] 7.3 Test methods with optional parameters
- [x] 7.4 Test deprecated methods (getFilteredHugoVersions)

### 8. Verify baseline tests pass

- [x] 8.1 Run tests against current class-based implementation: `cd frontend && npm test -- api-client`
- [x] 8.2 Verify all tests pass (proves tests are correct)
- [x] 8.3 Review test coverage report

## Phase 2: Refactor to Functional Module

### 9. Convert class to functional implementation

- [x] 9.1 Create API interface type definition at top of file
- [x] 9.2 Convert each class method to exported function (maintain exact signatures)
- [x] 9.3 Remove class syntax completely
- [x] 9.4 Remove singleton export: `export const instance = new API()`
- [x] 9.5 Add individual named exports for all 94 functions
- [x] 9.6 Maintain @deprecated JSDoc comments where present
- [x] 9.7 Verify all type annotations are preserved

### 10. Verify refactored implementation

- [x] 10.1 Run tests: `cd frontend && npm test -- api-client`
- [x] 10.2 Verify all tests still pass (behavior unchanged)
- [x] 10.3 Run TypeScript type check: `cd frontend && npx tsc --noEmit`
- [x] 10.4 Verify no new TypeScript errors

## Phase 3: Update Imports in Consuming Code

### 11. Update api-service.ts

- [x] 11.1 Remove import of `instance` from '../api'
- [x] 11.2 Add wildcard re-export: `export * from '../api'`
- [x] 11.3 Update function implementations to use direct imports
- [x] 11.4 Verify TypeScript compilation passes
- [x] 11.5 Verify existing service functions still work

### 12. Update useApiQuery.ts

- [x] 12.1 Update type import to reference API interface
- [x] 12.2 Verify type inference still works for method names
- [x] 12.3 Verify TypeScript compilation passes

### 13. Update useServiceData.ts

- [x] 13.1 Update import pattern from api.ts
- [x] 13.2 Update usage if needed
- [x] 13.3 Verify TypeScript compilation passes

### 14. Verify no other direct imports exist

- [x] 14.1 Search for remaining direct imports: `rg "from.*\.\./api'" frontend/src`
- [x] 14.2 Update any remaining direct imports
- [x] 14.3 Verify all imports compile successfully

## Phase 4: Comprehensive Validation

### 15. Run full test suite

- [x] 15.1 Run all frontend tests: `cd frontend && npm test`
- [x] 15.2 Verify all tests pass (including new api-client tests)
- [x] 15.3 Review test output for any warnings or errors

### 16. Type checking validation

- [x] 16.1 Run TypeScript type checking: `cd frontend && npx tsc --noEmit`
- [x] 16.2 Verify no TypeScript errors related to api.ts
- [x] 16.3 Verify no new type warnings

### 17. Runtime validation

- [x] 17.1 Run existing integration tests
- [x] 17.2 Verify API calls work correctly
- [x] 17.3 Verify no console errors related to API client

### 18. Code review

- [x] 18.1 Review all changed files for code quality
- [x] 18.2 Verify all function signatures match original exactly
- [x] 18.3 Verify @deprecated tags are preserved
- [x] 18.4 Confirm no console.log or debug code left in
- [x] 18.5 Verify imports are clean and minimal

## Phase 5: Documentation

### 19. Code documentation

- [x] 19.1 Ensure JSDoc comments are present where they existed before
- [x] 19.2 Update comments if class-specific language is present
- [x] 19.3 Verify @deprecated tags are accurate

### 20. Final verification

- [x] 20.1 Confirm spec delta accurately reflects changes
- [x] 20.2 Confirm all tasks are completed
- [x] 20.3 Run validation: `openspec validate refactor-api-to-functional --strict`
