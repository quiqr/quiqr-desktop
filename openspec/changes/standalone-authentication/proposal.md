## Why

The standalone server exposes the full Quiqr API and frontend on an HTTP port with no access control. Anyone who can reach the port can read, modify, and delete all site content. With unified frontend serving now in place, authentication is the critical next step to make standalone/Docker deployments safe for real use.

## What Changes

- Add optional JWT-based authentication middleware to the Express server, controlled via `ServerOptions.auth`
- Implement a local file auth provider that stores users with bcrypt-hashed passwords in `users.json` in the config directory
- Add auth API endpoints: login, logout, refresh token, change password — all public (no auth required)
- All other API endpoints and SSE streams become protected when auth is enabled
- SSE endpoints accept auth tokens via query parameter (`?token=...`) since `EventSource` cannot send headers
- Frontend gains a login page, forced password change flow, and an axios interceptor for token management
- CLI tool for user management (add, list, remove, reset-password) — no admin UI in this phase
- On first install, a default admin user is created with a `mustChangePassword` flag
- Electron adapter: auth is always disabled — no changes to Electron behavior
- Auth provider system is designed to be extensible (OIDC, LDAP, SAML in future), but only the local file provider is implemented now
- New npm dependencies: `bcryptjs` (password hashing), `jsonwebtoken` (JWT)
- Documentation for standalone auth setup, CLI tool usage, and Docker auth configuration

## Non-goals

- Authorization / permissions (users have full access once authenticated)
- Admin UI for user management (CLI-only in this phase)
- External auth providers (OIDC, LDAP, SAML) — architecture supports them, but not implemented
- API key support
- Multi-factor authentication
- Any changes to Electron mode behavior

## Capabilities

### New Capabilities
- `authentication`: JWT-based auth middleware, local file auth provider, token lifecycle (issue, refresh, revoke), user management CLI, password hashing, first-run default user setup
- `auth-frontend`: Login page, forced password change flow, token storage in localStorage, axios auth interceptor, auth-aware routing (redirect to login when unauthenticated)

### Modified Capabilities
- `communication-layer`: SSE endpoints accept auth tokens via query parameter; all API endpoints require auth when enabled
- `adapters`: Standalone adapter configures auth from instance settings; Electron adapter explicitly disables auth
- `unified-config`: Instance settings extended with auth configuration block (provider type, session secret, token expiry)
- `documentation`: Auth setup guide, CLI usage, Docker auth configuration

## Impact

- **packages/backend/src/api/server.ts**: Auth middleware added to pipeline, auth API routes added
- **packages/backend/src/api/middleware/**: New auth middleware module
- **packages/backend/src/services/**: New `AuthService` with provider abstraction
- **packages/backend/src/config/container.ts**: `AuthService` added to DI container
- **packages/types/src/schemas/**: Auth-related Zod schemas (login request/response, user, token)
- **packages/adapters/standalone/**: Auth config resolution, CLI tool for user management
- **packages/adapters/electron/**: Explicitly passes `auth: { enabled: false }`
- **packages/frontend/src/**: Login page component, password change component, auth interceptor, auth-aware routing
- **New dependencies**: `bcryptjs`, `jsonwebtoken`, `@types/jsonwebtoken`
- **Instance settings schema**: Extended with `auth` configuration block
- **packages/docs/**: Auth documentation added
