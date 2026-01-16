# frontend-components Specification

## Purpose
TBD - created by archiving change convert-aiassist-to-functional. Update Purpose after archive.
## Requirements
### Requirement: Functional Component Pattern
All React components in the frontend SHALL use the functional component pattern with hooks rather than class-based components.

#### Scenario: New components are functional
- **GIVEN** a developer is creating a new React component
- **WHEN** they write the component code
- **THEN** they MUST use a functional component with const declaration and typed props
- **AND** they MUST NOT use React.Component class syntax
- **AND** they MUST destructure props in function parameters

#### Scenario: Existing class components are converted
- **GIVEN** an existing class-based React component exists in the codebase
- **WHEN** it is identified during refactoring or maintenance
- **THEN** it SHOULD be converted to a functional component
- **AND** the conversion MUST preserve all existing functionality
- **AND** the conversion MUST maintain the same props interface

#### Scenario: State management uses hooks
- **GIVEN** a functional component needs local state
- **WHEN** implementing state management
- **THEN** it MUST use useState hook for state variables
- **AND** it SHOULD use useCallback for stable function references
- **AND** it SHOULD use useEffect for side effects and lifecycle needs
- **AND** it MAY use useMemo for expensive computations

#### Scenario: No class component remains in components directory
- **GIVEN** the frontend codebase
- **WHEN** searching for class components with `grep -r "extends React.Component" packages/frontend/src/components`
- **THEN** no matches SHOULD be found
- **AND** the AiAssist component MUST be the last class component converted

### Requirement: Component Type Safety
All functional components SHALL have properly typed props without using React.FC.

#### Scenario: Props are explicitly typed
- **GIVEN** a functional component with props
- **WHEN** defining the component
- **THEN** it MUST declare an interface for props
- **AND** it MUST type the props parameter with that interface
- **AND** it MUST NOT use React.FC or React.FunctionComponent types

#### Scenario: Props are destructured
- **GIVEN** a functional component receives props
- **WHEN** accessing prop values
- **THEN** it MUST destructure props in the function parameters
- **AND** it MUST NOT use props.propertyName syntax

Example of correct pattern:
```typescript
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

const MyComponent = ({ value, onChange }: MyComponentProps) => {
  // Component implementation
};
```

Example of incorrect patterns:
```typescript
// ❌ Using React.FC
const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => { };

// ❌ Using props object
const MyComponent = (props: MyComponentProps) => {
  return <div>{props.value}</div>;
};

// ❌ Using class component
class MyComponent extends React.Component<MyComponentProps> { }
```

### Requirement: AI Assistant Component Modes
The AI Assistant component SHALL support only modes that are functional and accessible to users.

#### Scenario: Preview page mode removed
- **GIVEN** the AI Assistant dialog is open
- **WHEN** the user views the "Run AI Assist with text" dropdown
- **THEN** only "from input field" and "command prompt only" options SHALL be available
- **AND** the "from preview page" option SHALL NOT be present

#### Scenario: Two operational modes
- **GIVEN** the AI Assistant is being used
- **WHEN** selecting a run mode
- **THEN** "from input field" mode SHALL apply prompts to the current field content
- **AND** "command prompt only" mode SHALL send only the prompt without field content
- **AND** no preview page fetching SHALL occur

#### Scenario: Simplified component interface
- **GIVEN** a parent component uses AiAssist
- **WHEN** rendering the component
- **THEN** it SHALL NOT require a pageUrl prop
- **AND** it SHALL only require inValue, inField, and handleSetAiText props

### Requirement: Utility Module Pattern
Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods or class-with-instance-methods patterns.

#### Scenario: API bridge modules use functional exports
- **GIVEN** a utility module that bridges frontend and backend communication (e.g., main-process-bridge)
- **WHEN** implementing the module
- **THEN** it MUST export functions as named exports
- **AND** it MUST NOT use class syntax with instance methods
- **AND** it MUST NOT export a singleton class instance as default
- **AND** it MAY use module-level state for singleton behavior
- **AND** message handler registration MUST use closure-based storage

#### Scenario: Message handler pattern
- **GIVEN** an API bridge needs to register message handlers for push notifications
- **WHEN** implementing the message handler system
- **THEN** it MUST provide `addMessageHandler(type, handler)` function
- **AND** it MUST provide `removeMessageHandler(type, handler)` function
- **AND** it MUST provide `dispatchMessage(type, data)` function
- **AND** multiple handlers for the same message type MUST be supported
- **AND** handlers MUST be stored in module-level closure
- **AND** dispatching MUST call all registered handlers for the message type

#### Scenario: HTTP request function with validation
- **GIVEN** an API bridge provides HTTP request functionality
- **WHEN** implementing the request function
- **THEN** it MUST accept method name, data, and options parameters
- **AND** it MUST return a Promise with the API response
- **AND** it MUST validate responses against Zod schemas
- **AND** it MUST construct correct endpoint URLs (hostname + port + /api/ + method)
- **AND** it MUST handle timeout, network errors, and validation errors
- **AND** validation failures MUST throw clear error messages with method name

### Requirement: Debounce Utility Testing
The debounce utility SHALL have comprehensive automated tests to ensure correct timing behavior.

