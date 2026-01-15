# Change: Refactor Service Classes to Functional Pattern

## Why

The frontend currently has three class-based service modules in `frontend/src/services/`:
- `base-service.ts` - Abstract base class with listener pattern and Zod validation
- `service.ts` - Main service extending BaseService with API caching and data fetching
- `ui-service.ts` - UI services (SnackMessageService, ConsoleService) for state management

These class-based services violate the project's goal of moving towards fully functional TypeScript. The legacy listener pattern (`registerListener`/`unregisterListener`) forces components to manually manage subscriptions, which is error-prone and redundant with React's built-in state management.

Modern React patterns (hooks, context, state management) provide better solutions for:
- State management (useState, useReducer, Context API)
- Component updates (automatic re-renders on state changes)
- Subscription cleanup (useEffect cleanup functions)
- Type safety (TypeScript generics with hooks)

## What Changes

**Base Service Pattern → Functional Utilities:**
- Convert validation logic to standalone utility functions
- Remove the listener pattern entirely (components use React state instead)
- Extract Zod validation into reusable helper functions

**Main Service → Functional API Layer:**
- Convert Service class to functional module with named exports
- Replace instance caching with React hooks (useMemo, useRef)
- Move cache management to React Context or custom hooks
- Keep the API client import and validation patterns

**UI Services → React Context + Hooks:**
- Convert SnackMessageService to SnackbarContext with useSnackbar hook
- Convert ConsoleService to ConsoleContext with useConsole hook
- Use React state management instead of manual listener notifications
- Maintain message buffering and throttling logic in functional style

## Impact

- **Affected specs**: `frontend-components` (extends Service Module Pattern requirement)
- **Affected code**:
  - `frontend/src/services/base-service.ts` - Extract to functional validation utilities
  - `frontend/src/services/service.ts` - Convert to functional module with hooks
  - `frontend/src/services/ui-service.ts` - Convert to Context providers with hooks
  - 3 files using listener pattern need updates:
    - `frontend/src/containers/Console/index.tsx`
    - `frontend/src/components/SnackbarManager.tsx`
    - `frontend/src/containers/WorkspaceMounted/Collection/index.tsx`
  - 50+ files importing `service` or `ui-service` (import statements only, no logic changes)

- **Breaking changes**:
  - Service class API changes to functional exports
  - Listener pattern removed (replaced with hooks)
  - UI service singleton instances become Context providers

- **Migration complexity**: Medium - requires Context providers at app root and hook adoption
