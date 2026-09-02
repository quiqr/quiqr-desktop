## Context

The in-app preview opens the running Hugo preview server (`hugo server --bind 0.0.0.0 --port 13131`). Hugo binds `0.0.0.0`, so it is reachable from outside the host. There is no reverse proxy in front of `:13131` in the standalone adapter — the port is exposed and reachable directly from the user's browser (confirmed: this is the intended deployment for now).

Current state:
- `Workspace.tsx` already reads the `preview.baseUrl` instance setting via `useQuery(['getInstanceSetting','preview.baseUrl'])`, falls back to `http://localhost:13131`, uses it for the toolbar "open preview" action, and exposes it through `WorkspaceOutletContext.previewBaseUrl`.
- Three other preview-link builders ignore that context and hardcode `http://localhost:13131`, each carrying a TODO to "use previewBaseUrl from WorkspaceOutletContext when this variable is wired up":
  - `packages/frontend/src/containers/WorkspaceMounted/Single.tsx:122`
  - `packages/frontend/src/containers/WorkspaceMounted/Collection/CollectionItem.tsx:112`
  - `packages/frontend/src/containers/WorkspaceMounted/Collection/index.tsx:555`
- The `preview.baseUrl` app default is `http://localhost:13131` in three places: the Zod schema (`packages/types/src/schemas/config.ts:491-492`), `config-store.ts:28`, and `config-resolver.ts:39-42`.
- Runtime mode is already available to the frontend via the `useEnvironment()` hook (`isStandalone`), backed by `getEnvironmentInfo()` which returns `runtime: 'electron' | 'standalone'`.

The bug (bean `quiqr-desktop-mipmip-7th8`): in standalone/server mode, `localhost:13131` resolves to the user's own machine, not the server, so the preview is dead.

## Goals / Non-Goals

**Goals:**
- Preview links work out-of-the-box in standalone mode with zero configuration by deriving the host from the browser location.
- Preserve existing Electron behavior exactly (`http://localhost:13131`).
- Keep an explicit `preview.baseUrl` override as the escape hatch for proxied/TLS deployments.
- Finish the partial refactor so all four preview-link builders share one resolution and no longer hardcode `localhost:13131`.

**Non-Goals:**
- Dynamic preview port allocation / find-a-free-port-in-range (deferred to a later change).
- Reverse-proxy or TLS termination for the Hugo preview server.
- Exposing the resolver `source` field to the frontend (alternative considered below).
- Hiding `preview.baseUrl` in standalone preferences (bean `gnfl`, tracked separately).

## Decisions

### Decision 1: Resolve preview URL in the frontend, branching on runtime mode

The preview URL is a presentation concern derived from where the *browser* is, so the frontend is the correct layer. The resolution precedence is:

```
explicit preview.baseUrl (non-empty)  →  use verbatim
else if isStandalone                  →  location.protocol + '//' + location.hostname + ':13131'
else (electron)                       →  'http://localhost:13131'
```

Use `location.hostname` (not `location.host`) so the app's own serving port is dropped and the fixed preview port `13131` is appended. Use `location.protocol` so an https-served app derives an https preview URL.

**Alternative considered — backend-computed URL.** The backend does not know the browser's hostname/protocol (it only knows its bind address), so it cannot derive the user-facing URL reliably behind NAT or with multiple hostnames. Rejected.

### Decision 2: Single shared resolver, consumed everywhere

Add one pure helper (e.g. `resolvePreviewBaseUrl({ setting, isStandalone, location })`) in the frontend and route all builders through it. `Workspace.tsx` continues to compute `previewBaseUrl` (now via the helper) and expose it through `WorkspaceOutletContext`; `Single.tsx`, `Collection/index.tsx`, and `Collection/CollectionItem.tsx` consume `previewBaseUrl` from that context instead of hardcoding. This finishes the refactor the existing TODOs point at and keeps the host-derivation logic in exactly one testable place.

**Alternative considered — fix each site inline.** Duplicates the branch logic four times and re-introduces drift. Rejected.

### Decision 3: Flip the `preview.baseUrl` default to empty string

Today the default is `http://localhost:13131`, so the frontend cannot distinguish "admin set localhost on purpose" from "nobody set it" — both arrive as the same string. Changing the default to `''` makes "unset" observable: a non-empty value means an explicit override, empty means apply the runtime-mode fallback. The default must change in all three sources (schema, config-store, config-resolver) to stay consistent.

**Alternative considered — expose the resolver `source` field to the frontend (Option 2).** `resolveInstanceSetting` already returns `source: 'user' | 'app-default'`, which would let an admin deliberately set `localhost` in standalone and have it honored. This is marginally more correct but requires changing the API surface for a near-meaningless edge case (deliberately choosing a non-working URL). Rejected in favor of the smaller empty-default approach.

## Risks / Trade-offs

- **Mixed content** → If a deployment serves Quiqr over `https://` while Hugo's `:13131` stays plain `http://`, the browser may block the preview. Mitigation: derive with `location.protocol` (so an http app yields an http preview, the common case), and use the explicit `preview.baseUrl` override for TLS setups. Full TLS for the preview server is out of scope.
- **Port 13131 must be reachable from the browser** → True today by design (Hugo binds `0.0.0.0`, port exposed, no proxy). If a future deployment closes `:13131` or proxies it, the derived URL breaks; the explicit override is the escape hatch. Documented as a known constraint.
- **Default change touches persisted config** → Changing the default to `''` is backward compatible: existing instances that explicitly stored a `preview.baseUrl` keep it (treated as an override); instances relying on the default now fall through to the runtime-mode branch, which yields `http://localhost:13131` in Electron — identical to today.
- **`location` access in tests** → The shared resolver should take `location` (or its protocol/hostname) as an argument rather than reading the global directly, so it stays a pure, unit-testable function.

## Migration Plan

1. Change the `preview.baseUrl` default to `''` in schema, config-store, and config-resolver; rebuild `@quiqr/types`.
2. Add the shared resolver helper with unit tests.
3. Wire `Workspace.tsx` to use the helper; consume `previewBaseUrl` in the three TODO sites.
4. No data migration needed — existing explicit settings continue to work as overrides.

**Rollback:** revert the default and the frontend changes; explicitly-set `preview.baseUrl` values remain valid throughout.

## Open Questions

- None blocking. (Dynamic port range and standalone preference-hiding are tracked separately as future work / bean `gnfl`.)
