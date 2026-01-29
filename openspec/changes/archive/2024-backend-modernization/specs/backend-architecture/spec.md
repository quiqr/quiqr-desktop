## ADDED Requirements

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

## REMOVED Requirements

None - this is a new architectural layer for the backend. The backend previously had no formal requirements.

## MODIFIED Requirements

### Requirement: Backend Platform Coupling (Removed Constraint)

**Before:** Backend directly imported and used Electron APIs throughout the codebase.

**After:** Backend is platform-agnostic and uses adapter interfaces for platform-specific operations.

**Rationale:** Enables standalone server deployment and improves testability. See `dependency-injection` spec for adapter pattern requirements.
