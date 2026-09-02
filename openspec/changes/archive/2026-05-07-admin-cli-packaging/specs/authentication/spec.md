## MODIFIED Requirements

### Requirement: CLI User Management

The standalone adapter SHALL provide a CLI tool (`quiqr-admin`) for managing users in the local auth provider. The CLI SHALL be registered as a `bin` entry in `package.json` and SHALL respect the `QUIQR_CONF_DIR` environment variable to locate the configuration directory.

#### Scenario: Add user
- **WHEN** `quiqr-admin add <email>` is executed
- **THEN** the CLI SHALL prompt for a password
- **AND** create the user in `users.json` with the bcrypt-hashed password
- **AND** set `mustChangePassword: true`

#### Scenario: List users
- **WHEN** `quiqr-admin list` is executed
- **THEN** the CLI SHALL print all users with their email and status (active/must-change-password)
- **AND** SHALL NOT print password hashes

#### Scenario: Remove user
- **WHEN** `quiqr-admin remove <email>` is executed
- **THEN** the CLI SHALL remove the user from `users.json`

#### Scenario: Reset password
- **WHEN** `quiqr-admin reset-password <email>` is executed
- **THEN** the CLI SHALL prompt for a new password
- **AND** update the bcrypt hash in `users.json`
- **AND** set `mustChangePassword: true`

#### Scenario: QUIQR_CONF_DIR support
- **WHEN** `QUIQR_CONF_DIR` is set
- **THEN** the CLI SHALL use that directory to locate `users.json`

#### Scenario: QUIQR_CONF_DIR not set
- **WHEN** `QUIQR_CONF_DIR` is not set
- **THEN** the CLI SHALL default to `~/.quiqr-standalone`

#### Scenario: Help output
- **WHEN** `quiqr-admin` is executed without arguments or with `--help`
- **THEN** the CLI SHALL display usage information including available commands and the `QUIQR_CONF_DIR` environment variable
