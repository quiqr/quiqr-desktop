# auth-frontend Specification

## Purpose
TBD - created by archiving change standalone-authentication. Update Purpose after archive.
## Requirements
### Requirement: Login Page

The frontend SHALL provide a login page for unauthenticated users.

#### Scenario: Unauthenticated user
- **WHEN** the SPA loads and no valid token is in localStorage
- **THEN** the login page SHALL be rendered instead of the application
- **AND** the login page SHALL present email and password fields

#### Scenario: Successful login
- **WHEN** the user submits valid credentials
- **THEN** the frontend SHALL call `POST /api/auth/login`
- **AND** store the returned token and refreshToken in localStorage
- **AND** if `mustChangePassword` is false, navigate to the application
- **AND** if `mustChangePassword` is true, navigate to the change-password form

#### Scenario: Failed login
- **WHEN** the user submits invalid credentials
- **THEN** the frontend SHALL display an error message
- **AND** remain on the login page

### Requirement: Forced Password Change

The frontend SHALL force a password change when the `mustChangePassword` flag is set.

#### Scenario: Must change password after login
- **WHEN** login succeeds with `mustChangePassword: true`
- **THEN** the frontend SHALL render a change-password form
- **AND** SHALL NOT allow navigation to the application until the password is changed

#### Scenario: Password changed successfully
- **WHEN** the user submits a new password via the change-password form
- **THEN** the frontend SHALL call `POST /api/auth/change-password`
- **AND** on success, navigate to the application

### Requirement: Auth Token Management

The frontend SHALL manage JWT tokens for authenticated API access.

#### Scenario: Attach token to requests
- **WHEN** a token exists in localStorage
- **THEN** an axios request interceptor SHALL attach `Authorization: Bearer <token>` to all API requests

#### Scenario: Attach token to SSE connections
- **WHEN** creating an `EventSource` for SSE endpoints
- **THEN** the frontend SHALL append `?token=<jwt>` to the SSE URL

#### Scenario: Automatic token refresh on 401
- **WHEN** an API request receives a 401 response
- **THEN** the axios response interceptor SHALL attempt to refresh the token via `POST /api/auth/refresh`
- **AND** on success, retry the original request with the new token
- **AND** on failure, clear tokens from localStorage and redirect to the login page

#### Scenario: Logout
- **WHEN** the user logs out
- **THEN** the frontend SHALL call `POST /api/auth/logout`
- **AND** clear tokens from localStorage
- **AND** redirect to the login page

### Requirement: Auth-Aware Routing

The frontend SHALL conditionally render the application or login page based on authentication state.

#### Scenario: App mount with valid token
- **WHEN** the SPA mounts and a non-expired token exists in localStorage
- **THEN** the application SHALL render normally

#### Scenario: App mount without token
- **WHEN** the SPA mounts and no token exists in localStorage
- **AND** auth is enabled on the backend
- **THEN** the login page SHALL render

#### Scenario: Auth not enabled
- **WHEN** the backend does not require authentication
- **THEN** the frontend SHALL render the application without any login flow
- **AND** no auth interceptors SHALL be active

### Requirement: User Menu

The standalone text menu SHALL include a "User" menu when authentication is enabled.

#### Scenario: User menu visible when auth is enabled
- **WHEN** the application is running in standalone mode with auth enabled
- **THEN** a "User" menu SHALL appear in the menu bar
- **AND** it SHALL contain "Change Password" and "Logout" items

#### Scenario: User menu hidden when auth is disabled
- **WHEN** the application is running without auth (Electron or standalone without auth)
- **THEN** no "User" menu SHALL appear in the menu bar

#### Scenario: Logout via menu
- **WHEN** the user clicks "Logout" in the User menu
- **THEN** the frontend SHALL call `POST /api/auth/logout`
- **AND** clear tokens from localStorage
- **AND** redirect to the login page

#### Scenario: Change password via menu
- **WHEN** the user clicks "Change Password" in the User menu
- **THEN** the frontend SHALL navigate to the change-password form
- **AND** after a successful password change, navigate back to the application

