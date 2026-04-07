## Context

Quiqr Desktop has two runtime modes: Electron (desktop) and standalone (server). Both use the same Express backend created by `createServer()` in `packages/backend/src/api/server.ts`.

Currently, the Electron adapter adds frontend serving (express.static + SPA catch-all) as inline code in its own `main.ts` after calling `createServer()`. The standalone adapter does not serve the frontend at all — a separate web server is required.

The frontend bridge (`main-process-bridge.ts`) hardcodes `http://<hostname>:5150/api/...` for all API requests, assuming cross-origin access. CORS is always enabled. SSE endpoints hardcode `Access-Control-Allow-Origin: *`.

Reference implementations:
- Current server factory: `packages/backend/src/api/server.ts`
- Electron frontend serving: `packages/adapters/electron/src/main.ts` lines 87-107
- Frontend bridge: `packages/frontend/src/utils/main-process-bridge.ts` line 81
- Standalone entry: `packages/adapters/standalone/src/main.ts`

## Goals / Non-Goals

**Goals:**
- Single Express server serves both API and frontend SPA in production (both adapters)
- Frontend-serving logic lives in the shared server factory, not duplicated across adapters
- Frontend bridge works on any origin without hardcoded ports
- Docker deployment works out of the box with a single container
- Clear error messaging when frontend build is missing
- Existing development workflows (Vite dev server) remain unchanged

**Non-Goals:**
- Authentication (future change, but this design must not conflict with it)
- Server-side rendering or any change to how the React SPA works
- Changing the Electron development flow (BrowserWindow still loads from Vite dev server)
- Bundling frontend into the standalone adapter npm package

## Decisions

### Decision 1: Frontend serving as a ServerOptions parameter (Option B)

Add `frontendPath?: string` to `ServerOptions`. When provided, `createServer()` adds `express.static(frontendPath)` and an SPA catch-all route after all API routes but before the error handler.

**Why not a separate middleware function (Option C)?** The middleware ordering is critical — static files and SPA catch-all must come after API routes but before the error handler. `createServer()` already owns this pipeline. Exposing a separate function would require callers to manage ordering, and the error handler is already registered inside `createServer()`. Option B keeps the pipeline self-contained.

**Why not per-adapter inline code (current Electron approach)?** Duplicates logic. The Electron adapter already has this code; adding it again to standalone would create two copies that drift.

### Decision 2: Conditional CORS based on frontendPath

When `frontendPath` is set, CORS is unnecessary (same-origin). The `cors` option in `ServerOptions` defaults to `!frontendPath` — i.e., CORS is off when serving frontend, on when running API-only. This can still be explicitly overridden.

SSE endpoints that currently hardcode `Access-Control-Allow-Origin: *` will check whether CORS is enabled before setting that header, using a shared helper or the same option.

**Why not always keep CORS on?** It's harmless but misleading, and removing it for same-origin setups simplifies the future authentication story (no CORS preflight complications with credentials).

### Decision 3: Relative API URLs with Vite dev proxy

The frontend bridge changes from:
```ts
axios.post("http://"+host+":5150/api/"+method, ...)
```
to:
```ts
axios.post("/api/"+method, ...)
```

In production (both Electron and standalone), the frontend is served from the same Express server, so relative URLs resolve correctly.

In development, Vite's built-in proxy forwards `/api/*` requests to `http://localhost:5150`:
```js
// vite.config.js
server: {
  proxy: { '/api': 'http://localhost:5150' }
}
```

**Why not keep the hardcoded URL for dev?** The bridge shouldn't need to know about deployment topology. A relative URL works everywhere. The Vite proxy is a one-line config that makes dev behave like production from the frontend's perspective.

### Decision 4: Frontend build path resolution

The standalone adapter resolves the frontend build path by checking `{rootPath}/packages/frontend/build/index.html`. This is the Vite build output directory configured in `vite.config.js`.

An environment variable `FRONTEND_PATH` can override this for Docker or custom deployments.

If the path doesn't exist, the server still starts (API-only mode is still useful) but logs a clear warning:
```
WARNING: Frontend build not found at <path>
  Run 'npm run build -w @quiqr/frontend' to build the frontend.
  The API server is running, but no frontend will be served.
```

The Electron adapter keeps its existing multi-path lookup (`findFrontendBuildDir()`) since the packaged app layout differs, but passes the resolved path through `frontendPath` instead of adding middleware inline.

### Decision 5: Express middleware ordering

The final middleware order in `createServer()`:

```
1. cors()                          — only if cors option is true
2. express.json({ limit: '100mb' })
3. API routes (POST /api/:method, GET /api/ssg/*, SSE endpoints, etc.)
4. express.static(frontendPath)    — only if frontendPath is set
5. SPA catch-all (GET *)           — only if frontendPath is set
6. errorHandler                    — always last
```

The SPA catch-all explicitly skips `/api/*` paths and returns 404 JSON for unmatched API routes, matching the current Electron behavior.

## Risks / Trade-offs

**[Risk] Frontend build out of sync with backend** — In development, the standalone server might serve a stale frontend build while the developer expects hot-reload.
→ Mitigation: In `NODE_ENV=development`, the standalone adapter skips frontend serving entirely and logs a message directing to the Vite dev server on `:4002`. The `dev:start` script sets `NODE_ENV=development` to ensure this. Frontend serving is only active in production mode.

**[Risk] Vite base URL `./` (relative) might not resolve correctly** — The Vite config uses `base: './'` for Electron's `file://` protocol compatibility.
→ Mitigation: When served from Express at `/`, relative paths resolve to the root, which is correct. No change needed. Verify with a test after implementation.

**[Risk] SSE endpoints lose CORS headers when they shouldn't** — If someone runs the standalone API without frontend (API-only mode for a custom frontend on a different origin), they'd need CORS.
→ Mitigation: CORS defaults to off only when `frontendPath` is set. API-only mode (no frontendPath) keeps CORS on. Can also be explicitly set via `cors: true`.

**[Trade-off] Two frontend build locations** — Electron uses `findFrontendBuildDir()` with multiple fallback paths; standalone uses a single known path. This is acceptable because the packaged Electron app has a different directory structure than the monorepo.

## Open Questions

- Should the Dockerfile use a multi-stage build (build stage + slim runtime stage) to reduce image size? Current PoC Dockerfile is single-stage.
