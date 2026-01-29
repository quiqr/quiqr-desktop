<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

This file provides guidance to Coding Agents when working with code in this repository.

## Project Overview

Quiqr Desktop is an Electron-based desktop CMS for local-first management of static site generators like Hugo and Quarto. The project uses a client-server architecture within Electron, with a React frontend communicating with a Node.js backend via HTTP.

## Development Commands

**Start development environment:**
```bash
npm run dev  # Starts both frontend dev server and Electron
```

**Frontend only:**
```bash
cd packages/frontend && npm run dev  # Vite dev server on http://localhost:4002
```

**Build application:**
```bash
npm run build  # Full build including frontend and installers
npm run build:frontend  # Frontend only
```

**Platform-specific builds:**
```bash
npm run build:windows
npm run build:appimage
npm run build:rpm
```

**Type checking:**
```bash
cd packages/frontend && npx tsc --noEmit
```

## Architecture Overview

### Three-Layer Architecture

1. **Electron Main Process** (`/electron/main.js`)
   - Manages application lifecycle and native OS integration
   - Initializes backend server and global state
   - Handles window management via `ui-managers/`

2. **Backend Server** (`/backend/`)
   - Express server running inside Electron main process
   - Exposes REST API at `/api/*` endpoints
   - All backend logic is in `/backend/src-main/`

3. **Frontend** (`/packages/frontend/src/`)
   - React + TypeScript + Vite + Material-UI (MUI v6)
   - Communicates with backend via HTTP through `main-process-bridge.ts`
   - Runs on port 4002 in development

### Communication Pattern

Frontend → Backend communication flow:
```
React Component
  ↓
service.api.methodName()  (/packages/frontend/src/api.ts)
  ↓
mainProcessBridge.request()  (/packages/frontend/src/utils/main-process-bridge.ts)
  ↓
HTTP POST to http://localhost:3030/api/methodName
  ↓
Express handler  (/backend/server.js)
  ↓
apiMain[methodName]()  (/backend/src-main/bridge/api-main.js)
  ↓
Backend services and business logic
```

### Type System

**Centralized type definitions in `/packages/frontend/types.ts`:**
- All Zod schemas for data validation
- Field schemas for the dynamic form system
- API response schemas in `apiSchemas` object
- Service schemas for higher-level operations
- Type inference via `z.infer<typeof schema>`

**Type-safe API calls:**
The `main-process-bridge.ts` validates all API responses against Zod schemas defined in `apiSchemas`. This ensures type safety between frontend and backend at runtime.

**Generic typing for config keys:**
When adding methods that read/write config values, use generic typing with a type map (like `ReadConfKeyMap`) to provide automatic type inference based on the key parameter.

## Key Directories

### Backend (`/packages/backend/src-main/`)
- `bridge/` - API endpoints exposed to frontend
- `services/` - Core business logic (site, workspace, library services)
- `sync/` - Git synchronization (GitHub, system git, folder sync)
- `app-prefs-state/` - Application configuration and preferences
- `hugo/` - Hugo SSG integration
- `import/` - Site import functionality
- `scaffold-model/` - Dynamic model scaffolding
- `utils/` - Shared utilities

### Frontend (`/packages/frontend/src/`)
- `api.ts` - API client methods (one method per backend endpoint)
- `services/` - Frontend service layer with validation
- `components/` - Reusable UI components
  - `SukohForm/` - Primary dynamic form system
  - `HoForm/` - Legacy form system
- `containers/` - Page-level components with routing
  - `WorkspaceMounted/` - Main workspace UI
  - `SiteLibrary/` - Site selection and management
  - `Prefs/` - User preferences
- `utils/main-process-bridge.ts` - Frontend-backend communication bridge
- `app-ui-styles/` - Theme definitions

### Resources (`/resources/`)
Platform-specific binaries and assets packaged with the application (Hugo binaries, Git binaries, etc.)

## Dynamic Form System

The SukohForm system (`/packages/frontend/src/components/SukohForm/`) is a schema-driven form builder using React Context and lazy-loaded components:

### Architecture

```
FormProvider (holds state, provides context)
  → FormContext (exposes getValueAtPath, setValueAtPath, getFieldConfig, meta)
    → FieldRenderer (lazy-loads components via FieldRegistry)
      → Field Component (uses useField hook)
```

- **Field Types**: Defined as Zod schemas in `packages/types/src/schemas/fields.ts`
- **Field Components**: Each type has a component in `/components/SukohForm/fields/`
- **FieldRegistry**: Maps type strings to lazy imports for code-splitting
- **compositeKey**: Unique identifier for each field (e.g., `root.author.name`, `root.tags[0]`)

### Adding New Field Types

1. Define Zod schema in `packages/types/src/schemas/fields.ts`
2. Add to `CoreFields` object and `coreFieldSchemas` array
3. Export type with `z.infer<typeof schema>`
4. Rebuild types: `npm run build -w @quiqr/types`
5. Create component in `/components/SukohForm/fields/`
6. Register in `FieldRegistry.ts`

### Field Component Pattern

