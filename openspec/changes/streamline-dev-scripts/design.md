## Context

Current root `package.json` dev/start scripts (relevant subset):

```
dev                       concurrently: types + backend + adapter-electron + dev:frontend + dev:electron:wait
dev:backend               npm run dev -w @quiqr/backend
dev:backend:standalone    concurrently: types + backend + adapter-standalone + (adapter) dev:start   ← NO frontend
start:backend:standalone  build types+backend+standalone, then run standalone server
dev:frontend              cd packages/frontend && npm run dev
dev:electron              cross-env NODE_ENV=development electron .                                   ← bare app only
dev:electron:wait         wait-on http://localhost:4002 && npm run dev:electron
start                     electron-forge start
```

Key facts established during exploration:
- The standalone **backend already binds `0.0.0.0`** by default: `server.ts` does `const bindAddress = host || '0.0.0.0'`, and `main.ts` passes `host = process.env.HOST || process.env.BIND_ADDRESS || undefined`. So the LAN-reachability gap is **not** the backend.
- In dev, the standalone adapter **skips serving the frontend** (`main.ts`: `isDev → "use Vite dev server on :4002"`). The UI a developer opens is therefore **Vite**, and `vite.config.js` sets only `server.port: 4002` (no `host`), so Vite binds localhost only. **Vite is the actual LAN blocker.**
- Vite proxies `/api` to `http://localhost:5150`; this is resolved on the Vite host, so it keeps working when the browser is remote (backend runs alongside Vite).
- No `.github/workflows` reference these scripts. The Nix flake does not call npm dev/start scripts. Docs/README do reference `dev`, `dev:backend:standalone`, and `dev:frontend`.

## Goals / Non-Goals

**Goals:**
- One unambiguous full-stack dev command per edition: `dev:electron`, `dev:standalone`.
- `dev:standalone` includes the Vite frontend so it is symmetric with `dev:electron` (single command, UI works).
- Dev servers reachable over the LAN (`0.0.0.0`).
- Remove ambiguous names; no aliases.
- Docs/README stay accurate.

**Non-Goals:**
- Build/package/make script changes.
- HMR-over-LAN tuning.
- A `wait-on` barrier for `dev:standalone`.
- Production/Docker behavior changes.

## Decisions

### Decision 1: Final script names

```
dev:electron        concurrently: types + backend + adapter-electron + dev:frontend + _dev:electron:wait
dev:standalone      concurrently: types + backend + adapter-standalone + dev:frontend + (adapter) dev:start
dev:backend         (kept) backend-only watcher
dev:frontend        (kept) Vite
_dev:electron:app   cross-env NODE_ENV=development electron .          (internal; was dev:electron)
_dev:electron:wait  wait-on http://localhost:4002 && npm run _dev:electron:app   (internal; was dev:electron:wait)
start:electron      electron-forge start                              (was start)
start:standalone    build types+backend+standalone, run standalone    (was start:backend:standalone)
```

Rationale: the only genuinely confusing rename is `dev:electron`. Today it means "bare `electron .`"; in the clean split it must mean "the whole electron stack." Resolve by moving the bare step to an underscore-prefixed internal helper (`_dev:electron:app`), so `dev:electron` is free to be the full command. Underscore-prefix marks helpers not meant to be run directly (matches existing `_build_info`, `_pack_embgit`).

**Alternative considered — keep `dev` as an alias of `dev:electron`.** Rejected per explicit decision: no friendly default; clarity over convenience.

### Decision 2: `dev:standalone` composition — add `dev:frontend`, no `wait-on`

`dev:standalone` adds `npm run dev:frontend` to the existing standalone concurrently set. No `wait-on` barrier: the standalone Express server (`dev:start`) and Vite are peers — Vite proxies to the backend and tolerates the backend coming up slightly later, and the backend does not depend on Vite. (The pre-existing race — `dev:start` needs the adapter's `dist/main.js` to be compiled by the tsc watcher first — is unchanged and out of scope.)

### Decision 3: Bind Vite to `0.0.0.0` unconditionally in config

Set `server.host = '0.0.0.0'` directly in `vite.config.js`. Per the explicit choice, this is always-on in dev rather than env-gated. Plain `host: '0.0.0.0'` is sufficient; HMR websockets are not specially configured.

**Alternative considered — env-gated host or `vite --host` flag.** Rejected per explicit decision (always-on, simplest).

### Decision 4: Update docs/README in lockstep

Rename references in `README.md` (`dev`, `dev:backend:standalone`, `dev:frontend` flow), `packages/docs/docs/configuration/index.md`, `packages/docs/docs/configuration/environment-variables.md`, and `packages/docs/docs/getting-started/standalone-deployment.md`. Update `AGENTS.md` Development Commands. The docs build validates internal links, so run it after edits.

## Risks / Trade-offs

- **Breaking muscle memory / external scripts** → Anyone running `npm run dev` or `dev:backend:standalone` gets "missing script". Mitigation: this is intentional (clarity); call it out as BREAKING in the proposal and update all in-repo docs. No CI depends on the names (verified).
- **Vite exposed on the network by default in dev** → `0.0.0.0` means the dev UI is reachable by anyone on the LAN. Mitigation: dev-only; documented in the standalone-deployment notes; acceptable per explicit choice.
- **Doc drift** → A missed reference leaves a stale command in docs. Mitigation: grep for all old names before finishing; docs build link-check.

## Migration Plan

1. Edit root `package.json` scripts to the names in Decision 1.
2. Set `server.host = '0.0.0.0'` in `packages/frontend/vite.config.js`.
3. Update `README.md`, the three docs pages, and `AGENTS.md`.
4. Verify: `npm run dev:electron` and `npm run dev:standalone` both start their full stacks; old names report missing-script; docs build passes.

**Rollback:** revert `package.json`, `vite.config.js`, and the doc edits — no persisted state or data involved.

## Open Questions

- None. (Naming, host binding, and no-alias decisions are all settled.)
