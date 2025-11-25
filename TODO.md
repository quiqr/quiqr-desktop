# Backend Modernization Plan

## 🎯 Project Goal
Modernize the backend from CommonJS/JavaScript/Electron-coupled to ESM/TypeScript/Adapter-based architecture. Enable deployment as both Electron app and standalone server.

---

## 📋 Workflow Instructions

**IMPORTANT - Claude's Operating Rules:**
1. ✅ **NEVER run** `npm install`, `npm run dev`, or `npm run build` automatically
2. ✅ **ALWAYS ask the user** to run these commands when needed
3. ✅ **NOTIFY user BEFORE marking any task complete** - wait for user verification
4. ✅ Only mark tasks as ✅ after user confirms completion

**User's Responsibilities:**
- Run all npm commands manually when Claude requests
- Verify and confirm when Claude completes a task
- Test the application after significant changes

---

## 📊 Current State Analysis

### What We Have:
- **Backend**: [backend/](backend/) - CommonJS, JavaScript, tightly coupled to Electron
- **Frontend**: [frontend/](frontend/) - Already TypeScript + ESM + Vite
- **Electron**: [electron/](electron/) - Main process code
- **11 files** in backend use `require('electron')` directly
- **19 files** have cross-directory dependencies (`require('../../../electron/...')`)
- Shared types currently in [frontend/types.ts](frontend/types.ts)
- Backend has old [backend/dist/](backend/dist/) folder from previous migration attempt

### Key Issues:
1. ❌ Backend uses CommonJS (`require`/`module.exports`)
2. ❌ No TypeScript in backend (no type safety)
3. ❌ Backend directly depends on Electron APIs
4. ❌ Cannot run as standalone server
5. ❌ Import paths are messy (`../../../electron/ui-managers/...`)
6. ❌ Types duplicated/scattered across codebase

---

## 🏗️ Proposed Architecture: Monorepo with Separate Packages

```
quiqr-desktop/
├── packages/
│   ├── types/           # @quiqr/types - Shared Zod schemas & TypeScript types
│   ├── backend/         # @quiqr/backend - Core API server (ESM, TS, platform-agnostic)
│   ├── frontend/        # @quiqr/frontend - React app (move existing frontend/)
│   └── adapters/
│       ├── electron/    # @quiqr/adapter-electron - Electron wrapper + UI managers
│       └── standalone/  # @quiqr/adapter-standalone - Traditional Node server (future)
├── package.json         # Root workspace config with all workspaces
├── tsconfig.base.json   # Shared TypeScript config
└── TODO.md             # This file
```

### Why This Architecture?

**1. Clean Separation of Concerns**
- Types: Pure schemas and interfaces
- Backend: Business logic only, no platform code
- Adapters: Platform-specific implementations (Electron, web server, etc.)

**2. No Import Path Hell**
- Before: `require('../../../electron/ui-managers/menu-manager')`
- After: `import { MenuManager } from '@quiqr/adapter-electron'`
- Same imports work in dev (workspace links) and production (node_modules)

**3. Type Safety Across Boundaries**
- Shared `@quiqr/types` ensures frontend ↔ backend contract
- Zod schemas validate at runtime
- TypeScript checks at compile time

**4. Platform Independence**
- Backend doesn't know about Electron
- Easy to add new adapters (web, mobile, cloud functions)
- Test backend without Electron dependencies

**5. Development/Production Parity**
- **Dev mode**: `import '@quiqr/backend'` → resolves via workspace link to `packages/backend/src/`
- **Production**: Same import → resolves to `node_modules/@quiqr/backend/dist/`
- **No conditional paths needed!**

---

## 📅 Timeline Overview

- **Phase 1**: Extract Shared Types (~1 week)
- **Phase 2**: Modernize Backend (~2 weeks) ← Most complex
- **Phase 3**: Create Electron Adapter (~1 week)
- **Phase 4**: Testing & Validation (~1 week)
- **Phase 5**: Standalone Adapter (~1-2 weeks, optional)

**Total for Electron parity**: ~5 weeks

---

## Phase 1: Extract Shared Types Package ✅ COMPLETE

**Goal**: Create `@quiqr/types` package with Zod schemas and TypeScript types

**Why First?**: Foundation for everything else. Both frontend and backend need these.

**Dependencies**: None

**Risk Level**: 🟢 Low (pure extraction, no logic changes)

### Tasks:

- [x] 1.1: Create package structure
  ```
  packages/types/
  ├── src/
  │   ├── schemas/      # Zod schemas
  │   │   ├── api.ts    # API request/response schemas
  │   │   ├── config.ts # App config schemas
  │   │   ├── fields.ts # Form field schemas
  │   │   └── index.ts
  │   ├── types/        # Pure TypeScript types
  │   │   └── index.ts
  │   └── index.ts      # Main entry point
  ├── package.json
  ├── tsconfig.json
  └── README.md
  ```

- [x] 1.2: Setup package.json for `@quiqr/types`
  ```json
  {
    "name": "@quiqr/types",
    "version": "0.1.0",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": "./dist/index.js",
      "./schemas": "./dist/schemas/index.js",
      "./types": "./dist/types/index.js"
    },
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch"
    },
    "dependencies": {
      "zod": "^3.x.x"
    },
    "devDependencies": {
      "typescript": "^5.x.x"
    }
  }
  ```

- [x] 1.3: Setup tsconfig.json for `@quiqr/types`
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src",
      "declaration": true,
      "declarationMap": true
    },
    "include": ["src"]
  }
  ```

- [x] 1.4: Create root `tsconfig.base.json`
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "esModuleInterop": true,
      "strict": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "allowSyntheticDefaultImports": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```

- [x] 1.5: Extract schemas from [frontend/types.ts](frontend/types.ts)
  - Organized into: `fields.ts` (25+ field types), `api.ts`, `config.ts`, `service.ts`
  - All schemas exported from `packages/types/src/schemas/index.ts`
  - Type inference included in each schema file

- [x] 1.6: Update root [package.json](package.json) workspaces
  - Added `packages/types` to workspaces array
  - Ran `npm install` successfully

- [x] 1.7: Update [frontend/types.ts](frontend/types.ts) to re-export from `@quiqr/types`
  - Replaced 954 lines with 6-line re-export
  - Maintains backward compatibility

