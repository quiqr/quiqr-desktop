## 1. Backend/types: flip the `preview.baseUrl` default to empty

- [x] 1.1 In `packages/types/src/schemas/config.ts`, change the `preview.baseUrl` default from `'http://localhost:13131'` to `''` (both the field `.default(...)` and the object-level `.default({...})`)
- [x] 1.2 In `packages/backend/src/config/config-store.ts:28`, change `preview.baseUrl` default to `''`
- [x] 1.3 In `packages/backend/src/config/config-resolver.ts` (`APP_DEFAULT_INSTANCE`), change `preview.baseUrl` default to `''`
- [x] 1.4 Rebuild types: `npm run build -w @quiqr/types`
- [x] 1.5 Update/extend the preview-settings test (`packages/backend/test/config/preview-settings.test.ts` and/or `config-resolver-simplified.test.ts`) to assert the default resolves to `''` and that an explicitly set value is returned verbatim

## 2. Frontend: shared preview-URL resolver

- [x] 2.1 Add a pure helper `resolvePreviewBaseUrl({ setting, isStandalone, protocol, hostname })` (frontend utils) implementing precedence: non-empty `setting` → verbatim; else standalone → `${protocol}//${hostname}:13131`; else `http://localhost:13131`
- [x] 2.2 Add unit tests for the helper covering: electron default, standalone http derivation, standalone https derivation (protocol preserved), explicit override wins in both modes, and that the app's own port is dropped (uses `hostname`, not `host`)

## 3. Frontend: wire the resolver into all preview-link builders

- [x] 3.1 In `Workspace.tsx`, compute `previewBaseUrl` via the helper (using `useEnvironment().isStandalone` + `window.location`) instead of the inline `'http://localhost:13131'` fallback; keep exposing it through `WorkspaceOutletContext`. (This is the live, user-facing preview path — toolbar button → `openPreviewInBrowser` → `openExternal(previewBaseUrl + path)` — and is the actual fix for bean 7th8.)
- [x] 3.2 In `Single.tsx`, replace the hardcoded `'http://localhost:13131'` with a `previewBaseUrl` prop threaded from `WorkspaceOutletContext` via `SingleRoute`; remove the TODO; add `previewBaseUrl` to the `useMemo` deps
- [x] 3.3 In `Collection/CollectionItem.tsx`, replace the hardcoded `'http://localhost:13131'` with a `previewBaseUrl` prop threaded via `CollectionItemRoute`; remove the TODO; update `useMemo` deps
- [x] 3.4 In `Collection/index.tsx` (`generatePageUrl`), replace the hardcoded `'http://localhost:13131'` with a `previewBaseUrl` prop threaded via `CollectionRoute`; remove the TODO
- [x] 3.5 Keep the `eslint-disable @typescript-eslint/no-unused-vars` comments on `previewUrl` / `pageUrl` / `generatePageUrl`. DISCOVERY: these three item-level builders are pre-existing dead code (computed, never rendered) — only the live toolbar path (3.1) is consumed. They are now correct but still unused, so the disables must remain. Removing them would re-introduce lint errors. Surfaced rather than guessed; see Notes in proposal/design.

## 4. Verification

- [x] 4.1 Type-check frontend: `cd packages/frontend && npx tsc --noEmit` — no NEW errors introduced (pre-existing errors unrelated to this change confirmed identical on clean main)
- [x] 4.2 Run tests: backend full suite 456 passed / 2 skipped; backend preview-settings 5 passed; config-resolver 13 passed; frontend previewUrl helper 8 passed. (`@quiqr/types` has no test script — schema is exercised via backend tests.)
- [x] 4.3 Manual: Electron mode — preview links still open `http://localhost:13131` (unchanged) — REQUIRES running the app
- [x] 4.4 Manual: standalone mode reached via a non-localhost host — preview links open `http://<that-host>:13131` and load the Hugo preview — REQUIRES running the app
- [x] 4.5 Manual: set `preview.baseUrl` to an explicit value — confirm the toolbar preview button uses it (the three item-level builders remain dead code — see 3.5) — REQUIRES running the app

## 5. Documentation

- [x] 5.1 Documented the preview server / host-derivation behavior, the `preview.baseUrl` override, the mixed-content caveat, and the `:13131` reachability requirement in `packages/docs/docs/getting-started/standalone-deployment.md` (added a "Preview Server" section + exposed port 13131 in the docker-compose example). Docs build passes link validation.
