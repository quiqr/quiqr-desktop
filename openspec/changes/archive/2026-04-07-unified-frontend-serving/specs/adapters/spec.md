## MODIFIED Requirements

### Requirement: Adapter Testing Infrastructure

Both adapter packages SHALL have comprehensive test coverage using Vitest to ensure platform abstractions work correctly.

#### Scenario: Electron adapter tests configured
- **WHEN** @quiqr/adapter-electron package is built
- **THEN** it includes vitest.config.ts with Node environment
- **AND** includes test scripts in package.json
- **AND** provides setup.ts with Electron API mocks
- **AND** is registered in root vitest.config.ts projects array

#### Scenario: Standalone adapter tests configured
- **WHEN** @quiqr/adapter-standalone package is built
- **THEN** it includes vitest.config.ts with Node environment
- **AND** includes test scripts in package.json
- **AND** provides setup.ts for test infrastructure
- **AND** is registered in root vitest.config.ts projects array

#### Scenario: Adapter implementations tested
- **WHEN** running adapter test suites
- **THEN** all adapter implementations have unit tests
- **AND** tests use mocked external dependencies (Electron APIs, Node APIs)
- **AND** coverage targets 50%+ for adapter code (excluding main.ts orchestration)
- **AND** tests verify correct API wrapping and state management

#### Scenario: Menu adapter state management tested
- **WHEN** testing menu adapters
- **THEN** tests verify menu state updates correctly
- **AND** tests verify menu item enabling/disabling
- **AND** tests verify menu structure generation
- **AND** tests use mocked container configuration

#### Scenario: Factory functions tested
- **WHEN** testing adapter creation functions
- **THEN** tests verify all required adapters are created
- **AND** tests verify adapters are properly wired together
- **AND** tests verify factory handles dependencies correctly

#### Scenario: Frontend build path resolution tested
- **WHEN** testing the standalone adapter
- **THEN** tests SHALL verify frontend build path resolution from default location
- **AND** tests SHALL verify `FRONTEND_PATH` environment variable override
- **AND** tests SHALL verify graceful fallback to API-only mode when build is missing

## ADDED Requirements

### Requirement: Standalone Adapter Frontend Serving

The standalone adapter SHALL resolve the frontend build path and pass it to the shared `createServer()` factory, enabling unified frontend+API serving.

#### Scenario: Standalone serves frontend in production
- **WHEN** the standalone adapter starts
- **AND** the frontend build is present
- **THEN** it SHALL pass the `frontendPath` option to `createServer()`
- **AND** the Express server SHALL serve both API and frontend on the same port

#### Scenario: Electron adapter uses shared frontend serving
- **WHEN** the Electron adapter starts in production mode
- **THEN** it SHALL resolve the frontend build directory using `findFrontendBuildDir()`
- **AND** pass the resolved path as `frontendPath` to `createServer()`
- **AND** SHALL NOT add `express.static()` or SPA catch-all middleware directly
