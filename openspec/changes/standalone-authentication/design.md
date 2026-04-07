## Context

Quiqr Desktop runs in two modes: Electron (desktop, single-user) and standalone (server, multi-user). The standalone server now serves both API and frontend from one Express server (via the `unified-frontend-serving` change). There is currently no authentication — anyone who can reach the port has full access.

The auth system must be optional (Electron never uses it), configurable (different auth providers), and extensible (OIDC/LDAP/SAML later). Only the local file provider is implemented in this phase.

Reference implementations:
- Server factory with conditional middleware: `packages/backend/src/api/server.ts` (CORS and frontendPath patterns)
- DI container: `packages/backend/src/config/container.ts`
- Config system: `packages/backend/src/config/unified-config-service.ts`
- Standalone adapter: `packages/adapters/standalone/src/main.ts`

## Goals / Non-Goals

**Goals:**
- Protect the standalone server with JWT-based authentication
- Local file auth provider with bcrypt password hashing as default
- CLI tool for user management (no admin UI)
- Forced password change on first login
- SSE auth via query parameter
- Extensible auth provider interface for future OIDC/LDAP/SAML
- Electron mode entirely unaffected

**Non-Goals:**
- Authorization / role-based permissions (all authenticated users have full access)
- Admin UI for user management
- External auth providers (architecture only, no implementation)
- API keys, MFA, OAuth flows

## Decisions

### Decision 1: JWT with short-lived access + refresh tokens

Use `jsonwebtoken` for stateless JWT tokens. Access tokens are short-lived (15 minutes), refresh tokens are longer (7 days). The refresh token is used to get a new access token without re-entering credentials.

**Why JWT over server-side sessions?** Quiqr is a single-server application — the simplicity benefit of sessions (easy revocation) doesn't outweigh the operational benefit of stateless tokens (no session store to manage, no cleanup, no sticky sessions if we ever scale). Token revocation is handled by short expiry + a simple in-memory blacklist for explicit logouts.

**Why not Passport.js?** While Passport.js was considered for its extensive strategy ecosystem, it adds complexity for the initial local-file-only implementation. The auth provider interface we define is simple enough that adding a Passport strategy adapter later is straightforward. We avoid the dependency until we need multi-provider support.

### Decision 2: Auth provider interface

```typescript
interface AuthProvider {
  authenticate(credentials: { email: string; password: string }): Promise<AuthResult>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  getUserById(userId: string): Promise<AuthUser | null>;
  needsPasswordChange(userId: string): Promise<boolean>;
}

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface AuthUser {
  id: string;
  email: string;
  mustChangePassword: boolean;
}
```

The `LocalFileAuthProvider` implements this interface using `users.json` + `bcryptjs`. Future providers (OIDC, LDAP) implement the same interface.

**Why an interface and not just inline code?** Even though only one provider exists now, the interface costs almost nothing and makes the future provider work trivial. The standalone adapter instantiates the right provider based on config and injects it into the container.

### Decision 3: Auth config in instance settings

```json
{
  "auth": {
    "enabled": true,
    "provider": "local",
    "local": {
      "usersFile": "users.json"
    },
    "session": {
      "secret": "auto-generated-on-first-run",
      "accessTokenExpiry": "15m",
      "refreshTokenExpiry": "7d"
    }
  }
}
```

The `session.secret` is auto-generated (crypto.randomBytes) on first startup if not present. This ensures each installation has a unique secret without manual configuration.

**Why instance settings and not a separate config file?** It follows the existing config pattern. Instance settings are already the place for server-level configuration. The `auth` block is a natural addition alongside `storage`, `git`, and `logging`.

### Decision 4: Users file in config dir, not sites dir

The `users.json` file lives in the config directory (`~/.quiqr-standalone/` / `quiqr-conf` Docker volume), not the sites directory. This prevents:
- Password hashes from being synced via git operations
- Content editing from accidentally modifying auth data
- Users from being visible as "content" in the Quiqr UI

