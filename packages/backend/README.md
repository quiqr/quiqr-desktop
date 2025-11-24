# @quiqr/backend

Platform-agnostic backend package for Quiqr Desktop CMS.

## Overview

This package provides the core business logic for Quiqr Desktop, decoupled from any specific platform (Electron, CLI, Web). It uses:

- **TypeScript + ESM** - Modern module system and type safety
- **Dependency Injection** - No global state, all dependencies injected
- **Adapter Pattern** - Platform-specific functionality abstracted behind interfaces
- **Zod Validation** - Runtime validation using `@quiqr/types` schemas

## Architecture

```
@quiqr/backend
├── adapters/       # Platform adapter interfaces
├── config/         # Configuration and state management
├── services/       # Business logic (TODO: to be migrated)
├── api/            # API handlers (TODO: to be migrated)
└── utils/          # Utility functions
```

## Usage

### Creating a Container

The container holds all application dependencies:

```typescript
import { createContainer, createDevAdapters } from '@quiqr/backend';

// For development/testing with no-op adapters
const container = createContainer({
  userDataPath: '/path/to/user/data',
  rootPath: '/path/to/app/root',
  adapters: createDevAdapters(),
});

// For production with real platform adapters (e.g., Electron)
import { createElectronAdapters } from '@quiqr/adapter-electron';

const container = createContainer({
  userDataPath: app.getPath('userData'),
  rootPath: app.getAppPath(),
  adapters: createElectronAdapters(),
});
```

### Using AppConfig

Replaces `global.pogoconf`:

```typescript
// Old way
global.pogoconf.setLastOpenedSite(siteKey, workspaceKey, sitePath);
const prefs = global.pogoconf.prefs;

// New way
container.config.setLastOpenedSite(siteKey, workspaceKey, sitePath);
const prefs = container.config.prefs;
```

### Using AppState

Replaces `global.currentSiteKey`, `global.currentSitePath`, etc:

```typescript
// Old way
global.currentSiteKey = 'my-site';
global.currentSitePath = '/path/to/site';

// New way
container.state.setCurrentSite('my-site', 'main', '/path/to/site');
```

### Using Adapters

Replace direct Electron calls:

```typescript
// Old way
const { dialog } = require('electron');
const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

// New way
const result = await container.adapters.dialog.showOpenDialog({
  properties: ['openDirectory']
});
```

## Platform Adapters

The backend requires platform-specific adapters for:

- **DialogAdapter** - File/folder dialogs, message boxes
- **ShellAdapter** - Open URLs, show files in folder
- **WindowAdapter** - Window management, IPC
- **MenuAdapter** - Application menu management
- **AppInfoAdapter** - App metadata (version, paths, etc.)

### Development Adapters

For testing without a real platform:

```typescript
import { createDevAdapters } from '@quiqr/backend';
const adapters = createDevAdapters(); // No-op implementations
```

### Electron Adapters

For production use with Electron:

```typescript
import { createElectronAdapters } from '@quiqr/adapter-electron';
const adapters = createElectronAdapters();
```

## Migration Status

✅ **Completed:**
- Package structure
- Adapter interfaces
- Core utilities (format providers, path helper, file utils)
- Configuration management (AppConfig, AppState, Container)

🚧 **In Progress:**
- Services layer migration
- API handlers migration

📋 **TODO:**
- Electron adapter implementation package
- Wire up in Electron main process
- Remove old backend code

## Development

```bash
# Build the package
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev

# Type checking only (no emit)
npx tsc --noEmit
```

## Dependencies

- `@quiqr/types` - Shared Zod schemas and TypeScript types
- `express` - HTTP server
- `zod` - Runtime validation
- `fs-extra` - Enhanced file system operations
- Various format parsers (js-yaml, toml, etc.)
