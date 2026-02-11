# Proposal: restore-scaffold-model

## Summary

Restore the scaffold-model functionality that was accidentally deleted in commit `a0230f7e` ("nuke /backend and /electron"). This feature allows users to automatically generate content model definitions (singles and collections) by analyzing existing data files.

## Motivation

The scaffold-model feature is a key productivity tool that:
- Analyzes existing data files (YAML, TOML, JSON, Markdown) and infers field types
- Automatically generates model configuration files for singles and collections
- Reduces manual configuration work when onboarding existing Hugo/Quarto sites
- Was documented in AGENTS.md and project.md as expected functionality

Without this feature, users must manually write model definitions for every content type, which is time-consuming and error-prone.

## Scope

### In Scope
- Restore the scaffold-model service as TypeScript in `packages/backend/src/services/scaffold-model/`
- Create API handlers for scaffold operations
- Integrate with the existing dependency injection container pattern
- Support YAML, TOML, JSON, and Markdown file formats
- Field type inference: string, number, boolean, arrays, nested objects
- Output model configs to `quiqr/model/includes/singles/` and `quiqr/model/includes/collections/`

### Out of Scope
- Frontend UI for scaffold operations (existing menu triggers remain)
- New field type support beyond original capabilities
- Changes to the model configuration format

## Approach

1. Create a new `ScaffoldModelService` class following the existing service patterns
2. Add API handlers in `packages/backend/src/api/handlers/scaffold-handlers.ts`
3. Register handlers in the API router
4. Use the existing `FormatProviderResolver` for file parsing
5. Use the adapter pattern for dialogs (already in place)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Original JS code may have undocumented behaviors | Port systematically, add tests |
| Dialog adapter integration | Use existing `DialogAdapter` interface |
| File system operations | Use fs-extra, follow existing patterns |

## Success Criteria

- [ ] `scaffoldSingleFromFile` API endpoint works
- [ ] `scaffoldCollectionFromFile` API endpoint works
- [ ] Generated models are valid and loadable by WorkspaceService
- [ ] Field type inference matches original behavior

## Related Specs

- `backend-architecture` - Service patterns
- `dependency-injection` - Container patterns
- `adapters` - Dialog adapter interface
