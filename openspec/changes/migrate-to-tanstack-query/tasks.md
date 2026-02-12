# Tasks: Migrate to TanStack Query

## Overview

This document breaks down the TanStack Query migration into ordered, verifiable work items. Each task is designed to deliver user-visible progress while maintaining working functionality.

## Migration Workflow (Per Component)

**Every component migration MUST follow this workflow:**

1. **Test First** ⚠️ CRITICAL
   - Check if component has tests
   - If NO tests: Write tests for current behavior
   - If HAS tests: Verify tests pass
   - Tests must cover: data fetching, mutations, loading states, error states

2. **Migrate**
   - Replace manual state management with TanStack Query
   - Update imports and hooks
   - Remove `useState` for loading/error/data

3. **Validate**
   - Run tests - they MUST pass
   - Manual testing of component
   - TypeScript compilation
   - No regressions

4. **PR**
   - Small, focused PR (1-5 related components max)
   - Include test additions in same PR if written
   - Reference this OpenSpec proposal
   - PR format: `feat(tanstack-query): migrate [ComponentName] to TanStack Query`

**Why test-first?**
Without tests, there's no way to validate the migration preserved functionality. Tests are not optional - they are the validation mechanism.

## Phase 1: Type System Consolidation ✅ COMPLETED

### Task 1.1: Audit Type Locations ✅
- **Goal**: Identify all types currently scattered between frontend and backend
- **Validation**: Document created with type locations and dependencies
- **Dependencies**: None
- **Status**: Completed in exploration phase

### Task 1.2: Move Shared API Types to @quiqr/types ⏭️ NEXT
- **Goal**: Centralize all API request/response types in `packages/types/src/types/api.ts`
- **Actions**:
  - Create `packages/types/src/types/api.ts` if not exists
  - Move `LogQueryOptions` from `packages/backend/src/logging/types.ts` to api.ts
  - Move `BuildConfig`, `ExtraBuildConfig`, `GitPublishConf` if not already in types package
  - Export all types from `packages/types/src/index.ts`
  - Update imports in backend to use `@quiqr/types`
  - Update imports in frontend to use `@quiqr/types`
- **Validation**:
  - TypeScript compilation succeeds: `cd packages/frontend && npx tsc --noEmit`
  - Backend TypeScript checking passes (if applicable)
  - No duplicate type definitions remain
- **Dependencies**: None
- **Estimated Time**: 1 work session

### Task 1.3: Update Query Options to Use Shared Types
- **Goal**: Refactor `packages/frontend/src/queries/options.ts` to import types from `@quiqr/types`
- **Actions**:
  - Replace inline type definitions in `logQueryOptions` with `LogQueryOptions` from `@quiqr/types`
  - Replace inline types in `workspaceMutationOptions.build` with shared `ExtraBuildConfig`
  - Replace inline types in `publisherMutationOptions.dispatch` with shared `GitPublishConf`
  - Review all other query/mutation options for inline types
  - Add JSDoc comments referencing shared types
- **Validation**:
  - TypeScript compilation succeeds
  - No inline type definitions remain in options.ts (except for simple param objects)
  - Types are imported from `@quiqr/types` at top of file
- **Dependencies**: Task 1.2
- **Estimated Time**: 1 work session

### Task 1.4: Rebuild Types Package
- **Goal**: Ensure types package is built and published to local npm
- **Actions**:
  - Run `npm run build -w @quiqr/types`
  - Verify build output in `packages/types/dist/`
  - Test import in frontend: `import { LogQueryOptions } from '@quiqr/types'`
- **Validation**:
  - Build succeeds without errors
  - Types are importable in frontend and backend
- **Dependencies**: Task 1.2
- **Estimated Time**: 15 minutes

## Phase 2: High-Priority Component Migrations

### Task 2.0: Test Coverage Audit (REQUIRED FIRST)
- **Goal**: Identify test coverage gaps before any component migration
- **Actions**:
  - Run test coverage: `cd packages/frontend && npm test -- --coverage`
  - Review coverage report for containers directory
  - Create list of components with NO tests
  - Create list of components with PARTIAL tests
  - Prioritize test writing for high-priority components
  - Document findings
- **Validation**:
  - Coverage report generated
  - List of untested components created
  - Test writing priorities established
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 30 minutes
- **Note**: This is a ONE-TIME audit, not per component

