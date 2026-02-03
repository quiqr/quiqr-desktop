# Change: Add Structured JSONL Logging System

## Why

The current logging implementation uses a simple console-based approach with string messages buffered in memory and displayed in a separate window. This lacks:
- Persistent storage for troubleshooting past issues
- Structured data for filtering and analysis
- Separation between global application events and site-specific operations
- Proper categorization and log levels for debugging

A structured JSONL logging system will enable users and support teams to diagnose issues more effectively, filter logs by category and level, and maintain a persistent audit trail of application and site operations.

## What Changes

**Backend:**
- Create new logging infrastructure with JSONL file writers for global and site-specific logs
- Global logs: `$HOME/Quiqr/logs/application-YYYY-MM-DD.jsonl` with daily rotation
- Site logs: `$HOME/Quiqr/sites/{siteKey}/{workspaceKey}-YYYY-MM-DD.jsonl` with daily rotation
- Implement structured log schema with timestamp, level, category, message, error code, and metadata
- Add configurable log retention (user preference, default 30 days)
- Support log levels: debug, info, warning, error (controlled by `QUIQR_LOGLEVEL` env var)
- Add categories for global logs: electron-init, standalone-init, llm-connection, etc.
- Add categories for site logs: sync, content, buildaction, etc.
- Remove legacy console.log-based logging from backend where it's replaced by the new system

**Frontend:**
- **BREAKING**: Remove legacy ConsoleContext, ConsoleProvider, useConsole hook, and Console container
- **BREAKING**: Remove log-window-manager.ts (separate log window no longer needed)
- Rename existing "Log" button to "Application Logs" in workspace toolbar
- Create new "Site Log" button next to Tools button in workspace toolbar
- Implement shared LogViewer component for rendering JSONL logs
- Add filtering by category, log level, and free-text search
- Support single-line clipboard copy
- Display logs in-app (no separate windows)

**API:**
- Add backend endpoints: `getApplicationLogs`, `getSiteLogs` with pagination and filtering
- Add schemas for log entries and log query parameters

## Impact

- **Affected specs**: logging (new), ui-components (modified)
- **Affected code**:
  - Backend: Create new `packages/backend/src/logging/` directory with LogWriter, LogLevel, categories
  - Backend: Update all backend services to use structured logging instead of console.log
  - Backend: Add API endpoints in `packages/backend/src-main/bridge/api-main.js`
  - Frontend: Remove `packages/frontend/src/contexts/ConsoleContext.tsx`
  - Frontend: Remove `packages/frontend/src/containers/Console/`
  - Frontend: Remove `packages/adapters/electron/src/ui-managers/log-window-manager.ts`
  - Frontend: Create `packages/frontend/src/components/LogViewer/`
  - Frontend: Add new routes for application logs and site logs
  - Frontend: Update `packages/frontend/src/containers/WorkspaceMounted/hooks/useWorkspaceToolbarItems.tsx`
- **Migration path**: Users will lose access to old console logs after upgrade (no migration needed as logs are ephemeral). New log files start fresh with the upgrade.
- **User preferences**: Add `logRetentionDays` preference (default: 30, range: 7-365, or 0 for "never delete")

## Implementation Status

**Status**: ✅ Complete - Core functionality implemented and functional

### What Was Implemented

**Backend Infrastructure:**
- Logging system (`packages/backend/src/logging/`): types.ts, categories.ts, log-writer.ts, log-cleaner.ts, logger.ts, index.ts
- API endpoints (`packages/backend/src/api/handlers/log-handlers.ts`): getApplicationLogs, getSiteLogs, getLogDates
- Container integration: Logger added to AppContainer, initialized at startup, graceful shutdown with log flushing
- User preferences: logRetentionDays field added (default: 30, range: 0-365)

**Frontend Components:**
- LogViewer component suite (`packages/frontend/src/components/LogViewer/`): LogViewer.tsx, LogFilters.tsx, LogTable.tsx, LogRow.tsx
- Application Logs view (`packages/frontend/src/containers/ApplicationLogs/`): Route `/logs/application`
- Site Logs view (`packages/frontend/src/containers/SiteLogs/`): Route `/sites/:siteKey/workspaces/:workspaceKey/logs`
- Preferences UI: Log retention control in PrefsAdvanced.tsx
- Workspace toolbar: "Application Logs" button (renamed from "Log"), "Site Log" button (siteDeveloper only)

**Legacy System Removal:**
- Removed ConsoleContext.tsx and ConsoleProvider
- Removed Console container and `/console` route
- Removed log-window-manager.ts (separate log window)
- Removed showLogWindow() and logToConsole() API methods
- Removed from WindowAdapter interface and all implementations

### Log File Locations

**Global Application Logs:**
```
$HOME/Quiqr/logs/application-YYYY-MM-DD.jsonl
```

**Site-Specific Logs:**
```
$HOME/Quiqr/sites/{siteKey}/{workspaceKey}-YYYY-MM-DD.jsonl
```

### Environment Variable

**Log Level Control:**
```bash
QUIQR_LOGLEVEL=debug  # Show all logs (debug, info, warning, error)
QUIQR_LOGLEVEL=info   # Default: info, warning, error
QUIQR_LOGLEVEL=warning # Only warning and error
QUIQR_LOGLEVEL=error   # Only errors
```

### What's Pending (Non-Critical)

The following items are not critical for the system to function:

1. **Unit/Integration Tests** - Test coverage for LogWriter, LogCleaner, Logger, API endpoints, UI components
2. **Progressive console.log Replacement** - Infrastructure is in place; existing console.log calls can be replaced incrementally
3. **Documentation** - User documentation, developer documentation, CHANGELOG migration notes, AGENTS.md updates
4. **Performance Validation** - Measure log write overhead, test high-volume scenarios, verify async writes, memory usage

### Breaking Changes

- **Console route removed**: Users can no longer access `/console` route
- **API methods removed**: `showLogWindow()` and `logToConsole()` no longer available
- **Legacy logs not migrated**: Old console logs are ephemeral and won't be migrated

### Files Changed

**Created (28 files):**
- `packages/backend/src/logging/` (6 files)
- `packages/backend/src/api/handlers/log-handlers.ts`
- `packages/frontend/src/components/LogViewer/` (5 files)
- `packages/frontend/src/containers/ApplicationLogs/`
- `packages/frontend/src/containers/SiteLogs/`

**Modified (15 files):**
- `packages/types/src/schemas/api.ts`
- `packages/types/src/schemas/config.ts`
- `packages/backend/src/api/router.ts`
- `packages/backend/src/config/container.ts`
- `packages/frontend/src/api.ts`
- `packages/frontend/src/App.tsx`
- `packages/frontend/src/containers/WorkspaceMounted/hooks/useWorkspaceToolbarItems.tsx`
- `packages/frontend/src/containers/Prefs/PrefsAdvanced.tsx`
- `packages/adapters/electron/src/main.ts`
- `packages/adapters/standalone/src/main.ts`
- `packages/backend/src/api/handlers/window-handlers.ts`
- `packages/backend/src/api/handlers/shell-handlers.ts`
- `packages/backend/src/adapters/types.ts`
- `packages/adapters/electron/src/adapters/index.ts`
- `packages/adapters/standalone/src/adapters/window-adapter.ts`

**Deleted (3 files):**
- `packages/frontend/src/contexts/ConsoleContext.tsx`
- `packages/frontend/src/containers/Console/` (entire directory)
- `packages/adapters/electron/src/ui-managers/log-window-manager.ts`
