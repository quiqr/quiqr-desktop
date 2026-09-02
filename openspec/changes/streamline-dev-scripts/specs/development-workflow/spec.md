## ADDED Requirements

### Requirement: Explicit per-edition development commands

The root `package.json` SHALL provide one full-stack development command per edition, with explicit edition names. There SHALL NOT be a generic `dev` script that implicitly selects an edition.

- `dev:electron` SHALL start the full Electron development stack: the `@quiqr/types`, `@quiqr/backend`, and `@quiqr/adapter-electron` TypeScript watchers, the Vite frontend dev server, and the Electron app (launched after the frontend is reachable).
- `dev:standalone` SHALL start the full standalone development stack: the `@quiqr/types`, `@quiqr/backend`, and `@quiqr/adapter-standalone` TypeScript watchers, the Vite frontend dev server, and the standalone Express server.

Both commands SHALL run their processes concurrently with labeled, color-coded output.

#### Scenario: Electron development command runs the full stack

- **WHEN** a developer runs `npm run dev:electron`
- **THEN** the types/backend/electron-adapter watchers, the Vite frontend dev server, and the Electron app all start
- **AND** the Electron app launches only after the frontend dev server is reachable

#### Scenario: Standalone development command includes the frontend

- **WHEN** a developer runs `npm run dev:standalone`
- **THEN** the types/backend/standalone-adapter watchers, the Vite frontend dev server, and the standalone Express server all start
- **AND** the developer can open the UI without running a second command

#### Scenario: No implicit default development command

- **WHEN** a developer runs `npm run dev`
- **THEN** npm reports a missing script (there is no generic `dev`); the developer must choose `dev:electron` or `dev:standalone`

### Requirement: Explicit per-edition start commands

The root `package.json` SHALL provide one production-style start command per edition, with explicit edition names.

- `start:electron` SHALL run the packaged-style Electron app (`electron-forge start`).
- `start:standalone` SHALL build the required packages and run the standalone Express server.

#### Scenario: Standalone start builds and runs

- **WHEN** a developer runs `npm run start:standalone`
- **THEN** `@quiqr/types`, `@quiqr/backend`, and `@quiqr/adapter-standalone` are built and the standalone server starts

#### Scenario: Electron start runs the forge app

- **WHEN** a developer runs `npm run start:electron`
- **THEN** the Electron app starts via electron-forge

### Requirement: Removed ambiguous script names

The previous ambiguous script names SHALL be removed, with no back-compat aliases retained.

- `dev` (implicit electron) — REMOVED.
- `dev:electron` meaning only the bare `electron .` step — REPLACED (the bare step becomes an internal helper such as `_dev:electron:app`).
- `dev:backend:standalone` — REMOVED (superseded by `dev:standalone`).
- `start:backend:standalone` — REMOVED (superseded by `start:standalone`).
- `start` (electron-forge start) — REMOVED (superseded by `start:electron`).

#### Scenario: Old standalone dev name no longer exists

- **WHEN** a developer runs `npm run dev:backend:standalone`
- **THEN** npm reports a missing script

#### Scenario: Backend-only watcher is retained

- **WHEN** a developer runs `npm run dev:backend`
- **THEN** the backend TypeScript watcher starts (this script is kept)

### Requirement: Development servers bind all network interfaces

The development servers SHALL bind to all network interfaces (`0.0.0.0`) so a development instance is reachable from other devices on the network.

- The Vite frontend dev server SHALL set `server.host` to `0.0.0.0`.
- The standalone Express server SHALL continue to default its bind address to `0.0.0.0` when no `HOST`/`BIND_ADDRESS` is set.

#### Scenario: Dev frontend reachable over the LAN

- **WHEN** the Vite dev server is running and another device on the network requests `http://<dev-host>:4002`
- **THEN** the dev server responds (it is not bound to localhost only)

#### Scenario: Standalone backend bind default unchanged

- **WHEN** the standalone server starts with no `HOST` or `BIND_ADDRESS` environment variable
- **THEN** it binds `0.0.0.0` (all interfaces), as it already does
