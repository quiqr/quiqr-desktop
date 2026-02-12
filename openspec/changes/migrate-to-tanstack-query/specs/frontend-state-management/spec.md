# Frontend State Management Specification Delta

## Purpose

Define requirements for managing server state in frontend components using TanStack Query.

## ADDED Requirements

### Requirement: TanStack Query for Server State

All frontend components SHALL use TanStack Query for managing server state (API data).

#### Scenario: Component fetches data
- **WHEN** a component needs to display data from the backend API
- **THEN** it uses `useQuery` with query options from `queries/options.ts`
- **AND** loading state is derived from `query.isLoading`
- **AND** error state is derived from `query.error`
- **AND** data is derived from `query.data`
- **AND** no manual `useState` hooks are used for loading/error/data

#### Scenario: Component mutates data
- **WHEN** a component needs to create, update, or delete data
- **THEN** it uses `useMutation` with mutation options from `queries/options.ts`
- **AND** pending state is derived from `mutation.isPending`
- **AND** error state is derived from `mutation.error`
- **AND** mutation triggers automatic cache invalidation via `onSuccess`
- **AND** no manual `useState` hooks are used for mutation state

#### Scenario: Imperative operations
- **WHEN** an operation is a side effect with no return value
- **THEN** it uses direct `service.api.method()` call
- **AND** operation is fire-and-forget (logging, analytics, opening editor)
- **AND** operation does NOT require loading/error state in UI
- **AND** a code comment explains why it's not a query/mutation

### Requirement: Query Options Factory Pattern

All API queries and mutations SHALL be defined as factory functions in `packages/frontend/src/queries/options.ts`.

#### Scenario: Creating a query option
- **WHEN** adding a new API endpoint that returns data
- **THEN** a query option factory is added to `options.ts`
- **AND** factory returns an object with `queryKey`, `queryFn`, and `staleTime`
- **AND** `queryKey` is a const tuple including all dependencies
- **AND** `queryFn` calls the corresponding `api.method()`
- **AND** `staleTime` is set based on data freshness requirements

#### Scenario: Creating a mutation option
- **WHEN** adding a new API endpoint that mutates data
- **THEN** a mutation option factory is added to `options.ts`
- **AND** factory accepts `QueryClient` as parameter
- **AND** factory returns an object with `mutationFn` and `onSuccess`
- **AND** `mutationFn` calls the corresponding `api.method()`
- **AND** `onSuccess` invalidates affected queries using `queryClient.invalidateQueries()`

#### Scenario: Using query options in components
- **WHEN** a component needs to fetch data
- **THEN** it imports the query option factory from `queries/options.ts`
- **AND** calls `useQuery(queryOptions.method(params))`
- **AND** TypeScript infers types from API method return type
- **AND** query options can be reused in multiple components

### Requirement: Cache Invalidation Strategy

All mutations SHALL automatically invalidate affected queries to maintain data consistency.

#### Scenario: Invalidating specific item
- **WHEN** a mutation updates a specific item
- **THEN** `onSuccess` invalidates queries for that item using exact query key
- **AND** uses `queryClient.invalidateQueries({ queryKey: [...] })`
- **AND** query key matches the query key used in `useQuery`

#### Scenario: Invalidating related data
- **WHEN** a mutation affects multiple queries
- **THEN** `onSuccess` invalidates all affected queries
- **AND** includes list queries if item might appear in lists
- **AND** includes parent queries if mutation affects parent state
- **AND** uses partial query keys for broad invalidation when appropriate

#### Scenario: Verifying invalidation
- **WHEN** a mutation completes
- **THEN** all invalidated queries refetch automatically
- **AND** UI updates to show new data
- **AND** no manual refetch calls are needed in components

### Requirement: Stale Time Configuration

Query options SHALL configure appropriate stale times based on data characteristics.

#### Scenario: Frequently changing data
- **WHEN** data changes frequently (content, workspace state)
- **THEN** stale time is set to 30 seconds
- **AND** queries refetch in background when stale
- **AND** UI shows cached data immediately while refetching

