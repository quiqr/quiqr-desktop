# Design Document: Stabilize Collection Listing

## Context

The Collection listing component (`/packages/frontend/src/containers/WorkspaceMounted/Collection/index.tsx`) has critical stability and correctness issues affecting core user workflows: renaming, copying, converting to page bundles, and displaying YAML file collections. The component was partially migrated to TanStack Query for data fetching but mutations still use manual `setState` patterns and direct API calls, leading to stale data and inconsistent UI states.

**Current State:**
- Uses `useCollectionItems` hook for fetching collection items (✓ correct pattern)
- Uses `useWorkspaceDetails` and `useQuery` for related data (✓ correct pattern)
- Uses manual API calls (`api.renameCollectionItem`, `api.copyCollectionItem`, etc.) for mutations (✗ incorrect pattern)
- Manual `setState` for `modalBusy` state management (✗ incorrect pattern)
- Missing or incomplete cache invalidation after mutations (✗ root cause of refresh issues)
- TODO comments for error handling never implemented (`//TODO: warn someone!`)
- YAML file collections fail Zod validation causing console errors and infinite loops

**Related Files:**
- `/packages/frontend/src/containers/WorkspaceMounted/Collection/index.tsx` - Main component
- `/packages/frontend/src/queries/options.ts` - Query and mutation option factories
- `/packages/frontend/src/queries/hooks.ts` - Convenience hooks
- `/packages/frontend/types.ts` - Type definitions and Zod schemas
- `/packages/backend/src-main/bridge/api-main.js` - Backend API handlers

## Goals

1. **Fix all 8 identified problems** without introducing regressions
2. **Complete TanStack Query migration** for all collection mutations
3. **Ensure automatic cache invalidation** after all mutation operations
4. **Support YAML file collections** without validation errors or infinite loops
5. **Provide clear user feedback** for all operations (loading, success, error states)
6. **Improve type safety** by adding `isPageBundle` metadata to items

## Non-Goals

- Redesigning the Collection UI or UX
- Adding new features beyond bug fixes
- Changing the backend API contract (except adding `isPageBundle` metadata)
- Performance optimization (unless directly related to fixes)

## Decisions

### Decision 1: Complete TanStack Query Migration for Mutations

**What:** Replace all manual API calls in Collection component with TanStack Query mutation hooks.

**Why:**
- Mutations in `queries/options.ts` already have proper cache invalidation logic defined
- Using hooks ensures consistent state management and automatic refetch behavior
- Eliminates manual `setState` for `modalBusy`, leveraging `mutation.isPending` instead
- Provides built-in error handling via `mutation.error` and `mutation.isError`
- Follows project's frontend-state-management specification requirements

**How:**
```typescript
// BEFORE (manual pattern)
const renameCollectionItem = (itemKey: string, itemOldKey: string) => {
  setState(prev => ({ ...prev, modalBusy: true }));
  api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
    .then((result) => {
      if (result.renamed) {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      }
    });
};

// AFTER (mutation hook pattern)
const renameCollectionItemMutation = useRenameCollectionItem();

const renameCollectionItem = (itemKey: string, itemOldKey: string) => {
  renameCollectionItemMutation.mutate(
    { siteKey, workspaceKey, collectionKey, collectionItemKey: itemOldKey, collectionItemNewKey: itemKey },
    {
      onSuccess: () => {
        setState(prev => ({ ...prev, view: undefined }));
        // Cache automatically invalidated, list automatically refetches
      },
    }
  );
};

// Use mutation.isPending for modal busy state
<Dialog busy={renameCollectionItemMutation.isPending} ... />
```

**Alternatives Considered:**
- Keep manual API calls and add manual `queryClient.invalidateQueries()`: Rejected because it duplicates logic already in mutation options and is error-prone
- Create new convenience hooks: Not needed, existing hooks in `queries/hooks.ts` already cover all operations

**Trade-offs:**
- ✓ Automatic cache invalidation and refetch
- ✓ Consistent state management
- ✓ Less boilerplate code
- ✓ Better error handling
- ✗ Small refactor required in component

### Decision 2: Add `isPageBundle` Metadata to CollectionItem

**What:** Extend the `CollectionItem` type and backend API to include an `isPageBundle` boolean property.

**Why:**
- Fixes PROBLEM-4: Currently no way to determine if an item is already a page bundle
- Enables disabling "Make Page Bundle" menu item for items that are already bundles
- Prevents user confusion and invalid operations
- Backend already has this information (checks directory structure)

**Implementation:**
```typescript
// types.ts
export const CollectionItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  sortval: z.string(),
  isPageBundle: z.boolean().optional(), // Add this field
});

// backend: api-main.js listCollectionItems
// Add logic to detect page bundle structure (dir with index.md)
items = items.map(item => ({
  ...item,
  isPageBundle: isDirectoryWithIndexMd(item.path)
}));
```

**Alternatives Considered:**
- Detect page bundle status in frontend by checking item.key pattern: Rejected, unreliable heuristic
- Always allow "Make Page Bundle" and fail at backend: Rejected, poor UX

### Decision 3: Fix YAML Collection Validation with Schema Update

**What:** Update the `CollectionItem` Zod schema to properly handle YAML file metadata.

**Why:**
- PROBLEM-8: Current schema fails validation for YAML collections
- Console shows "[API Validation] Schema validation failed for listCollectionItems"
- Different file types may have slightly different metadata structures
- Schema should be flexible enough to handle all supported file types (md, yaml, json, etc.)

**How:**
- Review backend response for YAML collections
- Make additional properties optional in `CollectionItemSchema` if needed
- Add `.passthrough()` or `.catchall()` if backend includes extra metadata
- Update tests to validate YAML collections

