## ADDED Requirements

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

All frontend-to-backend requests SHALL use HTTP POST to `/api/*` endpoints, maintaining the existing communication pattern.

#### Scenario: API method call
- **WHEN** frontend calls a service method
- **THEN** it uses `mainProcessBridge.request()` to POST to HTTP endpoint
- **AND** backend responds with JSON result
- **AND** WebSocket is NOT used for request-response

#### Scenario: File upload
- **WHEN** user selects files via HTML5 input
- **THEN** files are uploaded via HTTP POST with multipart/form-data
- **AND** existing backend API handles the upload

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

## MODIFIED Requirements

None - this establishes new communication patterns for the web adapter.
