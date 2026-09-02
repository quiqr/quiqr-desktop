## Why

The development scripts treat the two editions asymmetrically and ambiguously. Electron has a single full-stack command (`dev`), but standalone has no equivalent: `dev:backend:standalone` omits the frontend dev server entirely, so a standalone developer must run two commands and know to open `:4002` themselves. The names are also misleading — `dev` silently means "electron", and `dev:electron` confusingly means only the bare `electron .` step. On top of that, the Vite dev server binds `localhost` only, so a dev standalone instance is not reachable over the LAN even though the backend already binds `0.0.0.0`.

## What Changes

- **BREAKING**: Hard-rename the dev/start scripts around an explicit electron-vs-standalone split. No friendly `dev` default and no back-compat aliases — naming clarity is the goal.
  - Remove `dev` (the implicit electron default).
  - Add `dev:electron` — the full electron stack (what `dev` used to be).
  - Add `dev:standalone` — the full standalone stack, now **including the Vite frontend dev server** (the missing piece), symmetric with `dev:electron`.
  - Rename `start:backend:standalone` → `start:standalone`.
  - Rename `start` (`electron-forge start`) → `start:electron`.
  - Demote the bare `electron .` / wait steps to internal helpers (`_dev:electron:app`, `_dev:electron:wait`).
  - Keep `dev:backend` (backend-only) and `dev:frontend` (referenced by docs).
- Bind the Vite dev server to `0.0.0.0` so a dev standalone instance is reachable over the LAN. (The standalone backend already binds `0.0.0.0` by default via `server.ts`; Vite was the actual blocker.)
- Update documentation and README that reference the renamed scripts.

## Capabilities

### New Capabilities
- `development-workflow`: The set of npm scripts for running each edition in development and the network-binding behavior of the dev servers. Defines the electron-vs-standalone command split, what each command runs, and that dev servers bind all interfaces.

### Modified Capabilities
<!-- None: no existing spec covers the development workflow / dev scripts. -->

## Impact

- **Affected files**:
  - `package.json` — script rename/reorg (root workspace).
  - `packages/frontend/vite.config.js` — `server.host = '0.0.0.0'`.
  - `README.md`, `packages/docs/docs/configuration/index.md`, `packages/docs/docs/configuration/environment-variables.md`, `packages/docs/docs/getting-started/standalone-deployment.md` — references to renamed scripts.
  - `AGENTS.md` — Development Commands section.
- **Dual-runtime**: this is the change — it makes the two editions' dev commands symmetric and equally first-class.
- **No CI impact**: no `.github/workflows` reference the renamed scripts (verified). The flake does not invoke npm dev/start scripts.
- **DI-container migration**: not affected.

## Non-goals

- Changing build/package/make scripts (`build*`, `make*`, `package`, `publish`) — out of scope.
- HMR-over-LAN tuning (`server.hmr.host`) — plain `host: '0.0.0.0'` is sufficient.
- Adding a `wait-on` barrier to `dev:standalone` — backend and Vite are peers, no ordering dependency.
- Keeping deprecated aliases for the old names — intentionally omitted for clarity.
- Production deployment / Docker changes (covered by `standalone-deployment` docs).
