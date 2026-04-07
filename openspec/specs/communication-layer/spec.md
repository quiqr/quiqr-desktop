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

All frontend-to-backend requests SHALL use HTTP POST to `/api/*` endpoints using relative URLs, maintaining the existing communication pattern while working on any deployment origin.

#### Scenario: API method call
- **WHEN** frontend calls a service method
- **THEN** it uses `mainProcessBridge.request()` to POST to `/api/<method>` using a relative URL
- **AND** backend responds with JSON result
- **AND** WebSocket is NOT used for request-response
- **AND** no hardcoded hostname or port is included in the request URL

#### Scenario: File upload
- **WHEN** user selects files via HTML5 input
- **THEN** files are uploaded via HTTP POST with multipart/form-data
- **AND** existing backend API handles the upload

#### Scenario: Development mode with Vite proxy
- **WHEN** frontend runs on the Vite dev server (port 4002)
- **AND** backend runs on Express (port 5150)
- **THEN** Vite SHALL proxy requests matching `/api/*` to `http://localhost:5150`
- **AND** the frontend bridge SHALL use the same relative `/api/...` URLs as in production
- **AND** SSE connections matching `/api/*` SHALL also be proxied

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

