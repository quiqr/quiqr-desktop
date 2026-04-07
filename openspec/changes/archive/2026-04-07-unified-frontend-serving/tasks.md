## 1. Server Factory: Frontend Serving & Conditional CORS

- [x] 1.1 Add `frontendPath?: string` to `ServerOptions` in `packages/backend/src/api/server.ts`
- [x] 1.2 Change CORS default: `cors` defaults to `true` when `frontendPath` is unset, `false` when `frontendPath` is set
- [x] 1.3 Add `express.static(frontendPath)` middleware after API routes, before error handler, when `frontendPath` is set
- [x] 1.4 Add SPA catch-all route (`GET *`) that serves `index.html` for non-`/api/` paths, when `frontendPath` is set
- [x] 1.5 Extract SSE CORS header logic into a helper that checks the resolved CORS setting, replace hardcoded `Access-Control-Allow-Origin: *` in all SSE endpoints

## 2. Electron Adapter: Use Shared Frontend Serving

- [x] 2.1 Pass `frontendPath` from `findFrontendBuildDir()` to `createServer()` options (when `!isDev`)
- [x] 2.2 Remove inline `express.static()` and SPA catch-all code from `packages/adapters/electron/src/main.ts`
- [x] 2.3 Verify Electron production mode still serves frontend correctly

## 3. Standalone Adapter: Add Frontend Serving

- [x] 3.1 Add `findFrontendBuildDir()` function to standalone adapter that checks `{rootPath}/packages/frontend/build/index.html` and `FRONTEND_PATH` env var
- [x] 3.2 Pass resolved `frontendPath` to `startServer()` options
- [x] 3.3 Log clear warning message when frontend build is not found (API-only fallback)
- [x] 3.4 Update startup console output to show frontend URL when serving frontend

## 4. Frontend Bridge: Relative URLs

- [x] 4.1 Change `main-process-bridge.ts` to use relative URL `/api/<method>` instead of `http://<host>:5150/api/<method>`
- [x] 4.2 Add Vite dev proxy config: `/api` -> `http://localhost:5150` in `vite.config.js`
- [x] 4.3 Verify SSE endpoints in frontend code also use relative URLs (ssg download, model-events, sync streams)

## 5. Tests

- [x] 5.1 Add test: `createServer()` with `frontendPath` serves static files from the directory
- [x] 5.2 Add test: SPA catch-all returns `index.html` for non-API routes when `frontendPath` is set
- [x] 5.3 Add test: `/api/*` routes return 404 JSON (not `index.html`) for unknown API methods
- [x] 5.4 Add test: no static serving or catch-all when `frontendPath` is not set
- [x] 5.5 Add test: CORS middleware disabled by default when `frontendPath` is set
- [x] 5.6 Add test: CORS middleware enabled by default when `frontendPath` is not set
- [x] 5.7 Add test: explicit `cors: true` overrides the `frontendPath`-based default
- [x] 5.8 Add test: standalone adapter falls back to API-only mode when frontend build is missing
- [x] 5.9 Add test: standalone adapter resolves `FRONTEND_PATH` env var

## 6. Docker

- [x] 6.1 Update `Dockerfile` to copy `packages/frontend/` source and build frontend (`npm run build -w @quiqr/frontend`)
- [x] 6.2 Update `docker-compose.yml` service name and add `FRONTEND_PATH` env var documentation
- [x] 6.3 Verify Docker build and `docker-compose up` serves unified application on port 5150

## 7. Documentation

- [x] 7.1 Add standalone deployment guide to `packages/docs/docs/getting-started/` covering build steps, environment variables, and running the server
- [x] 7.2 Add Docker deployment section covering image build, docker-compose usage, volumes, and environment configuration