- [x] 1.8: Build types package
  - Built successfully with `npm run build -w @quiqr/types`
  - Generated `dist/` folder with compiled .js and .d.ts files

- [x] 1.9: Verify frontend still works
  - Updated frontend tsconfig.json `moduleResolution: "bundler"`
  - TypeScript compilation passes with `npx tsc --noEmit`
  - All imports resolve correctly

**Completion Criteria**:
- ✅ `@quiqr/types` package exists and builds successfully
- ✅ Frontend imports from `@quiqr/types` instead of local types.ts
- ✅ No TypeScript errors in frontend
- ✅ Application runs in dev mode without errors

**📝 Notes:**
- Removed `sourceMap: true` from tsconfig.base.json (not needed for internal packages)
- Fixed import syntax in `types/index.ts` to use standard imports instead of inline `import()`
- Package structure: 4 schema files (fields, config, api, service) + types folder

---

## Phase 2: Modernize Backend Package ⏳

**Goal**: Convert backend to TypeScript + ESM, remove Electron coupling via adapters

**Why This Phase?**: Core transformation. Most complex but enables everything else.

**Dependencies**: ✅ Phase 1 complete

**Risk Level**: 🟡 Medium (requires careful refactoring, but incremental)

### Architecture Changes:

**New Backend Structure**:
```
packages/backend/
├── src/
│   ├── api/              # API handlers (from bridge/api-main.js)
│   │   ├── handlers/     # Individual API endpoint handlers
│   │   ├── middleware/   # Express middleware
│   │   └── server.ts     # Express app setup
│   ├── services/         # Business logic (migrate from src-main/services/)
│   │   ├── site/
│   │   ├── workspace/
│   │   └── library/
│   ├── utils/            # Utilities (migrate from src-main/utils/)
│   ├── adapters/         # 🆕 Platform abstractions
│   │   ├── types.ts      # Adapter interfaces
│   │   ├── dialog.ts
│   │   ├── shell.ts
│   │   ├── filesystem.ts
│   │   └── window.ts
│   ├── config/           # Configuration management
│   │   └── app-config.ts # Replace global.pogoconf
│   └── index.ts          # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

**Key Concept - Adapter Pattern**:

Instead of:
```javascript
// ❌ Direct Electron coupling
const { dialog } = require('electron')
const result = await dialog.showOpenDialog(options)
```

Use:
```typescript
// ✅ Adapter interface
import { DialogAdapter } from './adapters/types'

class MyService {
  constructor(private dialog: DialogAdapter) {}

  async selectFolder() {
    return this.dialog.showOpenDialog({ properties: ['openDirectory'] })
  }
}
```

Then Electron adapter implements:
```typescript
// In @quiqr/adapter-electron package
import { dialog } from 'electron'
import { DialogAdapter } from '@quiqr/backend/adapters/types'

export class ElectronDialogAdapter implements DialogAdapter {
  async showOpenDialog(options) {
    return dialog.showOpenDialog(options)
  }
}
```

### Tasks:

**2.1: Setup Package Structure** ✅

- [x] 2.1.1: Create `packages/backend/` directory structure (see above)

- [x] 2.1.2: Create package.json for `@quiqr/backend`
  ```json
  {
    "name": "@quiqr/backend",
    "version": "0.1.0",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": "./dist/index.js",
      "./api": "./dist/api/server.js",
      "./services": "./dist/services/index.js",
      "./adapters": "./dist/adapters/index.js"
    },
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch"
    },
    "dependencies": {
      "@quiqr/types": "workspace:*",
      "express": "^4.x.x",
      "cors": "^2.x.x",
      "zod": "^3.x.x",
      "fs-extra": "^11.x.x",
      "glob": "^10.x.x",
      "js-yaml": "^4.x.x",
      "front-matter": "^4.x.x",
      "toml": "^3.x.x"
    },
    "devDependencies": {
      "typescript": "^5.x.x",
      "@types/express": "^4.x.x",
      "@types/cors": "^2.x.x",
      "@types/node": "^20.x.x"
    }
  }
  ```

- [x] 2.1.3: Create tsconfig.json for `@quiqr/backend`
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src",
      "declaration": true,
      "declarationMap": true,
      "lib": ["ES2022"],
      "types": ["node"]
    },
    "include": ["src"],
    "exclude": ["node_modules", "dist"]
  }
  ```

- [x] 2.1.4: Update root package.json workspaces
  ```json
  {
    "workspaces": [
      "packages/types",
      "packages/backend",
      "packages/frontend"
    ]
  }
  ```
  **⚠️ USER ACTION NEEDED**: Run `npm install`

**2.2: Define Adapter Interfaces** ✅

- [x] 2.2.1: Create `src/adapters/types.ts` with all adapter interfaces
  ```typescript
  // Dialog operations
  export interface DialogAdapter {
    showOpenDialog(options: OpenDialogOptions): Promise<string[]>
    showSaveDialog(options: SaveDialogOptions): Promise<string | undefined>
    showMessageBox(options: MessageBoxOptions): Promise<number>
  }

  // Shell operations (open external apps, show files in folder)
  export interface ShellAdapter {
    openExternal(url: string): Promise<void>
    showItemInFolder(fullPath: string): void
    openPath(path: string): Promise<string>
  }

  // Window management
  export interface WindowAdapter {
    showLogWindow(content: string): void
    reloadMainWindow(): void
    sendToRenderer(channel: string, data: any): void
  }

  // Menu management
  export interface MenuAdapter {
    setMenuItemEnabled(itemId: string, enabled: boolean): void
    createMainMenu(): void
  }

  // Application info
  export interface AppInfoAdapter {
    isPackaged(): boolean
    getAppPath(): string
    getVersion(): string
  }

  // Combined platform adapter
  export interface PlatformAdapters {
    dialog: DialogAdapter
    shell: ShellAdapter
    window: WindowAdapter
    menu: MenuAdapter
    appInfo: AppInfoAdapter
  }
  ```

- [x] 2.2.2: Create placeholder adapters for development (no-op implementations)
  ```typescript
  // src/adapters/dev-adapters.ts
  export const createDevAdapters = (): PlatformAdapters => ({
    dialog: {
      async showOpenDialog() { return [] },
      async showSaveDialog() { return undefined },
      async showMessageBox() { return 0 }
    },
    // ... other placeholders
  })
  ```