#### Scenario: Basic debounce delays execution
- **GIVEN** a debounce utility is created with a 100ms delay
- **WHEN** a function is debounced
- **THEN** the function MUST NOT execute immediately
- **AND** the function MUST execute after the specified delay
- **AND** the test MUST use vitest fake timers to verify timing

#### Scenario: Rapid calls cancel previous timers
- **GIVEN** a debounce utility is created
- **WHEN** the debounce function is called multiple times rapidly
- **THEN** only the last call's function MUST execute
- **AND** all previous pending executions MUST be cancelled
- **AND** the delay timer MUST restart with each new call

#### Scenario: Cancel method clears pending execution
- **GIVEN** a debounce utility with a pending execution
- **WHEN** the cancel method is called
- **THEN** the pending function MUST NOT execute
- **AND** the timeout MUST be cleared

#### Scenario: Multiple debounce instances are independent
- **GIVEN** multiple debounce instances are created
- **WHEN** each instance debounces different functions
- **THEN** each instance MUST maintain its own timer state
- **AND** calling one instance's debounce MUST NOT affect other instances

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

### Requirement: API Bridge Testing
The API bridge module SHALL have comprehensive automated tests covering both message handling and HTTP request functionality.

#### Scenario: Message handler lifecycle tests
- **GIVEN** the API bridge test suite
- **WHEN** testing message handler functionality
- **THEN** tests MUST verify adding single handler
- **AND** tests MUST verify adding multiple handlers for same type
- **AND** tests MUST verify removing specific handler
- **AND** tests MUST verify dispatching calls all handlers
- **AND** tests MUST verify multiple message types are independent
- **AND** tests MUST verify handlers receive correct data payload
- **AND** tests MUST verify no errors when dispatching with no handlers

#### Scenario: HTTP request tests with mocking
- **GIVEN** the API bridge test suite
- **WHEN** testing HTTP request functionality
- **THEN** tests MUST use MSW (Mock Service Worker) for HTTP mocking
- **AND** tests MUST verify successful requests return validated data
- **AND** tests MUST verify Zod validation with valid responses
- **AND** tests MUST verify Zod validation catches invalid responses
- **AND** tests MUST verify timeout handling
- **AND** tests MUST verify network error handling
- **AND** tests MUST verify custom timeout option
- **AND** tests MUST verify correct endpoint URL construction
- **AND** tests MUST verify request body contains data under 'data' key

#### Scenario: Validation behavior tests
- **GIVEN** the API bridge makes requests
- **WHEN** testing schema validation
- **THEN** tests MUST verify requests with schemas validate responses
- **AND** tests MUST verify requests without schemas log warning but succeed
- **AND** tests MUST verify validation errors include method name
- **AND** tests MUST verify validation errors include detailed Zod error info
- **AND** tests MUST verify console output for warnings and errors

#### Scenario: Test infrastructure setup
- **GIVEN** a test file for API bridge utilities
- **WHEN** setting up the test environment
- **THEN** it MUST use vitest as the test framework
- **AND** it MUST use MSW for HTTP mocking
- **AND** it MUST set up MSW server with beforeAll/afterAll hooks
- **AND** it MUST reset handlers between tests with afterEach
- **AND** it MUST follow project test patterns from existing test files

Example of correct API bridge pattern:
```typescript
// frontend/src/utils/main-process-bridge.ts

// Module-level state (singleton through module scope)
const messageHandlers: { [key: string]: Array<(data: any) => void> } = {};

// Named exports for all functions
export function addMessageHandler(type: string, handler: (data: any) => void) {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  messageHandlers[type].push(handler);
}

export function removeMessageHandler(type: string, handler: (data: any) => void) {
  const handlers = messageHandlers[type];
  if (handlers) {
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
}

export function dispatchMessage(type: string, data: any) {
  const handlers = messageHandlers[type];
  if (handlers) {
    handlers.forEach(handler => handler(data));
  }
}

export function request<M extends string>(
  method: M,
  data?: any,
  opts = { timeout: 90000 }
): Promise<ApiResponse<M>> {
  // Implementation with axios, validation, error handling
}

// Usage in consuming code
import { addMessageHandler, request } from './utils/main-process-bridge';

addMessageHandler('console', (data) => console.log(data));
const result = await request('getConfigurations', {});
```

Example of correct test pattern:
```typescript
// frontend/test/utils/main-process-bridge.test.ts
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { addMessageHandler, removeMessageHandler, dispatchMessage, request } from '../../src/utils/main-process-bridge';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('main-process-bridge', () => {
  describe('Message Handlers', () => {
    it('should call handler when message is dispatched', () => {
      const handler = vi.fn();
      addMessageHandler('test', handler);

      dispatchMessage('test', { foo: 'bar' });

      expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('HTTP Requests', () => {
    it('should make successful request with validation', async () => {
      server.use(
        http.post('http://localhost:5150/api/testMethod', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const result = await request('testMethod', { param: 'value' });

      expect(result).toEqual({ success: true });
    });
  });
});
```

Example of incorrect patterns:
```typescript
// ❌ Using class with singleton export
class MainProcessBridge {
  private _messageHandlers: { [key: string]: any[] } = {};

  addMessageHandler(type: string, handler: any) {
    // ...
  }
}
export default new MainProcessBridge();

// ❌ No tests for critical infrastructure
// (test file does not exist or has minimal coverage)
```

