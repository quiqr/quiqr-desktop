# SSG Provider System

**Status:** archived  
**Created:** 2024 (legacy)  
**Archived:** 2026-01-29  
**Implementation:** Completed in earlier version

## Context

This spec documents the pluggable Static Site Generator (SSG) provider system that abstracts SSG-specific operations (Hugo, Eleventy, etc.) behind a common interface. The implementation was based on the successful integration of the Eleventy provider as the second SSG after Hugo.

## Architecture

### Provider System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     ProviderFactory                         │
│  (Central registry for all SSG providers)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─ HugoProvider
                            ├─ EleventyProvider
                            └─ [Future Providers]
                                    │
                    ┌───────────────┼──────────────┐
                    │               │              │
              BinaryManager    DevServer      Builder
```

### Core Interfaces

**SSGProvider** - Main provider interface:
- `getMetadata()` - Provider info (name, type, supported formats)
- `getBinaryManager()` - Binary/package installation
- `createDevServer()` - Development server
- `createBuilder()` - Static site builder
- `createConfigQuerier()` - Config file parsing (optional)
- `detectSite()` - Auto-detect SSG in directory
- `createSite()` - Scaffold new sites

**SSGBinaryManager** - Binary/package management:
- `isVersionInstalled()` - Check if version exists
- `download()` - Install binary/package (async generator for progress)
- `cancel()` - Cancel download
- `ensureAvailable()` - Download if not installed

**SSGDevServer** - Development server:
- `serve()` - Start dev server
- `stopIfRunning()` - Stop server
- `getCurrentProcess()` - Get process handle

**SSGBuilder** - Static site builder:
- `build()` - Build static site

**SSGConfigQuerier** - Config file parsing (optional):
- Parse and query SSG-specific configuration files

## Provider Implementation Patterns

### Two Distribution Methods Supported

**1. Standalone Binary (Hugo pattern):**
- Download from GitHub releases or similar
- Extract binary to version-specific directory
- Path: `pathHelper.getSSGBinForVer(ssgType, version)`
- Platform-specific binary selection (Linux, macOS, Windows)

**2. npm Package (Eleventy pattern):**
- Install via npm into version-specific directory
- Create minimal `package.json` in install directory
- Execute: `npm install package-name@version --no-save --loglevel=error`
- Windows: Check for `.cmd` wrapper in addition to binary
- Path: `pathHelper.getSSGBinDirForVer(ssgType, version)/node_modules/.bin/package`

### File Structure Convention

```
packages/backend/src/ssg-providers/ssg-name/
├── index.ts                    # Exports
├── ssg-name-provider.ts        # Main provider class
├── ssg-name-downloader.ts      # Binary/package manager
├── ssg-name-server.ts          # Dev server
├── ssg-name-builder.ts         # Builder
└── ssg-name-utils.ts           # Utilities (site scaffolding)
```

### Download Progress Pattern

Uses async generators for streaming progress updates:

```typescript
async *download(version: string): AsyncGenerator<DownloadProgress> {
  yield { percent: 10, message: 'Downloading...', complete: false };
  // ... perform download ...
  yield { percent: 50, message: 'Extracting...', complete: false };
  // ... extract/install ...
  yield { percent: 90, message: 'Verifying...', complete: false };
  // ... verify installation ...
  yield { percent: 100, message: 'Complete!', complete: true };
}
```

Progress consumed via SSE endpoint: `/api/ssg/download/:ssgType/:version`

### Site Detection Pattern

Confidence levels based on detection strength:

**High confidence:**
- Config files present: `ssg.config.js`, `.ssgrc`, etc.

**Medium confidence:**
- `package.json` with SSG package in dependencies/devDependencies

**Low confidence:**
- Multiple marker directories present (2+ SSG-specific folders)

### Provider Metadata

```typescript
interface ProviderMetadata {
  type: string;                    // e.g., 'hugo', 'eleventy'
  name: string;                    // Display name
  configFormats: string[];         // ['yaml', 'toml', 'json']
  requiresBinary: boolean;         // true if needs download
  supportsDevServer: boolean;      // true if has dev mode
  supportsBuild: boolean;          // true if can build static site
  supportsConfigQuery: boolean;    // true if can parse config
  version: string;                 // Provider version
}
```

## Key Design Decisions

### Standard Dev Server Port

**Decision:** All SSG dev servers use port **13131**

**Rationale:**
- Consistent UI experience across SSGs
- Single preview button configuration
- Avoids port conflict confusion

### Windows Compatibility

**npm executables:**
- Windows uses `.cmd` wrappers for npm scripts
- Check both `binary` and `binary.cmd` paths
- Use `npm.cmd` instead of `npm` on Windows

**Binary paths:**
- Platform-specific binary selection in download logic
- Handle different executable extensions (.exe on Windows)

### OutputConsole Pattern

**Decision:** Use `OutputConsole` service, not `console.log`

**Rationale:**
- All provider output visible in UI console
- User can see installation progress and errors
- Centralized logging for debugging

### Dependency Injection

**Pattern:** Providers receive dependencies via constructor:

```typescript
interface SSGProviderDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  environmentInfo: EnvironmentInfo;
  appConfig: AppConfig;
  windowAdapter: WindowAdapter;
}
```

**Rationale:**
- Testability (can inject mocks)
- Decoupling from global state
- Clear dependency graph

### Graceful Cancellation

**Pattern:** Support canceling long-running operations:

```typescript
private cancelRequested: boolean = false;

