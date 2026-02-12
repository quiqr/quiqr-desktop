# collection-management Specification Deltas

This document defines the delta changes for stabilizing collection listing functionality.

## ADDED Requirements

### Requirement: Collection List Automatic Refresh

The collection listing SHALL automatically refresh after any mutation operation (create, rename, copy, delete, convert to page bundle).

#### Scenario: Rename item refreshes list
- **WHEN** a collection item is renamed via `renameCollectionItem` mutation
- **THEN** the mutation SHALL invalidate the `listCollectionItems` query for that collection
- **AND** the collection listing SHALL automatically refetch and display updated data
- **AND** the renamed item SHALL appear with its new name in the list
- **AND** no manual refresh or navigation is required

#### Scenario: Copy item refreshes list
- **WHEN** a collection item is copied via `copyCollectionItem` mutation
- **THEN** the mutation SHALL invalidate the `listCollectionItems` query
- **AND** the collection listing SHALL automatically show the new copied item
- **AND** both original and copy SHALL appear in the list

#### Scenario: Copy to language refreshes list
- **WHEN** a collection item is copied to another language via `copyCollectionItemToLang` mutation
- **THEN** the mutation SHALL invalidate the `listCollectionItems` query
- **AND** the collection listing SHALL automatically refresh
- **AND** success feedback SHALL be shown to the user via snackbar
- **AND** the operation SHALL NOT cause application crash or white screen

#### Scenario: Delete item refreshes list
- **WHEN** a collection item is deleted via `deleteCollectionItem` mutation
- **THEN** the mutation SHALL invalidate the `listCollectionItems` query
- **AND** the deleted item SHALL be removed from the listing automatically
- **AND** no stale item entries remain visible

#### Scenario: Convert to page bundle refreshes list
- **WHEN** a markdown file is converted to page bundle via `makePageBundleCollectionItem` mutation
- **THEN** the mutation SHALL invalidate both the specific item query and the list query
- **AND** the collection listing SHALL show the updated item structure
- **AND** the item's bundle status SHALL be reflected in the UI

#### Scenario: Create item refreshes list
- **WHEN** a new collection item is created via `createCollectionItemKey` mutation
- **THEN** the mutation SHALL invalidate the `listCollectionItems` query
- **AND** the new item SHALL appear in the collection listing automatically
- **AND** user SHALL be navigated to the new item's edit page

### Requirement: YAML File Collection Support

The collection listing component SHALL support YAML file collections without validation errors or infinite render loops.

#### Scenario: List YAML files without validation errors
- **WHEN** a collection is configured with `extension: "yaml"` or `extension: "yml"`
- **THEN** the `listCollectionItems` API SHALL return valid `CollectionItem` data
- **AND** the Zod schema validation SHALL NOT fail
- **AND** no "[API Validation] Schema validation failed" errors SHALL appear in console
- **AND** all YAML items SHALL render in the list correctly

#### Scenario: No infinite render loops with YAML files
- **WHEN** YAML file collections are displayed
- **THEN** the component SHALL NOT enter infinite useEffect loops
- **AND** no "Maximum update depth exceeded" errors SHALL occur
- **AND** the `items` and `state.filter` dependencies in useEffect SHALL be correctly managed
- **AND** the `resolveFilteredItems` callback SHALL be stable (useCallback)

### Requirement: Page Bundle Detection and Menu Item State

The system SHALL detect page bundles correctly and control the "Make Page Bundle" menu item availability accordingly.

**Page Bundle Definition**: A page bundle in Hugo is a **directory** containing an `index.md` file (e.g., `about/index.md`). A standalone markdown file (e.g., `about.md`) is NOT a page bundle but CAN be converted to one.

**Backend Detection**: The backend SHALL set `isPageBundle: true` for collection items whose file path matches the pattern `/index\.(md|html|markdown|qmd)$`. This identifies files that are ALREADY page bundles (inside a directory structure).

**Frontend Logic**: The "Make Page Bundle" menu item SHALL be:
- **Hidden** when collection extension is NOT "md"
- **Disabled** when `item.isPageBundle === true` (already a bundle, cannot convert)
- **Enabled** when `item.isPageBundle === false` or undefined (standalone file, can be converted)

#### Scenario: Disable for existing page bundles
- **GIVEN** a collection item with path `about/index.md` has `isPageBundle: true`
- **WHEN** the collection item context menu is opened
- **THEN** the "Make Page Bundle" menu item SHALL be rendered as disabled
- **AND** a visual indicator SHALL show it's already a bundle (grayed out)

