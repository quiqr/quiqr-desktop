## ADDED Requirements

### Requirement: Auth Configuration in Instance Settings

The instance settings schema SHALL include an `auth` configuration block for authentication settings.

#### Scenario: Auth config structure
- **WHEN** reading instance settings
- **THEN** the `auth` property SHALL be an optional object with:
  - `enabled`: boolean (default: false)
  - `provider`: string (`"local"` for Phase 1)
  - `local`: object with `usersFile` (string, default: `"users.json"`)
  - `session`: object with `secret` (string), `accessTokenExpiry` (string, default: `"15m"`), `refreshTokenExpiry` (string, default: `"7d"`)

#### Scenario: Auth config validated with Zod
- **WHEN** instance settings are loaded
- **THEN** the `auth` block SHALL be validated against a Zod schema
- **AND** missing optional fields SHALL receive default values

#### Scenario: Session secret auto-generation
- **WHEN** `auth.enabled` is `true`
- **AND** `auth.session.secret` is not set
- **THEN** the system SHALL generate a cryptographically random secret
- **AND** persist it to instance settings

#### Scenario: Environment variable overrides
- **WHEN** `QUIQR_AUTH_ENABLED` is set
- **THEN** it SHALL override `auth.enabled` in instance settings
- **AND** `QUIQR_AUTH_SESSION_SECRET` SHALL override `auth.session.secret`
