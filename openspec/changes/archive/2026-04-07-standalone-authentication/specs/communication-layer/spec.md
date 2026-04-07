## MODIFIED Requirements

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

## ADDED Requirements

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
