# Change: Relocate frontend workspace to packages directory

## Why

The frontend workspace is the only workspace not located under `packages/`. All other workspaces (`@quiqr/types`, `@quiqr/backend`, `@quiqr/adapter-electron`, `@quiqr/adapter-standalone`) follow the consistent pattern of living in `packages/`. This inconsistency creates confusion and breaks the expectation that all workspace packages are in one location.

## What Changes

- Move `/frontend/` directory to `/packages/frontend/`
- Rename package to `@quiqr/frontend` (add `name` field to package.json)
- Update root `package.json`:
  - Workspace configuration: `"frontend"` -> `"packages/frontend"`
  - Scripts referencing `frontend` path -> `packages/frontend`
  - electron-builder `files` config: `frontend/build/**/*` -> `packages/frontend/build/**/*`
  - electron-builder `directories.buildResources`: `frontend/public` -> `packages/frontend/public`
- Update `.gitignore`: `frontend/build` -> `packages/frontend/build`
- Update `vitest.config.ts`: workspace path reference
- Update `.github/workflows/test.yml`: working directory references
- Update documentation (`AGENTS.md`, `CONTRIBUTING.md`, `openspec/project.md`, specs)

## Impact

- **Affected specs**: None directly (new capability: monorepo-structure)
- **Affected code**:
  - `package.json` (root)
  - `packages/frontend/package.json` (formerly `frontend/package.json`)
  - `vitest.config.ts`
  - `.github/workflows/test.yml`
  - `.gitignore`
  - `packages/adapters/electron/src/main.ts` (already handles `packages/frontend/build` lookup)
- **No breaking changes**: The electron adapter already has forward-compatible lookup for `packages/frontend/build`
- **Documentation updates**: Multiple docs reference `frontend/` path
