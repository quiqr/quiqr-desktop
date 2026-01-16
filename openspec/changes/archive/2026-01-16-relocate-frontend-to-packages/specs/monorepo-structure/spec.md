## ADDED Requirements

### Requirement: Consistent Workspace Location

All npm workspace packages MUST be located under the `packages/` directory.

#### Scenario: Frontend package location
- **GIVEN** the Quiqr Desktop monorepo structure
- **WHEN** a developer inspects workspace package locations
- **THEN** the frontend package MUST be at `packages/frontend/`
- **AND** the package.json MUST have name `@quiqr/frontend`

#### Scenario: Workspace listing
- **GIVEN** the root package.json workspaces configuration
- **WHEN** all workspace paths are examined
- **THEN** every workspace path MUST start with `packages/`

### Requirement: Scoped Package Naming

All workspace packages MUST use the `@quiqr/` npm scope.

#### Scenario: Frontend package name
- **GIVEN** the frontend workspace package
- **WHEN** the package.json is read
- **THEN** the name field MUST be `@quiqr/frontend`

#### Scenario: Package naming consistency
- **GIVEN** all workspace packages in the monorepo
- **WHEN** package names are examined
- **THEN** each MUST follow the pattern `@quiqr/<package-name>`
