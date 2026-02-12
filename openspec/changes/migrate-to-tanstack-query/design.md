# Design: TanStack Query Migration

## Architectural Overview

This design document captures the architectural decisions and patterns for migrating from manual state management to TanStack Query for all API interactions in the Quiqr Desktop frontend.

## Design Goals

1. **Eliminate Boilerplate**: Remove 200+ lines of manual loading/error/success state management
2. **Type Safety**: Maintain compile-time and runtime type validation
3. **Consistency**: Establish single pattern for all data fetching
4. **Backward Compatibility**: Allow gradual migration without breaking existing code
5. **Developer Experience**: Make adding new API calls trivial

## Architecture Decisions

### AD-1: Query Options Factory Pattern

**Decision**: Use query options factories instead of inline useQuery calls

**Rationale**:
- **Reusability**: Options can be used in components, Router loaders, and prefetching
- **Testability**: Options are plain objects that can be tested independently
- **Type Safety**: Query keys and return types are co-located with queryFn
- **Discoverability**: All queries documented in one file

**Pattern**:
```typescript
// packages/frontend/src/queries/options.ts
export const workspaceQueryOptions = {
  details: (siteKey: string, workspaceKey: string) => ({
    queryKey: ['getWorkspaceDetails', siteKey, workspaceKey] as const,
    queryFn: () => api.getWorkspaceDetails(siteKey, workspaceKey),
    staleTime: 30 * 1000, // 30 seconds
  }),
};

// In component
const { data, isLoading, error } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
```

**Alternatives Considered**:
- ❌ Custom hooks (useWorkspaceDetails): Adds abstraction layer, hides TanStack Query API
- ❌ Inline useQuery calls: Duplicates query keys, harder to maintain
- ❌ Single queryOptions object: Too large, hard to navigate

### AD-2: Shared Type Organization

**Decision**: All API request/response types must live in `packages/types/src/types/api.ts`

**Rationale**:
- **Single Source of Truth**: Types defined once, used in frontend and backend
- **Type Safety**: Changes to types break compilation immediately
- **Package Boundaries**: Clear separation between packages
- **Zod Integration**: Types derive from Zod schemas in same package

**Structure**:
```
packages/types/
├── src/
│   ├── types/
│   │   ├── index.ts          # Core domain types
│   │   └── api.ts            # API request/response types (NEW)
│   ├── schemas/
│   │   ├── api.ts            # Zod schemas for API validation
│   │   ├── fields.ts         # Field schemas
│   │   └── ...
│   └── index.ts              # Main export
```

**Import Hierarchy**:
```
@quiqr/types (no external deps)
    ↓
@quiqr/backend (imports from @quiqr/types)
    ↓
@quiqr/frontend (imports from @quiqr/types)
```

**Alternatives Considered**:
- ❌ Types in backend package: Frontend can't import backend in Node mode
- ❌ Duplicate types in each package: Maintenance nightmare, no type safety
- ❌ Types co-located with usage: Violates DRY, breaks contract

### AD-3: Cache Invalidation Strategy

**Decision**: Mutation options include automatic cache invalidation in `onSuccess` callbacks

**Rationale**:
- **Consistency**: All mutations follow same pattern
- **Correctness**: Impossible to forget invalidation
- **Performance**: Granular invalidation only affects related queries
- **Debugging**: Easy to trace what gets invalidated

**Pattern**:
```typescript
export const collectionMutationOptions = {
  updateItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {...}) => api.updateCollectionItem(...),

    onSuccess: (_data, variables) => {
      // Invalidate specific item
      queryClient.invalidateQueries({
        queryKey: ['getCollectionItem', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
      // Invalidate list (item might appear in list differently)
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),
};
```

**Invalidation Rules**:
1. Invalidate **specific item** when mutating that item
2. Invalidate **list queries** when item might affect list rendering
3. Invalidate **parent queries** when mutations might affect parent state
4. Use **partial query keys** for broad invalidation (e.g., all workspace queries)

**Alternatives Considered**:
- ❌ Manual invalidation in components: Error-prone, inconsistent
- ❌ Global refetch on any mutation: Performance impact
- ❌ No invalidation: Stale data issues

### AD-4: Stale Time Configuration

**Decision**: Configure stale times per operation type, not globally

**Rationale**:
- **Flexibility**: Different data has different freshness requirements
- **Performance**: Reduce unnecessary refetches
- **UX**: Balance freshness vs loading indicators