**2.3: Migrate Core Utilities (No Dependencies)** ✅

These can be converted first as they don't depend on other modules:

- [x] 2.3.1: Migrate `utils/content-formats.js` → `src/utils/content-formats.ts`
  - Convert to ESM
  - Add TypeScript types
  - Use `export const` instead of `module.exports`

- [x] 2.3.2: Migrate `utils/format-providers/*.js` → `src/utils/format-providers/*.ts`
  - Convert YAML, TOML, JSON providers
  - Create TypeScript interfaces for providers

- [x] 2.3.3: Migrate `utils/path-helper.js` → `src/utils/path-helper.ts`
  - Remove Electron dependencies (use adapter if needed)
  - Update to ESM

- [x] 2.3.4: Migrate `utils/file-dir-utils.js` → `src/utils/file-dir-utils.ts`

- [x] 2.3.5: Migrate `utils/format-provider-resolver.js` → `src/utils/format-provider-resolver.ts`

**2.4: Replace Global State with Dependency Injection** ✅

Current problem: `global.pogoconf`, `global.currentSiteKey`, etc.

Solution: Create configuration service with dependency injection

- [x] 2.4.1: Create `src/config/app-config.ts`
  ```typescript
  import { z } from 'zod'
  import { appConfigSchema } from '@quiqr/types'

  export class AppConfig {
    private config: z.infer<typeof appConfigSchema>

    constructor(configPath: string) {
      // Load config from file
    }

    get lastOpenedSite() { return this.config.lastOpenedSite }
    get prefs() { return this.config.prefs }
    // ... other getters

    async save(): Promise<void> { /* ... */ }
  }
  ```

- [x] 2.4.2: Create `src/config/app-state.ts` for runtime state
  ```typescript
  export class AppState {
    currentSiteKey: string | undefined
    currentWorkspaceKey: string | undefined
    currentServerProcess: any
    // ... other runtime state
  }
  ```

- [x] 2.4.3: Create dependency injection container
  ```typescript
  // src/container.ts
  export interface AppContainer {
    config: AppConfig
    state: AppState
    adapters: PlatformAdapters
  }

  export function createContainer(adapters: PlatformAdapters): AppContainer {
    const config = new AppConfig(/* ... */)
    const state = new AppState()
    return { config, state, adapters }
  }
  ```

**2.5: Migrate Services (Incremental, One at a Time)**

Strategy: Start with services that have fewest dependencies, work up to complex ones.

- [x] 2.5.1: Migrate `services/workspace/folder-helper.js` → `src/services/workspace/folder-helper.ts`
  - Convert to ESM
  - Add types
  - No Electron dependencies

- [x] 2.5.2: Migrate `services/workspace/workspace-config-validator.js` → `src/services/workspace/workspace-config-validator.ts`
  - Use `@quiqr/types` schemas
  - Convert Joi schemas to Zod if needed

- [x] 2.5.3: Migrate `services/workspace/workspace-config-provider.js` → `src/services/workspace/workspace-config-provider.ts`
  - Update imports to ESM
  - Use `AppConfig` instead of `global.pogoconf`

- [x] 2.5.4: Migrate `services/workspace/initial-workspace-config-builder.js` → `src/services/workspace/initial-workspace-config-builder.ts`

- [x] 2.5.5: Migrate `services/workspace/workspace-service.js` → `src/services/workspace/workspace-service.ts`
  - Replace `require('electron').shell` with `ShellAdapter`
  - Inject dependencies via constructor
  ```typescript
  export class WorkspaceService {
    constructor(
      private config: AppConfig,
      private shell: ShellAdapter
    ) {}
  }
  ```

- [x] 2.5.6: Migrate `services/site/site-service.js` → `src/services/site/site-service.ts`

- [x] 2.5.7: Migrate `services/library/library-service.js` → `src/services/library/library-service.ts`

**2.6: Migrate Sync Modules**

- [ ] 2.6.1: Migrate `sync/folder/folder-sync.js` → `src/sync/folder/folder-sync.ts`

- [ ] 2.6.2: Migrate `sync/github/*.js` → `src/sync/github/*.ts`

- [ ] 2.6.3: Migrate `sync/sysgit/*.js` → `src/sync/sysgit/*.ts`

- [ ] 2.6.4: Migrate `sync/sync-factory.js` → `src/sync/sync-factory.ts`

**2.7: Migrate Hugo Integration**

- [ ] 2.7.1: Migrate `hugo/hugo-config.js` → `src/hugo/hugo-config.ts`

- [ ] 2.7.2: Migrate `hugo/hugo-utils.js` → `src/hugo/hugo-utils.ts`
  - Remove Electron dependencies

- [ ] 2.7.3: Migrate `hugo/hugo-builder.js` → `src/hugo/hugo-builder.ts`

- [ ] 2.7.4: Migrate `hugo/hugo-server.js` → `src/hugo/hugo-server.ts`

- [ ] 2.7.5: Migrate `hugo/hugo-downloader.js` → `src/hugo/hugo-downloader.ts`
  - Replace Electron dialog with `DialogAdapter`

**2.8: Migrate Import/Export**

- [ ] 2.8.1: Migrate `import-export/pogozipper.js` → `src/import-export/pogozipper.ts`
  - Replace Electron dependencies with adapters

- [ ] 2.8.2: Migrate `import/folder-importer.js` → `src/import/folder-importer.ts`

- [ ] 2.8.3: Migrate `import/git-importer.js` → `src/import/git-importer.ts`

**2.9: Migrate API Layer**

- [ ] 2.9.1: Analyze current API structure in `bridge/api-main.js`
  - Document all API endpoints (there are many!)
  - Group by domain (workspace, site, library, etc.)

- [ ] 2.9.2: Create API handler structure
  ```
  src/api/
  ├── handlers/
  │   ├── workspace-handlers.ts
  │   ├── site-handlers.ts
  │   ├── library-handlers.ts
  │   ├── sync-handlers.ts
  │   └── config-handlers.ts
  ├── middleware/
  │   ├── error-handler.ts
  │   └── request-validator.ts
  └── server.ts
  ```

