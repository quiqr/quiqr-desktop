## ADDED Requirements

### Requirement: Standalone Auth Configuration

The standalone adapter SHALL configure authentication based on instance settings and pass the auth config to `createServer()`.

#### Scenario: Auth enabled by default in standalone
- **WHEN** the standalone server starts
- **AND** instance settings include `auth.enabled: true` (or auth config is present)
- **THEN** the adapter SHALL instantiate the configured auth provider
- **AND** pass `auth` options to `createServer()`

#### Scenario: Auth disabled in standalone
- **WHEN** the standalone server starts
- **AND** instance settings have `auth.enabled: false` or no auth config
- **THEN** the adapter SHALL NOT configure auth
- **AND** the server SHALL run without authentication (current behavior)

#### Scenario: First-run default user creation
- **WHEN** the standalone server starts with auth enabled
- **AND** the users file does not exist
- **THEN** the adapter SHALL create the default admin user
- **AND** print the default credentials to the console

### Requirement: Electron Auth Disabled

The Electron adapter SHALL explicitly disable authentication.

#### Scenario: Electron never uses auth
- **WHEN** the Electron adapter starts
- **THEN** it SHALL NOT pass `auth` options to `createServer()`
- **AND** no auth middleware SHALL be active
- **AND** no auth-related config SHALL be read or written
