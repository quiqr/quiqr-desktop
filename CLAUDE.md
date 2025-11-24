# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quiqr Desktop is an Electron-based desktop CMS for local-first management of static site generators like Hugo and Quarto. The project uses a client-server architecture within Electron, with a React frontend communicating with a Node.js backend via HTTP.

## Development Commands

**Start development environment:**
```bash
npm run dev  # Starts both frontend dev server and Electron
```

**Frontend only:**
```bash
cd frontend && npm run dev  # Vite dev server on http://localhost:4002
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
cd frontend && npx tsc --noEmit
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

3. **Frontend** (`/frontend/src/`)
   - React + TypeScript + Vite + Material-UI (MUI v6)
   - Communicates with backend via HTTP through `main-process-bridge.ts`
   - Runs on port 4002 in development

### Communication Pattern

Frontend → Backend communication flow:
```
React Component
  ↓
service.api.methodName()  (/frontend/src/api.ts)
  ↓
mainProcessBridge.request()  (/frontend/src/utils/main-process-bridge.ts)
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

**Centralized type definitions in `/frontend/types.ts`:**
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

### Backend (`/backend/src-main/`)
- `bridge/` - API endpoints exposed to frontend
- `services/` - Core business logic (site, workspace, library services)
- `sync/` - Git synchronization (GitHub, system git, folder sync)
- `app-prefs-state/` - Application configuration and preferences
- `hugo/` - Hugo SSG integration
- `import/` - Site import functionality
- `scaffold-model/` - Dynamic model scaffolding
- `utils/` - Shared utilities

### Frontend (`/frontend/src/`)
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

The SukohForm system (`/frontend/src/components/SukohForm/`) is a schema-driven form builder:

- **Field Types**: 25+ field types defined in `/frontend/types.ts` (string, markdown, accordion, bundle-manager, etc.)
- **Field Components**: Each field type has a corresponding `*Dynamic.tsx` component in `/components/SukohForm/components/`
- **Schema Validation**: All field schemas use Zod with discriminated unions
- **Extensibility**: Custom field types supported via `customFieldSchema`

When adding new field types:
1. Define the schema in `/frontend/types.ts`
2. Add to `coreFieldSchemas` array
3. Create the component in `/components/SukohForm/components/`
4. Register in the form field router

## Important Patterns

### Adding a New API Method

1. Add the method to `/backend/src-main/bridge/api-main.js`
2. Define the response schema in `/frontend/types.ts` under `apiSchemas`
3. Add the method to `/frontend/src/api.ts` with proper typing
4. Use generic typing for methods that return different types based on parameters

### Working with User Preferences

User preferences are stored in `global.pogoconf` (backend) and accessed via:
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

Projects use NPM workspaces with `/frontend` as a workspace. Install dependencies in the root first, then frontend-specific dependencies will be linked automatically.

## Code Style

- TypeScript for all new frontend code
- Use Zod schemas for validation and type inference
- Prefer generic typing over union types with manual type guards
- Frontend components use Material-UI (MUI) v6 with Emotion styling
- Backend remains JavaScript (Node.js)
