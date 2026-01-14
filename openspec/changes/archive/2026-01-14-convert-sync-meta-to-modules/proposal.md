# Proposal: Convert Sync Meta Classes to Modules

## Summary
Convert 3 sync Meta utility classes (github, sysgit, folder) from class-with-static-methods pattern to plain module exports with named functions.

## Why
- **Not React components**: These are utility classes, not components
- **Unnecessary class syntax**: Using classes only for static methods is verbose
- **Modern pattern**: Plain module exports are simpler and more idiomatic
- **Part of issue #559**: Removing class-based patterns from frontend

## What Changes
Convert 3 Meta utility classes to modules:
- `syncTypes/github/Meta.tsx` → Export named functions
- `syncTypes/sysgit/Meta.tsx` → Export named functions
- `syncTypes/folder/Meta.tsx` → Export named functions

Pattern change:
```typescript
// Before: Class with static methods
export default class Meta {
  static configDialogTitle = "GitHub Target";
  static sidebarLabel(config) { ... }
  static icon() { return <GitHubIcon />; }
}

// After: Named exports
export const configDialogTitle = "GitHub Target";
export const sidebarLabel = (config) => { ... };
export const icon = () => <GitHubIcon />;
```

**Note**: CardNew components (3 files) are already functional - no conversion needed.

## Impact Analysis

**Files to convert** (3 files, ~118 lines total):
- `frontend/src/containers/WorkspaceMounted/Sync/syncTypes/github/Meta.tsx` (37 lines)
- `frontend/src/containers/WorkspaceMounted/Sync/syncTypes/sysgit/Meta.tsx` (67 lines)
- `frontend/src/containers/WorkspaceMounted/Sync/syncTypes/folder/Meta.tsx` (14 lines)

**Files using these Meta classes** (5 files):
- `SyncSidebar.tsx` - Calls `Meta.sidebarLabel()`, `Meta.icon()`
- `SyncConfigDialog.tsx` - Calls `Meta.configDialogTitle`, `Meta.syncingText`
- `github/Dashboard.tsx` - Calls `Meta.repoAdminUrl()`, `Meta.liveUrl()`
- `sysgit/Dashboard.tsx` - Calls `Meta.repoAdminUrl()`, `Meta.liveUrl()`
- `folder/Dashboard.tsx` - Calls `Meta.sidebarLabel()`

**Import changes needed**:
```typescript
// Before
import { Meta as GitHubMeta } from './syncTypes/github';
GitHubMeta.sidebarLabel(config);

// After
import * as GitHubMeta from './syncTypes/github/Meta';
GitHubMeta.sidebarLabel(config);
// OR destructured:
import { sidebarLabel, icon } from './syncTypes/github/Meta';
```

## Implementation Approach

### Phase 1: Convert Meta Classes
1. Convert github/Meta.tsx to module exports
2. Convert sysgit/Meta.tsx to module exports
3. Convert folder/Meta.tsx to module exports

### Phase 2: Update Imports
4. Update SyncSidebar.tsx imports
5. Update SyncConfigDialog.tsx imports
6. Update Dashboard.tsx files (3 files)

### Phase 3: Verification
7. TypeScript type checking
8. Build verification
9. Manual testing of sync functionality

## Scope

**In scope:**
- Convert 3 Meta classes to module exports
- Update 5 files that import/use Meta classes
- Update index.ts exports if needed
- Maintain exact same functionality

**Out of scope:**
- Changes to CardNew components (already functional)
- Changes to sync logic or behavior
- UI/UX improvements
- Refactoring Dashboard components

## Success Criteria
- [x] All 3 Meta classes converted to modules
- [x] All 5 consumer files updated with correct imports
- [x] No `class` or `static` keywords in Meta files
- [x] TypeScript compiles with no errors
- [x] Build succeeds
- [x] Sync functionality works (sidebar, dialogs, dashboards)
- [x] Follows project conventions (no React.FC, destructured props)

## Related Work
- Part of GitHub issue #559 (Convert remaining class components to functional)
- Continues pattern from AiAssist conversion (archived change)
