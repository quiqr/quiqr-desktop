# AGENTS.md

Operational guide for AI agents working in this repository. For architecture, conventions, and domain context see `openspec/config.yaml`. For detailed requirements see specs in `openspec/specs/`.

## Development Commands

```bash
# Start dev environment (frontend + Electron)
npm run dev

# Frontend only (Vite on http://localhost:4002)
cd packages/frontend && npm run dev

# Build
npm run build                   # Full build with installers
npm run build:frontend          # Frontend only
npm run build:windows           # Platform-specific
npm run build:appimage
npm run build:rpm

# Type checking
cd packages/frontend && npx tsc --noEmit

# Testing
npm run test                    # All tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
npm run test -w @quiqr/backend
npm run test -w @quiqr/types
npm run test -w @quiqr/frontend
npm run test -w @quiqr/adapter-electron
npm run test -w @quiqr/adapter-standalone

# Documentation (Docusaurus)
npm run start -w @quiqr/docs    # Dev server with hot reload
npm run build -w @quiqr/docs    # Production build (validates links)
npm run serve -w @quiqr/docs    # Serve production build
```

## Key Directories

```
electron/main.js                          # Electron main process
packages/backend/src/
  api/handlers/                           # API endpoint handlers (*.ts)
  api/server.ts                           # Express server setup
  services/                               # Business logic (site, workspace, library, config)
  sync/                                   # Git sync (GitHub, system git, folder)
  config/                                 # AppConfig, AppState
  ssg-providers/                          # Hugo, Jekyll, Eleventy, Quarto
  import/                                 # Site import
  adapters/                               # Backend platform adapters
  jobs/                                   # Background job runner
  logging/                                # Structured logging
packages/frontend/src/
  api.ts                                  # API client (one method per endpoint)
  services/                               # Frontend service layer
  components/SukohForm/                   # Dynamic form system
  components/HoForm/                      # Legacy form system
  containers/                             # Page-level components
  utils/main-process-bridge.ts            # Frontend-backend HTTP bridge
  app-ui-styles/                          # Theme definitions
packages/types/src/                       # Shared Zod schemas and types
packages/adapters/electron/               # Electron platform adapter
packages/adapters/standalone/             # Standalone/browser platform adapter
packages/docs/                            # Docusaurus documentation
resources/                                # Bundled binaries (Hugo, Git)
```

## Code Style

- TypeScript for all code (frontend and backend)
- Zod schemas for validation and type inference (`z.infer<typeof schema>`)
- Centralized types in `packages/types/src/` (field schemas, shared types)
- Frontend components use MUI v7 with Emotion styling
- No `React.FC` — use `const` with typed, destructured props
- Prefer generic typing over union types with manual type guards
- Prefer editing existing files over creating new ones
- No emojis in code/comments unless explicitly requested

## Recipes

### Adding a New API Method

1. Add handler in `packages/backend/src/api/handlers/` (existing file or new `*-handlers.ts`)
2. Define response Zod schema in `packages/types/src/schemas/api.ts` under `apiSchemas`
3. Add client method in `packages/frontend/src/api.ts`
4. Use generic typing for methods returning different types based on parameters

### Adding a New Field Type

1. Define Zod schema in `packages/types/src/schemas/fields.ts`
2. Add to `CoreFields` object and `coreFieldSchemas` array
3. Export type with `z.infer<typeof schema>`
4. Rebuild: `npm run build -w @quiqr/types`
5. Create component in `packages/frontend/src/components/SukohForm/fields/`
6. Register in `FieldRegistry.ts`

See `FIELD_DEVELOPMENT_GUIDE.md` in the SukohForm directory for the full component pattern.

## Documentation

Quiqr uses Docusaurus. All docs in `packages/docs/docs/`.

Document when adding: new features, API changes, new field types, breaking changes. See `openspec/specs/documentation/spec.md` for full requirements.

```
packages/docs/docs/
├── intro.md              # Landing page
├── getting-started/      # Installation, quick start, import
├── user-guide/           # Using Quiqr
├── developer-guide/      # Architecture, APIs, field system
├── field-reference/      # Field types reference
├── contributing/         # Contribution guidelines
└── release-notes/        # Version history
```

Deploys automatically to GitHub Pages on merge to main.

## Corpus Testing

Quiqr uses two-layer corpus testing to validate that code changes don't break community template loading or rendering.

### The Two Layers

1. **Backend schema test** (`packages/backend/src/services/workspace/__tests__/template-corpus.test.ts`)
   — Discovers templates under `{dataFolder}/sites/`, loads each through `WorkspaceConfigProvider`, asserts Zod validation passes, and checks that all field types are registered in `FieldRegistry`.

2. **Frontend smoke test** (`packages/frontend/test/components/SukohForm/template-corpus-smoke.test.tsx`)
   — Discovers templates under `{dataFolder}/sites/`, loads each through `WorkspaceConfigProvider`, renders `FormProvider` with each collection/single's `Field[]` in JSDOM, and asserts no React rendering errors occur.

Both layers directly read from `{dataFolder}/sites/` (where `{dataFolder}` respects the user's `storage.dataFolder` configuration setting, defaulting to `~/Quiqr` when not set). No intermediate fixture generation step. Tests are skipped (not failed) when no templates are cloned locally.

### When to Run Corpus Tests

Changes that touch any of the following MUST include a corpus test run as part of their task checklist:

- `WorkspaceConfigProvider` or `WorkspaceConfigValidator` (config loading / merging / validation)
- `FieldRegistry` (field type registration)
- Field type schemas in `packages/types/src/schemas/fields.ts`
- Field component implementations in `packages/frontend/src/components/SukohForm/fields/`

### Running Corpus Tests

Run these commands locally before releases or when changing config/field code:

```bash
# Backend validation (loads configs, validates schema, checks field types)
npm run test -w @quiqr/backend -- template-corpus

# Frontend smoke tests (renders forms, checks for crashes)
npm run test -w @quiqr/frontend -- template-corpus
```

Both tests require locally-cloned community templates in the `sites/` subdirectory of your configured data folder (defaults to `~/Quiqr/sites/`). Clone templates before running corpus tests to ensure full coverage.

## Specs Reference

For detailed requirements, consult the relevant spec in `openspec/specs/`:

| Topic | Spec |
|-------|------|
| Architecture & backend | `backend-architecture` |
| Communication (HTTP/WebSocket) | `communication-layer` |
| Frontend components & forms | `frontend-components` |
| Type system & Zod schemas | `type-system` |
| Unified configuration | `unified-config` |
| Platform adapters | `adapters` |
| AI/LLM integration | `ai-integration` |
| State management | `frontend-state-management` |
| Dependency injection | `dependency-injection` |
| Documentation standards | `documentation`, `documentation-requirements` |
| CI/CD | `ci-automation` |
| Monorepo structure | `monorepo-structure` |
