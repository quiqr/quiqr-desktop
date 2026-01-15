# Project Context

## Purpose
Quiqr Desktop is an Electron-based desktop CMS for local-first management of static site generators like Hugo and Quarto. It provides a user-friendly interface for creating, editing, and managing static site content without requiring command-line knowledge.

### Key Goals
- Provide a visual, desktop-native CMS experience for static sites
- Support multiple workspaces and branches for the same site
- Enable offline-first content management
- Integrate seamlessly with Git workflows
- Support dynamic, schema-driven forms for content editing

## Tech Stack

### Core Technologies
- **Electron** - Desktop application framework
- **React** - Frontend UI library
- **TypeScript** - Frontend type safety
- **Vite** - Frontend build tool and dev server
- **Material-UI (MUI) v6/v7** - UI component library with Emotion styling
- **Node.js** - Backend runtime
- **Express** - Backend HTTP server
- **Zod** - Runtime validation and type inference

### Static Site Generators
- **Hugo** - Primary SSG integration
- **Quarto** - WIP SSG support
- **Jekyll** - WIP SSG support
- **Eleventy** - WIP SSG support

### Build & Packaging
- **electron-builder** - Application packaging and installers
- **NPM workspaces** - Monorepo structure

## Project Conventions

### Code Style
- **TypeScript** for all new frontend code
- **JavaScript** for legacy backend code (Node.js)
- **No React.FC** - Use const with typed props instead
- **Destructure props** - Don't use `props.somevar`, destructure in function args
- Use **Zod schemas** for validation and type inference via `z.infer<typeof schema>`
- Prefer **generic typing** over union types with manual type guards
- **No emojis** in code or comments unless explicitly requested
- **Centralized types** in `/frontend/types.ts` for all Zod schemas

### Naming Conventions
- compositeKey for form fields: `root.author.name`, `root.tags[0]`
- API methods: camelCase (e.g., `readConfKey`, `setSiteConfig`)
- Component files: PascalCase (e.g., `FormItemWrapper.tsx`)
- Service files: camelCase (e.g., `main-process-bridge.ts`)

### Architecture Patterns

#### Dual-Runtime Architecture

The project is a monorepo that supports two runtime modes with a shared codebase:

**1. Electron Mode** (Desktop Application)
- **Electron Main Process** (`/electron/main.js`)
  - Application lifecycle and native OS integration
  - Initializes and hosts the backend server
  - Window management via `ui-managers/`
- **Backend Server** (`/packages/backend/src-main/`)
  - Express server running inside Electron main process
  - REST API at `/api/*` endpoints
  - Business logic and file system operations
- **Frontend** (`/frontend/src/`)
  - React + TypeScript + Vite + MUI
  - Rendered in Electron window
  - HTTP communication to backend via `main-process-bridge.ts`

**2. Standalone Node Mode** (Browser-Based)
- **Backend Server** (`/packages/backend/src-main/`)
  - Standalone Node.js process running Express server
  - REST API at `/api/*` endpoints
  - Same backend code as Electron mode
- **Frontend** (`/frontend/src/`)
  - React + TypeScript + Vite + MUI
  - Served to web browser
  - HTTP communication to backend via `main-process-bridge.ts`
  - Port 4002 in development

#### Communication Pattern
```
React Component
  → service.api.methodName() (/frontend/src/api.ts)
  → mainProcessBridge.request() (/frontend/src/utils/main-process-bridge.ts)
  → HTTP POST to http://localhost:3030/api/methodName
  → Express handler (/backend/server.js)
  → apiMain[methodName]() (/backend/src-main/bridge/api-main.js)
  → Backend services and business logic
```

#### Dependency Injection (New Pattern)
Backend uses DI container pattern:
```typescript
const container = createContainer({
  userDataPath: '/path/to/user/data',
  rootPath: '/path/to/app/root',
  adapters: createDevAdapters() // or createElectronAdapters()
});

// AppConfig - replaces global.pogoconf
container.config.setLastOpenedSite(siteKey, workspaceKey, sitePath);

// AppState - replaces global.currentSiteKey, etc.
container.state.setCurrentSite('my-site', 'main', '/path/to/site');
```

#### Dynamic Form System (SukohForm)
Schema-driven form builder using React Context:
- **Field Types**: Defined as Zod schemas in `packages/types/src/schemas/fields.ts`
- **Field Components**: In `/components/SukohForm/fields/`
- **FieldRegistry**: Maps type strings to lazy imports
- **compositeKey**: Unique identifier for each field

Form component pattern:
```typescript
const { field, value, setValue } = useField<ValueType>(compositeKey);
const { saveForm } = useFormState();
```