#### Scenario: Rarely changing data
- **WHEN** data changes rarely (configuration, SSG versions)
- **THEN** stale time is set to 5 minutes or more
- **AND** reduces unnecessary network requests
- **AND** improves perceived performance

#### Scenario: Time-sensitive data
- **WHEN** data is time-sensitive (logs, real-time state)
- **THEN** stale time is set to 10 seconds or less
- **AND** ensures users see current data
- **AND** balances freshness with network usage

### Requirement: Test-First Migration

Components SHALL have test coverage BEFORE migration to TanStack Query to validate the migration preserves functionality.

#### Scenario: Component has existing tests
- **WHEN** a component is selected for migration
- **THEN** existing tests are verified to run successfully
- **AND** tests cover key functionality (data fetching, mutations, error states)
- **AND** migration proceeds only after tests pass
- **AND** tests are updated to work with TanStack Query patterns
- **AND** tests still pass after migration

#### Scenario: Component lacks tests
- **WHEN** a component selected for migration has no tests
- **THEN** tests are written BEFORE migration begins
- **AND** tests cover data fetching behavior
- **AND** tests cover loading and error states
- **AND** tests cover mutation operations (if applicable)
- **AND** tests verify UI behavior with mocked API responses
- **AND** tests pass before migration starts

#### Scenario: Validating migration success
- **WHEN** a component has been migrated to TanStack Query
- **THEN** all existing tests are run
- **AND** tests pass without modification (or with minimal test setup changes)
- **AND** no new bugs are introduced
- **AND** functionality is preserved
- **AND** test coverage is maintained or improved

### Requirement: Error Handling

Components SHALL handle query and mutation errors using TanStack Query's error states.

#### Scenario: Query error handling
- **WHEN** a query fails
- **THEN** component checks `query.error`
- **AND** renders appropriate error message
- **AND** TanStack Query automatically retries (default 3 times)
- **AND** error is logged via main-process-bridge

#### Scenario: Mutation error handling
- **WHEN** a mutation fails
- **THEN** component checks `mutation.error`
- **AND** displays error message to user
- **AND** cache is not invalidated
- **AND** user can retry the mutation

#### Scenario: Global error handling
- **WHEN** any query or mutation fails
- **THEN** error is logged via main-process-bridge
- **AND** error appears in TanStack Query DevTools (development)
- **AND** component-level error handling takes precedence

## MODIFIED Requirements

None. This is a new capability.

## REMOVED Requirements

### Requirement: Manual State Management for API Calls (REMOVED)

~~Components SHALL use `useState` hooks to manage loading, error, and data states for API calls.~~

**Reason**: Replaced by TanStack Query, which manages these states automatically.

### Requirement: useEffect for Data Fetching (REMOVED)

~~Components SHALL use `useEffect` hooks to trigger API calls on mount or dependency changes.~~

**Reason**: Replaced by `useQuery` which handles dependency tracking automatically.

### Requirement: Manual Cache Invalidation (REMOVED)

~~Components SHALL manually trigger data refetch after mutations by calling fetch functions.~~

**Reason**: Replaced by automatic cache invalidation in mutation options.

## Migration Notes

### Backward Compatibility
- Old pattern (`service.api.*` + `useState`) continues to work during migration
- Both patterns can coexist in the same application
- Components can be migrated incrementally without breaking changes

### Migration Path
1. Add query option factory to `queries/options.ts`
2. Replace `useEffect` + `useState` with `useQuery` in component
3. Replace manual API calls with `useMutation` for mutations
4. Remove manual state management code
5. Test component functionality
6. Verify cache invalidation works

### Testing Requirements
- Unit tests for query option factories
- Integration tests for cache invalidation
- Component tests for loading/error/success states
- Type checking validation

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- `packages/frontend/src/queries/options.ts` - Query options implementation
- Design document: `openspec/changes/migrate-to-tanstack-query/design.md`
