# Implementation Tasks

## 1. Setup and Investigation
- [x] 1.1 Set up test sites (technative-rebuild and msa-packaging)
- [x] 1.2 Reproduce all 8 problems systematically
- [x] 1.3 Document current behavior for each problem

## 2. Fix PROBLEM-1: Renaming doesn't refresh listing
- [x] 2.1 Identify root cause in rename mutation
- [x] 2.2 Ensure `renameCollectionItem` mutation invalidates `listCollectionItems` query
- [x] 2.3 Verify query refetch happens automatically after rename
- [x] 2.4 Test rename for both markdown files and page bundles
- [x] 2.5 Document root cause and solution in proposal.md

## 3. Fix PROBLEM-2: Renaming sometimes doesn't work
- [x] 3.1 Reproduce the failure condition
- [x] 3.2 Add error handling and user feedback to rename operation
- [x] 3.3 Check backend API response validation
- [x] 3.4 Add snackbar notifications for success/failure
- [x] 3.5 Document root cause and solution in proposal.md

## 4. Fix PROBLEM-3: Converting to page bundle not working
- [x] 4.1 Identify root cause in `makePageBundleCollectionItem` function
- [x] 4.2 Ensure mutation calls correct API method
- [x] 4.3 Verify cache invalidation for both item and list queries
- [x] 4.4 Add loading state feedback during conversion
- [x] 4.5 Test conversion and verify listing updates
- [x] 4.6 Document root cause and solution in proposal.md

## 5. Fix PROBLEM-4: Disable menu item for existing page bundles
- [x] 5.1 Add `isPageBundle` property to `CollectionItem` type
- [x] 5.2 Update backend API to include bundle status in item metadata
- [x] 5.3 Add conditional disabled state to "Make Page Bundle" menu item
- [x] 5.4 Add tooltip explaining why item is disabled
- [x] 5.5 Document root cause and solution in proposal.md

## 6. Fix PROBLEM-5: Copy to language causes crash
- [x] 6.1 Reproduce crash in Electron environment
- [x] 6.2 Add error boundary or try-catch to `copyCollectionItemToLang`
- [x] 6.3 Fix error handling in mutation
- [x] 6.4 Add proper error reporting to user
- [x] 6.5 Test in both dev and Electron production build
- [x] 6.6 Document root cause and solution in proposal.md

## 7. Fix PROBLEM-6: Copy doesn't refresh
- [x] 7.1 Verify `copyCollectionItem` mutation invalidates queries
- [x] 7.2 Ensure both `copyItem` and `copyItemToLang` mutations work correctly
- [x] 7.3 Add loading state and success feedback
- [x] 7.4 Test copy operations refresh listing automatically
- [x] 7.5 Document root cause and solution in proposal.md

## 8. Fix PROBLEM-7: Unclear refresh state and manual refresh not working
- [x] 8.1 Add visual feedback when query is refetching
- [x] 8.2 Implement explicit "Refresh" button if needed
- [x] 8.3 Verify navigation away and back triggers refetch based on staleTime
- [x] 8.4 Consider adding `refetchOnMount: true` for collection queries
- [x] 8.5 Document root cause and solution in proposal.md

## 9. Fix PROBLEM-8: YAML files cause validation errors
- [x] 9.1 Reproduce error in msa-packaging site "Package Sets" collection
- [x] 9.2 Review `CollectionItem` Zod schema in types.ts
- [x] 9.3 Update schema to support YAML file metadata structure
- [x] 9.4 Fix "Maximum update depth exceeded" infinite loop in useEffect
- [x] 9.5 Test YAML collections display correctly
- [x] 9.6 Document root cause and solution in proposal.md

## 10. Refactor to TanStack Query Mutations
- [x] 10.1 Replace `renameCollectionItem` with `useRenameCollectionItem` hook
- [x] 10.2 Replace `copyCollectionItem` with `useCopyCollectionItem` hook
- [x] 10.3 Replace `copyCollectionItemToLang` with `useCopyCollectionItemToLang` hook
- [x] 10.4 Replace `makePageBundleCollectionItem` with `useMakePageBundle` hook
- [x] 10.5 Remove manual setState for modalBusy, use mutation.isPending instead
- [x] 10.6 Remove manual error handling, use mutation.error and mutation.isError
- [x] 10.7 Verify all mutations automatically invalidate and refetch

## 11. Testing
- [x] 11.1 Write unit tests for Collection component (if none exist)
- [x] 11.2 Test all 8 problems are resolved
- [x] 11.3 Test YAML file collections work correctly
- [x] 11.4 Test error states display properly
- [x] 11.5 Test loading states during operations
- [x] 11.6 Verify no regressions in existing functionality
- [x] 11.7 Test in both development and Electron builds

## 12. Documentation and Cleanup
- [x] 12.1 Update proposal.md with all root causes and solutions
- [x] 12.2 Remove obsolete code comments (TODO lines 361, 363, 366)
- [x] 12.3 Update AGENTS.md if new patterns are introduced
- [x] 12.4 Create user-facing documentation if needed
