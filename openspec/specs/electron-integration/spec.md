# Electron Integration Specification

## Purpose

Electron integration is isolated in a separate adapter package, allowing the backend to remain platform-agnostic while providing full Electron functionality.

## Requirements

### Requirement: Electron Adapter Package

Electron-specific code SHALL be isolated in the `@quiqr/adapter-electron` package, separate from core backend logic.

#### Scenario: Electron adapter implements interfaces
- **WHEN** Electron application starts
- **THEN** `@quiqr/adapter-electron` creates adapter implementations
- **AND** implements all interfaces from `@quiqr/backend/adapters/types`
- **AND** uses Electron APIs internally

#### Scenario: Electron main process entry point
- **WHEN** Electron application launches
- **THEN** `packages/adapters/electron/dist/main.js` is entry point
- **AND** creates PlatformAdapters with Electron implementations
- **AND** starts backend server with injected adapters
- **AND** manages Electron windows and menus

#### Scenario: Backend runs inside Electron
- **WHEN** Electron adapter starts backend
- **THEN** backend server runs on localhost:5150
- **AND** frontend connects to backend via HTTP
- **AND** adapters provide Electron functionality to backend
- **AND** no Electron APIs are used directly in backend

### Requirement: UI Manager Migration

All Electron window management code SHALL be migrated from root `electron/` to `@quiqr/adapter-electron` package.

#### Scenario: Main window manager in adapter
- **WHEN** Electron app needs main window
- **THEN** uses MainWindowManager from adapter package
- **AND** manager is implemented in TypeScript
- **AND** no window management code in root electron/

#### Scenario: Log window manager in adapter
- **WHEN** adapter needs to show logs
- **THEN** uses LogWindowManager from adapter package
- **AND** WindowAdapter delegates to log window manager
- **AND** backend code just calls `adapter.window.showLogWindow()`

### Requirement: Adapter Interface Implementations

The Electron adapter SHALL implement all adapter interfaces using Electron APIs.

#### Scenario: ElectronDialogAdapter
- **WHEN** backend calls `adapter.dialog.showOpenDialog()`
- **THEN** ElectronDialogAdapter uses `dialog.showOpenDialog()` from Electron
- **AND** returns file paths to backend
- **AND** backend doesn't know it's using Electron

#### Scenario: ElectronShellAdapter
- **WHEN** backend calls `adapter.shell.showItemInFolder(path)`
- **THEN** ElectronShellAdapter uses `shell.showItemInFolder(path)` from Electron
- **AND** opens native file explorer
- **AND** backend remains platform-agnostic

#### Scenario: ElectronWindowAdapter
- **WHEN** backend calls `adapter.window.reloadMainWindow()`
- **THEN** ElectronWindowAdapter calls `mainWindow.reload()`
- **AND** Electron window reloads
- **AND** backend doesn't directly access BrowserWindow