- [ ] 2.9.3: Convert each API method from `api-main.js` to typed handler
  ```typescript
  // Example handler
  export async function getWorkspaceHandler(
    data: unknown,
    container: AppContainer
  ): Promise<WorkspaceResponse> {
    const input = workspaceRequestSchema.parse(data)
    const service = new WorkspaceService(container.config, container.adapters.shell)
    return service.getWorkspace(input.workspaceKey)
  }
  ```

- [ ] 2.9.4: Create new Express server in `src/api/server.ts`
  ```typescript
  import express from 'express'
  import cors from 'cors'
  import { AppContainer } from '../container'

  export function createServer(container: AppContainer) {
    const app = express()
    app.use(cors())
    app.use(express.json())

    // Register handlers
    app.post('/api/:method', async (req, res) => {
      const { method } = req.params
      const { data } = req.body

      try {
        const handler = getHandler(method)
        const result = await handler(data, container)
        res.json(result)
      } catch (error) {
        console.error('API error:', error)
        res.status(500).json({ error: error.message })
      }
    })

    return app
  }
  ```

- [ ] 2.9.5: Migrate all API handlers from `api-main.js` (this will be many small tasks)
  - Group similar handlers
  - Add Zod validation for requests
  - Use `@quiqr/types` schemas for responses

**2.10: Create Main Entry Point**

- [ ] 2.10.1: Create `src/index.ts`
  ```typescript
  import { createServer } from './api/server'
  import { createContainer } from './container'
  import { PlatformAdapters } from './adapters/types'

  export { PlatformAdapters } from './adapters/types'
  export { AppConfig } from './config/app-config'
  export { AppState } from './config/app-state'

  export function startBackend(adapters: PlatformAdapters, port = 5150) {
    const container = createContainer(adapters)
    const app = createServer(container)

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`Backend server running on http://localhost:${port}`)
        resolve({ server, container })
      })
    })
  }
  ```

**2.11: Build and Test**

- [ ] 2.11.1: Build the backend package
  **⚠️ USER ACTION NEEDED**: Run `npm run build -w @quiqr/backend`

- [ ] 2.11.2: Fix any TypeScript compilation errors
  - Use `// @ts-expect-error` temporarily for complex types
  - Document with TODOs for later cleanup

- [ ] 2.11.3: Create temporary test harness to verify backend builds

**Completion Criteria**:
- ✅ All backend code converted to TypeScript + ESM
- ✅ No direct `require('electron')` in backend code
- ✅ All services use dependency injection
- ✅ Backend package builds without errors
- ✅ Adapter interfaces defined for all platform operations

---

## Phase 3: Create Electron Adapter Package ⏳

**Goal**: Move Electron-specific code to adapter package, wire up to backend

**Why This Phase?**: Makes backend usable in Electron again. Completes the adapter pattern.

**Dependencies**: ✅ Phase 2 complete

**Risk Level**: 🟡 Medium (requires testing all Electron features)

### Tasks:

**3.1: Setup Package Structure**

- [ ] 3.1.1: Create package structure
  ```
  packages/adapters/electron/
  ├── src/
  │   ├── adapters/         # Adapter implementations
  │   │   ├── dialog.ts
  │   │   ├── shell.ts
  │   │   ├── window.ts
  │   │   ├── menu.ts
  │   │   └── app-info.ts
  │   ├── ui-managers/      # Migrate from root electron/ui-managers/
  │   │   ├── main-window-manager.ts
  │   │   ├── log-window-manager.ts
  │   │   ├── menu-manager.ts
  │   │   └── screenshot-window-manager.ts
  │   ├── main.ts           # Electron entry point
  │   └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── README.md
  ```

- [ ] 3.1.2: Create package.json
  ```json
  {
    "name": "@quiqr/adapter-electron",
    "version": "0.1.0",
    "type": "module",
    "main": "./dist/main.js",
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch"
    },
    "dependencies": {
      "@quiqr/backend": "workspace:*",
      "@quiqr/types": "workspace:*",
      "electron": "^30.x.x",
      "@electron/remote": "^2.x.x",
      "electron-window-state": "^5.x.x"
    },
    "devDependencies": {
      "typescript": "^5.x.x",
      "@types/node": "^20.x.x"
    }
  }
  ```

- [ ] 3.1.3: Create tsconfig.json
  ```json
  {
    "extends": "../../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src",
      "lib": ["ES2022"],
      "types": ["node"]
    },
    "include": ["src"]
  }
  ```

- [ ] 3.1.4: Update root package.json workspaces
  ```json
  {
    "workspaces": [
      "packages/types",
      "packages/backend",
      "packages/frontend",
      "packages/adapters/electron"
    ]
  }
  ```
  **⚠️ USER ACTION NEEDED**: Run `npm install`

**3.2: Implement Electron Adapters**

- [ ] 3.2.1: Implement `src/adapters/dialog.ts`
  ```typescript
  import { dialog } from 'electron'
  import { DialogAdapter } from '@quiqr/backend/adapters'

  export class ElectronDialogAdapter implements DialogAdapter {
    async showOpenDialog(options) {
      const result = await dialog.showOpenDialog(options)
      return result.filePaths
    }

    async showSaveDialog(options) {
      const result = await dialog.showSaveDialog(options)
      return result.filePath
    }

    async showMessageBox(options) {
      const result = await dialog.showMessageBox(options)
      return result.response
    }
  }
  ```

- [ ] 3.2.2: Implement `src/adapters/shell.ts`
  ```typescript
  import { shell } from 'electron'
  import { ShellAdapter } from '@quiqr/backend/adapters'

  export class ElectronShellAdapter implements ShellAdapter {
    async openExternal(url: string) {
      await shell.openExternal(url)
    }

    showItemInFolder(fullPath: string) {
      shell.showItemInFolder(fullPath)
    }

    async openPath(path: string) {
      return shell.openPath(path)
    }
  }
  ```

- [ ] 3.2.3: Implement `src/adapters/window.ts`
  ```typescript
  import { BrowserWindow } from 'electron'
  import { WindowAdapter } from '@quiqr/backend/adapters'
  import { logWindowManager } from '../ui-managers/log-window-manager'

  export class ElectronWindowAdapter implements WindowAdapter {
    constructor(private mainWindow: BrowserWindow) {}

    showLogWindow(content: string) {
      logWindowManager.show(content)
    }

    reloadMainWindow() {
      this.mainWindow.reload()
    }

    sendToRenderer(channel: string, data: any) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
  ```