**Stale Time Guidelines**:
| Data Type | Stale Time | Rationale |
|-----------|------------|-----------|
| Content (singles, collections) | 30 seconds | Changes frequently during editing |
| Workspace details | 30 seconds | Build status changes often |
| Site configuration | 2 minutes | Rarely changes during session |
| User preferences | 5 minutes | Rarely changes |
| Logs | 10 seconds | Time-sensitive debugging data |
| SSG versions | 24 hours | External data, changes rarely |
| Languages | 5 minutes | Rarely changes |

**Pattern**:
```typescript
export const singleQueryOptions = {
  detail: (siteKey: string, workspaceKey: string, singleKey: string) => ({
    queryKey: ['getSingle', siteKey, workspaceKey, singleKey] as const,
    queryFn: () => api.getSingle(siteKey, workspaceKey, singleKey),
    staleTime: 30 * 1000, // 30 seconds - content changes frequently
  }),
};
```

**Alternatives Considered**:
- ❌ Single global stale time: One size doesn't fit all
- ❌ No stale time (always refetch): Poor UX, excessive requests
- ❌ Infinite stale time (never refetch): Stale data issues

### AD-5: Query vs Imperative Operations

**Decision**: Not all API calls should be queries; some operations are imperative

**Criteria for Query**:
- ✅ Fetches data for display
- ✅ Needs loading/error state in UI
- ✅ Data might become stale
- ✅ Multiple components might need same data

**Criteria for Imperative (Direct API Call)**:
- ✅ Side effect only (no return value needed)
- ✅ Fire-and-forget operation
- ✅ Logging, analytics, telemetry
- ✅ Opening external editors

**Examples**:

**Query**:
```typescript
// ✅ Fetching workspace details - needs loading state, can become stale
const { data: workspace, isLoading } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
```

**Imperative**:
```typescript
// ✅ Logging - fire-and-forget, no UI state needed
const handleError = (error: Error) => {
  service.api.logToConsole('error', error.message);
  // Continue with error handling
};

// ✅ Open in editor - side effect, no return value
const handleEdit = () => {
  service.api.openSingleInEditor(siteKey, workspaceKey, singleKey);
};
```

**Alternatives Considered**:
- ❌ Everything is a query: Unnecessary complexity for side effects
- ❌ Everything is imperative: Loses benefits of TanStack Query

### AD-6: Convenience Hooks (Optional Layer)

**Decision**: Provide optional convenience hooks in `queries/hooks.ts` but prefer direct query options

**Rationale**:
- **Simplicity**: Direct query options are more explicit
- **Flexibility**: Direct options allow customization (e.g., refetchInterval)
- **Learning Curve**: Developers familiar with TanStack Query prefer direct API
- **Migration Path**: Hooks ease transition from old patterns

**When to Use Convenience Hooks**:
- ✅ Common query patterns used in many places
- ✅ Complex query orchestration (multiple dependent queries)
- ✅ Default options appropriate for all use cases

**When to Use Direct Query Options**:
- ✅ One-off or unique queries
- ✅ Need to customize options (staleTime, refetchInterval, etc.)
- ✅ Using in Router loaders
- ✅ Prefetching

**Example**:
```typescript
// Convenience hook - good for common patterns
const { workspace, isLoading } = useWorkspaceDetails(siteKey, workspaceKey);

// Direct query options - more control
const { data: workspace, isLoading } = useQuery({
  ...workspaceQueryOptions.details(siteKey, workspaceKey),
  refetchInterval: 5000, // Custom refetch for this usage
});
```

### AD-7: Error Handling Strategy

**Decision**: Use TanStack Query's error states, with optional global error handler

**Rationale**:
- **Component Control**: Each component decides how to display errors
- **Consistency**: Errors follow TanStack Query patterns
- **Debugging**: Query DevTools show all errors

**Pattern**:
```typescript
const { data, isLoading, error } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <WorkspaceView data={data} />;
```

**Global Error Handler** (Optional):
```typescript
// In QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // Log to console (already happens via main-process-bridge)
        console.error('Query error:', error);
      },
    },
  },
});
```

**Alternatives Considered**:
- ❌ Error boundaries only: Loses component control
- ❌ Global error handler only: All-or-nothing approach
- ❌ Try-catch around queries: Doesn't work with useQuery

### AD-8: Migration Strategy

**Decision**: Gradual component-by-component migration with both patterns coexisting

**Rationale**:
- **Risk Mitigation**: Small changes, test frequently
- **Flexibility**: Can pause migration if issues arise
- **Learning**: Team learns patterns before wide adoption
- **No Breaking Changes**: Old code continues working