### Decision 5: Middleware pipeline positioning

```
1. express.static(frontendPath)  ← public (login page must load)
2. express.json()
3. Auth routes (POST /api/auth/*) ← public
4. Auth middleware               ← validates token, attaches user to req
5. Protected API routes          ← all /api/:method, SSE endpoints
6. SPA catch-all                 ← public (serves index.html)
7. Error handler
```

Static files come first so the SPA (including login page) loads without auth. Auth API routes are registered before the auth middleware so login/refresh work without a token. All other API routes are after the middleware and require a valid token.

**Why static files before auth?** The React SPA must load before the user can authenticate. The SPA itself handles showing login vs. app based on token state.

### Decision 6: SSE auth via query parameter

`EventSource` cannot send custom headers. SSE endpoints accept the JWT via `?token=` query parameter:

```
new EventSource('/api/workspace/site1/ws1/model-events?token=eyJ...')
```

The auth middleware checks `req.headers.authorization` first, then falls back to `req.query.token`. This keeps regular API calls clean (header-based) while supporting SSE.

**Accepted risk:** Tokens in URLs can appear in server logs. Mitigated by short token expiry (15 minutes) and the fact that standalone deployments are typically on private networks.

### Decision 7: CLI user management tool

A standalone script at `packages/adapters/standalone/src/cli/user-admin.ts` that reads/writes `users.json` directly:

```bash
node dist/cli/user-admin.js add <email>        # prompts for password
node dist/cli/user-admin.js list
node dist/cli/user-admin.js remove <email>
node dist/cli/user-admin.js reset-password <email>
```

Exposed via npm script: `npm run user -w @quiqr/adapter-standalone -- add admin@example.com`

The Dockerfile and docker-compose can expose this as: `docker exec quiqr npm run user -w @quiqr/adapter-standalone -- list`

### Decision 8: First-run default user

On first startup, if `users.json` doesn't exist, the standalone adapter creates it with a default admin user:
- Email: `admin@localhost`
- Password: `admin` (bcrypt-hashed)
- `mustChangePassword: true`

The password and email are printed to the console at startup. The frontend forces the password change before allowing access.

### Decision 9: Frontend auth architecture

- **Token storage**: `localStorage` for access token, `localStorage` for refresh token
- **Axios interceptor**: Attaches `Authorization: Bearer <token>` to all requests
- **401 handling**: Axios response interceptor catches 401, attempts token refresh, retries the request. If refresh fails, redirects to login.
- **Auth-aware routing**: A wrapper component checks for a valid token. No token → render login page. Token present → render app. `mustChangePassword` → render change-password form.
- **No new state management**: Token state is in localStorage, checked on app mount. React Query handles server state as usual.

## Risks / Trade-offs

**[Risk] Default password left unchanged** — Users may forget to change the default admin password.
→ Mitigation: `mustChangePassword` flag forces change on first login. The frontend blocks all access until password is changed.

**[Risk] JWT token in SSE query params visible in logs** — Server access logs may contain tokens.
→ Mitigation: Short-lived tokens (15 min). Standalone deployments are typically on private networks. Future: consider log scrubbing.

**[Risk] In-memory token blacklist lost on restart** — If the server restarts, blacklisted (logged-out) tokens become valid again until they expire.
→ Mitigation: Short access token expiry (15 min) limits the window. Acceptable for Phase 1.

**[Trade-off] No Passport.js** — Simpler now, but adding OIDC/LDAP later requires either adopting Passport or writing custom provider adapters.
→ The auth provider interface is designed to map cleanly to Passport strategies if we adopt it later.

**[Trade-off] CLI-only user management** — Less convenient than a UI, but dramatically simpler to implement.
→ Admin UI is a natural Phase 2 follow-up when authorization/permissions are added.

## Open Questions

- Should the refresh token be stored as an HttpOnly cookie instead of localStorage for better XSS protection? For Phase 1, localStorage is simpler and consistent with the access token. Can revisit if security hardening is needed.