async cancel(): Promise<void> {
  this.cancelRequested = true;
  // Clean up ongoing operations
}
```

**Checks:**
- During download: Check `cancelRequested` between steps
- Abort HTTP requests if supported
- Clean up partial downloads

## Provider Registration

Located in: `packages/backend/src/ssg-providers/provider-registry.ts`

```typescript
async registerBuiltInProviders(): Promise<void> {
  try {
    const { HugoProvider } = await import('./hugo/hugo-provider.js');
    this.registerProvider(HugoProvider, true);
  } catch (error) {
    this.outputConsole.appendLine(`Failed to register Hugo: ${error.message}`);
  }

  try {
    const { EleventyProvider } = await import('./eleventy/eleventy-provider.js');
    this.registerProvider(EleventyProvider, true);
  } catch (error) {
    this.outputConsole.appendLine(`Failed to register Eleventy: ${error.message}`);
  }
}
```

**Error Handling:**
- Each provider registration is try-caught independently
- Failure to load one provider doesn't break others
- Errors logged to OutputConsole

## Site Configuration

**Base configuration** (`quiqr/model/base.yaml`):

```yaml
ssgType: eleventy         # Provider type
ssgVersion: 2.0.0         # SSG version to install
serve:
  - key: default
    config: eleventy.config.js
build:
  - key: default
    config: eleventy.config.js
    destination: _site
```

**Config Migration:**
- Old format: `hugover: 0.123.0`
- New format: `ssgType: hugo`, `ssgVersion: 0.123.0`
- Migration handled in `packages/types/src/schemas/config.ts`

## Frontend Integration

**SSG-agnostic design:**
- Frontend uses `workspace.ssgType` and `workspace.ssgVersion`
- Generic `useSSGDownload()` hook for all providers
- Dynamic API calls: `service.api.checkSSGVersion(ssgType, version)`
- No provider-specific UI code required

**SSE Download Progress:**
- Frontend subscribes to `/api/ssg/download/:ssgType/:version`
- Backend streams progress via async generator
- Real-time progress bar updates

## File Paths

**Binary storage:**
- Location: User data directory + `/ssg-bin/[ssgType]/[version]/`
- Retrieved via: `pathHelper.getSSGBinForVer(ssgType, version)`
- Version isolation: Each version gets its own directory

**npm package storage:**
- Location: Same as binary, but contains `node_modules/`
- Binary path: `[installDir]/node_modules/.bin/[package]`

## Provider Types Reference

**Location:** `packages/backend/src/ssg-providers/types.ts`

Contains all TypeScript interfaces and types:
- `SSGProvider`
- `SSGBinaryManager`
- `SSGDevServer`
- `SSGBuilder`
- `SSGConfigQuerier`
- `ProviderMetadata`
- `SSGDetectionResult`
- `DownloadProgress`
- Configuration interfaces

## Implementation Checklist

Essential requirements for a complete provider:

- [ ] Provider class implements all `SSGProvider` methods
- [ ] Binary manager implements all `SSGBinaryManager` methods
- [ ] Dev server implements all `SSGDevServer` methods
- [ ] Builder implements all `SSGBuilder` methods
- [ ] Provider registered in `provider-registry.ts`
- [ ] Site detection logic with confidence levels
- [ ] Port 13131 used for dev server
- [ ] Download progress via async generator
- [ ] Windows path handling (`.cmd` for npm)
- [ ] OutputConsole used for logging
- [ ] Graceful cancellation support
- [ ] Installation verification after download
- [ ] Multiple config format detection
- [ ] Example site template provided

## Example Providers

**Hugo Provider:**
- Location: `packages/backend/src/ssg-providers/hugo/`
- Pattern: Standalone binary download
- Platforms: Linux, macOS, Windows
- Source: GitHub releases

**Eleventy Provider:**
- Location: `packages/backend/src/ssg-providers/eleventy/`
- Pattern: npm package installation
- Platforms: All (via Node.js)
- Source: npm registry

## Notes

This spec represents a completed provider system architecture. The pluggable design allows adding new SSG support without modifying core application logic. Both binary-based (Hugo) and npm-based (Eleventy) distribution methods are supported. Archived for historical reference and as implementation guide for future SSG integrations.
