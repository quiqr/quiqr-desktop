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
