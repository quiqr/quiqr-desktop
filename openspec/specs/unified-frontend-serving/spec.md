# unified-frontend-serving Specification

## Purpose
TBD - created by archiving change unified-frontend-serving. Update Purpose after archive.
## Requirements
### Requirement: Frontend SPA Serving via ServerOptions

The `createServer()` factory in `packages/backend/src/api/server.ts` SHALL accept an optional `frontendPath` parameter in `ServerOptions` that, when provided, configures Express to serve the frontend SPA build from that directory.

#### Scenario: Frontend served when frontendPath is set
- **WHEN** `createServer()` is called with `frontendPath` pointing to a directory containing `index.html`
- **THEN** Express SHALL serve static files from that directory via `express.static(frontendPath)`
- **AND** the static file middleware SHALL be registered after all API routes
- **AND** the static file middleware SHALL be registered before the error handler

#### Scenario: SPA catch-all route
- **WHEN** a GET request arrives that does not match any API route or static file
- **AND** `frontendPath` is set
- **THEN** the server SHALL respond with the contents of `{frontendPath}/index.html`
- **AND** the SPA catch-all SHALL NOT intercept requests starting with `/api/`
- **AND** unmatched `/api/*` requests SHALL return 404 JSON `{ error: "API endpoint not found" }`

#### Scenario: No frontend serving without frontendPath
- **WHEN** `createServer()` is called without `frontendPath` (or `frontendPath` is undefined)
- **THEN** no static file middleware SHALL be added
- **AND** no SPA catch-all route SHALL be added
- **AND** the server SHALL function as API-only (current behavior)

### Requirement: Conditional CORS

The `createServer()` factory SHALL make CORS conditional based on whether the frontend is served from the same origin.

#### Scenario: CORS disabled when serving frontend
- **WHEN** `frontendPath` is set and `cors` option is not explicitly provided
- **THEN** CORS middleware SHALL NOT be enabled
- **AND** SSE endpoints SHALL NOT set `Access-Control-Allow-Origin` headers

#### Scenario: CORS enabled for API-only mode
- **WHEN** `frontendPath` is not set and `cors` option is not explicitly provided
- **THEN** CORS middleware SHALL be enabled (current default behavior)
- **AND** SSE endpoints SHALL set `Access-Control-Allow-Origin: *` headers

#### Scenario: Explicit CORS override
- **WHEN** `cors` option is explicitly set to `true` or `false`
- **THEN** the explicit value SHALL take precedence over the `frontendPath`-based default
- **AND** SSE headers SHALL follow the same explicit setting

### Requirement: Frontend Build Path Resolution

The standalone adapter SHALL resolve the frontend build path at startup and pass it to `createServer()`, but only in production mode.

#### Scenario: Frontend serving skipped in development mode
- **WHEN** the standalone server starts with `NODE_ENV=development`
- **THEN** the server SHALL NOT resolve or serve the frontend build
- **AND** log a message directing the developer to use the Vite dev server for hot reload

#### Scenario: Frontend build found at default path
- **WHEN** the standalone server starts in production mode
- **AND** `{rootPath}/packages/frontend/build/index.html` exists
- **THEN** the server SHALL serve the frontend from that directory
- **AND** log a message indicating the frontend serving path

#### Scenario: Frontend build path from environment variable
- **WHEN** the `FRONTEND_PATH` environment variable is set
- **THEN** the server SHALL use that path instead of the default
- **AND** the path SHALL be validated for the presence of `index.html`

#### Scenario: Frontend build not found
- **WHEN** the frontend build directory does not exist or does not contain `index.html`
- **THEN** the server SHALL start in API-only mode
- **AND** log a warning: "Frontend build not found at <path>. Run 'npm run build -w @quiqr/frontend' to build the frontend. The API server is running, but no frontend will be served."
- **AND** the server SHALL NOT crash or exit

### Requirement: Middleware Ordering

The Express middleware pipeline SHALL maintain a strict ordering to ensure correct behavior.

#### Scenario: Middleware order with frontend serving
- **WHEN** `createServer()` is called with `frontendPath`
- **THEN** middleware SHALL be registered in this order:
  1. CORS (if enabled)
  2. JSON body parser
  3. API routes (POST /api/:method, GET /api/ssg/*, SSE endpoints)
  4. Static file serving (express.static)
  5. SPA catch-all
  6. Error handler

#### Scenario: Middleware order without frontend serving
- **WHEN** `createServer()` is called without `frontendPath`
- **THEN** middleware SHALL be registered in this order:
  1. CORS (if enabled)
  2. JSON body parser
  3. API routes
  4. Error handler

### Requirement: Docker Deployment

The Dockerfile SHALL build and serve both backend and frontend as a single container.

#### Scenario: Docker build includes frontend
- **WHEN** building the Docker image
- **THEN** the build SHALL include `packages/frontend/` source and dependencies
- **AND** the build SHALL run `npm run build -w @quiqr/frontend`
- **AND** the frontend build output SHALL be available at the expected path inside the container

#### Scenario: Docker container serves unified application
- **WHEN** starting the Docker container
- **THEN** a single Express server SHALL serve both the API and the frontend
- **AND** the application SHALL be accessible on the exposed port (default 5150)

#### Scenario: Docker compose example
- **WHEN** a user runs `docker-compose up`
- **THEN** the full Quiqr application SHALL be accessible at `http://localhost:5150`
- **AND** the compose file SHALL serve as an example for deployment

