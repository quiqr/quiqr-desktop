# Proposal: Migrate to TanStack Query

## Problem Statement

The frontend currently uses manual state management for API calls with explicit `useState` hooks for loading, error, and data states. This creates:

1. **Code Duplication**: 67 instances of manual error handling (`setError`), 95+ `useState` calls in components, 144+ in containers
2. **Inconsistent Patterns**: Multiple approaches to cache invalidation, loading states, and error handling across 81 container components
3. **Type Safety Gaps**: Query options in `packages/frontend/src/queries/options.ts` use inline types instead of shared types from `packages/types/`
4. **Maintenance Burden**: Adding new API calls requires boilerplate for loading/error/success states in every component

## Current State

### Already Completed (Commits 0fbd4a3f, a69cd778, 609d9d10, 12598d53)
- ✅ TanStack Query infrastructure installed and configured
- ✅ Query and mutation options factories created in `packages/frontend/src/queries/options.ts`
- ✅ Proof of concept: Preferences migrated successfully
- ✅ Partial migration: 5 components (Workspace.tsx, Single.tsx, CollectionItem.tsx, Collection/index.tsx, PrefsGeneral.tsx)
- ✅ Automatic cache invalidation patterns in mutation options

### Remaining Work
- ❌ 76+ container components still using `service.api.*` directly
- ❌ 30+ scattered direct API calls with manual state management
- ❌ Shared types scattered between backend and frontend packages
- ❌ Query options use inline types instead of importing from `@quiqr/types`
- ❌ Old hooks (`useServiceData.ts`, `useApiQuery.ts`) still present and creating confusion

## Proposed Solution

Complete the TanStack Query migration across the entire frontend codebase by:

1. **Consolidating Shared Types**: Move all API request/response types to `packages/types/` package
2. **Updating Query Options**: Refactor `queries/options.ts` to use shared types from `@quiqr/types`
3. **Migrating Components**: Replace manual state management with TanStack Query hooks in remaining components
4. **Removing Legacy Code**: Delete old wrapper hooks and manual state management utilities
5. **Standardizing Patterns**: Document and enforce consistent patterns for data fetching

## Scope

### In Scope
- Migrating all 76+ remaining container components to TanStack Query
- Moving shared API types to `packages/types/src/types/api.ts`
- Refactoring query/mutation options to use shared types
- Deleting legacy hooks (`useServiceData.ts`)
- Updating documentation with new patterns
- Writing tests for components BEFORE migration (where missing)
- Validating migrations with existing tests

### Out of Scope
- Changing backend API contracts or response formats
- Refactoring the SukohForm dynamic form system
- Adding new API endpoints
- Performance optimizations beyond standard TanStack Query features

### PR Strategy

**This spec will be implemented across MULTIPLE SMALL PRs, not one large PR.**

Each PR should:
- Migrate 1-5 related components maximum
- Include test coverage verification/addition BEFORE migration
- Include validation that tests pass AFTER migration
- Be independently reviewable in < 30 minutes
- Reference this OpenSpec proposal in commit message

Example PR sequence:
1. **PR 1**: Type consolidation (Phase 1)
2. **PR 2**: PrefsAdvanced component + tests
3. **PR 3**: Complete Workspace.tsx migration
4. **PR 4**: SiteLibrary useSiteOperations hook
5. **PR 5**: SiteLibrary CRUD dialogs (3-4 dialogs)
6. ... (continue with small, focused PRs)

Each PR title format: `feat(tanstack-query): migrate [ComponentName] to TanStack Query`

## Benefits

### Developer Experience
- **Reduced Boilerplate**: Eliminate 200+ lines of manual state management code
- **Type Safety**: Compile-time and runtime validation of API types
- **Consistency**: Standardized patterns for all data fetching operations
- **Better DevTools**: TanStack Query DevTools for debugging cache and queries

### Code Quality
- **Maintainability**: Single source of truth for query configurations
- **Testability**: Easier to test with query options factories
- **Error Handling**: Centralized error handling patterns
- **Cache Management**: Automatic cache invalidation and synchronization

