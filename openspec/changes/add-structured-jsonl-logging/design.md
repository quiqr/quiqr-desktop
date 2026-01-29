# Design: Structured JSONL Logging System

## Context

Quiqr Desktop needs persistent, structured logging to support troubleshooting, debugging, and audit trails. The current implementation buffers console messages in memory and displays them in a separate window, which is insufficient for diagnosing issues after they occur.

The system operates in two runtime modes (Electron and standalone Node), both sharing the same backend, so the logging system must work consistently in both environments.

### Constraints
- Must support both Electron and standalone Node.js modes
- Backend and frontend communicate via HTTP only (no direct IPC)
- File system access is backend-only
- Logs must be human-readable (JSONL) and parseable by standard tools
- Minimal performance impact on application operations

### Stakeholders
- End users: Need to diagnose issues and share logs with support
- Developers: Need detailed logs for debugging
- Support teams: Need structured logs for troubleshooting

## Goals / Non-Goals

### Goals
- Persistent, structured logging with file-based storage
- Separate global application logs from site-specific workspace logs
- Daily log rotation with configurable retention
- Filterable by level, category, and search terms
- In-app log viewing without separate windows
- Environment-variable log level control for debugging

### Non-Goals
- Real-time log streaming (use file polling instead)
- Binary log formats (keep JSONL for human readability)
- Log aggregation to remote services (local-first only)
- Log compression (keep files uncompressed for simplicity)
- Migration of old console logs (start fresh with new system)

## Decisions

### Decision 1: JSONL Format
**What**: Use newline-delimited JSON (JSONL) for log file format.

**Why**:
- Human-readable with standard text tools (cat, grep, tail)
- Parseable by standard JSON libraries (one line = one log entry)
- Appendable without parsing entire file (efficient writes)
- Widely supported by log analysis tools

**Alternatives considered**:
- Plain text: Not structured enough for filtering
- JSON array: Requires parsing entire file for each append
- Binary formats (protobuf): Not human-readable

### Decision 2: Daily Rotation with Configurable Retention
**What**: Create new log files daily (YYYY-MM-DD suffix) and auto-delete logs older than user-configured retention period (default 30 days).

**Why**:
- Daily rotation provides predictable file names and manageable file sizes
- User can configure retention (7-365 days, or 0 for "never") based on disk space and compliance needs
- Simpler than size-based rotation (no need to track partial file names)

**Alternatives considered**:
- Size-based rotation: More complex file naming, harder to locate specific dates
- Single file: Would grow unbounded over time
- No automatic deletion: Users would need to manually clean up

### Decision 3: Descriptive Error Codes
**What**: Use descriptive string error codes like `SYNC_FAILED`, `BUILD_ERROR`, `MODEL_CACHE_CLEAR`.

**Why**:
- Immediately understandable without lookup table
- Easier to search and filter
- Aligns with existing Quiqr patterns (camelCase, descriptive naming)

**Alternatives considered**:
- Numeric codes (ERR_001): Requires lookup table, less readable
- Hybrid (code + name): More verbose, unnecessary complexity

### Decision 4: Backend-Only Log Writing
**What**: All log writing happens in the backend. Frontend requests logs via API.

**Why**:
- Consistent with Quiqr's architecture (frontend has no direct file access)
- Ensures logs are written even if frontend crashes
- Works in both Electron and standalone modes
- Centralized control over log rotation and cleanup

**Alternatives considered**:
- Frontend logging to localStorage: Limited size, not persistent across sessions
- Frontend direct file writes: Violates architecture, doesn't work in browser mode

### Decision 5: Two Log Types with Separate Storage
**What**: 
- Global logs: `$HOME/Quiqr/logs/application-YYYY-MM-DD.jsonl`
- Site logs: `$HOME/Quiqr/sites/{siteKey}/{workspaceKey}-YYYY-MM-DD.jsonl`

