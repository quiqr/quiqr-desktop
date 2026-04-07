## Why

Running Quiqr in standalone mode currently requires two separate processes: the backend Express server and a separate web server for the frontend. This complicates deployment (especially Docker), doubles the operational surface, and introduces cross-origin complexity (CORS) that will become painful when adding authentication later. The Electron adapter already serves the frontend from Express in production — the standalone adapter should too.

## What Changes

- Add `frontendPath` option to `ServerOptions` in the shared `createServer()` factory, enabling any adapter to serve the frontend build via `express.static()` + SPA catch-all
- Remove duplicated frontend-serving logic from the Electron adapter — it uses the shared option instead
- Standalone adapter resolves the frontend build directory and passes it to `createServer()`; logs a clear error if the build is missing
- Frontend HTTP bridge switches from hardcoded `http://<host>:5150/api/...` to relative `/api/...` URLs, working on any origin
- Vite dev config adds a proxy rule (`/api` -> `localhost:5150`) so relative URLs work during development too
- CORS middleware becomes conditional: disabled when frontend is served from the same origin (no longer needed), enabled when running cross-origin (dev without proxy, or API-only mode)
- SSE endpoint `Access-Control-Allow-Origin: *` headers follow the same CORS logic
- Dockerfile updated to include the frontend package and build step
- `docker-compose.yml` updated to reflect a full application server (not backend-only)
- Tests for frontend-serving middleware behavior (static files, SPA catch-all, CORS toggling)
- Documentation for standalone deployment and Docker usage

## Non-goals

- Authentication — this change lays groundwork for it but does not implement auth
- WebSocket push notifications — orthogonal to frontend serving
- Changes to the Electron development workflow (Vite dev server + Electron stays the same)
- Bundling the frontend build into the standalone adapter package — the build is resolved at runtime from a known path

## Capabilities

### New Capabilities
- `unified-frontend-serving`: Shared Express middleware for serving the frontend SPA build from the backend server, with SPA catch-all routing and conditional CORS

### Modified Capabilities
- `communication-layer`: Frontend bridge URL resolution changes from hardcoded cross-origin to relative same-origin, with Vite proxy for dev mode
- `adapters`: Standalone adapter gains frontend serving; Electron adapter delegates frontend serving to the shared server factory
- `documentation`: Standalone deployment guide and Docker usage documentation added

## Impact

- **packages/backend/src/api/server.ts**: `ServerOptions` extended, static file + SPA middleware added
- **packages/adapters/electron/src/main.ts**: Frontend-serving code removed, replaced by `frontendPath` option
- **packages/adapters/standalone/src/main.ts**: Frontend build resolution + `frontendPath` option added
- **packages/frontend/src/utils/main-process-bridge.ts**: URL construction changed to relative
- **packages/frontend/vite.config.js**: Dev proxy added for `/api`
- **Dockerfile**: Frontend package added to build
- **docker-compose.yml**: Service renamed, reflects full app
- **Tests**: New tests for server factory frontend-serving behavior
- **No breaking API changes** — existing API endpoints unchanged, frontend behavior identical from the user's perspective
