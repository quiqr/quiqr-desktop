## ADDED Requirements

### Requirement: Auth Setup Documentation

The documentation site SHALL include a guide for configuring authentication in standalone mode.

#### Scenario: Auth setup guide exists
- **WHEN** a user wants to secure their standalone Quiqr deployment
- **THEN** documentation SHALL describe:
  - How authentication works (JWT, local file provider)
  - Default admin user and forced password change
  - Instance settings auth configuration options
  - Environment variables for auth config

### Requirement: CLI User Management Documentation

The documentation SHALL include a reference for the user management CLI tool.

#### Scenario: CLI reference exists
- **WHEN** a user needs to manage users
- **THEN** documentation SHALL describe:
  - All CLI commands (add, list, remove, reset-password)
  - How to run commands directly and via Docker exec
  - Examples for common operations

### Requirement: Docker Auth Documentation

The documentation SHALL include auth-specific Docker deployment guidance.

#### Scenario: Docker auth guide exists
- **WHEN** a user deploys Quiqr with Docker and wants authentication
- **THEN** documentation SHALL describe:
  - Auth-related environment variables
  - Managing users inside a Docker container
  - Persisting auth data via volumes
