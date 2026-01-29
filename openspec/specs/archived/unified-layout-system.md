# Unified Layout System

**Status:** archived  
**Created:** 2024 (legacy)  
**Archived:** 2026-01-29  
**Implementation:** Completed in earlier version

## Context

This spec was created to address layout code duplication and inconsistencies across the application. The original implementation had layout logic duplicated in `MainLayout.tsx` and `Workspace.tsx` with hardcoded dimensions and custom positioning instead of MUI patterns.

## Problems Addressed

1. **Code Duplication**: `MainLayout.tsx` and `Workspace.tsx` contained nearly identical layout code (~100 lines each)
2. **Hardcoded Dimensions**: Values like `52px`, `280px`, `214px`, `66px` scattered throughout instead of using `LAYOUT_CONSTANTS`
3. **Non-standard Patterns**: Used `position: absolute` + CSS transforms instead of MUI Drawer patterns
4. **Class Components**: 35 class components needed conversion to functional components
5. **Inconsistent State**: Sidebar state managed separately in `App.tsx` and `Workspace.tsx`

## Solution

### Architecture

Created a unified `AppLayout` component system with proper MUI component usage:

**File Structure:**
```
frontend/src/layouts/AppLayout/
  ├── index.ts              # Re-export
  ├── AppLayout.tsx         # Main unified layout component
  ├── AppLayout.types.ts    # TypeScript interfaces
  ├── useLayoutState.ts     # Custom hook for sidebar state
  ├── AppToolbar.tsx        # MUI AppBar wrapper
  └── AppSidebar.tsx        # MUI Drawer wrapper
```

**Component Hierarchy:**
```
<AppLayout>
  ├── <AppToolbar>           (MUI AppBar, position: fixed)
  │   ├── ToolbarLeft        (280px, site title)
  │   └── ToolbarRight       (flex, 3 sections: left/center/right buttons)
  ├── <AppSidebar>           (MUI Drawer, variant: permanent)
  │   └── {sidebar content}  (SiteLibrarySidebar, WorkspaceSidebar, etc.)
  └── <ContentArea>          (main content, adjusts for sidebar)
      └── {children}
```

### Key Interfaces

**AppLayoutProps:**
```typescript
interface ToolbarConfig {
  title?: string;                    // Title for toolbar left section
  leftItems?: ReactNode[];           // Toolbar buttons on left (Content, Sync, Tools)
  centerItems?: ReactNode[];         // Center items (Preview button)
  rightItems?: ReactNode[];          // Right items (Log, Site Library, Prefs)
}

interface AppLayoutProps {
  sidebar: ReactNode;                // Sidebar content (any sidebar component)
  toolbar: ToolbarConfig;            // Toolbar configuration
  children: ReactNode;               // Main content

  // Optional: controlled mode (for lifting state to parent)
  sidebarState?: {
    isLocked: boolean;
    isExpanded: boolean;
  };
  onSidebarStateChange?: (state: { isLocked: boolean; isExpanded: boolean }) => void;

  disableSidebar?: boolean;          // For Console view (no sidebar)
}
```

### Layout State Management

**useLayoutState Hook:**
```typescript
export const useLayoutState = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
    setIsExpanded(true);
    setSkipTransition(true);
    window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(() => setSkipTransition(false));
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const collapseIfUnlocked = useCallback(() => {
    if (!isLocked && isExpanded) {
      setIsExpanded(false);
    }
  }, [isLocked, isExpanded]);

  return {
    isLocked,
    isExpanded,
    skipTransition,
    toggleLock,
    toggleExpand,
    collapseIfUnlocked,
    hideItems: !isLocked && !isExpanded,
  };
};
```

### Component Specifications

**AppToolbar:**
- Uses MUI `AppBar` with `position: fixed`
- Height: `LAYOUT_CONSTANTS.topBarHeight`
- Left section: Fixed width `LAYOUT_CONSTANTS.sidebarWidth` (280px) for alignment
- Right section: Flex auto, divided into left/center/right button groups
- Z-index: `theme.zIndex.drawer + 1` (appears above sidebar)

