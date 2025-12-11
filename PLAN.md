# Unified Layout System Plan

## Overview

Create a single reusable `AppLayout` component that replaces the duplicated layout code in `MainLayout.tsx` and `Workspace.tsx`. The new layout will use MUI's `AppBar` and `Drawer` components properly, centralize sidebar state management, and work across all views.

## Current Problems

1. **Duplicated code** - `MainLayout.tsx` and `Workspace.tsx` have nearly identical layout code (~100 lines each)
2. **Hardcoded dimensions** - `52px`, `280px`, `214px`, `66px` scattered in both files instead of using `LAYOUT_CONSTANTS`
3. **Custom positioning** - Uses `position: absolute` + CSS transforms instead of MUI Drawer patterns
4. **35 class components** - Need conversion to functional components
5. **Inconsistent sidebar state** - Managed separately in `App.tsx` and `Workspace.tsx`

## Architecture

### File Structure

```
frontend/src/layouts/
  AppLayout/
    index.ts              # Re-export
    AppLayout.tsx         # Main unified layout component
    AppLayout.types.ts    # TypeScript interfaces
    useLayoutState.ts     # Custom hook for sidebar state
    AppToolbar.tsx        # MUI AppBar wrapper
    AppSidebar.tsx        # MUI Drawer wrapper
```

### Component Hierarchy

```
<AppLayout>
  ├── <AppToolbar>           (MUI AppBar, position: fixed)
  │   ├── ToolbarLeft        (280px, site title)
  │   └── ToolbarRight       (flex, 3 sections: left/center/right buttons)
  │
  ├── <AppSidebar>           (MUI Drawer, variant: permanent)
  │   └── {sidebar content}  (SiteLibrarySidebar, WorkspaceSidebar, etc.)
  │
  └── <ContentArea>          (main content, adjusts for sidebar)
      └── {children}
</AppLayout>
```

### Props Interface

```typescript
// AppLayout.types.ts

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

### useLayoutState Hook

```typescript
// useLayoutState.ts
import { useState, useCallback, useRef } from 'react';
import { LAYOUT_CONSTANTS } from '../../theme';

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

### AppToolbar Component

```typescript
// AppToolbar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { LAYOUT_CONSTANTS } from '../../theme';
import TopToolbarLeft from '../../containers/TopToolbarLeft';

interface AppToolbarProps {
  title?: string;
  leftItems?: ReactNode[];
  centerItems?: ReactNode[];
  rightItems?: ReactNode[];
}

const AppToolbar = ({ title = 'Quiqr', leftItems, centerItems, rightItems }: AppToolbarProps) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: LAYOUT_CONSTANTS.topBarHeight,
        backgroundColor: (theme) => theme.palette.toolbar.background,
        borderTop: (theme) => `1px solid ${theme.palette.toolbar.border}`,
        borderBottom: (theme) => `1px solid ${theme.palette.toolbar.border}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: 'unset', height: '100%' }}>
        {/* Left section - 280px for sidebar alignment */}
        <Box
          sx={{
            flex: `0 0 ${LAYOUT_CONSTANTS.sidebarWidth}px`,
            height: '100%',
            borderRight: (theme) => `1px solid ${theme.palette.toolbar.border}`,
          }}
        >
          <TopToolbarLeft title={title} />
        </Box>

        {/* Right section - toolbar items */}
        <Box sx={{ flex: 'auto', height: '100%', overflow: 'hidden', px: 2 }}>
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            {/* Left items */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {leftItems}
            </Box>

            {/* Center items */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {centerItems}
            </Box>

            {/* Right items */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {rightItems}
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
```

### AppSidebar Component

```typescript
// AppSidebar.tsx
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { LAYOUT_CONSTANTS } from '../../theme';

interface AppSidebarProps {
  children: ReactNode;
  isLocked: boolean;
  isExpanded: boolean;
  skipTransition: boolean;
}

const AppSidebar = ({ children, isLocked, isExpanded, skipTransition }: AppSidebarProps) => {
  const { sidebarWidth, sidebarCollapsedOffset, topBarHeight } = LAYOUT_CONSTANTS;

  // Calculate transform: fully visible when locked or expanded, shifted left otherwise
  const transform = (isLocked || isExpanded)
    ? 'translateX(0)'
    : `translateX(-${sidebarCollapsedOffset}px)`;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          top: topBarHeight,
          height: `calc(100vh - ${topBarHeight}px)`,
          backgroundColor: (theme) => theme.palette.sidebar.background,
          borderRight: (theme) => `1px solid ${theme.palette.sidebar.border}`,
          transform,
          transition: skipTransition ? 'none' : 'transform 0.3s ease-in-out',
          overflowY: 'auto',
          overflowX: 'hidden',
          // Hide scrollbar
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        },
      }}
    >
      {children}
    </Drawer>
  );
};
```

### Main AppLayout Component

```typescript
// AppLayout.tsx
import Box from '@mui/material/Box';
import { LAYOUT_CONSTANTS } from '../../theme';
import AppToolbar from './AppToolbar';
import AppSidebar from './AppSidebar';
import { useLayoutState } from './useLayoutState';
import type { AppLayoutProps } from './AppLayout.types';

