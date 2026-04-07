# Communication Layer Specification

## Purpose

The communication layer defines how the frontend and backend communicate in different deployment environments, using HTTP for request-response and WebSocket for server-to-client push notifications.
## Requirements
### Requirement: WebSocket Push Notification Layer

The web adapter SHALL use WebSocket connections for backend-to-frontend push notifications only, not for request-response patterns.

#### Scenario: Hugo output streaming
- **WHEN** Hugo build runs on backend
- **THEN** backend sends output via WebSocket message type `console:append`
- **AND** frontend appends the line to console display
- **AND** no response is expected from frontend

#### Scenario: Window reload trigger
- **WHEN** backend needs to trigger frontend reload
- **THEN** backend sends WebSocket message type `window:reload`
- **AND** frontend executes `window.location.reload()`

#### Scenario: Connection management
- **WHEN** frontend connects to backend
- **THEN** WebSocket connection is established
- **AND** frontend listens for push messages
- **AND** no request-response correlation tracking is needed

### Requirement: HTTP-Only Request-Response

All frontend-to-backend requests SHALL use HTTP POST to `/api/*` endpoints using relative URLs, with an `Authorization: Bearer <token>` header when auth is enabled.

#### Scenario: API method call
- **WHEN** frontend calls a service method
- **THEN** it uses `mainProcessBridge.request()` to POST to `/api/<method>` using a relative URL
- **AND** if a token exists, the request SHALL include an `Authorization: Bearer <token>` header
- **AND** backend responds with JSON result
- **AND** WebSocket is NOT used for request-response

#### Scenario: File upload
- **WHEN** user selects files via HTML5 input
- **THEN** files are uploaded via HTTP POST with multipart/form-data
- **AND** the request SHALL include the auth header when auth is enabled

#### Scenario: Development mode with Vite proxy
- **WHEN** frontend runs on the Vite dev server (port 4002)
- **AND** backend runs on Express (port 5150)
- **THEN** Vite SHALL proxy requests matching `/api/*` to `http://localhost:5150`
- **AND** the frontend bridge SHALL use the same relative `/api/...` URLs as in production
- **AND** auth headers SHALL be forwarded by the Vite proxy

### Requirement: Adapter-Agnostic Frontend

The frontend SHALL never detect or branch on platform type, using only standard web APIs that work universally.

#### Scenario: Platform independence
- **WHEN** frontend code executes
- **THEN** it uses only standard HTML5, React, and HTTP APIs
- **AND** does not check if running in Electron vs web
- **AND** all platform-specific logic is in backend adapters

#### Scenario: File selection
- **WHEN** user needs to select files
- **THEN** frontend uses `<input type="file">`
- **AND** works identically in both Electron and web browser

### Requirement: SSE Authentication via Query Parameter

SSE endpoints SHALL accept JWT tokens via query parameter since `EventSource` cannot send custom headers.

#### Scenario: Authenticated SSE connection
- **WHEN** the frontend opens an SSE connection (EventSource)
- **AND** auth is enabled
- **THEN** the frontend SHALL append `?token=<jwt>` to the SSE URL
- **AND** the backend auth middleware SHALL validate the token from the query parameter

#### Scenario: Unauthenticated SSE connection attempt
- **WHEN** an SSE connection is attempted without a token
- **AND** auth is enabled
- **THEN** the backend SHALL respond with 401

