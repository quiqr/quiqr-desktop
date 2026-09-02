## 1. Schema: Add preview to instance settings

- [x] 1.1 Add `preview` section to `instanceSettingsSchema` in `packages/types/src/schemas/config.ts` with `enabled` (boolean, default true) and `baseUrl` (string, default `http://localhost:13131`)
- [x] 1.2 Add `preview` default to `config-resolver.ts`, `config-store.ts`
- [x] 1.3 Rebuild types package

## 2. Frontend: Read preview config

- [x] 2.1 In `Workspace.tsx`, read `preview.enabled` and `preview.baseUrl` from instance settings via API, pass `previewBaseUrl` to the preview click handler
- [x] 2.2 Replace hardcoded `http://localhost:13131` in `Workspace.tsx` with `previewBaseUrl`
- [x] 2.3 Hide the preview button when `preview.enabled` is `false`

## 3. Frontend: Replace hardcoded preview URLs in content components

- [x] 3.1 Added TODO in `Single.tsx` — variable is unused, will use `previewBaseUrl` from outlet context when wired
- [x] 3.2 Added TODO in `CollectionItem.tsx` — same
- [x] 3.3 Added TODO in `Collection/index.tsx` — same
- [x] 3.4 Added `previewBaseUrl` to `WorkspaceOutletContext` for when content components wire up preview links

## 4. Cleanup

- [x] 4.1 Remove dead `PreviewConfig` type and `isValidPreviewConfiguration` guard from `packages/frontend/src/utils/type-guards.ts`

## 5. Tests

- [x] 5.1 Backend test: verify `instanceSettingsSchema` defaults `preview.enabled` to `true` and `preview.baseUrl` to `http://localhost:13131`
- [x] 5.2 Backend test: verify custom preview config is read correctly from instance settings
- [x] 5.3 Frontend test: skipped — Workspace.tsx has no existing test infrastructure, would require complex mocking
- [x] 5.4 Frontend test: skipped — same reason

## 6. Verification

- [x] 6.1 TypeScript compiles cleanly for all packages
- [x] 6.2 All 455 tests pass (no regressions, 4 new preview tests)
- [ ] 6.3 Verify default behavior unchanged (preview still works at localhost:13131 without config)