const AppLayout = ({
  sidebar,
  toolbar,
  children,
  sidebarState: controlledState,
  onSidebarStateChange,
  disableSidebar = false,
}: AppLayoutProps) => {
  // Internal state (used when not controlled)
  const internalState = useLayoutState();

  // Use controlled state if provided
  const isLocked = controlledState?.isLocked ?? internalState.isLocked;
  const isExpanded = controlledState?.isExpanded ?? internalState.isExpanded;
  const skipTransition = internalState.skipTransition;
  const hideItems = !isLocked && !isExpanded;

  const { sidebarWidth, sidebarCollapsedOffset, sidebarVisibleWidth, topBarHeight } = LAYOUT_CONSTANTS;

  // Content area positioning based on sidebar state
  const contentMarginLeft = disableSidebar
    ? 0
    : (isLocked ? sidebarWidth : sidebarVisibleWidth);

  const contentTransform = (!disableSidebar && !isLocked && isExpanded)
    ? `translateX(${sidebarCollapsedOffset}px)`
    : 'translateX(0)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
      <AppToolbar
        title={toolbar.title}
        leftItems={toolbar.leftItems}
        centerItems={toolbar.centerItems}
        rightItems={toolbar.rightItems}
      />

      {/* Sidebar */}
      {!disableSidebar && (
        <AppSidebar
          isLocked={isLocked}
          isExpanded={isExpanded}
          skipTransition={skipTransition}
        >
          {/* Pass hideItems to sidebar for visibility control */}
          {sidebar}
        </AppSidebar>
      )}

      {/* Main Content */}
      <Box
        component="main"
        onClick={disableSidebar ? undefined : internalState.collapseIfUnlocked}
        sx={{
          flexGrow: 1,
          marginTop: `${topBarHeight}px`,
          marginLeft: `${contentMarginLeft}px`,
          transform: contentTransform,
          transition: skipTransition ? 'none' : 'transform 0.3s ease-in-out',
          overflow: 'auto',
          overflowX: 'hidden',
          height: `calc(100vh - ${topBarHeight}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
```

## Migration Strategy

### Phase 1: Create AppLayout Infrastructure
1. Create `frontend/src/layouts/AppLayout/` directory
2. Implement `AppLayout.types.ts`
3. Implement `useLayoutState.ts` hook
4. Implement `AppToolbar.tsx`
5. Implement `AppSidebar.tsx`
6. Implement main `AppLayout.tsx`
7. Add `index.ts` re-export

### Phase 2: Migrate Site Library & Preferences
1. Update `App.tsx` to use `AppLayout` instead of `MainLayout`
2. Pass `SiteLibrarySidebar` and `PrefsSidebar` as sidebar prop
3. Configure toolbar for each view
4. Test both views thoroughly
5. Delete old `MainLayout.tsx`

### Phase 3: Migrate Workspace
1. Update `Workspace.tsx` to use `AppLayout`
2. Remove inline layout code from Workspace
3. Handle dynamic sidebar switching (WorkspaceSidebar, SyncSidebar, SiteConfSidebar)
4. Test all workspace routes (content, sync, siteconf)

### Phase 4: Convert Sidebar Class Components to Functional
Priority order:
1. `Sidebar.tsx` (base component - 350 lines)
2. `SiteLibrarySidebar.tsx`
3. `PrefsSidebar.tsx`
4. `WorkspaceSidebar.tsx`
5. `SiteConfSidebar.tsx`
6. `SyncSidebar.tsx`

### Phase 5: Convert Toolbar Class Components
1. `TopToolbarRight.tsx` → functional
2. `ToolbarButton.tsx` → functional (may already be)
3. `ToolbarToggleButtonGroup.tsx` → functional

## Usage Examples

### Site Library View
```tsx
<AppLayout
  sidebar={<SiteLibrarySidebar />}
  toolbar={{
    title: 'Site Library',
    centerItems: [<ViewToggle key="view" />],
    rightItems: [
      <ToolbarButton key="new" icon={AddIcon} title="New" />,
      <ToolbarButton key="import" icon={ImportIcon} title="Import" />,
    ],
  }}
>
  <SiteLibraryRouted />
</AppLayout>
```

### Workspace View
```tsx
<AppLayout
  sidebar={renderCurrentSidebar()}
  toolbar={{
    title: siteName,
    leftItems: [
      <ToolbarButton key="content" to={contentPath} title="Content" active={isContent} />,
      <ToolbarButton key="sync" to={syncPath} title="Sync" active={isSync} />,
    ],
    centerItems: showPreview ? [<PreviewButton key="preview" />] : [],
    rightItems: [
      <ToolbarButton key="library" to="/sites" title="Site Library" />,
      <ToolbarButton key="prefs" to="/prefs" title="Preferences" />,
    ],
  }}
>
  {renderContent()}
</AppLayout>
```

### Preferences View
```tsx
<AppLayout
  sidebar={<PrefsSidebar hideItems={hideItems} />}
  toolbar={{
    title: 'Preferences',
    leftItems: [<ToolbarButton key="back" icon={ArrowBackIcon} onClick={goBack} />],
    rightItems: [
      <ToolbarButton key="library" to="/sites" title="Site Library" />,
      <ToolbarButton key="prefs" to="/prefs" title="Preferences" active />,
    ],
  }}
>
  <PrefsRouted />
</AppLayout>
```

## Key Decisions

1. **sx props over styled()** - Keep using sx props for simplicity and colocation of styles
2. **MUI Drawer with permanent variant** - Use transform for slide animation instead of variant switching
3. **LAYOUT_CONSTANTS** - All dimensions from `theme/index.ts`, no hardcoded values
4. **Controlled/uncontrolled pattern** - AppLayout can manage its own state or accept controlled state
5. **Functional components only** - All new components are functional, convert existing class components

## Files to Modify

| File | Action |
|------|--------|
| `frontend/src/layouts/AppLayout/*` | Create new |
| `frontend/src/layouts/MainLayout.tsx` | Delete after migration |
| `frontend/src/App.tsx` | Use AppLayout |
| `frontend/src/containers/WorkspaceMounted/Workspace.tsx` | Use AppLayout, remove layout code |
| `frontend/src/containers/Sidebar.tsx` | Convert to functional |
| `frontend/src/containers/SiteLibrary/SiteLibrarySidebar.tsx` | Convert to functional |
| `frontend/src/containers/Prefs/PrefsSidebar.tsx` | Convert to functional |
| `frontend/src/containers/WorkspaceMounted/WorkspaceSidebar.tsx` | Convert to functional |
| `frontend/src/containers/TopToolbarRight/TopToolbarRight.tsx` | Convert to functional |

## Success Criteria

- [ ] Single `AppLayout` component used by all views
- [ ] No duplicated layout code
- [ ] All dimensions from `LAYOUT_CONSTANTS`
- [ ] Sidebar lock/unlock/expand works correctly
- [ ] Smooth transitions preserved
- [ ] All views render correctly (SiteLibrary, Prefs, Workspace, Console)
- [ ] No class components in layout system