**Trade-off:**
- ✓ Supports all file types
- ✗ May allow unexpected fields (mitigated by testing)

### Decision 4: Fix Infinite Loop with useEffect Dependencies

**What:** Stabilize the `useEffect` in Collection component that filters items.

**Why:**
- PROBLEM-8: "Maximum update depth exceeded" error occurs with YAML files
- Current useEffect dependencies include `items` and `state.filter`
- `resolveFilteredItems` is not memoized, causing it to be recreated every render
- Setting state inside useEffect with unstable dependencies causes infinite loop

**Solution:**
```typescript
// Wrap resolveFilteredItems with useCallback
const resolveFilteredItems = React.useCallback((items: CollectionItem[], filter: string) => {
  // ... implementation
}, []); // No dependencies needed, pure function

// useEffect now has stable dependencies
React.useEffect(() => {
  if (items) {
    const filteredData = resolveFilteredItems(items, state.filter);
    setState(prev => ({ ...prev, ...filteredData }));
  }
}, [items, state.filter, resolveFilteredItems]); // All stable
```

**Alternatives Considered:**
- Move filtering logic outside useEffect: Rejected, would require computing on every render
- Use `useMemo` instead of `useEffect`: Valid alternative, but current pattern works if dependencies are stable

### Decision 5: Improve User Feedback with Snackbar Notifications

**What:** Add snackbar notifications for all mutation success/error states.

**Why:**
- PROBLEM-2, PROBLEM-5, PROBLEM-6: Users don't know when operations fail
- Current implementation has TODO comments for error handling
- Silent failures lead to confusion (e.g., copy appears to do nothing)
- Success feedback confirms operations completed (especially for copy-to-language)

**Implementation:**
```typescript
const { addSnackMessage } = useSnackbar();

renameCollectionItemMutation.mutate(
  { ... },
  {
    onSuccess: () => {
      addSnackMessage('Item renamed successfully', { severity: 'success' });
      setState(prev => ({ ...prev, view: undefined }));
    },
    onError: (error) => {
      addSnackMessage(`Failed to rename item: ${error.message}`, { severity: 'error' });
    },
  }
);
```

**Trade-off:**
- ✓ Clear user feedback
- ✓ Improved error handling
- ✗ Slightly more verbose code

## Risks and Mitigations

### Risk 1: Breaking Existing Functionality During Refactor

**Mitigation:**
- Write tests BEFORE refactoring (test-first migration requirement from frontend-state-management spec)
- Test all 8 problems systematically after each fix
- Keep changes incremental (one problem at a time)
- Verify in both dev and Electron production builds

### Risk 2: Backend Changes Required for `isPageBundle`

**Mitigation:**
- Backend change is minimal (add one boolean property)
- Make frontend handle missing `isPageBundle` gracefully (default to false)
- Deploy backend changes first, then frontend

### Risk 3: Cache Invalidation Too Broad or Too Narrow

**Mitigation:**
- Follow existing patterns in `queries/options.ts` for invalidation
- Test that mutations properly refresh UI without extra network requests
- Use React Query DevTools in development to verify query states

### Risk 4: YAML Schema Changes Break Other Collections

**Mitigation:**
- Update schema incrementally (start with making fields optional)
- Test all collection types: md, yaml, json
- Verify no regressions in existing sites

## Migration Plan

### Phase 1: Foundation (Setup and Investigation)
1. Set up test sites (technative-rebuild, msa-packaging)
2. Reproduce all 8 problems with detailed notes
3. Write tests covering current behavior (even if broken)

### Phase 2: Query/Mutation Refactor (Core Fixes)
1. Fix infinite loop (useCallback for resolveFilteredItems)
2. Replace manual mutations with hooks (rename, copy, delete, makePageBundle)
3. Add snackbar notifications for all operations
4. Remove `modalBusy` state, use `mutation.isPending`

### Phase 3: Backend Schema Updates
1. Add `isPageBundle` to backend `listCollectionItems` response
2. Update `CollectionItem` Zod schema
3. Disable "Make Page Bundle" menu item for bundles

### Phase 4: YAML Support
1. Debug YAML validation errors
2. Update schema to support YAML metadata structure
3. Test YAML collections in msa-packaging site

### Phase 5: Testing and Documentation
1. Verify all 8 problems are resolved
2. Test error states and edge cases
3. Update proposal.md with root causes and solutions
4. Clean up TODO comments and obsolete code

### Rollback Plan
If critical issues emerge:
1. Revert to previous commit (keep changes in feature branch)
2. Deploy fix for highest priority issue only
3. Re-test remaining issues individually

## Open Questions

1. **Should we add optimistic updates?**
   - Current plan: No, automatic refetch is fast enough
   - Reconsider if: Users report slow refresh after mutations

2. **Should `isPageBundle` be computed on frontend or backend?**
   - Decision: Backend, it already has filesystem information
   - Avoids duplicating detection logic

3. **Should we add explicit "Refresh" button?**
   - Current plan: No, automatic refetch should be sufficient per TanStack Query patterns
   - Reconsider if: Users report confusion about refresh behavior

4. **Should we batch multiple mutations (e.g., rename multiple items)?**
   - Out of scope for this change
   - Add to backlog if users request it

## Success Metrics

- All 8 problems resolved and verified in test sites
- No regressions in existing collection operations
- YAML collections work without console errors
- User feedback (snackbars) appears for all operations
- Collection listing refreshes automatically after all mutations
- No infinite loops or maximum update depth errors
- "Make Page Bundle" menu item properly disabled for existing bundles
