# authentication Specification

## Purpose
TBD - created by archiving change standalone-authentication. Update Purpose after archive.
## Requirements
### Requirement: Auth Middleware

The Express server SHALL support optional JWT-based authentication middleware, controlled via `ServerOptions.auth`.

#### Scenario: Auth enabled in standalone mode
- **WHEN** `createServer()` is called with `auth.enabled: true`
- **THEN** an auth middleware SHALL be registered after the JSON body parser and auth API routes
- **AND** all API routes registered after the middleware SHALL require a valid JWT token
- **AND** requests without a valid token SHALL receive a 401 JSON response `{ error: "Unauthorized" }`

#### Scenario: Auth disabled in Electron mode
- **WHEN** `createServer()` is called without `auth` or with `auth.enabled: false`
- **THEN** no auth middleware SHALL be registered
- **AND** all API routes SHALL be accessible without authentication (current behavior)

#### Scenario: Token validation from Authorization header
- **WHEN** a request includes an `Authorization: Bearer <token>` header
- **THEN** the middleware SHALL validate the JWT token
- **AND** attach the decoded user to the request object
- **AND** call `next()` to proceed to the route handler

#### Scenario: Token validation from query parameter (SSE support)
- **WHEN** a request includes a `?token=<jwt>` query parameter
- **AND** no `Authorization` header is present
- **THEN** the middleware SHALL validate the JWT from the query parameter
- **AND** this SHALL work for SSE endpoints (`EventSource` cannot send headers)

### Requirement: Auth API Endpoints

The server SHALL provide public (unauthenticated) API endpoints for authentication operations.

#### Scenario: Login
- **WHEN** a POST request is made to `/api/auth/login` with `{ email, password }`
- **THEN** the server SHALL validate credentials against the configured auth provider
- **AND** on success, return `{ token, refreshToken, user: { id, email, mustChangePassword } }`
- **AND** on failure, return 401 `{ error: "Invalid credentials" }`

#### Scenario: Token refresh
- **WHEN** a POST request is made to `/api/auth/refresh` with `{ refreshToken }`
- **THEN** the server SHALL validate the refresh token
- **AND** on success, return a new `{ token, refreshToken }`
- **AND** on failure, return 401 `{ error: "Invalid refresh token" }`

#### Scenario: Logout
- **WHEN** a POST request is made to `/api/auth/logout` with a valid token
- **THEN** the server SHALL blacklist the token for its remaining lifetime
- **AND** return 200

#### Scenario: Change password
- **WHEN** a POST request is made to `/api/auth/change-password` with `{ oldPassword, newPassword }` and a valid token
- **THEN** the server SHALL validate the old password via the auth provider
- **AND** update the password hash
- **AND** clear the `mustChangePassword` flag
- **AND** return 200

#### Scenario: Auth routes are public
- **WHEN** auth is enabled
- **THEN** `/api/auth/login` and `/api/auth/refresh` SHALL be accessible without a token
- **AND** `/api/auth/change-password` and `/api/auth/logout` SHALL require a valid token

### Requirement: Auth Provider Interface

The backend SHALL define an `AuthProvider` interface that abstracts credential validation, allowing different authentication backends.

#### Scenario: Local file provider
- **WHEN** the auth config specifies `provider: "local"`
- **THEN** a `LocalFileAuthProvider` SHALL be instantiated
- **AND** it SHALL read/write user data from a JSON file in the config directory

#### Scenario: Provider abstraction
- **WHEN** a new auth provider is needed (e.g., OIDC)
- **THEN** it SHALL implement the same `AuthProvider` interface
- **AND** be selectable via the `auth.provider` config setting
- **AND** require no changes to the auth middleware or API routes

### Requirement: Local File Auth Provider

The `LocalFileAuthProvider` SHALL manage users in a `users.json` file with bcrypt-hashed passwords.

#### Scenario: User file location
- **WHEN** the local auth provider is initialized
- **THEN** it SHALL read users from `{configDir}/users.json`
- **AND** the file SHALL NOT be stored in the sites directory

#### Scenario: Password hashing
- **WHEN** a user is created or a password is changed
- **THEN** the password SHALL be hashed with bcrypt (via `bcryptjs`)
- **AND** the plaintext password SHALL never be stored

#### Scenario: Authenticate user
- **WHEN** `authenticate()` is called with email and password
- **THEN** the provider SHALL look up the user by email
- **AND** compare the password against the stored bcrypt hash
- **AND** return the user on success or an error on failure

#### Scenario: Must change password
- **WHEN** a user has `mustChangePassword: true`
- **THEN** `needsPasswordChange()` SHALL return `true`
- **AND** after a successful `changePassword()`, the flag SHALL be set to `false`

### Requirement: JWT Token Lifecycle

The auth system SHALL use short-lived access tokens and longer-lived refresh tokens.

#### Scenario: Access token expiry
- **WHEN** an access token is issued
- **THEN** it SHALL expire after the configured duration (default 15 minutes)
- **AND** the expiry SHALL be configurable via `auth.session.accessTokenExpiry`

#### Scenario: Refresh token expiry
- **WHEN** a refresh token is issued
- **THEN** it SHALL expire after the configured duration (default 7 days)
- **AND** the expiry SHALL be configurable via `auth.session.refreshTokenExpiry`

#### Scenario: Session secret auto-generation
- **WHEN** the server starts for the first time
- **AND** no `auth.session.secret` is configured
- **THEN** a cryptographically random secret SHALL be generated
- **AND** persisted to instance settings for subsequent restarts

### Requirement: First-Run Default User

On first startup with auth enabled, the system SHALL create a default admin user.

#### Scenario: Default user created
- **WHEN** the standalone server starts with auth enabled
- **AND** `users.json` does not exist
- **THEN** a default user SHALL be created with email `admin@localhost` and password `admin`
- **AND** the `mustChangePassword` flag SHALL be `true`
- **AND** the credentials SHALL be printed to the server console

#### Scenario: Existing users file
- **WHEN** the standalone server starts
- **AND** `users.json` already exists
- **THEN** no default user SHALL be created

### Requirement: CLI User Management

The standalone adapter SHALL provide a CLI tool for managing users in the local auth provider.

#### Scenario: Add user
- **WHEN** `user-admin add <email>` is executed
- **THEN** the CLI SHALL prompt for a password
- **AND** create the user in `users.json` with the bcrypt-hashed password
- **AND** set `mustChangePassword: true`

#### Scenario: List users
- **WHEN** `user-admin list` is executed
- **THEN** the CLI SHALL print all users with their email and status (active/must-change-password)
- **AND** SHALL NOT print password hashes

#### Scenario: Remove user
- **WHEN** `user-admin remove <email>` is executed
- **THEN** the CLI SHALL remove the user from `users.json`

#### Scenario: Reset password
- **WHEN** `user-admin reset-password <email>` is executed
- **THEN** the CLI SHALL prompt for a new password
- **AND** update the bcrypt hash in `users.json`
- **AND** set `mustChangePassword: true`

