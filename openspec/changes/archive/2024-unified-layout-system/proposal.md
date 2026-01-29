# Change: Unified Layout System

## Why

The application had duplicated layout code in `MainLayout.tsx` and `Workspace.tsx` (~100 lines each) with hardcoded dimensions, custom positioning instead of MUI patterns, and inconsistent sidebar state management. This made maintenance difficult and created UX inconsistencies.

## What Changes

- Create single reusable `AppLayout` component using proper MUI patterns
- Replace `position: absolute` + transforms with MUI `Drawer` and `AppBar`
- Centralize all layout dimensions in `LAYOUT_CONSTANTS`
- Implement unified sidebar state management via `useLayoutState` hook
- Convert 35 class components to functional components
- Support controlled/uncontrolled state patterns for flexibility
- **BREAKING**: Remove `MainLayout.tsx` component

## Impact

- Affected specs: frontend-components, ui-theming
- Affected code:
  - `frontend/src/layouts/AppLayout/*` (created)
  - `frontend/src/layouts/MainLayout.tsx` (deleted)
  - `frontend/src/App.tsx`
  - `frontend/src/containers/WorkspaceMounted/Workspace.tsx`
  - All sidebar components (converted to functional)
  - All toolbar components (converted to functional)
