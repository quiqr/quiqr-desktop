# Implementation Tasks

## 1. Create New Functional Debounce Utility
- [x] 1.1 Rewrite `frontend/src/utils/debounce.ts` as functional utility
  - Export `createDebounce(delay: number)` factory function
  - Return object with `debounce(fn)` and `cancel()` methods
  - Use proper TypeScript types (`NodeJS.Timeout`, arrow functions)
  - Add JSDoc comments explaining usage

## 2. Write Comprehensive Tests
- [x] 2.1 Create test file `frontend/test/utils/debounce.test.ts`
- [x] 2.2 Test: Basic debounce delays execution (using vitest fake timers)
- [x] 2.3 Test: Rapid calls cancel previous timers
- [x] 2.4 Test: Cancel method clears pending execution
- [x] 2.5 Test: Multiple debounce instances are independent
- [x] 2.6 Ensure all tests pass: `cd frontend && npm test debounce`

## 3. Update Collection Component
- [x] 3.1 Update import in `Collection/index.tsx:29`
  - Change from: `import { Debounce } from './../../../utils/debounce'`
  - Change to: `import { createDebounce } from './../../../utils/debounce'`
- [x] 3.2 Update instance creation at line 239
  - Change from: `const filterDebounce = React.useRef(new Debounce(200))`
  - Change to: `const filterDebounce = React.useRef(createDebounce(200))`
- [x] 3.3 Update usage at line 488
  - Change from: `filterDebounce.current.run(() => { ... })`
  - Change to: `filterDebounce.current.debounce(() => { ... })`
- [x] 3.4 Update usage at line 522
  - Change from: `filterDebounce.current.run(() => { ... })`
  - Change to: `filterDebounce.current.debounce(() => { ... })`
- [x] 3.5 Add cleanup in useEffect to call `filterDebounce.current.cancel()` on unmount

## 4. Remove Unused Code
- [x] 4.1 Delete `frontend/src/components/HoForm/debounce.ts` (confirmed unused)

## 5. Validation
- [x] 5.1 Run TypeScript type check: `cd frontend && npx tsc --noEmit`
- [x] 5.2 Run all tests: `cd frontend && npm test`
- [x] 5.3 Manual test: Open Collection view and verify filter debouncing works
- [x] 5.4 Verify no console errors or warnings in dev mode
- [x] 5.5 Run frontend build to ensure no build errors: `npm run build:frontend`
