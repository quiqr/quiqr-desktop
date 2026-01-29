## ADDED Requirements

### Requirement: Dependency Injection Container

The backend SHALL use a dependency injection container to provide configuration, state, and adapters to all services.

#### Scenario: Container creation
- **WHEN** backend initializes
- **THEN** an AppContainer is created with config, state, and adapters
- **AND** all services receive container via constructor injection
- **AND** no global variables are used

#### Scenario: Service dependency access
- **WHEN** a service needs configuration
- **THEN** it accesses `container.config`
- **AND** TypeScript ensures config interface is correct
- **AND** no direct file access to config is needed

#### Scenario: Adapter injection
- **WHEN** a service needs platform operations
- **THEN** it accesses `container.adapters.dialog` (or other adapter)
- **AND** adapter implementation is determined at container creation
- **AND** service code is platform-agnostic

### Requirement: AppConfig Class

The backend SHALL use an AppConfig class instead of global state for application configuration.

#### Scenario: Load configuration
- **WHEN** AppConfig is instantiated
- **THEN** it loads configuration from user data directory
- **AND** validates config against `appConfigSchema` from `@quiqr/types`
- **AND** provides typed getters for all config values

#### Scenario: Save configuration changes
- **WHEN** configuration is modified
- **THEN** AppConfig.save() persists changes to disk
- **AND** validates new config before saving
- **AND** maintains config file consistency

#### Scenario: Replace global.pogoconf
- **WHEN** old code referenced `global.pogoconf`
- **THEN** new code uses `container.config`
- **AND** provides same functionality with type safety
- **AND** no global variables exist

### Requirement: AppState Class

The backend SHALL use an AppState class for runtime state management.

#### Scenario: Track current workspace
- **WHEN** user opens a workspace
- **THEN** `container.state.currentSiteKey` is updated
- **AND** `container.state.currentWorkspaceKey` is updated
- **AND** `container.state.currentSitePath` is set
- **AND** all services have access to current workspace

#### Scenario: Replace global runtime state
- **WHEN** old code used `global.currentSiteKey` etc.
- **THEN** new code uses `container.state`
- **AND** state is explicit dependency
- **AND** no hidden global state

### Requirement: Platform Adapter Interfaces

The backend SHALL define interfaces for all platform-specific operations and depend only on these interfaces, not implementations.

#### Scenario: Service uses dialog adapter
- **WHEN** service needs to show file picker
- **THEN** it calls `container.adapters.dialog.showOpenDialog()`
- **AND** service code doesn't know if it's Electron or web
- **AND** adapter implementation is injected at runtime

#### Scenario: Mock adapters for testing
- **WHEN** testing a service
- **THEN** test creates mock adapters
- **AND** injects mocks into container
- **AND** service behavior can be tested without Electron

## REMOVED Requirements

### Requirement: Global State Variables

**Reason:** Global variables like `global.pogoconf`, `global.currentSiteKey` caused tight coupling and made testing difficult.

**Migration:** Replace all global state references with container dependencies.

## MODIFIED Requirements

None - this establishes new dependency injection patterns.
