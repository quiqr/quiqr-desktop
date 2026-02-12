# Change: Stabilize Collection Listing

## Why

The Collection listing component (`/packages/frontend/src/containers/WorkspaceMounted/Collection/index.tsx`) has multiple stability and correctness issues that cause poor user experience:

## Problem statement

- PROBLEM-1 renaming a markdown file, or pageBundle does not refresh the listing
- PROBLEM-2 renaming a markdown file, or pageBundle sometime doesn't work at all
- PROBLEM-3 converting a markdown file to a pageBundle is not working
- PROBLEM-4 when an item is already a pageBundle the menu item should be disabled
- PROBLEM-5 copy page to another language ends-up in a app crash and a white screen (in the electron version)
- PROBLEM-6 copy doesn't refresh
- PROBLEM-7 it's not clear when it is refreshed. switching to another menu item and back again doesn't refresh too.
- PROBLEM-8 listing yaml-files causes error messages

### Testing above problems except for the PROBLEM-8

Most of above problems can be tested in:

@/home/pim/Quiqr/sites/technative-rebuild can used to test all above problems.

### Testing the yaml-files

PROBLEM-8, the Yaml-files listing problem can be found in: @/home/pim/Quiqr/sites/msa-packaging:

In the collection `Package Sets` it should list yaml-files. This causes several error message in the frontend console.

including the first error:

```
main-process-bridge.ts:31 [API Validation] Schema validation failed for listCollectionItems: 
(3) [{…}, {…}, {…}]
validateApiResponse	@	main-process-bridge.ts:31
(anonymous)	@	main-process-bridge.ts:89
Promise.then		
(anonymous)	@	main-process-bridge.ts:86
request	@	main-process-bridge.ts:79
listCollectionItems	@	api.ts:252
queryFn	@	options.ts:80
<Collection>		
CollectionRoute	@	CollectionRoute.tsx:11
<CollectionRoute>		
AppContent	@	App.tsx:146
```

and:

```
index.tsx:309 Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## What Changes

### Root Causes Identified and Fixed

**PROBLEM-1 & 2 (Rename doesn't refresh/work)**: Manual `api.renameCollectionItem()` calls bypassed TanStack Query cache invalidation. Migrated to `useRenameCollectionItem()` mutation hook with automatic cache invalidation.

**PROBLEM-3 (Page bundle conversion not working)**: Manual `api.makePageBundleCollectionItem()` didn't trigger list refresh. Migrated to `useMakePageBundle()` mutation hook.

**PROBLEM-4 (Page bundle menu not disabled)**: Missing `isPageBundle` metadata in CollectionItem schema. Added backend detection for page bundles (`/index.md` files) and disabled menu item in frontend.

**PROBLEM-5 (Copy to language crash)**: Manual `api.copyCollectionItemToLang()` lacked error boundaries. Migrated to `useCopyCollectionItemToLang()` mutation hook with proper error handling.

**PROBLEM-6 (Copy doesn't refresh)**: Manual `api.copyCollectionItem()` bypassed cache. Migrated to `useCopyCollectionItem()` mutation hook.

**PROBLEM-7 (Unclear refresh state)**: No visual indicators during refetch. Added `LinearProgress` indicator when `isFetching || isRefetching`.

**PROBLEM-8 (YAML validation errors)**: CollectionItemSchema required `sortval: z.string()` but YAML items didn't have it. Made `sortval` optional and backend now always returns it (defaults to key for data folders).

### Additional Fixes

- **Delete snackbar**: Added success/error feedback to delete operation
- **Duplicate key prevention**: Added validation to prevent copying/renaming/creating items with existing keys
- **Hydration errors**: Fixed `DialogContentText` components to use `component="div"` instead of default `<p>` tag
- **Controlled input warning**: Fixed `EditItemKeyDialog` to initialize state with empty string instead of undefined
- **Bundle files error**: Fixed `getFilesInBundle` to return empty array instead of throwing errors or returning undefined
- **Mutation type safety**: Fixed TanStack Query mutation options to include all parameters in `onSuccess` variables type

### Implementation Details

All collection operations now use TanStack Query mutation hooks:
- ✅ deleteCollectionItem
- ✅ renameCollectionItem  
- ✅ copyCollectionItem
- ✅ copyCollectionItemToLang
- ✅ makePageBundleCollectionItem
- ✅ createCollectionItemKey

## Proposed Solution

Iterate through all problems, and when a problem is fixed document the root cause and solution in this openspec change. When the user has confirmed the fix, create specs to describe the correct functionality and create unit and/or integration tests to prevent future problems.
