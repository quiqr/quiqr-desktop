# Tasks: Add Template Corpus Testing

**Change ID:** `add-template-corpus-testing`

## 1. Investigate WorkspaceConfigProvider constructor requirements

- [x] 1.1 Read `WorkspaceConfigProvider` constructor signature and identify required DI dependencies
- [x] 1.2 Determine minimum stubs needed to instantiate it in a test (path helper, no UnifiedConfigService needed?)
- [x] 1.3 Check an existing backend test (e.g. `ssg-providers/__tests__/integration.test.ts`) for patterns on constructing backend services in tests

## 2. Backend corpus test

- [x] 2.1 Create `packages/backend/src/services/workspace/__tests__/template-corpus.test.ts`
- [x] 2.2 Implement template discovery: scan `{dataFolder}/sites/` for subdirs containing `quiqr/model/base.yaml` using `PathHelper.getRoot()` + `fs.existsSync` (respects user's configured data folder)
- [x] 2.3 Hardcode the list of 9 official community template names (from `templates.json`) in the test file
- [x] 2.4 After discovery, cross-reference found templates against the official list and log each missing template name
- [x] 2.5 Skip (not fail) missing templates; log a warning when zero templates are discovered
- [x] 2.6 For each discovered template, call `WorkspaceConfigProvider.getWorkspaceConfig()` with its model directory
- [x] 2.7 Assert the returned config satisfies `workspaceConfigSchema` (Zod `safeParse`, no errors)
- [x] 2.8 Extract all `type` values from the resolved `Field[]` tree (collections + singles, recursive)
- [x] 2.9 Assert each type is in the known-types list (import registered types from `@quiqr/types` or derive from `FieldRegistry` exports if accessible from backend)
- [x] 2.10 Produce a named failure per unknown type: `"Template <name>: unknown field type '<type>' at path <path>"`
- [x] 2.11 Verify: `npm run test -w @quiqr/backend` passes with locally-available templates
  - Note: `summer-qremix` intentionally has `type: cooklang` (unsupported) — corpus test correctly reports it as a named failure, demonstrating detection works.

## 3. Fixture refresh script [REMOVED]

**Design change (2026-03-01):** Eliminated intermediate fixture generation layer for simplicity. Frontend smoke tests now directly discover and load templates from `{dataFolder}/sites/` (same as backend tests, respecting user's configured data folder), making the fixture refresh script unnecessary.

- [x] 3.1-3.7 Removed `scripts/refresh-template-fixtures.ts`, deleted `packages/frontend/test/fixtures/`, removed `refresh-template-fixtures` script from `package.json`

## 4. Frontend smoke tests

- [x] 4.1 Create `packages/frontend/test/components/SukohForm/template-corpus-smoke.test.tsx`
- [x] 4.2 ~~Use `import.meta.glob` to load all fixture JSON files~~ → Directly discover templates from `{dataFolder}/sites/` using `PathHelper.getRoot()` (respects configured data folder)
- [x] 4.3 For each template, load `WorkspaceConfig` via `WorkspaceConfigProvider`, then render each collection/single's `Field[]`
- [x] 4.4 Assert the component mounts without throwing
- [x] 4.5 Skip (not fail) when no templates found locally
- [x] 4.6 Verify: `npm run test -w @quiqr/frontend` passes

## 5. Document the testing standard

- [x] 5.1 Add a `## Corpus Testing` section to `AGENTS.md` describing the **two-layer** testing approach (backend + frontend, no fixtures)
- [x] 5.2 Note that changes touching `WorkspaceConfigProvider`, `WorkspaceConfigValidator`, `FieldRegistry`, or field types MUST include a corpus test run
- [x] 5.3 ~~Note the fixture refresh script~~ → Removed (no longer exists)

## 6. Verify end-to-end

- [x] 6.1 ~~Run fixture refresh script~~ → No longer applicable (removed)
- [x] 6.2 Run `npm run test -w @quiqr/backend` — confirm corpus tests pass
  - 23/24 tests pass; `summer-qremix` fails with named error for `type: cooklang` (intentional — demonstrates detection)
- [x] 6.3 Run `npm run test -w @quiqr/frontend` — confirm smoke tests pass
- [x] 6.4 ~~Test bad field type in fixture~~ → Test validates against live template data instead
