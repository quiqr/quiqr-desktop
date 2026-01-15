# Design: Service Class to Functional Refactoring

## Context

The current service layer uses an object-oriented pattern with:
1. **BaseService abstract class** - Provides listener pattern and Zod validation
2. **Service singleton** - Extends BaseService, provides cached API calls
3. **UI service singletons** - SnackMessageService and ConsoleService for UI state

This pattern predates React hooks and uses manual subscription management instead of React's built-in state management capabilities.

## Goals

- Replace class-based services with functional modules and React hooks
- Eliminate the manual listener pattern in favor of React state management
- Maintain existing functionality (caching, validation, message buffering)
- Improve type safety and code maintainability
- Align with project conventions (functional TypeScript, no classes)

## Non-Goals

- Changing the API client (`api.ts`) - it stays as-is
- Modifying backend communication patterns
- Adding new features or capabilities
- Performance optimization (maintain current behavior)

## Decisions

### Decision 1: Validation Utilities

**Choice**: Extract Zod validation from BaseService into standalone utility functions

**Rationale**:
- Validation logic doesn't need class structure
- Can be pure functions: `validateResponse(schema, data) => validated`
- Easier to test in isolation
- Reusable across different contexts

**Implementation**:
```typescript
// utils/validation.ts
export function validateServiceResponse<T extends z.ZodType>(
  methodName: string,
  schema: T,
  response: unknown
): z.infer<T> {
  if (!schema) {
    console.warn(`No schema found for method: ${methodName}`);
    return response as z.infer<T>;
  }
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Schema validation failed for ${methodName}:`, error.errors);
      throw new Error(`Service response validation failed: ${error.message}`);
    }
    throw error;
  }
}
```

### Decision 2: Main Service Caching Strategy

**Choice**: Move Service class caching logic into custom hooks

**Rationale**:
- React hooks provide built-in mechanisms for caching (useMemo, useRef)
- Allows components to control cache lifecycle
- Better integration with React component lifecycle
- Automatic cleanup on unmount

**Alternatives considered**:
1. Keep singleton with getter functions - rejected because it maintains imperative API
2. Use external state management library (Redux, Zustand) - rejected as overkill for simple caching
3. Custom hooks with Context for sharing - selected for balance of simplicity and React patterns

**Implementation approach**:
```typescript
// hooks/useServiceData.ts
export function useConfigurations(refetch?: boolean) {
  const [data, setData] = useState<Configurations>();
  const promiseRef = useRef<Promise<Configurations>>();

  useEffect(() => {
    if (!data || refetch) {
      if (!promiseRef.current) {
        promiseRef.current = api.getConfigurations({ invalidateCache: refetch })
          .then(configs => {
            const validated = validateServiceResponse('getConfigurations', schema, configs);
            setData(validated);
            promiseRef.current = undefined;
            return validated;
          });
      }
    }
  }, [refetch]);

  return { data, loading: !data };
}
```

### Decision 3: UI Services State Management

**Choice**: Convert UI services to React Context providers with custom hooks

**Rationale**:
- Context API is React's standard pattern for shared state
- Eliminates need for manual listener management
- Automatic re-renders when state changes
- Clean subscription/unsubscription via useContext

**Architecture**:
```
App.tsx
  └─ SnackbarProvider
      └─ ConsoleProvider
          └─ App content
              └─ Components use hooks:
                  - useSnackbar()
                  - useConsole()
```

**Implementation pattern**:
```typescript
// contexts/SnackbarContext.tsx
interface SnackbarContextValue {
  currentMessage: SnackMessage | undefined;
  addMessage: (message: string, options: SnackOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }) {
  const [queue, setQueue] = useState<SnackMessage[]>([]);
  const [current, setCurrent] = useState<SnackMessage>();

  const addMessage = useCallback((message, options) => {
    setQueue(prev => [...prev, { message, ...options }]);
  }, []);

  // Auto-assign from queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);

  return (
    <SnackbarContext.Provider value={{ currentMessage: current, addMessage }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be within SnackbarProvider');
  return context;
}
```

### Decision 4: Migration Strategy

**Choice**: Phased migration with backward compatibility layer (temporary)

**Phase 1**: Create new functional implementations alongside existing classes
**Phase 2**: Add Context providers to App.tsx
**Phase 3**: Update components one-by-one to use hooks
**Phase 4**: Remove old class-based services once all consumers migrated

**Rationale**:
- Minimizes risk of breaking changes
- Allows testing new implementation before full migration
- Can be done incrementally across multiple PRs if needed

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing components | High | Phased migration with compatibility layer |
| Lost caching optimization | Medium | Replicate existing cache behavior in hooks |
| Message buffering complexity | Medium | Preserve existing throttling logic in Context |
| Testing effort | Low | Add tests for new hooks and contexts |

## Migration Plan

1. **Create new implementations**:
   - `utils/validation.ts` - Validation utilities
   - `contexts/SnackbarContext.tsx` - Snackbar state management
   - `contexts/ConsoleContext.tsx` - Console state management
   - `hooks/useServiceData.ts` - Service data fetching hooks

2. **Add providers to App.tsx**:
   - Wrap app with SnackbarProvider and ConsoleProvider

3. **Update consumer components** (3 files with listeners):
   - Console/index.tsx - Use useConsole hook
   - SnackbarManager.tsx - Use useSnackbar hook
   - Collection/index.tsx - Remove service listener

4. **Update import statements** (50+ files):
   - Change `import service from './services/service'` to functional imports
   - Most files only use `service.api` which can be re-exported

5. **Remove old files**:
   - Delete base-service.ts
   - Delete service.ts class implementation
   - Delete ui-service.ts class implementations

6. **Testing**:
   - Add unit tests for validation utilities
   - Add tests for Context providers
   - Integration test for message queue behavior
   - Verify no regressions in caching behavior

## Open Questions

1. Should we create a single ServiceProvider that wraps all contexts, or keep them separate?
   - **Decision**: Keep separate for flexibility and clarity

2. Should `service.api` be re-exported from the service module or imported directly?
   - **Decision**: Re-export for backward compatibility during migration

3. Do we need to maintain promise deduplication for `getSiteAndWorkspaceData`?
   - **Decision**: Yes, replicate the same promise caching behavior to avoid duplicate API calls
