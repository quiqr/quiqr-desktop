# UI Components Specification

## ADDED Requirements

### Requirement: LogViewer Component
The system SHALL provide a reusable LogViewer component for displaying structured logs in the main application.

#### Scenario: Log display
- **WHEN** LogViewer is rendered with log entries
- **THEN** each entry is displayed as a table row with columns: timestamp, level, category, message, errorCode (if present)

#### Scenario: Empty log state
- **WHEN** LogViewer is rendered with no log entries
- **THEN** a message is displayed indicating no logs are available

#### Scenario: In-app rendering
- **WHEN** user navigates to log view
- **THEN** logs are displayed in the main application body (not in a separate window)

### Requirement: Log Filtering
The system SHALL provide filter controls for log level, category, and free-text search.

#### Scenario: Filter by log level
- **WHEN** user selects a log level from the dropdown (debug, info, warning, error)
- **THEN** only log entries at that level are displayed

#### Scenario: Filter by category
- **WHEN** user selects a category from the dropdown
- **THEN** only log entries in that category are displayed

#### Scenario: Free-text search
- **WHEN** user types in the search field
- **THEN** only log entries matching the search term in message or errorCode are displayed

#### Scenario: Combined filters
- **WHEN** multiple filters are active (level, category, search)
- **THEN** only log entries matching all filters are displayed

#### Scenario: Clear filters
- **WHEN** user clears filters
- **THEN** all log entries for the selected date are displayed

### Requirement: Single-Line Clipboard Copy
The system SHALL support copying individual log entries to the clipboard.

#### Scenario: Copy log entry
- **WHEN** user clicks copy button on a log row
- **THEN** the complete log entry JSON is copied to clipboard
- **AND** a confirmation message is displayed

### Requirement: Application Logs View
The system SHALL provide a dedicated view for global application logs accessible from the workspace toolbar.

#### Scenario: Application Logs button
- **WHEN** user is in a workspace
- **THEN** an "Application Logs" button is visible in the workspace toolbar (renamed from "Log")

#### Scenario: Open Application Logs
- **WHEN** user clicks "Application Logs" button
- **THEN** the application navigates to `/logs/application` route
- **AND** the LogViewer displays global application logs

### Requirement: Site Logs View
The system SHALL provide a dedicated view for site-specific workspace logs accessible from the workspace toolbar.

#### Scenario: Site Log button placement
- **WHEN** user is in a workspace with applicationRole "siteDeveloper"
- **THEN** a "Site Log" button is visible next to the "Tools" button in the workspace toolbar

#### Scenario: Open Site Logs
- **WHEN** user clicks "Site Log" button
- **THEN** the application navigates to `/sites/:siteKey/workspaces/:workspaceKey/logs` route
- **AND** the LogViewer displays logs for that specific workspace

## REMOVED Requirements

### Requirement: Legacy Console Window
The legacy Console container, ConsoleContext, ConsoleProvider, and separate log window are removed in favor of the new structured logging system.

**Reason**: Replaced by structured JSONL logging with in-app LogViewer component.

**Migration**: Users access logs via "Application Logs" and "Site Log" buttons. Old console logs are not migrated (were ephemeral).

#### Previously removed components:
- `packages/frontend/src/contexts/ConsoleContext.tsx`
- `packages/frontend/src/containers/Console/`
- `packages/adapters/electron/src/ui-managers/log-window-manager.ts`
- `useConsole` hook and ConsoleProvider
- `/console` route