**Migration Phases**:
1. **Infrastructure** (Complete): Query options, types, setup
2. **Proof of Concept** (Complete): Preferences
3. **High-Value Components**: SiteLibrary, Prefs, Workspace
4. **Batch Migration**: Remaining components in groups
5. **Cleanup**: Remove old patterns
6. **Documentation**: Update guides

**Coexistence Pattern**:
```typescript
// Old pattern - still works
useEffect(() => {
  service.api.getWorkspaceDetails(siteKey, workspaceKey)
    .then(data => setWorkspace(data))
    .catch(err => setError(err));
}, [siteKey, workspaceKey]);

// New pattern - preferred
const { data: workspace } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
```

**Alternatives Considered**:
- ❌ Big bang migration: Too risky, hard to debug
- ❌ Maintain both patterns long-term: Confusing, inconsistent
- ❌ Forced migration deadline: Artificial pressure

## Component Patterns

### Pattern 1: Simple Read-Only Component

```typescript
function WorkspaceView({ siteKey, workspaceKey }: Props) {
  const { data: workspace, isLoading, error } = useQuery(
    workspaceQueryOptions.details(siteKey, workspaceKey)
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!workspace) return null;

  return <div>{workspace.name}</div>;
}
```

**Migration**: Replace `useEffect` + `useState` with `useQuery`

### Pattern 2: Component with Mutation

```typescript
function CollectionItemEditor({ siteKey, workspaceKey, collectionKey, itemKey }: Props) {
  const queryClient = useQueryClient();

  // Query for data
  const { data: item, isLoading } = useQuery(
    collectionQueryOptions.item(siteKey, workspaceKey, collectionKey, itemKey)
  );

  // Mutation for updates
  const updateMutation = useMutation(collectionMutationOptions.updateItem(queryClient));

  const handleSave = (document: Record<string, unknown>) => {
    updateMutation.mutate({
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey: itemKey,
      document,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(formData); }}>
      {/* form fields */}
      <button disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Saving...' : 'Save'}
      </button>
      {updateMutation.error && <ErrorMessage error={updateMutation.error} />}
    </form>
  );
}
```

**Migration**: Replace `useState` + `service.api.update` with `useMutation`

### Pattern 3: Multiple Queries

```typescript
function WorkspaceDashboard({ siteKey, workspaceKey }: Props) {
  const workspaceQuery = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
  const configQuery = useQuery(siteQueryOptions.config(siteKey));
  const languagesQuery = useQuery(siteQueryOptions.languages(siteKey, workspaceKey));

  const isLoading = workspaceQuery.isLoading || configQuery.isLoading || languagesQuery.isLoading;
  const error = workspaceQuery.error || configQuery.error || languagesQuery.error;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{workspaceQuery.data.name}</h1>
      <Config config={configQuery.data} />
      <Languages languages={languagesQuery.data} />
    </div>
  );
}
```

**Migration**: Replace multiple `useEffect` hooks with multiple `useQuery` calls

### Pattern 4: Dependent Queries

```typescript
function CollectionList({ siteKey, workspaceKey }: Props) {
  // First, get workspace details
  const { data: workspace } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));

  // Then, get collection items (only if workspace loaded)
  const collectionKey = workspace?.collections[0]?.key;
  const { data: items } = useQuery({
    ...collectionQueryOptions.items(siteKey, workspaceKey, collectionKey!),
    enabled: !!collectionKey, // Only run if collectionKey exists
  });

  return items ? <ItemList items={items} /> : null;
}
```

**Migration**: Use `enabled` option for dependent queries

## Type Safety Patterns

### Pattern 1: Type Inference from API

```typescript
// Types automatically inferred from api method return type
const { data: workspace } = useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
//    ^^^^^^^^^^^^^ TypeScript knows this is WorkspaceDetails

// No need for manual typing:
// ❌ const { data: workspace }: { data: WorkspaceDetails } = useQuery(...)
```

### Pattern 2: Shared Types in Options

```typescript
// In packages/types/src/types/api.ts
export interface LogQueryOptions {
  date?: string;
  level?: LogLevel;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// In packages/frontend/src/queries/options.ts
import { LogQueryOptions } from '@quiqr/types';

export const logQueryOptions = {
  application: (options: LogQueryOptions) => ({
    queryKey: ['getApplicationLogs', options] as const,
    queryFn: () => api.getApplicationLogs(options),
    staleTime: 10 * 1000,
  }),
};
```

### Pattern 3: Type-Safe Query Keys

