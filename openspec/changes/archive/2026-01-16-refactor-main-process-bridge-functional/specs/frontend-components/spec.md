# Frontend Components Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
