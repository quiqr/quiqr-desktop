## Why

In standalone/server mode the in-app preview links open `http://localhost:13131`, which resolves to the *user's own* machine rather than the server running Hugo, so the preview is dead out of the box. The preview server is reachable on the same host the user already uses to reach Quiqr — the link just needs to point there.

## What Changes

- Resolve the preview base URL based on runtime mode:
  - **Electron**: `http://localhost:13131` (unchanged).
  - **Standalone/server**: derive from the browser location — `window.location.protocol` + `window.location.hostname` + `:13131` — so the preview points at the same host serving Quiqr.
  - **Explicit override**: if an admin sets `preview.baseUrl` in instance settings, that value always wins (escape hatch for proxied/TLS setups).
- Change the `preview.baseUrl` app default from `http://localhost:13131` to an empty string so "unset" can be distinguished from "explicitly chosen", letting the derive/electron fallback take over when no admin override exists. (Updated in all three default locations: `config.ts` schema, `config-store.ts`, `config-resolver.ts`.)
- Introduce a single shared frontend helper that encapsulates this resolution, and route all preview-link builders through it.
- Finish the partially-completed refactor: three link builders still hardcode `http://localhost:13131` (marked with TODOs) instead of consuming the `previewBaseUrl` already provided via `WorkspaceOutletContext`:
  - `Single.tsx`
  - `Collection/CollectionItem.tsx`
  - `Collection/index.tsx`

## Capabilities

### New Capabilities
- `site-preview`: How the in-app preview base URL is resolved across runtime modes (Electron vs standalone), including the explicit `preview.baseUrl` override and the standalone host-derivation behavior.

### Modified Capabilities
<!-- None: no existing spec covers preview URL resolution. -->

## Impact

- **Affected packages/layers**:
  - `packages/frontend` — new shared preview-URL resolver; `Workspace.tsx`, `Single.tsx`, `Collection/index.tsx`, `Collection/CollectionItem.tsx` consume it. Uses the existing `useEnvironment()` hook (`isStandalone`) — no new API needed.
  - `packages/backend` — `config-store.ts` and `config-resolver.ts` default change for `preview.baseUrl`.
  - `packages/types` — `schemas/config.ts` default change for `preview.baseUrl`.
- **Dual-runtime**: Electron behavior is preserved by the fallback branch; standalone gains correct host derivation.
- **DI-container migration**: not affected; uses existing `unifiedConfig`/resolver and the existing `getEnvironmentInfo` surface.
- **Known caveat (mixed content)**: if a future deployment serves Quiqr over `https://` while Hugo's `:13131` remains plain `http://`, the browser may block the preview. Deriving with `location.protocol` plus the explicit `preview.baseUrl` override are the mitigations; full TLS for the preview server is out of scope.

## Non-goals

- Dynamic preview port allocation / finding a free port within a range (explicitly deferred to a later change).
- Exposing additional preview ports or running multiple concurrent preview servers.
- Reverse-proxy/TLS termination for the Hugo preview server.
- Surfacing the resolved-value `source` to the frontend (Option 2 in exploration); this change uses the empty-string-default approach instead.
- Hiding `preview.baseUrl` in standalone preferences views (tracked separately under bean `gnfl`).
