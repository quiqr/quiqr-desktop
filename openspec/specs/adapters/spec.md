# Adapters Specification

## Purpose

The adapter system provides platform abstraction for Quiqr Desktop, enabling deployment across multiple environments (Electron, web browsers, Docker, serverless) without changing core application logic.
## Requirements
### Requirement: FilesystemAdapter Interface

The backend SHALL provide a FilesystemAdapter interface that abstracts file system operations, enabling different storage backends (local filesystem, S3, in-memory, etc.).

#### Scenario: Read file through adapter
- **WHEN** a service needs to read a file
- **THEN** it uses `container.adapters.filesystem.readFile(path)`
- **AND** the implementation (local, S3, etc.) is determined at build time

#### Scenario: Write file through adapter
- **WHEN** a service needs to write a file
- **THEN** it uses `container.adapters.filesystem.writeFile(path, content)`
- **AND** the file is stored using the configured storage backend

#### Scenario: Ensure directory exists
- **WHEN** a service needs to ensure a directory exists
- **THEN** it uses `container.adapters.filesystem.ensureDir(path)`
- **AND** the adapter creates the directory hierarchy if needed

### Requirement: LocalFilesystemAdapter Implementation

The system SHALL provide a LocalFilesystemAdapter that wraps fs-extra for local file operations.

#### Scenario: Local file operations
- **WHEN** using LocalFilesystemAdapter
- **THEN** all operations delegate to fs-extra
- **AND** paths are resolved relative to the configured root directory

### Requirement: Platform Adapter Interface

The backend SHALL define a PlatformAdapters interface containing all required adapter types for dependency injection.

#### Scenario: Adapter registration
- **WHEN** creating adapters at build time
- **THEN** the container receives a PlatformAdapters object
- **AND** all adapters are available via `container.adapters.*`

#### Scenario: Filesystem adapter included
- **WHEN** PlatformAdapters is created
- **THEN** it MUST include a `filesystem: FilesystemAdapter` property
- **AND** services can access it via `container.adapters.filesystem`

### Requirement: ShellAdapter for Platform Operations

The system SHALL provide a ShellAdapter for platform-specific shell operations like opening files in native explorers.

#### Scenario: Show item in folder (Electron)
- **WHEN** user requests to show a file in folder on Electron
- **THEN** ShellAdapter uses `shell.showItemInFolder(path)`
- **AND** the native file explorer opens with the item selected

#### Scenario: Show item in folder (Web)
- **WHEN** user requests to show a file in folder on web
- **THEN** ShellAdapter provides a download link or displays the path
- **AND** no native file explorer is available

#### Scenario: Open external link
- **WHEN** user clicks an external link
- **THEN** ShellAdapter opens it using platform-appropriate method
- **AND** Electron uses `shell.openExternal()`, web uses `window.open()`

### Requirement: AppInfoAdapter for Platform Information

The system SHALL provide an AppInfoAdapter that supplies platform-specific information like paths, version, and environment.

#### Scenario: Get user data path
- **WHEN** a service needs the user data directory
- **THEN** it uses `container.adapters.appInfo.getUserDataPath()`
- **AND** returns platform-appropriate path (Electron: app.getPath('userData'), Web: server-side config)

#### Scenario: Get application version
- **WHEN** displaying application version
- **THEN** it uses `container.adapters.appInfo.getVersion()`
- **AND** returns the current application version

### Requirement: OutputConsole for Build Output Streaming

The system SHALL provide an OutputConsole adapter for streaming Hugo build output to the frontend.

#### Scenario: Stream Hugo output (Electron)
- **WHEN** Hugo build runs in Electron
- **THEN** OutputConsole directly appends output to the display
- **AND** no network layer is needed

#### Scenario: Stream Hugo output (Web)
- **WHEN** Hugo build runs on web server
- **THEN** OutputConsole sends output via WebSocket
- **AND** frontend displays it in real-time

### Requirement: Hybrid MenuAdapter

The system SHALL provide a MenuAdapter that creates native OS menus in Electron and no-op in web (where React handles menus).

#### Scenario: Create menu (Electron)
- **WHEN** application initializes in Electron
- **THEN** MenuAdapter creates native OS menu using `Menu.buildFromTemplate()`
- **AND** menu includes File, Edit, View, Window, Help items

#### Scenario: Create menu (Web)
- **WHEN** application initializes in web
- **THEN** MenuAdapter.createMainMenu() is a no-op
- **AND** React renders MUI menus in the AppBar