### Task 2.1: Migrate PrefsAdvanced Component
- **Goal**: Complete migration of preferences to TanStack Query
- **File**: `packages/frontend/src/containers/Prefs/PrefsAdvanced.tsx`
- **Actions**:
  - **FIRST**: Check if component has tests in `packages/frontend/test/`
  - **IF NO TESTS**: Write tests for current behavior (before migration):
    - Test data fetching on mount
    - Test preference save operations
    - Test loading states
    - Test error handling
    - Run tests and verify they pass
  - **IF HAS TESTS**: Run tests and verify they pass
  - **THEN MIGRATE**:
    - Replace `service.api.readConfKey('prefs')` with `useQuery(prefsQueryOptions.all())`
    - Replace `service.api.saveConfPrefKey()` with `useMutation(prefsMutationOptions.save(queryClient))`
    - Remove manual loading/error state useState hooks
    - Update UI to use query.isLoading, query.error states
  - **AFTER MIGRATION**: Run tests again to validate
- **Validation**:
  - Tests exist and pass BEFORE migration
  - Component renders correctly
  - Loading states display properly
  - Preferences save successfully
  - Cache invalidation works (changes appear immediately)
  - Tests pass AFTER migration
  - No TypeScript errors
  - No functionality regressions
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 1.5-2 work sessions (including test writing if needed)
- **PR**: Single PR with test additions (if any) and migration

### Task 2.2: Complete Workspace.tsx Migration
- **Goal**: Finish partial migration started in commit 609d9d10
- **File**: `packages/frontend/src/containers/WorkspaceMounted/Workspace.tsx`
- **Actions**:
  - Migrate remaining `service.api.checkSSGVersion()` call to `useQuery(ssgQueryOptions.versionCheck())`
  - Remove any manual state management for SSG checks
  - Verify all workspace queries use TanStack Query
- **Validation**:
  - SSG version checking works
  - Workspace loads correctly
  - Build/serve operations work
  - No direct service.api calls remain
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 30 minutes

### Task 2.3: Complete Single.tsx Migration
- **Goal**: Remove remaining direct API calls
- **File**: `packages/frontend/src/containers/WorkspaceMounted/Single.tsx`
- **Actions**:
  - Review remaining `service.api` calls (openSingleInEditor, logToConsole)
  - Determine if these need query options or can stay as imperative calls
  - Document decision in code comments
  - Migrate any calls that should be queries
- **Validation**:
  - Single content editing works
  - Save operations work
  - Build operations work
  - Only imperative operations use direct API calls (with comments explaining why)
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 30 minutes

### Task 2.4: Complete CollectionItem.tsx Migration
- **Goal**: Remove remaining direct API calls
- **File**: `packages/frontend/src/containers/WorkspaceMounted/Collection/CollectionItem.tsx`
- **Actions**:
  - Review remaining `service.api` calls for file operations
  - Migrate file upload/delete to mutation options if not already done
  - Remove manual state management
- **Validation**:
  - Collection item editing works
  - File operations work
  - Save operations work
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 30 minutes

## Phase 3: SiteLibrary Component Migrations (High Value)

### Task 3.1: Migrate useSiteOperations Hook
- **Goal**: Convert site operations to use TanStack Query mutations
- **File**: `packages/frontend/src/containers/SiteLibrary/useSiteOperations.ts`
- **Actions**:
  - Replace `service.api.mountWorkspace()` with `useMutation(workspaceMutationOptions.mount())`
  - Replace `service.api.listWorkspaces()` with `useQuery(workspaceQueryOptions.list())`
  - Update return values to provide mutation functions
  - Update error handling to use mutation.error
- **Validation**:
  - Mount workspace works
  - Workspace list loads correctly
  - Error handling works
- **Dependencies**: Phase 1 complete
- **Estimated Time**: 1 work session

### Task 3.2: Migrate Site CRUD Dialogs
- **Goal**: Convert site create/copy/delete dialogs to use TanStack Query
- **Files**:
  - `packages/frontend/src/containers/SiteLibrary/DeleteSiteDialog.tsx`
  - `packages/frontend/src/containers/SiteLibrary/CopySiteDialog.tsx`
  - `packages/frontend/src/containers/SiteLibrary/RenameSiteDialog.tsx`
  - Other dialog files as identified
- **Actions**:
  - Replace manual API calls with mutation hooks
  - Remove manual loading/error state
  - Update to use mutation.isPending, mutation.error
  - Ensure cache invalidation triggers site list refresh
- **Validation**:
  - Site creation works
  - Site copying works
  - Site deletion works
  - Site list refreshes after operations
  - Loading states display correctly
  - Error messages display correctly