#### Scenario: Enable for standalone markdown files
- **GIVEN** a collection item with path `about.md` has `isPageBundle: false`
- **WHEN** the collection item context menu is opened
- **AND** the collection extension is "md"
- **THEN** the "Make Page Bundle" menu item SHALL be enabled and clickable
- **AND** clicking it SHALL open the conversion confirmation dialog
- **AND** after conversion, the file SHALL become `about/index.md` with `isPageBundle: true`

#### Scenario: Hide for non-markdown collections
- **WHEN** a collection item context menu is opened
- **AND** the collection extension is NOT "md" (e.g., "yaml", "json")
- **THEN** the "Make Page Bundle" menu item SHALL NOT be displayed at all

### Requirement: Mutation Error Handling and User Feedback

All collection mutations SHALL provide clear error handling and user feedback for both success and failure states.

#### Scenario: Display loading state during mutations
- **WHEN** any collection mutation is in progress (rename, copy, delete, convert)
- **THEN** the mutation's `isPending` state SHALL control loading indicators
- **AND** dialogs SHALL show loading spinners
- **AND** buttons SHALL be disabled during operations
- **AND** no manual `setState` for `modalBusy` is required

#### Scenario: Show success feedback
- **WHEN** a mutation completes successfully
- **THEN** a success message SHALL be displayed via snackbar
- **AND** the message SHALL be descriptive (e.g., "Copied item-name to language-code")
- **AND** the dialog SHALL close automatically
- **AND** the listing SHALL show updated data

#### Scenario: Show error feedback
- **WHEN** a mutation fails (network error, validation error, backend error)
- **THEN** an error message SHALL be displayed to the user
- **AND** the error message SHALL be user-friendly and actionable
- **AND** the dialog SHALL remain open to allow retry
- **AND** the mutation's `error` state SHALL be accessible for debugging

#### Scenario: Prevent operations on stale data
- **WHEN** a mutation is triggered
- **THEN** it SHALL use current query data as the source of truth
- **AND** it SHALL NOT rely on stale local state
- **AND** optimistic updates SHALL be avoided unless explicitly required

### Requirement: TanStack Query Integration

The Collection component SHALL use TanStack Query hooks for all data fetching and mutations, following the patterns defined in `frontend-state-management` spec.

#### Scenario: Use query hooks for data fetching
- **WHEN** the Collection component mounts
- **THEN** it SHALL use `useCollectionItems(siteKey, workspaceKey, collectionKey)` hook
- **AND** it SHALL use `useWorkspaceDetails(siteKey, workspaceKey)` hook
- **AND** it SHALL use `useQuery(siteQueryOptions.languages(...))` for languages
- **AND** loading states SHALL derive from `query.isLoading`
- **AND** no manual `useState` for loading/error/data is used for server state

#### Scenario: Use mutation hooks for operations
- **WHEN** the Collection component needs to mutate data
- **THEN** it SHALL use `useRenameCollectionItem()` for rename operations
- **AND** it SHALL use `useCopyCollectionItem()` for copy operations
- **AND** it SHALL use `useCopyCollectionItemToLang()` for copy-to-language operations
- **AND** it SHALL use `useDeleteCollectionItem()` for delete operations
- **AND** it SHALL use `useMakePageBundle()` for page bundle conversion
- **AND** mutation states SHALL derive from `mutation.isPending` and `mutation.error`

#### Scenario: Automatic cache invalidation
- **WHEN** any mutation succeeds
- **THEN** the mutation's `onSuccess` callback SHALL invalidate affected queries
- **AND** `listCollectionItems` query SHALL be invalidated for list-affecting operations
- **AND** specific item queries SHALL be invalidated for item-affecting operations
- **AND** automatic refetch SHALL occur without manual intervention

### Requirement: Collection Item Type Safety

The `CollectionItem` type SHALL include all necessary metadata for determining item state and capabilities.

#### Scenario: Include page bundle status
- **WHEN** collection items are fetched from the backend
- **THEN** each item SHALL include an `isPageBundle` boolean property
- **AND** the property SHALL be `true` if the item is a directory with index.md
- **AND** the property SHALL be `false` if the item is a single file
- **AND** frontend can use this property to control UI element states

#### Scenario: Include all required item metadata
- **WHEN** collection items are returned by `listCollectionItems` API
- **THEN** each item SHALL include `key`, `label`, `sortval` properties
- **AND** for YAML files, all standard properties SHALL be present
- **AND** the Zod schema in types.ts SHALL validate all item structures
- **AND** no items SHALL fail schema validation at runtime

