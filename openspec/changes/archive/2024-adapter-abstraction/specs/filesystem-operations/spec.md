## ADDED Requirements

### Requirement: Filesystem Abstraction Migration Strategy

The codebase SHALL migrate from direct `fs` usage to FilesystemAdapter over multiple phases, starting with proof-of-concept and expanding incrementally.

#### Scenario: Proof-of-concept migration
- **WHEN** implementing Phase 1
- **THEN** ConfigurationDataProvider is migrated first
- **AND** all `fs` calls are replaced with `container.adapters.filesystem` calls
- **AND** existing tests verify behavior remains unchanged

#### Scenario: Full migration scope
- **WHEN** all migrations are complete
- **THEN** approximately 25 backend files use FilesystemAdapter
- **AND** no direct `fs` or `fs-extra` calls remain in services
- **AND** all file operations go through the adapter layer

#### Scenario: Migration documentation
- **WHEN** proof-of-concept is complete
- **THEN** migration documentation lists all files requiring updates
- **AND** provides patterns and examples
- **AND** allows incremental migration over time

### Requirement: Service Adapter Access

All backend services SHALL access filesystem operations through the dependency injection container, not direct imports.

#### Scenario: Service using filesystem
- **WHEN** a service needs file operations
- **THEN** it receives `container` via dependency injection
- **AND** uses `container.adapters.filesystem.readFile()`, etc.
- **AND** never imports `fs` or `fs-extra` directly

#### Scenario: Path resolution
- **WHEN** service needs to resolve paths
- **THEN** it uses `container.adapters.filesystem.resolvePath()`
- **AND** adapter handles platform-specific path logic

### Requirement: Adapter Build-Time Selection

The application SHALL select and wire adapters at build time based on deployment target, not runtime detection.

#### Scenario: Electron build
- **WHEN** building for Electron
- **THEN** `createElectronAdapters()` provides platform adapters
- **AND** includes LocalFilesystemAdapter, native menu, etc.
- **AND** no runtime platform detection occurs

#### Scenario: Web build
- **WHEN** building for web deployment
- **THEN** `createWebAdapters()` provides platform adapters
- **AND** includes LocalFilesystemAdapter, no-op menu, WebSocket console
- **AND** same backend code runs with different adapters

## MODIFIED Requirements

None - this defines new operational patterns for the adapter system.