```typescript
import { useField, useFormState } from '../useField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import type { MyFieldType as MyFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

function MyField({ compositeKey }: Props) {
  // 1. Get field utilities
  const { field, value, setValue } = useField<ValueType>(compositeKey);
  const { saveForm } = useFormState();  // Only if you need autoSave
  const config = field as MyFieldConfig;

  // 2. Build icon buttons (tip, etc.)
  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // 3. Handle changes
  const handleChange = (newValue: ValueType) => {
    setValue(newValue, 250);  // 250ms debounce (0 for immediate)
    if (config.autoSave === true) {
      saveForm();
    }
  };

  // 4. Render
  return (
    <FormItemWrapper
      control={
        <DefaultWrapper>
          {/* Your field UI */}
        </DefaultWrapper>
      }
      iconButtons={iconButtons}
    />
  );
}

export default MyField;
```

### Useful Hooks

| Hook | Purpose |
|------|---------|
| `useField<T>(compositeKey)` | Get field config, value, setValue |
| `useFormState()` | Get isDirty, isSubmitting, saveForm, document, meta |
| `useRenderFields()` | Get renderFields function for container fields |
| `useResources(compositeKey)` | Manage file resources for bundle fields |

### setValue Debounce Values

| Value | Use Case |
|-------|----------|
| `0` | Immediate update (clicks, selects) |
| `250` | Text input while typing |
| `500` | Expensive operations |

See `FIELD_DEVELOPMENT_GUIDE.md` in the SukohForm directory for detailed documentation.

## Important Patterns

### Adding a New API Method

1. Add the method to `/backend/src-main/bridge/api-main.js`
2. Define the response schema in `/frontend/types.ts` under `apiSchemas`
3. Add the method to `/frontend/src/api.ts` with proper typing
4. Use generic typing for methods that return different types based on parameters

### Working with User Preferences

**New Backend Pattern (packages/backend):**

The backend uses dependency injection with a container holding all dependencies:

```typescript
// Creating the container
import { createContainer, createDevAdapters } from '@quiqr/backend';

const container = createContainer({
  userDataPath: '/path/to/user/data',
  rootPath: '/path/to/app/root',
  adapters: createDevAdapters(),  // or createElectronAdapters() for production
});

// AppConfig - replaces global.pogoconf
container.config.setLastOpenedSite(siteKey, workspaceKey, sitePath);
const prefs = container.config.prefs;

// AppState - replaces global.currentSiteKey, global.currentSitePath, etc.
container.state.setCurrentSite('my-site', 'main', '/path/to/site');
```

**Legacy Pattern (still in use in some places):**

User preferences stored in `global.pogoconf` (backend) and accessed via:
- Backend: `global.pogoconf` (QuiqrAppConfig instance)
- Frontend: `service.api.readConfKey("prefs")` returns typed `UserPreferences`

The `appConfigSchema` in types.ts defines the structure of the global config object.

### Type-Safe Config Access

The `readConfKey` API method uses generic typing to automatically infer return types:
```typescript
api.readConfKey("prefs")  // Returns Promise<UserPreferences>
api.readConfKey("skipWelcomeScreen")  // Returns Promise<boolean>
```

This is achieved through:
1. `ReadConfKeyMap` type extracted from `appConfigSchema`
2. Generic method signature: `readConfKey<K extends keyof ReadConfKeyMap>(confkey: K)`
3. Return type automatically inferred as `ReadConfKeyMap[K]`

### Site and Workspace Concepts

- **Site**: A Hugo/Quarto project configuration
- **Workspace**: A specific instance/branch of a site with its own content
- **Single**: A single-file content item (e.g., homepage, about page)
- **Collection**: A folder of multiple content items (e.g., blog posts)

## Workspace Structure

Projects use NPM workspaces with `/packages/frontend` as a workspace. Install dependencies in the root first, then frontend-specific dependencies will be linked automatically.

## Code Style

- TypeScript for all new frontend code
- Use Zod schemas for validation and type inference
- Prefer generic typing over union types with manual type guards
- Frontend components use Material-UI (MUI) v7 with Emotion styling
- Backend remains JavaScript (Node.js)
- Do not use React.FC, just create a const and type the props. Do not use props.somevar, but destructure them in the args of the functional component.

## Documentation

:::note
Full documentation requirements are defined in `openspec/specs/documentation/spec.md`. This section provides quick reference for AI assistants.
:::

Quiqr uses Docusaurus for documentation. All documentation is in `/packages/docs/`.

### When to Document

Document when:
- Adding new features (user-facing documentation in getting-started/ or user-guide/)
- API changes (developer guide updates)
- New field types (field reference entries)
- Breaking changes (release notes)

### Quick Commands

```bash
# Development server with hot reload
npm run start -w @quiqr/docs

# Production build (validates links)
npm run build -w @quiqr/docs

# Serve production build locally
npm run serve -w @quiqr/docs
```

### Documentation Structure

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

### Frontmatter Template

```markdown
---
sidebar_position: 1
---

# Page Title

Content here...
```

### Deployment

- Documentation deploys automatically to `https://quiqr.github.io/quiqr-desktop/docs/` on merge to main
- PR checks build documentation (non-blocking) to catch errors early
- OpenSpec UI deploys to `/specs/`, docs to `/docs/`, coverage badge at `/badges/`

### More Information

See `openspec/specs/documentation/spec.md` for complete documentation requirements and standards.
