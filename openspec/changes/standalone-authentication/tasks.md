## 1. Types & Schemas

- [x] 1.1 Add auth-related Zod schemas to `packages/types/src/schemas/`: `authLoginRequest`, `authLoginResponse`, `authRefreshRequest`, `authRefreshResponse`, `authChangePasswordRequest`, `authUser`
- [x] 1.2 Add `auth` block to the instance settings Zod schema with provider, local, and session sub-schemas
- [x] 1.3 Add `AuthOptions` type to `ServerOptions` interface: `auth?: { enabled: boolean; provider: AuthProvider; secret: string; accessTokenExpiry: string; refreshTokenExpiry: string }`
- [x] 1.4 Export all new types from `packages/types/src/index.ts`
- [x] 1.5 Rebuild types package and verify no type errors

## 2. Auth Provider Interface & Local File Provider

- [x] 2.1 Create `packages/backend/src/auth/types.ts` with `AuthProvider`, `AuthResult`, `AuthUser` interfaces
- [x] 2.2 Create `packages/backend/src/auth/local-file-provider.ts` implementing `AuthProvider` using `users.json` + `bcryptjs`
- [x] 2.3 Implement `authenticate()`: look up user by email, verify bcrypt hash
- [x] 2.4 Implement `changePassword()`: validate old password, hash new password, update file, clear `mustChangePassword`
- [x] 2.5 Implement `getUserById()` and `needsPasswordChange()`
- [x] 2.6 Implement `createUser()` and `removeUser()` for CLI use
- [x] 2.7 Add `bcryptjs` dependency to `packages/backend/package.json`

## 3. JWT Token Service

- [x] 3.1 Create `packages/backend/src/auth/token-service.ts` with `issueAccessToken()`, `issueRefreshToken()`, `verifyToken()`, `blacklistToken()`
- [x] 3.2 Implement in-memory token blacklist (Map with TTL cleanup)
- [x] 3.3 Add `jsonwebtoken` and `@types/jsonwebtoken` dependencies to `packages/backend/package.json`

## 4. Auth Middleware

- [x] 4.1 Create `packages/backend/src/api/middleware/auth-middleware.ts` that validates JWT from `Authorization` header or `?token` query param
- [x] 4.2 Attach decoded user to `req` (extend Express Request type)
- [x] 4.3 Return 401 JSON for missing/invalid tokens
- [x] 4.4 Skip auth for routes registered before the middleware (auth API routes, static files)

## 5. Auth API Routes

