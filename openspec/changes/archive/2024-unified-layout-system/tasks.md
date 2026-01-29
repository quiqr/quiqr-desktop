## 1. Infrastructure
- [x] 1.1 Create `frontend/src/layouts/AppLayout/` directory structure
- [x] 1.2 Implement `AppLayout.types.ts` with interfaces
- [x] 1.3 Implement `useLayoutState.ts` custom hook
- [x] 1.4 Implement `AppToolbar.tsx` component
- [x] 1.5 Implement `AppSidebar.tsx` component
- [x] 1.6 Implement main `AppLayout.tsx` component
- [x] 1.7 Add `index.ts` re-export

## 2. Site Library & Preferences Migration
- [x] 2.1 Update `App.tsx` to use `AppLayout`
- [x] 2.2 Configure toolbar for Site Library view
- [x] 2.3 Configure toolbar for Preferences view
- [x] 2.4 Test both views thoroughly
- [x] 2.5 Delete old `MainLayout.tsx`

## 3. Workspace Migration
- [x] 3.1 Update `Workspace.tsx` to use `AppLayout`
- [x] 3.2 Remove inline layout code from Workspace
- [x] 3.3 Handle dynamic sidebar switching (WorkspaceSidebar, SyncSidebar, SiteConfSidebar)
- [x] 3.4 Test all workspace routes (content, sync, siteconf)

## 4. Convert Sidebar Components
- [x] 4.1 Convert `Sidebar.tsx` to functional component
- [x] 4.2 Convert `SiteLibrarySidebar.tsx` to functional
- [x] 4.3 Convert `PrefsSidebar.tsx` to functional
- [x] 4.4 Convert `WorkspaceSidebar.tsx` to functional
- [x] 4.5 Convert `SiteConfSidebar.tsx` to functional
- [x] 4.6 Convert `SyncSidebar.tsx` to functional

## 5. Convert Toolbar Components
- [x] 5.1 Convert `TopToolbarRight.tsx` to functional
- [x] 5.2 Convert `ToolbarButton.tsx` to functional (if needed)
- [x] 5.3 Convert `ToolbarToggleButtonGroup.tsx` to functional

## 6. Testing & Cleanup
- [x] 6.1 Verify sidebar lock/unlock/expand behavior
- [x] 6.2 Verify smooth transitions preserved
- [x] 6.3 Test all views (SiteLibrary, Prefs, Workspace, Console)
- [x] 6.4 Verify all dimensions use LAYOUT_CONSTANTS
- [x] 6.5 Remove any remaining hardcoded values
