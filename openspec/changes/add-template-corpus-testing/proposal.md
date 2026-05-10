# Change: Add Template Corpus Testing

## Why

As Quiqr's feature set grows, manual pre-release testing against community templates is no longer sustainable. There is no automated way to verify that code changes don't break how templates load, validate, or render — nor is there a way to assess whether a community template itself is well-formed.

## What Changes

- **Add** backend schema corpus tests that load each locally-cloned community template through the real config loader and assert Zod validation passes
- **Add** frontend RTL smoke tests that render `FormProvider` with each template's resolved `Field[]` and assert no crashes
- **Add** a testing standard spec that defines the corpus testing requirement for future feature work
- **No new dependencies** — uses existing Vitest infrastructure in both `@quiqr/backend` and `@quiqr/frontend`

## Capabilities

### New Capabilities

- `template-corpus-testing`: Automated corpus testing of community templates at the schema validation and component rendering layers, plus the testing standard that governs when corpus tests must be included in future changes.

### Modified Capabilities

<!-- None — existing specs are not changing requirements, only a new testing capability is being added. -->

## Impact

**Affected packages:**
- `packages/backend` — new test file: corpus test iterating over locally-cloned templates via the config loader
- `packages/frontend` — new test file: RTL smoke tests iterating over resolved `Field[]` from each template

**Affected code:**
- `packages/backend/src/services/workspace/workspace-config-validator.ts` — exercised by corpus tests (read-only)
- `packages/frontend/src/components/SukohForm/` — exercised by render smoke tests (read-only)
- `openspec/specs/template-corpus-testing/spec.md` — new spec defining the testing standard

**Not affected:**
- Dual-runtime (Electron + standalone) — tests run in Node/JSDOM, no runtime adapter involved
- DI container migration — no production code changes
- `packages/types`, `packages/adapters` — unchanged

## Non-goals

- Playwright / E2E tests (separate concern, higher investment — future change)
- Testing templates that are not locally cloned (no network fetching in tests)
- Testing Hugo build output or SSG correctness
- Asserting specific UI behaviour per template (that's unit test territory)