- **Dependencies**: Task 3.1
- **Estimated Time**: 2 work sessions

### Task 3.3: Migrate Site Import Operations
- **Goal**: Convert import dialogs to use TanStack Query
- **Files**:
  - `packages/frontend/src/containers/SiteLibrary/ImportFromUrl.tsx` (if exists)
  - `packages/frontend/src/containers/SiteLibrary/ImportFromFolder.tsx` (if exists)
  - Other import-related files
- **Actions**:
  - Create mutation options for import operations if not exists
  - Replace manual API calls with mutation hooks
  - Update loading/error states
- **Validation**:
  - Import from URL works
  - Import from folder works
  - Progress indicators work
  - Error handling works
- **Dependencies**: Task 3.1
- **Estimated Time**: 1-2 work sessions

## Phase 4: Remaining Container Migrations

### Task 4.1: Audit Remaining Components
- **Goal**: Create comprehensive list of components needing migration
- **Actions**:
  - Run grep search: `rg "service\.api\." packages/frontend/src/containers/`
  - Categorize by priority and complexity
  - Group related components
  - Identify parallel work opportunities
- **Validation**:
  - Complete list of components with line numbers
  - Priority ranking assigned
  - Dependencies identified
- **Dependencies**: Phase 3 complete
- **Estimated Time**: 1 hour

### Task 4.2: Migrate Batch 1 - Simple Query Components
- **Goal**: Migrate components with only read operations (no mutations)
- **Actions**:
  - Identify components that only fetch data (no create/update/delete)
  - Replace useEffect + service.api with useQuery
  - Remove manual loading/error state
  - Test each component
- **Validation**:
  - All components render correctly
  - Data loads correctly
  - Loading states work
  - Error states work
  - No TypeScript errors
- **Dependencies**: Task 4.1
- **Estimated Time**: 2-3 work sessions

### Task 4.3: Migrate Batch 2 - Mutation Components
- **Goal**: Migrate components with create/update/delete operations
- **Actions**:
  - Identify components with mutations
  - Add mutation options to options.ts if missing
  - Replace manual API calls with useMutation
  - Implement cache invalidation in onSuccess
  - Remove manual state management
  - Test each component
- **Validation**:
  - All mutations work correctly
  - Cache invalidation triggers refetches
  - Optimistic updates work (if implemented)
  - Error handling works
  - Loading states work
- **Dependencies**: Task 4.2
- **Estimated Time**: 4-6 work sessions

### Task 4.4: Migrate Batch 3 - Complex Components
- **Goal**: Migrate components with complex state or multiple queries
- **Actions**:
  - Identify components with multiple queries or complex dependencies
  - Plan query orchestration (parallel vs sequential)
  - Implement with useQueries if needed
  - Test thoroughly
- **Validation**:
  - All queries execute correctly
  - Dependencies between queries work
  - Component functionality unchanged
  - Performance is acceptable
- **Dependencies**: Task 4.3
- **Estimated Time**: 3-4 work sessions

## Phase 5: Testing and Validation

### Task 5.1: Add Query Options Tests
- **Goal**: Ensure query/mutation options have test coverage
- **File**: `packages/frontend/test/queries/options.test.ts` (create if not exists)
- **Actions**:
  - Write tests for query key generation
  - Write tests for queryFn execution
  - Write tests for mutation cache invalidation
  - Mock api.* methods
  - Test error handling
- **Validation**:
  - All tests pass
  - Coverage for all query/mutation factories
  - Edge cases covered
- **Dependencies**: Phase 4 complete
- **Estimated Time**: 2 work sessions

### Task 5.2: Integration Testing
- **Goal**: Verify end-to-end functionality with TanStack Query
- **Actions**:
  - Manual testing of key user flows
  - Test cache invalidation across components
  - Test error handling across components
  - Test loading states
  - Verify no regressions
- **Validation**:
  - All user flows work
  - No console errors
  - Performance is acceptable
  - No memory leaks
- **Dependencies**: Phase 4 complete
- **Estimated Time**: 2 work sessions

### Task 5.3: Type Checking Validation
- **Goal**: Ensure all TypeScript types are correct
- **Actions**:
  - Run `cd packages/frontend && npx tsc --noEmit`
  - Fix any type errors
  - Verify type inference works correctly
  - Check for any `@ts-ignore` comments added during migration
- **Validation**:
  - TypeScript compilation succeeds with no errors
  - No type assertions used unnecessarily
  - No @ts-ignore comments (or documented if necessary)
