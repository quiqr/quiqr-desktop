# Backend Architecture Specification

## Purpose

The backend architecture defines how Quiqr Desktop's server-side code is organized, built, and deployed across multiple platforms using TypeScript, ESM, and NPM workspaces.

## Requirements

### Requirement: TypeScript + ESM Backend

The backend SHALL be written in TypeScript and use ESM (ES Modules) instead of CommonJS.

#### Scenario: TypeScript compilation
- **WHEN** backend code is written
- **THEN** it uses TypeScript with strict type checking
- **AND** compiles to JavaScript in `dist/` folder
- **AND** all type errors must be resolved before deployment

#### Scenario: ESM imports
- **WHEN** backend modules import dependencies
- **THEN** they use `import` statements instead of `require()`
- **AND** all exports use `export` instead of `module.exports`
- **AND** package.json specifies `"type": "module"`

### Requirement: Shared Types Package

The system SHALL maintain a shared `@quiqr/types` package containing all Zod schemas and TypeScript types used by both frontend and backend.

#### Scenario: Frontend imports types
- **WHEN** frontend code needs type definitions
- **THEN** it imports from `@quiqr/types`
- **AND** TypeScript resolves types correctly
- **AND** Zod schemas can validate at runtime

#### Scenario: Backend imports types
- **WHEN** backend code needs type definitions
- **THEN** it imports from `@quiqr/types`
- **AND** uses same schemas as frontend
- **AND** maintains type contract

#### Scenario: Schema changes propagate
- **WHEN** a schema is updated in `@quiqr/types`
- **THEN** both frontend and backend see the change
- **AND** TypeScript catches any breaking changes
- **AND** single source of truth is maintained

### Requirement: NPM Workspaces Structure

The project SHALL use NPM workspaces to organize packages with clean boundaries.

#### Scenario: Workspace imports in development
- **WHEN** running in development mode
- **THEN** imports like `@quiqr/types` resolve to `packages/types/src/`
- **AND** TypeScript type checking works across workspaces
- **AND** changes are immediately available without rebuild

#### Scenario: Workspace imports in production
- **WHEN** packages are built for production
- **THEN** imports like `@quiqr/types` resolve to `packages/types/dist/`
- **AND** same import statements work without changes
- **AND** compiled JavaScript is used

#### Scenario: Clean import paths
- **WHEN** a package needs to import from another package
- **THEN** it uses `@quiqr/package-name` imports
- **AND** never uses relative paths like `../../../`
- **AND** imports are consistent across dev and production

### Requirement: Pluggable SSG Provider System

The backend SHALL provide a pluggable architecture for supporting multiple Static Site Generators through common interfaces.

#### Scenario: Register built-in providers
- **WHEN** the backend initializes
- **THEN** it SHALL load and register all built-in providers (Hugo, Eleventy)
- **AND** each provider SHALL be registered independently with error isolation
- **AND** failure to load one provider SHALL NOT prevent loading others
- **AND** errors SHALL be logged to OutputConsole

#### Scenario: Get provider by type
- **WHEN** code requests a provider by SSG type (e.g., "hugo", "eleventy")
- **THEN** the provider registry SHALL return the appropriate provider instance
- **AND** if provider is not found, SHALL throw clear error message

#### Scenario: Standard dev server port
- **WHEN** any SSG provider starts a dev server
- **THEN** it SHALL use port 13131
- **AND** preview button SHALL always link to `http://localhost:13131`

### Requirement: SSG Binary Management

The system SHALL support two distribution patterns: standalone binaries and npm packages.

#### Scenario: Check version installed (standalone binary)
- **WHEN** checking if a specific version is installed
- **THEN** it SHALL check path from `pathHelper.getSSGBinForVer(ssgType, version)`
- **AND** return true if binary file exists

#### Scenario: Check version installed (npm package)
- **WHEN** checking if npm package version is installed
- **THEN** it SHALL check `[installDir]/node_modules/.bin/[package]`
- **AND** on Windows, SHALL also check for `.cmd` wrapper

#### Scenario: Download with progress streaming
- **WHEN** downloading/installing SSG version
- **THEN** it SHALL use async generator pattern yielding progress objects
- **AND** progress SHALL be streamed via SSE to frontend
- **AND** supports graceful cancellation