- [ ] 3.2.4: Implement `src/adapters/menu.ts`

- [ ] 3.2.5: Implement `src/adapters/app-info.ts`
  ```typescript
  import { app } from 'electron'
  import { AppInfoAdapter } from '@quiqr/backend/adapters'

  export class ElectronAppInfoAdapter implements AppInfoAdapter {
    isPackaged() {
      return app.isPackaged
    }

    getAppPath() {
      return app.getAppPath()
    }

    getVersion() {
      return app.getVersion()
    }
  }
  ```

**3.3: Migrate UI Managers**

- [ ] 3.3.1: Migrate `electron/ui-managers/main-window-manager.js` → `src/ui-managers/main-window-manager.ts`
  - Convert to TypeScript
  - Update to ESM

- [ ] 3.3.2: Migrate `electron/ui-managers/log-window-manager.js` → `src/ui-managers/log-window-manager.ts`

- [ ] 3.3.3: Migrate `electron/ui-managers/menu-manager.js` → `src/ui-managers/menu-manager.ts`

- [ ] 3.3.4: Migrate `electron/ui-managers/screenshot-window-manager.js` → `src/ui-managers/screenshot-window-manager.ts`

**3.4: Create Electron Main Process**

- [ ] 3.4.1: Create `src/main.ts` (new Electron entry point)
  ```typescript
  import { app, BrowserWindow } from 'electron'
  import remoteMain from '@electron/remote/main'
  import { startBackend } from '@quiqr/backend'
  import { mainWindowManager } from './ui-managers/main-window-manager'
  import { menuManager } from './ui-managers/menu-manager'
  import {
    ElectronDialogAdapter,
    ElectronShellAdapter,
    ElectronWindowAdapter,
    ElectronMenuAdapter,
    ElectronAppInfoAdapter
  } from './adapters'

  remoteMain.initialize()

  const isDev = process.env.NODE_ENV === 'development'

  let mainWindow: BrowserWindow | null = null

  async function createWindow() {
    mainWindow = mainWindowManager.getCurrentInstanceOrNew()

    // Create adapters
    const adapters = {
      dialog: new ElectronDialogAdapter(),
      shell: new ElectronShellAdapter(),
      window: new ElectronWindowAdapter(mainWindow),
      menu: new ElectronMenuAdapter(),
      appInfo: new ElectronAppInfoAdapter()
    }

    // Start backend server
    await startBackend(adapters, 5150)

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', async () => {
    await createWindow()
    menuManager.createMainMenu()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
  ```

- [ ] 3.4.2: Remove old `global.pogoconf` and global state setup
  - Backend now manages its own state
  - No more global variables

**3.5: Update Root Configuration**

- [ ] 3.5.1: Update root [package.json](package.json) to point to new entry
  ```json
  {
    "main": "packages/adapters/electron/dist/main.js",
    "scripts": {
      "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:electron:wait\"",
      "dev:frontend": "npm run dev -w @quiqr/frontend",
      "dev:electron": "cross-env NODE_ENV=development electron .",
      "dev:electron:wait": "wait-on http://localhost:4002 && npm run dev:electron",
      "build": "npm run build:all && electron-builder",
      "build:all": "npm run build -ws --if-present",
      "build:frontend": "npm run build -w @quiqr/frontend"
    }
  }
  ```

- [ ] 3.5.2: Update [electron-builder configuration](package.json) files array
  ```json
  {
    "build": {
      "files": [
        "packages/frontend/build/**/*",
        "packages/adapters/electron/dist/**/*",
        "packages/backend/dist/**/*",
        "packages/types/dist/**/*",
        "packages/*/package.json",
        "resources/**/*",
        "package.json"
      ]
    }
  }
  ```

**3.6: Build and Test**

- [ ] 3.6.1: Build all packages
  **⚠️ USER ACTION NEEDED**: Run `npm run build:all`

- [ ] 3.6.2: Fix any TypeScript compilation errors

- [ ] 3.6.3: Test Electron app in development
  **⚠️ USER ACTION NEEDED**: Run `npm run dev`
  - Verify backend server starts on port 5150
  - Verify frontend connects to backend
  - Verify basic functionality works

- [ ] 3.6.4: Test critical features:
  - [ ] Opening/creating workspaces
  - [ ] File dialogs (open, save)
  - [ ] Menu items
  - [ ] Hugo server integration
  - [ ] Git operations
  - [ ] Import/export

**3.7: Remove Old Code**

- [ ] 3.7.1: Delete old [electron/](electron/) folder
  - Verify everything is migrated first!

- [ ] 3.7.2: Delete old [backend/src-main/electron.js](backend/src-main/electron.js)

- [ ] 3.7.3: Delete old [backend/src-main/bridge/](backend/src-main/bridge/) folder

- [ ] 3.7.4: Delete old [backend/dist/](backend/dist/) folder from failed attempt

**Completion Criteria**:
- ✅ Electron adapter package exists and builds
- ✅ All Electron-specific code moved to adapter
- ✅ Backend runs inside Electron via adapters
- ✅ Development mode works (`npm run dev`)
- ✅ All critical features tested and working
- ✅ Old code removed

---

## Phase 4: Testing & Production Build Validation ⏳

**Goal**: Ensure everything works in both dev and production, optimize build

**Why This Phase?**: Catch issues before considering migration complete

**Dependencies**: ✅ Phase 3 complete

**Risk Level**: 🟢 Low (mostly validation and fixes)

### Tasks:

**4.1: Development Environment Testing**

- [ ] 4.1.1: Test hot reload in frontend
  - Make change to React component
  - Verify hot reload works

- [ ] 4.1.2: Test backend changes require restart
  - Document this behavior (expected)

- [ ] 4.1.3: Test concurrent development
  - Frontend dev server on 4002
  - Backend server on 5150
  - Electron wraps both

**4.2: Production Build Testing**

- [ ] 4.2.1: Clean build from scratch
  **⚠️ USER ACTION NEEDED**:
  ```bash
  npm run clean  # If script exists
  rm -rf node_modules packages/*/node_modules packages/*/dist
  npm install
  npm run build:all
  ```