- **Dependencies**: Phase 4 complete
- **Estimated Time**: 1 work session

## Phase 6: Cleanup and Documentation

### Task 6.1: Remove Legacy Hooks
- **Goal**: Delete old wrapper hooks no longer needed
- **Files**:
  - `packages/frontend/src/hooks/useServiceData.ts` (141 lines) - DELETE
  - `packages/frontend/src/hooks/useApiQuery.ts` - Already deleted
  - Any other wrapper hooks identified
- **Actions**:
  - Verify no imports remain
  - Delete files
  - Update index.ts if needed
  - Run git grep to find any remaining references
- **Validation**:
  - Files deleted
  - No import errors
  - Application builds successfully
- **Dependencies**: Phase 4 complete
- **Estimated Time**: 30 minutes

### Task 6.2: Update AGENTS.md Documentation
- **Goal**: Document new TanStack Query patterns for AI assistants
- **File**: `AGENTS.md`
- **Actions**:
  - Add section on TanStack Query usage patterns
  - Document query options factory pattern
  - Provide example component migrations
  - Document type import hierarchy
  - Add examples of imperative vs query operations
- **Validation**:
  - Documentation is clear and comprehensive
  - Examples are correct and runnable
  - Import hierarchy is documented
- **Dependencies**: Phase 5 complete
- **Estimated Time**: 1 work session

### Task 6.3: Update Developer Documentation
- **Goal**: Update Docusaurus docs with TanStack Query patterns
- **File**: `packages/docs/docs/developer-guide/frontend-architecture.md` (or similar)
- **Actions**:
  - Document TanStack Query integration
  - Explain query options pattern
  - Show example components
  - Document cache invalidation strategy
  - Add troubleshooting section
- **Validation**:
  - Documentation builds without errors
  - Examples are accurate
  - Links work correctly
- **Dependencies**: Phase 5 complete
- **Estimated Time**: 1 work session

### Task 6.4: Add TanStack Query DevTools (Optional Enhancement)
- **Goal**: Integrate TanStack Query DevTools for development
- **File**: `packages/frontend/src/App.tsx` or `main.tsx`
- **Actions**:
  - Import ReactQueryDevtools
  - Add to component tree (development only)
  - Configure position and default open state
  - Test functionality
- **Validation**:
  - DevTools appear in development mode
  - DevTools do not appear in production build
  - DevTools show all queries correctly
- **Dependencies**: Phase 5 complete
- **Estimated Time**: 30 minutes

## Phase 7: Final Review and Cleanup

### Task 7.1: Code Review Checklist
- **Goal**: Systematic review of all changes
- **Actions**:
  - Review all modified files for consistency
  - Check for any TODO comments added during migration
  - Verify error handling is consistent
  - Check for performance issues
  - Look for unused imports
- **Validation**:
  - All TODOs resolved or documented
  - No performance regressions
  - Code style is consistent
- **Dependencies**: Phase 6 complete
- **Estimated Time**: 1 work session

### Task 7.2: Update TANSTACK_QUERY_MIGRATION_HANDOFF.md
- **Goal**: Mark migration as complete
- **File**: `TANSTACK_QUERY_MIGRATION_HANDOFF.md`
- **Actions**:
  - Update status to "COMPLETE"
  - Add completion date
  - Document any deviations from original plan
  - Add lessons learned section
  - Archive or delete file
- **Validation**:
  - File updated or archived
- **Dependencies**: All phases complete
- **Estimated Time**: 15 minutes

### Task 7.3: Git Commit and PR
- **Goal**: Commit all changes and create pull request
- **Actions**:
  - Stage all changes
  - Write comprehensive commit message
  - Create PR with summary and test plan
  - Reference this OpenSpec proposal
  - Request code review
- **Validation**:
  - PR created successfully
  - CI tests pass
  - Code review feedback addressed
- **Dependencies**: Task 7.2
- **Estimated Time**: 30 minutes

## Summary

### Total Tasks: 26
### Completed: 1 (audit)
### Remaining: 25
### Parallelizable: Tasks within each phase can often run in parallel (e.g., migrating different components simultaneously)

### Critical Path
1. Phase 1 (Type consolidation) must complete first
2. Phase 2-3 can partially overlap
3. Phase 4 requires Phase 2-3 complete
4. Phase 5-7 are sequential

### Dependencies Highlight
- **No external blockers**: All work can be done within the repository
- **Type package rebuild**: Must rebuild after type changes in Phase 1
- **Testing cadence**: Test after each component migration, full suite after each phase