### User Experience
- **Perceived Performance**: Optimistic updates and background refetching
- **Reliability**: Automatic retries and stale-while-revalidate patterns
- **Offline Support**: Query cache persists across navigation

## Dependencies

### Technical Dependencies
- TanStack Query v5.x (already installed)
- TypeScript 5.x for type inference
- Zod schemas in `@quiqr/types` package

### Spec Dependencies
This change affects the following specs:
- **frontend-components**: How components fetch and manage data
- **type-system**: Organization of shared types
- **communication-layer**: Standardized query patterns

## Risks and Mitigations

### Risk: Breaking Existing Functionality
**Mitigation**:
- Migrate incrementally, testing each component
- Keep old patterns coexisting until all migrations complete
- Run full test suite after each phase

### Risk: Type Import Cycles
**Mitigation**:
- Establish clear import hierarchy: types → backend → frontend
- Use index.ts barrel exports to control dependencies
- Document import patterns in AGENTS.md

### Risk: Cache Invalidation Bugs
**Mitigation**:
- Review all query keys for consistency
- Test mutation side effects thoroughly
- Use TanStack Query DevTools during development

### Risk: Developer Confusion During Transition
**Mitigation**:
- Document both old and new patterns during transition
- Add code comments marking deprecated patterns
- Update AGENTS.md with migration guide

## Timeline Estimate

Based on the exploration, this work breaks down into:

1. **Type Consolidation**: Move ~20 type definitions (2-3 work sessions)
2. **Query Options Update**: Refactor options.ts (1 work session)
3. **Test Coverage Audit**: Identify gaps (1 session)
4. **Component Migration**: 76+ components
   - **Per component**: 30-60 minutes (including test writing/verification)
   - **Batched in PRs**: 1-5 components per PR
   - **Total**: 15-25 work sessions depending on test coverage gaps
5. **Testing & Validation**: Comprehensive testing (2-3 work sessions)
6. **Cleanup**: Remove legacy code and documentation (1 work session)

**Total**: Approximately 22-36 work sessions

**PR Strategy**: 15-25 small PRs (not one large PR)

**Note**: Timeline assumes ~50% of components need tests written before migration. If test coverage is better, timeline reduces. If worse, timeline increases.

## Success Criteria

### Functional Criteria
- ✅ All 81 container components use TanStack Query
- ✅ Zero direct `service.api.*` calls in component render logic
- ✅ All query/mutation options use shared types from `@quiqr/types`
- ✅ Legacy hooks (`useServiceData.ts`) deleted
- ✅ Full test coverage maintained or improved

### Quality Criteria
- ✅ TypeScript compilation with no errors
- ✅ Consistent query key patterns across all queries
- ✅ Automatic cache invalidation working correctly
- ✅ Error handling consistent across all components
- ✅ No regression in functionality

### Documentation Criteria
- ✅ AGENTS.md updated with TanStack Query patterns
- ✅ Example components documented
- ✅ Type import hierarchy documented
- ✅ Migration guide for future developers

## Alternatives Considered

### Alternative 1: Keep Manual State Management
**Rejected**: Does not address code duplication, inconsistency, or maintenance burden

### Alternative 2: Custom React Query Wrapper
**Rejected**: Adds abstraction layer, hides TanStack Query features, harder to maintain

### Alternative 3: Zustand or Redux for State
**Rejected**: These are for client state, not server state. TanStack Query is purpose-built for API data.

### Alternative 4: React Context + useReducer
**Rejected**: Requires manual cache management, no built-in stale/refetch logic

## Related Work

### Completed Work
- Commit 0fbd4a3f: Port all API methods to TanStack Query client
- Commit a69cd778: Move preferences over to TanStack Query
- Commit 609d9d10: Fix tests
- Commit 12598d53: Move workspace to use Tanstack Query

### Future Work
- TanStack Query DevTools integration (Phase 5)
- Query persistence for offline mode (Phase 6)
- Performance monitoring and optimization (Phase 7)

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- `packages/frontend/src/queries/options.ts` - Current implementation
- `TANSTACK_QUERY_MIGRATION_HANDOFF.md` - Detailed migration plan