- [ ] 4.2.2: Verify all packages build successfully
  - Check `packages/types/dist/`
  - Check `packages/backend/dist/`
  - Check `packages/adapters/electron/dist/`
  - Check `packages/frontend/build/`

- [ ] 4.2.3: Build Electron installer
  **⚠️ USER ACTION NEEDED**: Run `npm run build` (includes electron-builder)

- [ ] 4.2.4: Test installer on target platform
  **⚠️ USER ACTION NEEDED**: Install and run the built application
  - Verify it starts without errors
  - Verify backend server starts
  - Verify all features work

**4.3: Path Resolution Verification**

- [ ] 4.3.1: Verify package imports work in production
  - `@quiqr/types` resolves correctly
  - `@quiqr/backend` resolves correctly
  - No "module not found" errors

- [ ] 4.3.2: Verify resource paths work (Hugo binaries, Git binaries, etc.)
  - Check [resources/](resources/) folder paths
  - Verify extraResources in electron-builder config

**4.4: Performance & Optimization**

- [ ] 4.4.1: Check bundle sizes
  - Frontend bundle size
  - Backend bundle size (if relevant)

- [ ] 4.4.2: Identify any large dependencies
  - Can any be moved to devDependencies?
  - Can any be made optional?

- [ ] 4.4.3: Test startup time
  - Dev mode startup time
  - Production app startup time

**4.5: Error Handling & Logging**

- [ ] 4.5.1: Test error scenarios
  - Invalid API requests
  - Missing files
  - Failed git operations
  - Network errors

- [ ] 4.5.2: Verify error messages are helpful
  - No cryptic errors
  - Stack traces available in dev mode

- [ ] 4.5.3: Test logging system
  - Verify log window works
  - Verify console output is clean

**4.6: Documentation Updates**

- [ ] 4.6.1: Update [CLAUDE.md](CLAUDE.md) with new architecture
  - Update directory structure
  - Update communication patterns
  - Update build commands

- [ ] 4.6.2: Update [README.md](README.md) (if exists)
  - Update development instructions
  - Update build instructions

- [ ] 4.6.3: Create [packages/backend/README.md](packages/backend/README.md)
  - Document adapter pattern
  - Document dependency injection
  - Document API structure

- [ ] 4.6.4: Create [packages/adapters/electron/README.md](packages/adapters/electron/README.md)
  - Document adapter implementations
  - Document UI managers

**4.7: CI/CD Updates (if applicable)**

- [ ] 4.7.1: Update CI build scripts
  - Build all workspaces
  - Run type checking
  - Run tests (if any)

- [ ] 4.7.2: Update release scripts
  - Ensure all packages are built
  - Verify version bumping works

**Completion Criteria**:
- ✅ Development environment fully functional
- ✅ Production build works on all target platforms
- ✅ No path resolution issues
- ✅ Performance is acceptable
- ✅ Error handling is robust
- ✅ Documentation is up to date
- ✅ **Migration to TypeScript + ESM + Adapters COMPLETE!**

---

## Phase 5: Standalone Server Adapter (Optional, Future) 🔮

**Goal**: Create adapter for running as traditional Node.js server (no Electron)

**Why This Phase?**: Enables server deployment, multi-user scenarios, cloud hosting

**Dependencies**: ✅ Phase 4 complete