### Requirement: Minimal WindowAdapter

The system SHALL provide a WindowAdapter with minimal functionality for reload and redirect operations only.

#### Scenario: Reload window
- **WHEN** application needs to reload
- **THEN** WindowAdapter triggers a reload
- **AND** Electron uses BrowserWindow.reload(), web uses location.reload()

#### Scenario: Redirect to URL
- **WHEN** application needs to navigate to a different route
- **THEN** WindowAdapter performs the redirect
- **AND** uses platform-appropriate navigation method

### Requirement: Adapter Testing Infrastructure

Both adapter packages SHALL have comprehensive test coverage using Vitest to ensure platform abstractions work correctly.

#### Scenario: Electron adapter tests configured
- **WHEN** @quiqr/adapter-electron package is built
- **THEN** it includes vitest.config.ts with Node environment
- **AND** includes test scripts in package.json
- **AND** provides setup.ts with Electron API mocks
- **AND** is registered in root vitest.config.ts projects array

#### Scenario: Standalone adapter tests configured
- **WHEN** @quiqr/adapter-standalone package is built
- **THEN** it includes vitest.config.ts with Node environment
- **AND** includes test scripts in package.json
- **AND** provides setup.ts for test infrastructure
- **AND** is registered in root vitest.config.ts projects array

#### Scenario: Adapter implementations tested
- **WHEN** running adapter test suites
- **THEN** all adapter implementations have unit tests
- **AND** tests use mocked external dependencies (Electron APIs, Node APIs)
- **AND** coverage targets 50%+ for adapter code (excluding main.ts orchestration)
- **AND** tests verify correct API wrapping and state management

#### Scenario: Menu adapter state management tested
- **WHEN** testing menu adapters
- **THEN** tests verify menu state updates correctly
- **AND** tests verify menu item enabling/disabling
- **AND** tests verify menu structure generation
- **AND** tests use mocked container configuration

#### Scenario: Factory functions tested
- **WHEN** testing adapter creation functions
- **THEN** tests verify all required adapters are created
- **AND** tests verify adapters are properly wired together
- **AND** tests verify factory handles dependencies correctly

#### Scenario: Frontend build path resolution tested
- **WHEN** testing the standalone adapter
- **THEN** tests SHALL verify frontend build path resolution from default location
- **AND** tests SHALL verify `FRONTEND_PATH` environment variable override
- **AND** tests SHALL verify graceful fallback to API-only mode when build is missing

### Requirement: Standalone Adapter Frontend Serving

The standalone adapter SHALL resolve the frontend build path and pass it to the shared `createServer()` factory, enabling unified frontend+API serving.

#### Scenario: Standalone serves frontend in production
- **WHEN** the standalone adapter starts
- **AND** the frontend build is present
- **THEN** it SHALL pass the `frontendPath` option to `createServer()`
- **AND** the Express server SHALL serve both API and frontend on the same port

#### Scenario: Electron adapter uses shared frontend serving
- **WHEN** the Electron adapter starts in production mode
- **THEN** it SHALL resolve the frontend build directory using `findFrontendBuildDir()`
- **AND** pass the resolved path as `frontendPath` to `createServer()`
- **AND** SHALL NOT add `express.static()` or SPA catch-all middleware directly

### Requirement: Standalone Auth Configuration

The standalone adapter SHALL configure authentication based on instance settings and pass the auth config to `createServer()`.

#### Scenario: Auth enabled by default in standalone
- **WHEN** the standalone server starts
- **AND** instance settings include `auth.enabled: true` (or auth config is present)
- **THEN** the adapter SHALL instantiate the configured auth provider
- **AND** pass `auth` options to `createServer()`

#### Scenario: Auth disabled in standalone
- **WHEN** the standalone server starts
- **AND** instance settings have `auth.enabled: false` or no auth config
- **THEN** the adapter SHALL NOT configure auth
- **AND** the server SHALL run without authentication (current behavior)

#### Scenario: First-run default user creation
- **WHEN** the standalone server starts with auth enabled
- **AND** the users file does not exist
- **THEN** the adapter SHALL create the default admin user
- **AND** print the default credentials to the console

### Requirement: Electron Auth Disabled

The Electron adapter SHALL explicitly disable authentication.

#### Scenario: Electron never uses auth
- **WHEN** the Electron adapter starts
- **THEN** it SHALL NOT pass `auth` options to `createServer()`
- **AND** no auth middleware SHALL be active
- **AND** no auth-related config SHALL be read or written

