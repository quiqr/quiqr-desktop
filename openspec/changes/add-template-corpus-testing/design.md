# Design: Add Template Corpus Testing

**Change ID:** `add-template-corpus-testing`

## Context

Quiqr ships with a set of community templates that users can import. These templates define a `quiqr/model/` tree of YAML files that the `WorkspaceConfigProvider` resolves into a `WorkspaceConfig` (handling `_mergePartial` includes, `dynFormSearchKey` dynamic field loading, `glob`-based queries, etc.). The resulting `collections` and `singles` arrays carry `Field[]` trees that drive the SukohForm component system.

Currently, code changes are validated only against hand-crafted mocked schemas in unit tests. There is no automated check that the real template models still load cleanly, or that their `Field[]` trees still render without crashes, after a code change.

**Reference implementations:**
- Config loading: `packages/backend/src/services/workspace/workspace-config-provider.ts` (`WorkspaceConfigProvider`)
- Schema validation: `packages/backend/src/services/workspace/workspace-config-validator.ts` (`WorkspaceConfigValidator`)
- Frontend render harness: `packages/frontend/test/test-utils.tsx` + `packages/frontend/test/components/SukohForm/` (existing SukohForm tests)

## Goals / Non-Goals

**Goals:**
- Backend corpus tests: load each locally-cloned template through `WorkspaceConfigProvider`, assert Zod validation passes and all field types are known
- Frontend smoke tests: render `FormProvider` with each template's real `Field[]`, assert no crashes
- A testing standard (in spec) that requires new feature changes to include or update corpus test coverage when they touch config loading, field types, or form rendering
- Tests run with `npm run test` in their respective packages — no separate runner, no network calls

**Non-Goals:**
- Playwright / E2E tests
- Testing templates not cloned locally (no network fetching)
- Testing Hugo SSG output or build correctness
- Asserting per-template UI appearance or specific field behaviour
- Keeping fixture snapshots in sync automatically (manual refresh via re-run)

## Decisions

### 1. Backend: use `WorkspaceConfigProvider` directly, not a test-only loader

**Decision:** The backend corpus test instantiates `WorkspaceConfigProvider` and calls `getWorkspaceConfig(modelDir)` with the path to a locally-cloned template's `quiqr/model/` directory.

**Rationale:** This exercises the exact production path — partial merging, glob resolution, Zod validation — rather than a simplified test helper. Bugs in the loader itself are caught, not bypassed.

**Alternative considered:** Parse raw YAML manually in the test. Rejected: too shallow, misses `_mergePartial` resolution bugs.

**Trade-off:** Tests have a file-system dependency (`{dataFolder}/sites/`, respecting the user's `storage.dataFolder` configuration setting). Templates not present locally are skipped gracefully.

---

### 2. Template discovery: scan `{dataFolder}/sites/` and report against the known community list

**Decision:** The corpus test discovers templates by scanning `{dataFolder}/sites/` (where `{dataFolder}` is resolved via `PathHelper.getRoot()`, respecting the user's `storage.dataFolder` configuration setting or defaulting to `~/Quiqr`) for subdirectories containing `quiqr/model/base.yaml`. It then cross-references the discovered set against a hardcoded list of the 9 official community template names (sourced from `templates.json`). Templates not present are skipped (not failed), but the test output logs each missing template by name so the developer is aware of the coverage gap.

**Rationale:** Local-only testing is intentional — it allows testing newly added or forked templates in isolation before they are published. But silently skipping community templates would make the corpus pass look more complete than it is. Reporting missing templates by name gives the developer an actionable prompt ("clone X to test it") without blocking the suite.

**Alternative considered:** Hard-code an array of template names and fail when any are missing. Rejected: too strict for local dev where not all templates may be cloned.

**Trade-off:** The hardcoded list of community template names requires a manual update when new templates are added to the registry. This is acceptable — the list changes rarely and the update is a one-liner.

---

### 3. Frontend: directly discover and load templates (no fixtures) [UPDATED 2026-03-01]

**Decision:** The frontend smoke test directly discovers templates from `{dataFolder}/sites/` using the same `PathHelper` + discovery logic as the backend test. For each template, it instantiates `WorkspaceConfigProvider` to load the `WorkspaceConfig`, then renders each collection/single's `Field[]` with `<FormProvider>`.

**Rationale (updated):** The original three-layer design (backend test → fixture script → frontend test) added unnecessary complexity. Since fixtures were gitignored for security, they couldn't be used in CI anyway, eliminating their main benefit (deterministic CI runs). The intermediate fixture layer created a maintenance burden (stale fixtures, manual refresh step) with no actual value. The simpler two-layer approach is easier to understand, always uses fresh template data, and reduces the risk of fixtures falling out of sync with reality.

**Alternative considered (original design):** Generate JSON fixtures and commit them to the repo. Rejected after implementation: security risk of exposing private templates, and fixtures couldn't be committed anyway.

**Trade-off:** Frontend tests now import backend code (`WorkspaceConfigProvider`, `PathHelper`), but this is acceptable in a monorepo and actually improves test fidelity — frontend tests exercise the exact same loading code that production uses.

---

### 4. Field type validation: check against the `FieldRegistry`

**Decision:** The backend corpus test also asserts that every `type` value found in the resolved `Field[]` tree is registered in `FieldRegistry`. Unknown types produce a named test failure (not just a Zod error) to make the output actionable.

**Rationale:** A template using `type: "select-from-query"` that gets renamed in code should produce a clear failure, not a silent render fallback.

---

### 5. Testing standard: enforced via spec, not CI gate

**Decision:** The requirement that new changes include corpus test coverage is captured in `openspec/specs/template-corpus-testing/spec.md` and referenced in `AGENTS.md` / the PR checklist. It is not a CI gate that blocks merges.

**Rationale:** A hard gate would require templates to be cloned in CI, which adds complexity. The standard is enforced by convention and code review during the local-only phase. A future change can add CI template cloning and promote this to a gate.

## Risks / Trade-offs

- **Vacuous pass when no templates are cloned** → Mitigation: Both backend and frontend tests log a warning when zero templates are found; developer checklist includes "run corpus tests with templates present."
- **`WorkspaceConfigProvider` constructor requires DI dependencies** → Mitigation: instantiate with minimal stubs (real `PathHelper` for discovery, mock `PathHelper` for provider, mock `UnifiedConfigService`).
- **Frontend tests import backend code** → Acceptable trade-off in a monorepo; improves test fidelity by exercising real production code paths.

## Open Questions

1. ~~Does `WorkspaceConfigProvider` require a full DI container or can it be constructed with minimal stubs for testing?~~ **RESOLVED:** Minimal stubs work. PathHelper with real home directory for discovery + mock UnifiedConfigService is sufficient.

2. ~~Should fixture files be committed to the repo (deterministic CI) or `.gitignore`d (always fresh locally)?~~ **RESOLVED (2026-03-01):** Fixture layer **eliminated entirely**. Frontend tests now directly discover and load templates from disk, same as backend tests. This is simpler, always fresh, and removes the stale-fixture maintenance burden.