- [x] 5.1 Create `packages/backend/src/api/routes/auth-routes.ts` with login, refresh, logout, change-password endpoints
- [x] 5.2 `POST /api/auth/login`: validate credentials via provider, issue tokens, return user info with `mustChangePassword`
- [x] 5.3 `POST /api/auth/refresh`: validate refresh token, issue new token pair
- [x] 5.4 `POST /api/auth/logout`: blacklist current token
- [x] 5.5 `POST /api/auth/change-password`: validate old password, update via provider
- [x] 5.6 Register auth routes in `server.ts` BEFORE the auth middleware (so they're public)

## 6. Server Integration

- [x] 6.1 Update `createServer()` in `server.ts` to accept `auth` in `ServerOptions`
- [x] 6.2 Register auth API routes before auth middleware in the pipeline
- [x] 6.3 Register auth middleware after auth routes, before protected API routes
- [x] 6.4 Ensure static file serving and SPA catch-all remain public (before auth middleware or unaffected)
- [x] 6.5 Verify middleware ordering: static → json → auth routes → auth middleware → protected routes → SPA catch-all → error handler

## 7. DI Container

- [x] 7.1 Add `AuthProvider` to `AppContainer` interface (optional)
- [x] 7.2 Add token service to `AppContainer` (optional, created in server.ts from auth options)
- [x] 7.3 Wire up auth provider and token service in `createContainer()` when auth config is present

## 8. Config & First-Run

- [x] 8.1 Add auth env var mappings to `standardEnvMappings`: `QUIQR_AUTH_ENABLED`, `QUIQR_AUTH_SESSION_SECRET`
- [x] 8.2 Implement session secret auto-generation on first startup (crypto.randomBytes, persist to instance settings)
- [x] 8.3 Implement first-run default user creation: if `users.json` missing, create admin@localhost / admin with `mustChangePassword: true`
- [x] 8.4 Print default credentials to console on first-run

## 9. Standalone Adapter

- [x] 9.1 Read auth config from instance settings in standalone adapter `main.ts`
- [x] 9.2 Instantiate `LocalFileAuthProvider` with the config dir path
- [x] 9.3 Pass auth options to `startServer()`
- [x] 9.4 Trigger first-run default user creation before server start

## 10. Electron Adapter

- [x] 10.1 Verify Electron adapter does NOT pass `auth` options to `createServer()` (should already be the case)
- [x] 10.2 Add explicit comment documenting that auth is intentionally disabled in Electron

## 11. CLI User Management

- [x] 11.1 Create `packages/adapters/standalone/src/cli/user-admin.ts` with add, list, remove, reset-password subcommands
- [x] 11.2 Implement interactive password prompt (using `readline` or `process.stdin`)
- [x] 11.3 Add `"user"` npm script to standalone adapter `package.json`
- [x] 11.4 Verify CLI works: add user, list, reset-password, remove

## 12. Frontend: Auth Infrastructure

- [x] 12.1 Create `packages/frontend/src/auth/` module with token storage helpers (get/set/clear from localStorage)
- [x] 12.2 Add axios request interceptor to attach `Authorization: Bearer <token>` header
- [x] 12.3 Add axios response interceptor: on 401, attempt refresh; on refresh failure, redirect to login
- [x] 12.4 Create helper to append `?token=<jwt>` to SSE URLs

## 13. Frontend: Login & Password Change

- [x] 13.1 Create login page component with email/password form and error display
- [x] 13.2 Create change-password component with old/new password fields
- [x] 13.3 Implement login flow: call API, store tokens, check `mustChangePassword`, navigate
- [x] 13.4 Implement change-password flow: call API, on success navigate to app
- [x] 13.5 Add logout functionality (call API, clear tokens, redirect)

## 14. Frontend: Auth-Aware Routing

- [x] 14.1 Create auth wrapper component that checks token state on mount
- [x] 14.2 If no token → render login page; if token + mustChangePassword → render change form; otherwise → render app
- [x] 14.3 Add auth check API endpoint (e.g., `GET /api/auth/check`) — implemented in both auth-routes.ts and server.ts (disabled case)
- [x] 14.4 Handle "auth not enabled" case: render app directly without login flow

## 15. Frontend: SSE Auth

- [x] 15.1 Update `useModelCacheEvents.ts` to append `?token=` to EventSource URL when token exists
- [x] 15.2 Update `useSSGDownload.ts` to append `?token=` to EventSource URL when token exists
- [x] 15.3 Update `useSyncProgress.ts` to include auth header in fetch calls (uses fetch directly, not axios)

## 16. Tests

- [x] 16.1 Test `LocalFileAuthProvider`: authenticate, changePassword, createUser, removeUser, needsPasswordChange
- [x] 16.2 Test token service: issue, verify, blacklist, expiry
- [x] 16.3 Test auth middleware: valid token passes, invalid token returns 401, query param fallback works, blacklisted token rejected
- [x] 16.4 Test auth API routes: login success/failure (via MSW in frontend tests)
- [x] 16.5 Test first-run default user creation (via usersFileExists in provider tests)
- [x] 16.6 Test frontend login flow (MSW mocks for auth endpoints)
- [x] 16.7 Test auth interceptor: token attached to requests

## 17. Documentation

- [x] 17.1 Add auth setup guide to `packages/docs/docs/getting-started/` covering how auth works, default user, config options
- [x] 17.2 Add CLI user management reference with all commands and examples
- [x] 17.3 Add Docker auth section covering env vars, user management via `docker exec`, volume persistence
- [x] 17.4 Update standalone deployment guide to reference auth setup
