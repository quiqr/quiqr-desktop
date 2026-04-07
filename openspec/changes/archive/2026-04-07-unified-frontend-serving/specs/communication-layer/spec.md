## MODIFIED Requirements

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