**Risk Level**: 🟢 Low (additive, doesn't affect Electron)

### Tasks:

**5.1: Design Standalone Architecture**

- [ ] 5.1.1: Design authentication system
  - Session management
  - User accounts
  - API key authentication

- [ ] 5.1.2: Design file upload system
  - Replace Electron dialogs with web uploads
  - Multi-file upload support
  - Progress tracking

- [ ] 5.1.3: Design workspace isolation
  - Multiple users, isolated workspaces
  - Permissions system

**5.2: Create Standalone Adapter Package**

- [ ] 5.2.1: Create `packages/adapters/standalone/` structure
  ```
  src/
  ├── adapters/
  │   ├── dialog.ts         # Web-based file picker
  │   ├── shell.ts          # Server-side operations
  │   └── window.ts         # WebSocket notifications
  ├── auth/
  │   ├── session.ts
  │   └── middleware.ts
  ├── uploads/
  │   └── file-upload.ts
  └── server.ts             # HTTP server entry point
  ```

- [ ] 5.2.2: Implement web-based adapters
  ```typescript
  // Example: Web dialog adapter
  export class WebDialogAdapter implements DialogAdapter {
    async showOpenDialog(options) {
      // Return upload endpoint URL
      // Frontend posts file to this endpoint
      // Return selected file paths
    }
  }
  ```

**5.3: Frontend Modifications for Standalone Mode**

- [ ] 5.3.1: Detect running mode (Electron vs web)
  ```typescript
  const isElectron = window.navigator.userAgent.includes('Electron')
  ```

- [ ] 5.3.2: Implement file upload UI for web mode
  - Replace dialog triggers with upload buttons
  - Show upload progress

- [ ] 5.3.3: Add authentication UI
  - Login form
  - Session management

**5.4: Deployment**

- [ ] 5.4.1: Create Dockerfile
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  COPY packages packages/
  RUN npm install
  RUN npm run build:all
  EXPOSE 5150 4002
  CMD ["node", "packages/adapters/standalone/dist/server.js"]
  ```

- [ ] 5.4.2: Create docker-compose.yml for development

- [ ] 5.4.3: Document deployment to cloud platforms
  - AWS
  - DigitalOcean
  - Heroku
  - Fly.io

**5.5: Testing**

- [ ] 5.5.1: Test in standalone mode
  - Run without Electron
  - Access via web browser
  - Test all features work

- [ ] 5.5.2: Test multi-user scenarios
  - Multiple sessions
  - Workspace isolation
  - Concurrent edits

**Completion Criteria**:
- ✅ Standalone server adapter works
- ✅ Can run without Electron
- ✅ Web-based file management works
- ✅ Authentication works
- ✅ Deployment documentation complete
- ✅ **Full platform independence achieved!**

---

## 🎯 Answers to Your Key Questions

### Q1: How do imports work when compiling TS to dist/?

**A: With npm workspaces, imports stay the same in dev and production!**

**The Solution**:
```json
// Root package.json
{
  "workspaces": ["packages/*", "packages/adapters/*"]
}

// packages/backend/package.json
{
  "name": "@quiqr/backend",
  "dependencies": {
    "@quiqr/types": "workspace:*"  // ← Key: workspace protocol
  }
}
```

**How It Works**:

**Development Mode**:
```typescript
import { userSchema } from '@quiqr/types'
```
→ npm workspaces symlinks `node_modules/@quiqr/types` → `packages/types/src/`
→ TypeScript resolves to source `.ts` files
→ Hot reload works!

**Production Mode** (after `npm run build:all`):
```typescript
import { userSchema } from '@quiqr/types'
```
→ Same import!
→ npm workspaces symlinks `node_modules/@quiqr/types` → `packages/types/dist/`
→ Node.js resolves to compiled `.js` files
→ No path changes needed!

**TypeScript Config**:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // ← Handles workspaces
    "paths": {  // ← Optional, for IDE autocomplete
      "@quiqr/*": ["./packages/*/src"]
    }
  }
}
```

**Key Points**:
- ✅ **Same imports everywhere**: `@quiqr/backend`, never `../../../`
- ✅ **No conditional paths**: Works in dev, prod, tests, build
- ✅ **TypeScript happy**: Full type checking across packages
- ✅ **IDE happy**: Autocomplete and go-to-definition work
- ✅ **No runtime overhead**: Native Node.js module resolution

### Q2: Backend uses stuff from frontend/root directories?

**A: Extract to `@quiqr/types`, both import from there.**

**Current Problem**:
```javascript
// ❌ Backend imports from frontend
const { userSchema } = require('../../frontend/types')

// ❌ Frontend imports from root
const { appConfig } = require('../package.json')
```

**Solution - Shared Types Package**:
```
packages/types/
├── src/
│   ├── schemas/         # Zod schemas
│   │   ├── user.ts
│   │   ├── workspace.ts
│   │   └── api.ts
│   └── index.ts
```

**Usage**:
```typescript
// In backend
import { userSchema } from '@quiqr/types'

// In frontend
import { userSchema } from '@quiqr/types'

// Same source of truth! ✅
```

**Benefits**:
- 🎯 **Single source of truth**: Types defined once
- 🔒 **Type safety**: Frontend ↔ Backend contract enforced
- 🚀 **Validation**: Zod schemas work at runtime
- 📦 **Reusability**: Other packages can use types
- 🧹 **Clean dependencies**: No cross-directory imports

### Q3: Should we create separate packages?

**A: YES! Strongly recommended. Here's why:**

**❌ Monolith Approach (What You Have Now)**:
```
/backend/         ← Tightly coupled to Electron
/frontend/        ← Can't reuse backend types easily
/electron/        ← Mixed with backend logic
```

Problems:
- Can't run backend without Electron
- Hard to test backend in isolation
- Types scattered across codebase
- Messy imports (`../../../electron/ui-managers/...`)
- Can't deploy to server

**✅ Monorepo Approach (Recommended)**:
```
packages/
├── types/              # @quiqr/types
├── backend/            # @quiqr/backend
├── frontend/           # @quiqr/frontend
└── adapters/
    ├── electron/       # @quiqr/adapter-electron
    └── standalone/     # @quiqr/adapter-standalone
```

Benefits:

**1. Clean Separation of Concerns**
```typescript
// Backend doesn't know about Electron
import { startBackend } from '@quiqr/backend'

// Electron adapter provides platform features
import { ElectronAdapters } from '@quiqr/adapter-electron'

startBackend(new ElectronAdapters())
```

**2. Platform Independence**
```typescript
// Same backend, different adapter!
import { startBackend } from '@quiqr/backend'
import { WebAdapters } from '@quiqr/adapter-standalone'

startBackend(new WebAdapters())  // ← Runs in Node.js server
```

**3. Clean Imports**
```typescript
// ❌ Before
const menuManager = require('../../../electron/ui-managers/menu-manager')

// ✅ After
import { MenuManager } from '@quiqr/adapter-electron'
```

**4. Type Safety Across Boundaries**
```typescript
// Frontend knows backend's API types
import { WorkspaceResponse } from '@quiqr/types'

async function getWorkspace(): Promise<WorkspaceResponse> {
  return api.getWorkspace()  // ← Type-checked!
}
```

**5. Independent Testing**
```typescript
// Test backend without Electron
import { startBackend } from '@quiqr/backend'
import { MockAdapters } from './test-helpers'

const backend = startBackend(new MockAdapters())
// Test API endpoints without launching Electron!
```

**6. Future-Proof Architecture**

Adding new platforms is trivial:
```
packages/adapters/
├── electron/      # Desktop (Electron)
├── standalone/    # Server (Node.js)
├── mobile/        # Mobile (React Native) ← Easy to add!
└── cloud/         # Serverless (AWS Lambda) ← Easy to add!
```

**7. Better Developer Experience**
- IDE autocomplete works across packages
- Go-to-definition jumps to source
- Refactoring tools understand boundaries
- Clear ownership (who maintains what)
- Easier onboarding for new developers

**Comparison Table**:

| Aspect | Monolith | Monorepo |
|--------|----------|----------|
| **Electron Coupling** | Tightly coupled | Decoupled via adapters |
| **Server Deployment** | ❌ Impossible | ✅ Easy |
| **Import Paths** | `../../../` mess | Clean `@quiqr/*` |
| **Type Safety** | Scattered types | Shared `@quiqr/types` |
| **Testing** | Hard (needs Electron) | Easy (mock adapters) |
| **Code Reuse** | Difficult | Natural |
| **Future Platforms** | Major refactor | Add adapter package |

**Verdict**: **Use separate packages!**

The upfront work pays off massively:
- Phase 1-4: Get Electron working again (~5 weeks)
- Phase 5: Server deployment (~1 week) ← Would take months with monolith!
- Future: Mobile app, cloud functions, etc. ← Just add adapters!

---

## 🔥 Critical Success Factors

### 1. Incremental Migration (Phase 2)
- ✅ Don't convert all files at once
- ✅ Start with utils (fewest dependencies)
- ✅ Work up to services
- ✅ API layer last
- ✅ Keep `.js` and `.ts` side-by-side during migration
- ✅ Test after each service migration

### 2. Adapter Pattern (Phase 2-3)
- ✅ Define interfaces first
- ✅ Use dependency injection everywhere
- ✅ No `require('electron')` in backend
- ✅ No global state (`global.pogoconf`)

### 3. Type Safety (Phase 1)
- ✅ Extract types to `@quiqr/types` first
- ✅ Use Zod for runtime validation
- ✅ TypeScript for compile-time checking
- ✅ Single source of truth

### 4. Testing (All Phases)
- ✅ Test after each major change
- ✅ Keep dev mode working
- ✅ Verify production build
- ✅ Test critical user workflows

### 5. Documentation (Phase 4)
- ✅ Update CLAUDE.md
- ✅ Update package READMEs
- ✅ Document new architecture
- ✅ Update development workflow

---

## 🚫 Risk Mitigation

### Before Starting Each Phase:
1. ✅ **Backup**: Commit current state to git
2. ✅ **Branch**: Create feature branch (`git checkout -b phase-X`)
3. ✅ **Baseline**: Verify current functionality works

### During Phase:
1. ✅ **Incremental**: Small, testable changes
2. ✅ **Commit Often**: After each working subtask
3. ✅ **Test Early**: Don't wait until end of phase
4. ✅ **Use TODO.md**: Track progress, check off tasks

### If Blocked:
1. ✅ **Don't Skip Phase 1**: Types are foundation
2. ✅ **Use `@ts-expect-error`**: Temporarily for complex types
3. ✅ **Ask User**: For testing, running commands
4. ✅ **Rollback Option**: Keep git history clean

### Known Pitfalls:
1. ❌ **Don't convert everything at once** → Do incrementally
2. ❌ **Don't skip adapter interfaces** → Backend will stay coupled
3. ❌ **Don't forget global state** → Replace with DI
4. ❌ **Don't ignore build output** → Check `dist/` folders
5. ❌ **Don't skip production testing** → Dev mode != production

---

## 📦 Final Package Structure (After All Phases)

```
quiqr-desktop/
├── packages/
│   ├── types/                    # @quiqr/types
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── api.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── fields.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── dist/                 # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/                  # @quiqr/backend
│   │   ├── src/
│   │   │   ├── adapters/         # Adapter interfaces
│   │   │   ├── api/              # Express server & handlers
│   │   │   ├── services/         # Business logic
│   │   │   ├── utils/            # Utilities
│   │   │   ├── config/           # Configuration
│   │   │   ├── sync/             # Git sync
│   │   │   ├── hugo/             # Hugo integration
│   │   │   └── index.ts
│   │   ├── dist/                 # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/                 # @quiqr/frontend
│   │   ├── src/                  # React app
│   │   ├── build/                # Vite output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── adapters/
│       ├── electron/             # @quiqr/adapter-electron
│       │   ├── src/
│       │   │   ├── adapters/     # Electron implementations
│       │   │   ├── ui-managers/  # Window management
│       │   │   ├── main.ts       # Electron entry point
│       │   │   └── index.ts
│       │   ├── dist/
│       │   ├── package.json
│       │   └── tsconfig.json
│       │
│       └── standalone/           # @quiqr/adapter-standalone (Phase 5)
│           ├── src/
│           │   ├── adapters/     # Web implementations
│           │   ├── auth/         # Authentication
│           │   ├── server.ts     # HTTP server
│           │   └── index.ts
│           ├── dist/
│           ├── package.json
│           └── tsconfig.json
│
├── resources/                    # Platform binaries (Hugo, Git)
├── public/                       # Icons, assets
├── scripts/                      # Build scripts
├── package.json                  # Root (workspaces config)
├── tsconfig.base.json            # Shared TypeScript config
├── TODO.md                       # This file
├── CLAUDE.md                     # Updated in Phase 4
└── README.md                     # Updated in Phase 4
```

**Dependencies Graph**:
```
frontend ─┐
          ├──> types
backend ──┘

adapter-electron ──> backend ──> types
adapter-standalone ─> backend ──> types
```

---

## 🎉 Success Metrics

After **Phase 4** completion, you should have:

- ✅ All backend code in TypeScript + ESM
- ✅ Zero `require('electron')` in backend
- ✅ Clean imports: `@quiqr/*` instead of `../../../`
- ✅ Full type safety: Frontend ↔ Backend contract enforced
- ✅ Platform independence: Backend testable without Electron
- ✅ Development works: `npm run dev` launches everything
- ✅ Production works: `npm run build` creates working installer
- ✅ Foundation ready: Easy to add standalone server (Phase 5)

---

## 🏁 Getting Started

**Ready to begin?**

1. ✅ **Read this entire TODO.md** (you just did!)
2. ✅ **Backup current state**: `git commit -am "Backup before modernization"`
3. ✅ **Create branch**: `git checkout -b backend-modernization`
4. ✅ **Start Phase 1**: Begin with task 1.1
5. ✅ **Follow the plan**: Check off tasks as you complete them
6. ✅ **Notify user**: Before marking any task as done

**Let's modernize this backend! 🚀**

---

## 📝 Progress Tracking

- [x] **Phase 1**: Extract Shared Types ✅ COMPLETE (Completed: 2025-11-24)
- [ ] **Phase 2**: Modernize Backend (Est. 2 weeks) ← NEXT
- [ ] **Phase 3**: Create Electron Adapter (Est. 1 week)
- [ ] **Phase 4**: Testing & Validation (Est. 1 week)
- [ ] **Phase 5**: Standalone Adapter (Optional, Est. 1-2 weeks)

**Current Phase**: Phase 1 Complete - Ready for Phase 2
**Last Updated**: 2025-11-24
**Status**: Phase 1 ✅ | Phase 2 Ready to Start

---

## 💡 Tips for Claude

- ✅ Always reference this file when working on migration
- ✅ Update checkboxes as tasks complete (after user confirms!)
- ✅ Add notes/learnings under relevant tasks
- ✅ If stuck, re-read the architecture section
- ✅ Remember: incremental > big bang
- ✅ Test early, test often
- ✅ Ask user to run npm commands
- ✅ Wait for user confirmation before marking done

---

*"The journey of a thousand lines of TypeScript begins with a single `import`."*