**AppSidebar:**
- Uses MUI `Drawer` with `variant: permanent`
- Width: `LAYOUT_CONSTANTS.sidebarWidth` (280px)
- Top offset: `LAYOUT_CONSTANTS.topBarHeight`
- Transform-based animation for collapse/expand
- Transition: `transform 0.3s ease-in-out` (unless `skipTransition`)
- Collapsed offset: `LAYOUT_CONSTANTS.sidebarCollapsedOffset`

**Content Area:**
- Margin-left: `sidebarWidth` (locked) or `sidebarVisibleWidth` (unlocked)
- Transform: `translateX(sidebarCollapsedOffset)` when unlocked and expanded
- Top margin: `topBarHeight`
- Height: `calc(100vh - topBarHeight)`
- Click handler: Collapses sidebar if unlocked

## Migration Path

### Phase 1: Infrastructure
1. Create `frontend/src/layouts/AppLayout/` directory
2. Implement type definitions (`AppLayout.types.ts`)
3. Implement `useLayoutState.ts` hook
4. Implement `AppToolbar.tsx`
5. Implement `AppSidebar.tsx`
6. Implement main `AppLayout.tsx`
7. Add `index.ts` re-export

### Phase 2: Site Library & Preferences
1. Update `App.tsx` to use `AppLayout`
2. Pass `SiteLibrarySidebar` and `PrefsSidebar` as sidebar prop
3. Configure toolbar for each view
4. Test both views
5. Delete `MainLayout.tsx`

### Phase 3: Workspace
1. Update `Workspace.tsx` to use `AppLayout`
2. Remove inline layout code
3. Handle dynamic sidebar switching
4. Test all workspace routes

### Phase 4: Sidebar Components
Convert to functional components (priority order):
1. `Sidebar.tsx` (350 lines)
2. `SiteLibrarySidebar.tsx`
3. `PrefsSidebar.tsx`
4. `WorkspaceSidebar.tsx`
5. `SiteConfSidebar.tsx`
6. `SyncSidebar.tsx`

### Phase 5: Toolbar Components
1. `TopToolbarRight.tsx`
2. `ToolbarButton.tsx`
3. `ToolbarToggleButtonGroup.tsx`

## Design Decisions

1. **sx props over styled()**: Keep using sx props for simplicity and colocation
2. **MUI Drawer with permanent variant**: Use transform for slide animation instead of variant switching
3. **LAYOUT_CONSTANTS**: All dimensions from `theme/index.ts`, no hardcoded values
4. **Controlled/uncontrolled pattern**: AppLayout can manage its own state or accept controlled state
5. **Functional components only**: All new components are functional, convert existing class components

## Success Criteria

- Single `AppLayout` component used by all views
- No duplicated layout code
- All dimensions from `LAYOUT_CONSTANTS`
- Sidebar lock/unlock/expand works correctly
- Smooth transitions preserved
- All views render correctly (SiteLibrary, Prefs, Workspace, Console)
- No class components in layout system

## Files Modified

| File | Action |
|------|--------|
| `frontend/src/layouts/AppLayout/*` | Created |
| `frontend/src/layouts/MainLayout.tsx` | Deleted |
| `frontend/src/App.tsx` | Updated to use AppLayout |
| `frontend/src/containers/WorkspaceMounted/Workspace.tsx` | Updated to use AppLayout |
| `frontend/src/containers/Sidebar.tsx` | Converted to functional |
| `frontend/src/containers/SiteLibrary/SiteLibrarySidebar.tsx` | Converted to functional |
| `frontend/src/containers/Prefs/PrefsSidebar.tsx` | Converted to functional |
| `frontend/src/containers/WorkspaceMounted/WorkspaceSidebar.tsx` | Converted to functional |
| `frontend/src/containers/TopToolbarRight/TopToolbarRight.tsx` | Converted to functional |

## Notes

This spec represents a completed refactoring effort. The unified layout system is now the standard pattern for all application views. Archived for historical reference.