**Why**:
- Global logs track application lifecycle, not tied to any site
- Site logs are co-located with site content for easy export/sharing
- Users can share site logs without exposing global application data
- Retention can be managed independently (global vs per-site)

**Alternatives considered**:
- Single log file: Mixes concerns, harder to filter
- All logs in global location: Site logs not portable with site data

### Decision 6: Environment Variable Log Level Control
**What**: Use `QUIQR_LOGLEVEL` environment variable to control log verbosity (debug, info, warning, error).

**Why**:
- Standard practice for development/production logging
- No UI needed for advanced debugging
- Can be set before app startup for troubleshooting startup issues
- Developers can enable debug logging without code changes

**Alternatives considered**:
- UI preference only: Can't debug issues before UI loads
- Multiple env vars: Unnecessary complexity for single setting

### Decision 7: Shared LogViewer Component with In-App Display
**What**: Create reusable `LogViewer` component that displays logs in the main application body, not in separate windows.

**Why**:
- Consistent UX with rest of application
- Easier to maintain (one window to manage)
- Users can switch between logs and content without window juggling
- Simpler implementation (no window state management)

**Alternatives considered**:
- Separate window per log type: More complex, poorer UX
- External log viewer: Requires launching external tools

## Log Schemas

### Global Log Entry
```typescript
{
  timestamp: string;        // ISO 8601 format: "2026-01-29T10:30:45.123Z"
  level: 'debug' | 'info' | 'warning' | 'error';
  category: string;         // e.g., "electron-init", "llm-connection"
  message: string;          // Human-readable message
  errorCode?: string;       // Optional: "INIT_FAILED", "LLM_TIMEOUT"
  metadata?: object;        // Optional: Additional context (stack trace, request ID, etc.)
}
```

### Site Log Entry
```typescript
{
  timestamp: string;        // ISO 8601 format: "2026-01-29T10:30:45.123Z"
  level: 'debug' | 'info' | 'warning' | 'error';
  category: string;         // e.g., "sync", "content", "buildaction"
  message: string;          // Human-readable message
  errorCode?: string;       // Optional: "SYNC_FAILED", "BUILD_ERROR"
  metadata?: object;        // Optional: Additional context (file paths, commit hashes, etc.)
}
```

### Category Examples

**Global Categories** (extensible):
- `electron-init`: Electron main process initialization
- `standalone-init`: Standalone Node.js server initialization
- `llm-connection`: LLM service connections and requests
- `config`: Application configuration changes
- `backend-server`: Backend server lifecycle events
- `resource-download`: SSG binary downloads (Hugo, Quarto)

**Site Categories** (extensible):
- `sync`: Git synchronization, push/pull operations
- `content`: Content creation, editing, deletion
- `buildaction`: Hugo/Quarto build operations
- `model`: Model scaffolding and caching
- `import`: Site import operations
- `workspace`: Workspace creation, switching, deletion

## Implementation Architecture

### Backend Components

```
packages/backend/src/logging/
├── logger.ts              # Main Logger class with write methods
├── log-writer.ts          # JSONL file writer with rotation
├── log-cleaner.ts         # Retention policy enforcement
├── categories.ts          # Category constants and validation
└── types.ts               # TypeScript interfaces for log entries
```

**Logger API**:
```typescript
// Singleton instance accessed throughout backend
import { logger } from './logging/logger';

// Global logging
logger.info('electron-init', 'Application started', { version: '1.0.0' });
logger.error('llm-connection', 'LLM request failed', { errorCode: 'LLM_TIMEOUT', requestId: '123' });

// Site logging
logger.infoSite(siteKey, workspaceKey, 'sync', 'Git push completed', { commit: 'abc123' });
logger.errorSite(siteKey, workspaceKey, 'buildaction', 'Hugo build failed', { 
  errorCode: 'BUILD_ERROR', 
  exitCode: 1 
});
```

### Frontend Components