```typescript
// ✅ Query keys as const for type inference
queryKey: ['getWorkspaceDetails', siteKey, workspaceKey] as const,

// ❌ Not as const - loses type information
queryKey: ['getWorkspaceDetails', siteKey, workspaceKey],
```

## Performance Considerations

### Caching Strategy
- **Default**: Stale-while-revalidate pattern
- **Cache Time**: 5 minutes (TanStack Query default)
- **Stale Time**: Varies by data type (see AD-4)
- **Garbage Collection**: Automatic after cache time expires

### Network Optimization
- **Deduplication**: Automatic for concurrent identical queries
- **Background Refetch**: Happens automatically when stale
- **Prefetching**: Use `queryClient.prefetchQuery(options)` for predictive fetching
- **Parallel Queries**: Multiple `useQuery` calls automatically parallelize

### Memory Management
- **Subscription**: Queries automatically unsubscribe when components unmount
- **Cache Cleanup**: Unused queries removed after cache time
- **DevTools**: Monitor cache size in development

## Testing Strategy

### Unit Testing Query Options

```typescript
import { describe, it, expect, vi } from 'vitest';
import { workspaceQueryOptions } from './options';
import * as api from '../api';

describe('workspaceQueryOptions', () => {
  it('should generate correct query key', () => {
    const options = workspaceQueryOptions.details('site1', 'workspace1');
    expect(options.queryKey).toEqual(['getWorkspaceDetails', 'site1', 'workspace1']);
  });

  it('should call correct API method', async () => {
    const spy = vi.spyOn(api, 'getWorkspaceDetails').mockResolvedValue({ name: 'Test' });
    const options = workspaceQueryOptions.details('site1', 'workspace1');

    await options.queryFn();

    expect(spy).toHaveBeenCalledWith('site1', 'workspace1');
  });
});
```

### Integration Testing with QueryClient

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { workspaceQueryOptions } from './options';

it('should fetch workspace data', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(
    () => useQuery(workspaceQueryOptions.details('site1', 'workspace1')),
    { wrapper }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({ name: 'Test Workspace' });
});
```

## Migration Checklist

For each component being migrated:

**Phase 0: Test Verification (REQUIRED FIRST)**
- [ ] Check if component has tests in `packages/frontend/test/`
- [ ] If NO tests: Write tests for current behavior
  - [ ] Test data fetching on mount
  - [ ] Test loading states
  - [ ] Test error states
  - [ ] Test mutations (if applicable)
  - [ ] Test UI interactions
- [ ] Run tests: `cd packages/frontend && npm test -- [test-file]`
- [ ] Verify all tests pass BEFORE migration

**Phase 1: Analysis**
- [ ] Identify all `service.api.*` calls
- [ ] Determine if operation is query, mutation, or imperative
- [ ] Find or create query/mutation options in `options.ts`

**Phase 2: Migration**
- [ ] Replace `useState` for loading/error/data with query state
- [ ] Replace `useEffect` for fetching with `useQuery`
- [ ] Replace manual API calls with `useMutation`
- [ ] Remove manual cache invalidation (let mutation options handle it)
- [ ] Verify TypeScript types are correct

**Phase 3: Validation (REQUIRED)**
- [ ] Run tests again - MUST pass
- [ ] Test loading states (manual)
- [ ] Test error states (manual)
- [ ] Test success states (manual)
- [ ] Test cache invalidation
- [ ] Check for any performance regressions
- [ ] TypeScript compilation succeeds
- [ ] No functionality regressions

**Phase 4: PR**
- [ ] Create small, focused PR (1-5 components max)
- [ ] Include test additions if written
- [ ] Reference OpenSpec proposal
- [ ] PR title: `feat(tanstack-query): migrate [ComponentName] to TanStack Query`

## Future Enhancements

### Phase 8: Query Persistence (Optional)
- Persist query cache to localStorage
- Restore cache on app restart
- Offline support

### Phase 9: Optimistic Updates (Optional)
- Add optimistic updates for mutations
- Rollback on error
- Improve perceived performance

### Phase 10: Prefetching (Optional)
- Prefetch on hover
- Prefetch on route navigation
- Reduce perceived latency

### Phase 11: Query Cancellation (Optional)
- Cancel in-flight queries on unmount
- Cancel on new query with same key
- Improve performance

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Query Best Practices by TkDodo](https://tkdodo.eu/blog/practical-react-query)
- [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
- [React Query and TypeScript](https://tkdodo.eu/blog/react-query-and-type-script)
