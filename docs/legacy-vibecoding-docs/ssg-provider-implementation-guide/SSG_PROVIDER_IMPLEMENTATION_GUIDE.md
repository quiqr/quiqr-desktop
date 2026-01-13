# SSG Provider Implementation Guide

This guide walks you through implementing a new Static Site Generator (SSG) provider for Quiqr Desktop. It's based on the successful implementation of the Eleventy provider.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Testing Your Provider](#testing-your-provider)
5. [Example Site Template](#example-site-template)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Quiqr uses a pluggable provider system that abstracts SSG-specific operations:

```
┌─────────────────────────────────────────────────────────────┐
│                     ProviderFactory                         │
│  (Central registry for all SSG providers)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─ HugoProvider
                            ├─ EleventyProvider
                            └─ YourNewProvider
                                    │
                    ┌───────────────┼──────────────┐
                    │               │              │
              BinaryManager    DevServer      Builder
```

### Key Interfaces

**SSGProvider** - Main provider interface
- `getMetadata()` - Provider info (name, type, supported formats)
- `getBinaryManager()` - Binary/package installation
- `createDevServer()` - Development server
- `createBuilder()` - Static site builder
- `createConfigQuerier()` - Config file parsing (optional)
- `detectSite()` - Auto-detect SSG in directory
- `createSite()` - Scaffold new sites

**SSGBinaryManager** - Binary/package management
- `isVersionInstalled()` - Check if version exists
- `download()` - Install binary/package (async generator for progress)
- `cancel()` - Cancel download
- `ensureAvailable()` - Download if not installed

**SSGDevServer** - Development server
- `serve()` - Start dev server
- `stopIfRunning()` - Stop server
- `getCurrentProcess()` - Get process handle

**SSGBuilder** - Static site builder
- `build()` - Build static site

---

## Prerequisites

Before implementing a new provider, understand:

1. **Your SSG's distribution method:**
   - Standalone binary (like Hugo) → Download from GitHub releases
   - npm package (like Eleventy) → Install via npm
   - Other (gem, pip, etc.) → Custom installation logic

2. **Your SSG's commands:**
   - Dev server command and arguments
   - Build command and arguments
   - Config file format and location

3. **File structure conventions:**
   - Default input/output directories
   - Config file names and locations
   - Marker files/directories for detection

---

## Step-by-Step Implementation

### Phase 1: Create Provider Structure

**1. Create provider directory:**

```bash
packages/backend/src/ssg-providers/your-ssg/
├── index.ts                    # Exports
├── your-ssg-provider.ts        # Main provider class
├── your-ssg-downloader.ts      # Binary/package manager
├── your-ssg-server.ts          # Dev server
├── your-ssg-builder.ts         # Builder
└── your-ssg-utils.ts           # Utilities (site scaffolding)
```

### Phase 2: Implement Binary Manager

**For standalone binaries (Hugo pattern):**

```typescript
// your-ssg-downloader.ts
import { SSGBinaryManager } from '../types.js';

export class YourSSGDownloader implements SSGBinaryManager {
  isVersionInstalled(version: string): boolean {
    const binPath = this.pathHelper.getSSGBinForVer('yourssg', version);
    return fs.existsSync(binPath);
  }

  async *download(version: string, skipExistCheck?: boolean): AsyncGenerator<DownloadProgress> {
    // 1. Build download URL from GitHub releases or other source
    const url = this.buildDownloadUrl(version);

    // 2. Download with progress updates
    yield { percent: 10, message: 'Downloading...', complete: false };

    // 3. Extract/install
    yield { percent: 50, message: 'Extracting...', complete: false };

    // 4. Verify installation
    yield { percent: 90, message: 'Verifying...', complete: false };

    // 5. Complete
    yield { percent: 100, message: 'Complete!', complete: true };
  }

  async cancel(): Promise<void> {
    this.cancelRequested = true;
  }

  async ensureAvailable(version: string): Promise<void> {
    if (!this.isVersionInstalled(version)) {
      for await (const progress of this.download(version, true)) {
        if (progress.complete) break;
        if (progress.error) throw new Error(progress.error);
      }
    }
  }
}
```

**For npm packages (Eleventy pattern):**

```typescript
export class YourSSGDownloader implements SSGBinaryManager {
  isVersionInstalled(version: string): boolean {
    const installDir = this.pathHelper.getSSGBinDirForVer('yourssg', version);
    const binPath = path.join(installDir, 'node_modules', '.bin', 'yourssg');

    if (this.environmentInfo.platform === 'windows') {
      return fs.existsSync(binPath + '.cmd') || fs.existsSync(binPath);
    }
    return fs.existsSync(binPath);
  }

  async *download(version: string): AsyncGenerator<DownloadProgress> {
    const installDir = this.pathHelper.getSSGBinDirForVer('yourssg', version);

    // Create package.json
    await fs.ensureDir(installDir);
    await fs.writeFile(
      path.join(installDir, 'package.json'),
      JSON.stringify({ name: 'quiqr-yourssg', version: '1.0.0', private: true }, null, 2)
    );

    // Install via npm
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    await execFileAsync(
      npmCommand,
      ['install', `yourssg-package@${version}`, '--no-save', '--loglevel=error'],
      { cwd: installDir, timeout: 300000 }
    );

    yield { percent: 100, message: 'Installation complete!', complete: true };
  }
}
```

### Phase 3: Implement Dev Server

```typescript
// your-ssg-server.ts
import { SSGDevServer } from '../types.js';

export class YourSSGServer implements SSGDevServer {
  private currentServerProcess?: ChildProcess;

  async serve(): Promise<void> {
    this.stopIfRunning();

    const ssgBin = this.pathHelper.getSSGBinForVer('yourssg', this.config.version);

    // Build command arguments
    const args = ['serve', '--port', '13131']; // Use port 13131 for consistency

    if (this.config.config) {
      args.push('--config', this.config.config);
    }

    // Spawn server process
    this.currentServerProcess = spawn(ssgBin, args, {
      cwd: this.config.workspacePath,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Handle stdout/stderr (see eleventy-server.ts for full implementation)
    this.emitLines(this.currentServerProcess.stdout);
    this.currentServerProcess.stdout.on('line', (line: string) => {
      this.outputConsole.appendLine(line);
    });
  }

  stopIfRunning(): void {
    if (this.currentServerProcess) {
      this.currentServerProcess.kill();
      this.currentServerProcess = undefined;
    }
  }

  getCurrentProcess(): ChildProcess | undefined {
    return this.currentServerProcess;
  }
}
```

### Phase 4: Implement Builder

```typescript
// your-ssg-builder.ts
import { SSGBuilder } from '../types.js';

export class YourSSGBuilder implements SSGBuilder {
  async build(): Promise<void> {
    const ssgBin = this.pathHelper.getSSGBinForVer('yourssg', this.config.version);

    const args: string[] = ['build'];

    if (this.config.destination) {
      args.push('--output', this.config.destination);
    }

    if (this.config.config) {
      args.push('--config', this.config.config);
    }

    await execFileAsync(ssgBin, args, {
      cwd: this.config.workspacePath,
      timeout: 120000 // 2 minutes
    });
  }
}
```

### Phase 5: Implement Main Provider

```typescript
// your-ssg-provider.ts
import { SSGProvider, ProviderMetadata } from '../types.js';

export class YourSSGProvider implements SSGProvider {
  private dependencies: SSGProviderDependencies;
  private binaryManager: YourSSGDownloader;
  private utils: YourSSGUtils;

  constructor(dependencies: SSGProviderDependencies) {
    this.dependencies = dependencies;
    this.binaryManager = new YourSSGDownloader({
      pathHelper: dependencies.pathHelper,
      outputConsole: dependencies.outputConsole,
      environmentInfo: dependencies.environmentInfo,
    });
    this.utils = new YourSSGUtils();
  }

  getMetadata(): ProviderMetadata {
    return {
      type: 'yourssg',
      name: 'YourSSG',
      configFormats: ['yaml', 'toml', 'json'], // Supported config formats
      requiresBinary: true,
      supportsDevServer: true,
      supportsBuild: true,
      supportsConfigQuery: false, // true if you can parse config files
      version: '1.0.0',
    };
  }

  getBinaryManager(): SSGBinaryManager {
    return this.binaryManager;
  }

  createDevServer(config: SSGServerConfig): SSGDevServer {
    return new YourSSGServer(
      {
        workspacePath: config.workspacePath,
        version: config.version,
        config: config.configFile,
        port: config.port || 13131, // Always use 13131
      },
      this.dependencies.pathHelper,
      this.dependencies.appConfig,
      this.dependencies.windowAdapter,
      this.dependencies.outputConsole
    );
  }

  createBuilder(config: SSGBuildConfig): SSGBuilder {
    return new YourSSGBuilder(
      {
        workspacePath: config.workspacePath,
        version: config.version,
        destination: config.destination,
        config: config.configFile,
      },
      this.dependencies.pathHelper
    );
  }

  createConfigQuerier(
    workspacePath: string,
    version: string,
    configFile?: string
  ): SSGConfigQuerier | null {
    // Return null if you can't safely parse config files
    // Or implement YourSSGConfig class to query config values
    return null;
  }

  async detectSite(directory: string): Promise<SSGDetectionResult> {
    // Check for config files
    const configFiles = ['yourssg.config.js', 'yourssg.yml', '.yourssgrc'];
    const foundConfigs: string[] = [];

    for (const configFile of configFiles) {
      if (await fs.pathExists(path.join(directory, configFile))) {
        foundConfigs.push(configFile);
      }
    }

    if (foundConfigs.length > 0) {
      return { isDetected: true, confidence: 'high', configFiles: foundConfigs };
    }

    // Check package.json for dependency
    const packageJsonPath = path.join(directory, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.dependencies?.['yourssg-package'] ||
            packageJson.devDependencies?.['yourssg-package']) {
          return { isDetected: true, confidence: 'medium' };
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Check for marker directories
    const markers = ['yourssg-specific-folder', 'templates'];
    let markerCount = 0;
    for (const marker of markers) {
      if (await fs.pathExists(path.join(directory, marker))) {
        markerCount++;
      }
    }

    if (markerCount >= 2) {
      return { isDetected: true, confidence: 'low' };
    }

    return { isDetected: false, confidence: 'low' };
  }

  async createSite(options: SSGSiteCreationOptions): Promise<void> {
    await this.utils.createSiteDir(
      options.directory,
      options.title,
      options.configFormat as 'yaml' | 'json' | 'js'
    );
  }
}
```

### Phase 6: Update PathHelper (if needed)

**Only if your SSG has special path requirements:**

```typescript
// packages/backend/src/utils/path-helper.ts
getSSGBinForVer(ssgType: string, version: string): string {
  // ... existing code ...

  // Add your SSG if it needs special handling
  if (ssgType.toLowerCase() === 'yourssg') {
    // Custom path logic
    return path.join(binDir, 'custom', 'path', 'to', 'binary');
  }

  // Default handling
  // ...
}
```

### Phase 7: Register Provider

```typescript
// packages/backend/src/ssg-providers/provider-registry.ts
async registerBuiltInProviders(): Promise<void> {
  // ... existing providers ...

  try {
    const { YourSSGProvider } = await import('./your-ssg/your-ssg-provider.js');
    this.registerProvider(YourSSGProvider, true);
  } catch (error) {
    this.dependencies.outputConsole.appendLine(
      `Failed to register YourSSG provider: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

### Phase 8: Add Type Schemas (Frontend)

```typescript
// packages/types/src/schemas/api.ts

// Add response schemas if your provider has custom API methods
export const yourSSGVersionCheckResponseSchema = z.object({
  installed: z.boolean(),
  version: z.string(),
  ssgType: z.string()
});

// Add to apiSchemas object
export const apiSchemas = {
  // ... existing schemas ...
  checkYourSSGVersion: yourSSGVersionCheckResponseSchema,
};
```

### Phase 9: Frontend Updates (Usually None Required!)

The frontend is already SSG-agnostic! It uses:
- `workspace.ssgType` to determine which SSG
- `workspace.ssgVersion` for version
- Generic `useSSGDownload()` hook
- Dynamic API calls via `service.api.checkSSGVersion(ssgType, version)`

**Only add frontend code if you have SSG-specific features.**

---

## Testing Your Provider

### 1. Create Example Site

Create a test site at `~/Quiqr/sites/yourssg-test/`:

```yaml
# main/quiqr/model/base.yaml
ssgType: yourssg
ssgVersion: 1.0.0  # Your SSG version
serve:
  - key: default
    config: yourssg.config.js
build:
  - key: default
    config: yourssg.config.js
```

### 2. Test Backend

```bash
# Compile TypeScript
npx tsc --noEmit

# Test provider detection
# (Add temporary test code in provider-registry.ts if needed)
```

### 3. Test Frontend Integration

1. Start dev server: `npm run dev`
2. Open the test site in Quiqr Desktop
3. Verify:
   - ✅ Binary/package downloads correctly
   - ✅ Progress is shown via SSE
   - ✅ Dev server starts on port 13131
   - ✅ Preview button works
   - ✅ Build command works
   - ✅ Content editing works

### 4. Test Edge Cases

- ❌ Cancel download mid-progress
- ❌ Open site with missing binary
- ❌ Open site with already installed binary
- ❌ Switch between different SSG versions
- ❌ Error handling (invalid config, build failures)

---

## Example Site Template

Create a complete example site structure for users:

```
yourssg-template/
├── config.json                 # Quiqr site config
└── main/
    ├── yourssg.config.js      # SSG config
    ├── package.json           # If npm-based
    ├── content/               # Content files
    │   └── index.md
    ├── templates/             # Template files
    │   └── base.html
    └── quiqr/
        ├── model/
        │   ├── base.yaml      # ssgType: yourssg
        │   └── includes/
        │       ├── menu.yml
        │       ├── singles.yml
        │       └── collections.yaml
        ├── home/
        │   └── index.md
        └── etalage/
            └── template.json
```

**Key Files:**

**config.json:**
```json
{
  "key": "yourssg-template",
  "name": "YourSSG Template",
  "source": {
    "type": "folder",
    "path": "main"
  }
}
```

**quiqr/model/base.yaml:**
```yaml
ssgType: yourssg
ssgVersion: 1.0.0
serve:
  - key: default
    config: yourssg.config.js
build:
  - key: default
    config: yourssg.config.js
```

---

## Troubleshooting

### Binary Not Found

**Symptom:** `Binary not found for version X`

**Check:**
1. `isVersionInstalled()` looks at correct path
2. `getSSGBinForVer()` returns correct path for your SSG type
3. Path structure matches what's installed

**Debug:**
```typescript
console.log('Install dir:', this.pathHelper.getSSGBinDirForVer('yourssg', version));
console.log('Binary path:', this.pathHelper.getSSGBinForVer('yourssg', version));
console.log('Exists:', fs.existsSync(binaryPath));
```

### Config Migration Issues

**Symptom:** Old sites don't load

**Solution:** The config migration in `packages/types/src/schemas/config.ts` handles `hugover` → `ssgType + ssgVersion`. Your provider should just work with the migrated config.

### Download Progress Not Showing

**Symptom:** No progress bar during download

**Check:**
1. Async generator yields progress objects
2. SSE endpoint at `/api/ssg/download/:ssgType/:version` is registered
3. Frontend `useSSGDownload()` hook is used

### Server Not Starting

**Symptom:** Server process exits immediately

**Check:**
1. Binary path is correct
2. Arguments are valid for your SSG
3. Working directory is set correctly
4. Environment variables if needed

**Debug:**
```typescript
console.log('Starting server:', {
  binary: ssgBin,
  args: args,
  cwd: this.config.workspacePath
});
```

---

## Key Patterns & Best Practices

### 1. Use Port 13131 Consistently

All SSGs should use port **13131** for dev servers. This keeps the UI consistent and avoids confusion.

```typescript
const args = ['serve', '--port', '13131'];
```

### 2. Handle Windows Paths

npm executables on Windows use `.cmd` wrappers:

```typescript
if (platform.startsWith('win')) {
  return npmBinPath + '.cmd';
}
```

### 3. Use OutputConsole, Not console.log

```typescript
// ✅ Correct
this.outputConsole.appendLine('Installing...');

// ❌ Wrong
console.log('Installing...');
```

### 4. Stream Progress with Async Generators

```typescript
async *download(version: string): AsyncGenerator<DownloadProgress> {
  yield { percent: 10, message: 'Step 1...', complete: false };
  // ... do work ...
  yield { percent: 50, message: 'Step 2...', complete: false };
  // ... do work ...
  yield { percent: 100, message: 'Done!', complete: true };
}
```

### 5. Implement Graceful Cancellation

```typescript
private cancelRequested: boolean = false;

async cancel(): Promise<void> {
  this.cancelRequested = true;
  // Cancel ongoing downloads/processes
}
```

### 6. Validate Installation

After download/install, verify the binary/package exists:

```typescript
const installed = fs.existsSync(binaryPath);
if (!installed) {
  throw new Error('Binary not found after installation');
}
```

### 7. Support Multiple Config Formats

If your SSG supports multiple config formats, detect them all:

```typescript
const configFiles = [
  'yourssg.config.js',
  'yourssg.config.json',
  '.yourssgrc',
  'yourssg.yml',
];
```

---

## Checklist

Before submitting your provider:

- [ ] Provider class implements all `SSGProvider` methods
- [ ] Binary manager implements all `SSGBinaryManager` methods
- [ ] Dev server implements all `SSGDevServer` methods
- [ ] Builder implements all `SSGBuilder` methods
- [ ] Provider registered in `provider-registry.ts`
- [ ] Site detection logic works correctly
- [ ] TypeScript compiles without errors
- [ ] Example site template created
- [ ] Documentation added to README
- [ ] Tested on all target platforms (Linux, macOS, Windows)
- [ ] Port 13131 used for dev server
- [ ] Download progress works via SSE
- [ ] Build command works
- [ ] Config migration works for old sites (if applicable)

---

## Resources

- **Provider Types:** `packages/backend/src/ssg-providers/types.ts`
- **Hugo Provider:** `packages/backend/src/ssg-providers/hugo/` (binary example)
- **Eleventy Provider:** `packages/backend/src/ssg-providers/eleventy/` (npm example)
- **Path Helper:** `packages/backend/src/utils/path-helper.ts`
- **Type Schemas:** `packages/types/src/schemas/`

---

## Support

If you run into issues:

1. Check existing providers (Hugo, Eleventy) for reference
2. Review the type definitions in `types.ts`
3. Test with debug logging enabled
4. Open an issue on GitHub with:
   - SSG name and distribution method
   - Error messages or unexpected behavior
   - Your provider implementation code

Happy coding! 🎉