```
packages/frontend/src/components/LogViewer/
├── LogViewer.tsx          # Main log display component
├── LogFilters.tsx         # Category, level, and search filters
├── LogTable.tsx           # Table rendering with virtualization
├── LogRow.tsx             # Single log entry row
└── types.ts               # Frontend log types
```

**Routes**:
- `/logs/application` - Global application logs
- `/sites/:siteKey/workspaces/:workspaceKey/logs` - Site-specific logs

### API Endpoints

**Backend (`packages/backend/src-main/bridge/api-main.js`)**:
- `getApplicationLogs({ date?, level?, category?, search?, limit?, offset? })`
  - Returns: `{ entries: LogEntry[], total: number, hasMore: boolean }`
- `getSiteLogs({ siteKey, workspaceKey, date?, level?, category?, search?, limit?, offset? })`
  - Returns: `{ entries: LogEntry[], total: number, hasMore: boolean }`
- `getLogDates({ type: 'application' | 'site', siteKey?, workspaceKey? })`
  - Returns: `{ dates: string[] }` (available log dates)

## Risks / Trade-offs

### Risk 1: Log File Size Growth
**Risk**: High-volume operations (frequent syncs, builds) could generate large log files.

**Mitigation**:
- Daily rotation ensures files don't grow unbounded
- Configurable retention auto-deletes old files
- Users can adjust retention to balance disk space vs history
- Future optimization: Add size-based rotation if daily rotation proves insufficient

### Risk 2: Performance Impact from Disk I/O
**Risk**: Synchronous log writes could block backend operations.

**Mitigation**:
- Use asynchronous file writes (fs.appendFile)
- Batch log writes (collect entries, write every 100ms)
- Log level filtering (production defaults to 'info', skips 'debug')
- If performance issues arise, add in-memory buffer with periodic flush

### Risk 3: Log Corruption from Concurrent Writes
**Risk**: Multiple backend operations writing to same log file simultaneously could corrupt JSONL.

**Mitigation**:
- Node.js `fs.appendFile` is atomic for small writes (single log entry)
- Logger instance maintains write queue (serialize writes)
- If corruption occurs, invalid lines can be skipped during parsing

### Risk 4: Breaking Change Impact on Users
**Risk**: Removing ConsoleContext and log window breaks existing workflows.

**Mitigation**:
- New LogViewer provides superior functionality (filtering, search, persistence)
- Migration guide in release notes explains new log locations
- "Application Logs" button is clearly labeled and discoverable
- Old console logs were ephemeral (not losing persistent data)

## Migration Plan

### Pre-Release
1. Implement new logging system alongside legacy console logging (run both)
2. Test log rotation, retention, and filtering in development
3. Verify performance impact is negligible (<5ms overhead per operation)

### Release
1. Remove legacy ConsoleContext, ConsoleProvider, useConsole, Console container
2. Remove log-window-manager.ts (separate log window)
3. Update all backend console.log to use structured logger
4. Deploy with release notes explaining new log locations

### Post-Release
1. Monitor user feedback on log retention defaults
2. Add additional categories as needed based on user requests
3. Consider future enhancements (log export to file, advanced filters)

### Rollback Plan
If critical issues arise:
1. Revert PR to restore legacy console logging
2. New log files remain (no data loss)
3. Users can manually access JSONL files if needed

## Open Questions

1. **Should we implement log file compression for archived logs?**
   - Defer to future iteration. Start with uncompressed JSONL for simplicity.

2. **Should site logs support filtering across all workspaces for a site?**
   - No. Logs are per-workspace for clarity. Users can manually combine if needed.

3. **Should we add a "Download Logs" feature for support sharing?**
   - Start with single-line clipboard copy. Add batch export in future if requested.

4. **Should we log frontend errors (React errors, API failures)?**
   - Future enhancement. Focus on backend logging first. Frontend errors could be captured via error boundary and sent to backend API.

5. **Should retention be global or per-site?**
   - Global preference applies to both application and site logs. Keep it simple.
