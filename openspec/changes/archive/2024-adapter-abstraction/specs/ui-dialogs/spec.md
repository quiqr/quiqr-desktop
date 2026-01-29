## ADDED Requirements

### Requirement: HTML5 File Input API

The frontend SHALL use HTML5 `<input type="file">` elements for all file and folder selection, replacing backend dialog API calls.

#### Scenario: Select folder for site import
- **WHEN** user clicks import site button
- **THEN** an `<input type="file" webkitdirectory>` triggers native OS folder picker
- **AND** selected files are uploaded to backend via existing API
- **AND** no backend dialog API call is needed

#### Scenario: Select file for upload
- **WHEN** user needs to select a file
- **THEN** an `<input type="file">` triggers native OS file picker
- **AND** works identically in Electron and web browsers

#### Scenario: Multiple file selection
- **WHEN** user needs to select multiple files
- **THEN** an `<input type="file" multiple>` allows multi-select
- **AND** native OS dialog provides standard multi-select UX

### Requirement: React/MUI Menu Components

The frontend SHALL use React and Material-UI components for all in-app menus and dialogs, ensuring consistency across platforms.

#### Scenario: Display menu in web
- **WHEN** application runs in web browser
- **THEN** menus are rendered as React MUI components in AppBar
- **AND** provide equivalent functionality to native menus

#### Scenario: Display menu in Electron
- **WHEN** application runs in Electron
- **THEN** native OS menu is created via MenuAdapter
- **AND** React menus are not rendered (native menu takes precedence)

### Requirement: Single BrowserWindow Architecture

The Electron application SHALL use a single BrowserWindow for the main application, eliminating separate windows for dialogs and other UI.

#### Scenario: Main window only
- **WHEN** Electron application initializes
- **THEN** only one BrowserWindow is created for the main app
- **AND** all dialogs are HTML elements within that window
- **AND** no separate BrowserWindows for logs, screenshots, or dialogs

## REMOVED Requirements

### Requirement: Backend Dialog API Endpoints

**Reason**: File selection is handled client-side using HTML5 APIs, eliminating the need for backend dialog endpoints.

**Migration**: Remove these API methods:
- `api.showOpenFolderDialog()`
- `api.showSaveDialog()`
- `api.showOpenDialog()`

Replace with HTML5 file inputs in frontend components.

### Requirement: Multiple BrowserWindow Management

**Reason**: All UI is React-based within the single main window, so separate BrowserWindows for dialogs, logs, and screenshots are obsolete.

**Migration**: Convert any separate window functionality to React components rendered in the main application window.

## MODIFIED Requirements

None - this is primarily removing complexity rather than modifying existing requirements.
