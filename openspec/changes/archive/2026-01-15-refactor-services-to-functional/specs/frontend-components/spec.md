# Frontend Components Spec Delta

## ADDED Requirements

### Requirement: Service Module Pattern
Frontend service modules SHALL use functional patterns with React hooks and Context API rather than class-based singleton services.

#### Scenario: API service modules use functional exports
- **GIVEN** a service module that wraps API calls or provides data fetching
- **WHEN** implementing the service module
- **THEN** it MUST export functions as named exports, not class instances
- **AND** it MUST use React hooks (useState, useEffect, useMemo) for state and caching
- **AND** it MUST NOT use class syntax with constructor or methods
- **AND** it MAY re-export the API client for backward compatibility

#### Scenario: Validation utilities are pure functions
- **GIVEN** service responses need validation with Zod schemas
- **WHEN** implementing validation logic
- **THEN** it MUST be implemented as pure utility functions
- **AND** it MUST accept schema and data as parameters
- **AND** it MUST return validated, typed data
- **AND** it MUST NOT use class-based validation patterns

#### Scenario: State management uses React Context
- **GIVEN** shared state needs to be accessed across multiple components
- **WHEN** implementing state management (e.g., snackbar messages, console output)
- **THEN** it MUST use React Context API with Provider components
- **AND** it MUST provide custom hooks for consuming the context (e.g., useSnackbar, useConsole)
- **AND** it MUST NOT use manual listener registration/unregistration patterns
- **AND** component re-renders MUST be triggered automatically by React state changes

#### Scenario: Data fetching uses custom hooks
- **GIVEN** components need to fetch and cache data from the backend
- **WHEN** implementing data fetching logic
- **THEN** it MUST be implemented as custom hooks (e.g., useConfigurations, useSiteData)
- **AND** it MUST use useState for data storage
- **AND** it MUST use useRef for promise deduplication if needed
- **AND** it MUST use useEffect for triggering fetches
- **AND** it MUST return loading state and data to consumers

### Requirement: Legacy Listener Pattern Removal
The manual listener pattern (registerListener/unregisterListener) SHALL be completely removed from service modules in favor of React's built-in state management.

#### Scenario: No listener registration methods
- **GIVEN** a service or utility module
- **WHEN** implementing or refactoring the module
- **THEN** it MUST NOT export registerListener or unregisterListener methods
- **AND** it MUST NOT maintain an internal array of listener components
- **AND** it MUST NOT call forceUpdate on components

#### Scenario: Components use hooks for updates
- **GIVEN** a component needs to respond to service state changes
- **WHEN** implementing the component
- **THEN** it MUST use hooks (useContext, useState, custom hooks) to access state
- **AND** it MUST NOT manually register/unregister as a listener
- **AND** React MUST automatically re-render the component when state changes

#### Scenario: Context providers wrap application
- **GIVEN** the application root (App.tsx)
- **WHEN** setting up state management contexts
- **THEN** Context providers MUST wrap the application tree
- **AND** providers MUST be ordered correctly (outer to inner based on dependencies)
- **AND** all child components MUST have access to context via hooks

## MODIFIED Requirements

### Requirement: Utility Module Pattern
Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods or class-with-instance-methods patterns.

#### Scenario: Utility functions exported as named exports
- **GIVEN** a utility module that provides helper functions
- **WHEN** the module does not render UI or use React hooks directly
- **THEN** it MUST export functions as named exports
- **AND** it MUST NOT use class syntax with static methods
- **AND** it MUST NOT use class syntax with instance methods
- **AND** it MAY use const exports for constant values

#### Scenario: Service modules are functional
- **GIVEN** a service module that provides data fetching or API wrapping
- **WHEN** the module needs to manage state or cache data
- **THEN** it MUST provide React hooks for components to use
- **AND** it MAY export utility functions for non-React usage
- **AND** it MUST NOT export class instances or singletons

#### Scenario: Import utility modules
- **GIVEN** a component needs to use utility functions
- **WHEN** importing from a utility module
- **THEN** it SHALL use namespace imports (`import * as Util`) or destructured imports
- **AND** it MUST NOT import default-exported classes

#### Scenario: Typed utility functions
- **GIVEN** a utility function is exported from a module
- **WHEN** the function accepts parameters
- **THEN** parameters MUST have explicit TypeScript types
- **AND** return types SHOULD be explicit when not trivially inferred

#### Scenario: Validation utilities use functional pattern
- **GIVEN** code needs to validate data with Zod schemas
- **WHEN** implementing validation logic
- **THEN** it MUST use pure functions that accept schema and data
- **AND** it MUST NOT use class-based validation wrappers
- **AND** validation functions MUST properly handle and log errors

Example of correct service pattern:
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
  }, [data, refetch]);

  return { data, loading: !data };
}

// contexts/SnackbarContext.tsx
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<SnackMessage[]>([]);
  const [current, setCurrent] = useState<SnackMessage>();

  const addMessage = useCallback((message: string, options: SnackOptions) => {
    setQueue(prev => [...prev, { message, ...options }]);
  }, []);

  return (
    <SnackbarContext.Provider value={{ currentMessage: current, addMessage }}>
      {children}
    </SnackbarContext.Provider>
  );
}

// utils/validation.ts
export function validateServiceResponse<T extends z.ZodType>(
  methodName: string,
  schema: T,
  response: unknown
): z.infer<T> {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation failed for ${methodName}:`, error.errors);
      throw new Error(`Service response validation failed: ${error.message}`);
    }
    throw error;
  }
}
```

Example of incorrect patterns:
```typescript
// ❌ Using class with instance methods for services
class Service extends BaseService {
  _cache: any;
  constructor() { super(); }
  getData() { return this._cache; }
}
export default new Service();

// ❌ Using manual listener pattern
class BaseService {
  _listeners: Component[] = [];
  registerListener(component: Component) {
    this._listeners.push(component);
  }
  _notifyChanges() {
    this._listeners.forEach(l => l.forceUpdate());
  }
}

// ❌ Using singleton pattern for state management
class SnackMessageService {
  _currentMessage: SnackMessage;
  addMessage(msg: string) {
    this._currentMessage = msg;
    this._notifyChanges();
  }
}
export default new SnackMessageService();
```
