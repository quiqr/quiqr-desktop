# Logging Specification

## ADDED Requirements

### Requirement: Structured JSONL Log Files
The system SHALL write structured logs in newline-delimited JSON (JSONL) format with separate files for global application logs and site-specific workspace logs.

#### Scenario: Global log file creation
- **WHEN** the application starts
- **THEN** a global log file is created at `$HOME/Quiqr/logs/application-YYYY-MM-DD.jsonl` (where YYYY-MM-DD is the current date)

#### Scenario: Site log file creation
- **WHEN** a site operation is logged (sync, content change, build)
- **THEN** a site log file is created at `$HOME/Quiqr/sites/{siteKey}/{workspaceKey}-YYYY-MM-DD.jsonl` (where YYYY-MM-DD is the current date)

#### Scenario: Log entry format
- **WHEN** a log entry is written
- **THEN** it contains: timestamp (ISO 8601), level (debug/info/warning/error), category (string), message (string), optional errorCode (string), optional metadata (object)

### Requirement: Daily Log Rotation
The system SHALL create new log files daily with YYYY-MM-DD date suffix in the filename.

#### Scenario: Date change during runtime
- **WHEN** the system date changes (e.g., from 2026-01-29 to 2026-01-30)
- **THEN** new log entries are written to a new file with the updated date suffix
- **AND** the previous day's log file remains unchanged

#### Scenario: Startup on new day
- **WHEN** the application starts on a day without existing log files
- **THEN** new log files are created with the current date suffix

### Requirement: Configurable Log Retention
The system SHALL automatically delete log files older than the user-configured retention period.

#### Scenario: Default retention period
- **WHEN** no retention preference is configured
- **THEN** logs older than 30 days are automatically deleted

#### Scenario: Custom retention period
- **WHEN** user sets retention to 90 days in preferences
- **THEN** logs older than 90 days are automatically deleted
- **AND** logs newer than 90 days are preserved

#### Scenario: Never delete logs
- **WHEN** user sets retention to 0 (never)
- **THEN** no logs are automatically deleted

#### Scenario: Retention cleanup frequency
- **WHEN** the application starts or once per day during runtime
- **THEN** the retention policy is enforced and old logs are deleted

### Requirement: Log Level Filtering
The system SHALL support four log levels (debug, info, warning, error) and filter log writes based on the configured level.

#### Scenario: Default log level
- **WHEN** no QUIQR_LOGLEVEL environment variable is set
- **THEN** logs at 'info', 'warning', and 'error' levels are written
- **AND** logs at 'debug' level are discarded

#### Scenario: Debug log level
- **WHEN** QUIQR_LOGLEVEL environment variable is set to "debug"
- **THEN** logs at all levels (debug, info, warning, error) are written

#### Scenario: Warning log level
- **WHEN** QUIQR_LOGLEVEL environment variable is set to "warning"
- **THEN** only logs at 'warning' and 'error' levels are written
- **AND** logs at 'debug' and 'info' levels are discarded

#### Scenario: Error log level
- **WHEN** QUIQR_LOGLEVEL environment variable is set to "error"
- **THEN** only logs at 'error' level are written
- **AND** logs at other levels are discarded

### Requirement: Log Categories
The system SHALL categorize log entries to enable filtering by operation type.

#### Scenario: Global log categories
- **WHEN** logging global application events
- **THEN** categories include: electron-init, standalone-init, llm-connection, config, backend-server, resource-download, and others as needed

#### Scenario: Site log categories
- **WHEN** logging site-specific operations
- **THEN** categories include: sync, content, buildaction, model, import, workspace, and others as needed

#### Scenario: Extensible categories
- **WHEN** new backend functionality is added
- **THEN** new categories can be added without schema changes

### Requirement: Error Code Tracking
The system SHALL support optional descriptive error codes for log entries.

#### Scenario: Error with code
- **WHEN** an error occurs with a known error type
- **THEN** the log entry includes an errorCode field with a descriptive string (e.g., "SYNC_FAILED", "BUILD_ERROR", "LLM_TIMEOUT")

#### Scenario: Log without error code
- **WHEN** logging informational or debug messages
- **THEN** the errorCode field is omitted from the log entry

### Requirement: Metadata Context
The system SHALL support optional metadata object for additional context in log entries.

#### Scenario: Metadata for debugging
- **WHEN** logging complex operations
- **THEN** the metadata field can include relevant context (file paths, commit hashes, request IDs, stack traces, etc.)

#### Scenario: Log without metadata
- **WHEN** logging simple messages
- **THEN** the metadata field is omitted from the log entry

### Requirement: Backend Logger API
The system SHALL provide a singleton Logger instance accessible throughout the backend.

#### Scenario: Global logging methods
- **WHEN** backend code needs to log global events
- **THEN** it uses logger.debug(), logger.info(), logger.warning(), logger.error() methods with category, message, and optional metadata

#### Scenario: Site logging methods
- **WHEN** backend code needs to log site-specific events
- **THEN** it uses logger.debugSite(), logger.infoSite(), logger.warningSite(), logger.errorSite() methods with siteKey, workspaceKey, category, message, and optional metadata

### Requirement: Asynchronous Log Writes
The system SHALL write log entries asynchronously to avoid blocking backend operations.

#### Scenario: Non-blocking writes
- **WHEN** a log entry is written
- **THEN** the write operation does not block the calling code
- **AND** log entries are queued and written in order

#### Scenario: Write batching
- **WHEN** multiple log entries are generated rapidly
- **THEN** entries are batched and written together to improve performance

### Requirement: API Endpoints for Log Retrieval
The system SHALL provide backend API endpoints for retrieving and filtering logs.

#### Scenario: Get application logs
- **WHEN** frontend requests application logs via getApplicationLogs({ date?, level?, category?, search?, limit?, offset? })
- **THEN** the backend returns matching log entries with pagination (entries, total, hasMore)

#### Scenario: Get site logs
- **WHEN** frontend requests site logs via getSiteLogs({ siteKey, workspaceKey, date?, level?, category?, search?, limit?, offset? })
- **THEN** the backend returns matching log entries for that workspace with pagination

#### Scenario: Get available log dates
- **WHEN** frontend requests log dates via getLogDates({ type, siteKey?, workspaceKey? })
- **THEN** the backend returns an array of dates (YYYY-MM-DD) for which log files exist

#### Scenario: Filter by level
- **WHEN** API request includes level filter (e.g., level: "error")
- **THEN** only log entries at that level are returned

#### Scenario: Filter by category
- **WHEN** API request includes category filter (e.g., category: "sync")
- **THEN** only log entries in that category are returned

#### Scenario: Free-text search
- **WHEN** API request includes search term (e.g., search: "failed")
- **THEN** only log entries with matching text in message or errorCode are returned

#### Scenario: Pagination
- **WHEN** API request includes limit and offset
- **THEN** the specified page of results is returned with hasMore flag
