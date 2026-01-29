## ADDED Requirements

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

## REMOVED Requirements

### Requirement: DialogAdapter for File Selection

**Reason**: Native OS dialogs in Electron are actually OS-level dialogs (not Electron windows), and HTML5 `<input type="file">` also triggers native OS dialogs. Using HTML5 inputs provides identical UX across Electron and web with much simpler implementation.

**Migration**: Replace all `api.showOpenFolderDialog()` calls with HTML5 file inputs:
```typescript
// Before
const folders = await api.showOpenFolderDialog();

// After
<input
  type="file"
  webkitdirectory
  onChange={(e) => {
    const folder = e.target.files[0];
    // Upload to backend via existing API
  }}
/>
```

### Requirement: ScreenshotWindowManager

**Reason**: Screenshot functionality can be implemented as a backend service rather than requiring a separate window manager adapter.

**Migration**: Move screenshot logic to backend service, potentially using Puppeteer/Playwright for web environments.

## MODIFIED Requirements

None - this is a new architecture layer.