#### Type Safety
- All API responses validated against Zod schemas in `main-process-bridge.ts`
- Generic typing for config keys provides automatic type inference:
  ```typescript
  api.readConfKey("prefs")  // Returns Promise<UserPreferences>
  api.readConfKey("skipWelcomeScreen")  // Returns Promise<boolean>
  ```

### Testing Strategy

#### Frontend Testing
- **Test Framework**: Vitest (v4.x) - Fast unit testing framework
- **Test Location**: `frontend/test/` directory
- **Test Organization**: Mirrors source structure
  - `test/utils/` - Utility function tests
  - `test/components/` - React component tests
  - `test/containers/` - Page container tests
  - `test/contexts/` - Context provider tests
  - `test/integration/` - Integration tests

#### Running Tests
```bash
# Run all tests
cd frontend && npm test

# Run specific test file
cd frontend && npm test -- <filename>

# Watch mode during development
cd frontend && npm test -- --watch
```

#### Test Requirements
- **Utility Functions**: MUST have comprehensive unit tests
  - Cover all code paths and edge cases
  - Use vitest fake timers for timing-based code
  - Test error conditions and boundary cases
- **React Components**: SHOULD have tests for critical functionality
  - Test user interactions and state changes
  - Verify prop handling and rendering
- **Integration Tests**: For cross-cutting features (API, theming)

#### Test Patterns
- Use `describe()` blocks to group related tests
- Use `beforeEach()` and `afterEach()` for setup/teardown
- Use `vi.fn()` for mock functions
- Use `vi.useFakeTimers()` for time-dependent tests
- Clean up with `vi.restoreAllMocks()` in `afterEach()`

#### Example Test Structure
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { myFunction } from '../../src/utils/myModule';

describe('myFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle normal case', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    // Test implementation
  });
});
```

#### When to Write Tests
- **MUST**: All new utility functions and modules
- **MUST**: Changes to critical business logic
- **SHOULD**: New React components with complex logic
- **SHOULD**: Bug fixes to prevent regression
- **MAY**: Simple presentational components

### Git Workflow
- **Main branch**: `main` (used for PRs)
- **Feature branches**: `feature/*` naming convention
- Commit messages should be descriptive and reference changes
- PR format includes summary and test plan

## Domain Context

### Core Concepts
- **Site**: A Hugo/Quarto project configuration
- **Workspace**: A specific instance/branch of a site with its own content
- **Single**: A single-file content item (e.g., homepage, about page)
- **Collection**: A folder of multiple content items (e.g., blog posts)

### Key Directories

#### Backend (`/packages/backend/src-main/`)
- `bridge/` - API endpoints exposed to frontend
- `services/` - Core business logic (site, workspace, library services)
- `sync/` - Git synchronization (GitHub, system git, folder sync)
- `app-prefs-state/` - Application configuration and preferences
- `hugo/` - Hugo SSG integration
- `import/` - Site import functionality
- `scaffold-model/` - Dynamic model scaffolding
- `utils/` - Shared utilities

#### Frontend (`/frontend/src/`)
- `api.ts` - API client methods (one per backend endpoint)
- `services/` - Frontend service layer with validation
- `components/` - Reusable UI components
  - `SukohForm/` - Primary dynamic form system
  - `HoForm/` - Legacy form system
- `containers/` - Page-level components with routing
- `utils/main-process-bridge.ts` - Frontend-backend communication bridge

### User Preferences
- Stored in backend as `AppConfig` instance
- Accessed via `container.config` (new pattern) or `global.pogoconf` (legacy)
- Frontend accesses via `service.api.readConfKey("prefs")`
- Schema defined in `appConfigSchema` in types.ts

## Important Constraints

### Technical Constraints
- Platform-specific binaries bundled in `/resources/` (Hugo, Git)
- HTTP-only communication between frontend and backend (no direct IPC)
- Forms must work with schema-driven architecture

### Migration Constraints
- Legacy `global.pogoconf` pattern being phased out
- New code should use DI container pattern
- Both patterns must coexist during transition

### Code Organization
- ALWAYS prefer editing existing files over creating new ones
- NEVER create documentation files (*.md) unless explicitly requested
- Use NPM workspaces - install dependencies in root first
- Frontend-specific dependencies auto-linked via workspaces

## External Dependencies

### Static Site Generators
- **Hugo** - Bundled binaries for Windows, Linux, macOS
- **Quarto** - External installation expected

### Version Control
- **Git** - Bundled system git binaries
- **GitHub API** - For repository synchronization

### Development Services
- **Vite Dev Server** - http://localhost:4002 (frontend)
- **Backend Server** - http://localhost:3030 (API endpoints)

### Build Tools
- **electron-builder** - Multi-platform installers
- **TypeScript** - Frontend type checking (use `tsc --noEmit`)
