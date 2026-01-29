## ADDED Requirements

### Requirement: Unified Layout Component

The system SHALL provide a single `AppLayout` component that handles all application layout needs across different views (Site Library, Workspace, Preferences, Console).

#### Scenario: Render Site Library view
- **WHEN** Site Library view is mounted with `AppLayout`
- **THEN** sidebar shows `SiteLibrarySidebar` content
- **AND** toolbar displays site library specific buttons (New, Import)
- **AND** main content area displays site cards

#### Scenario: Render Workspace view
- **WHEN** Workspace view is mounted with `AppLayout`
- **THEN** sidebar can dynamically switch between WorkspaceSidebar, SyncSidebar, and SiteConfSidebar
- **AND** toolbar displays workspace-specific buttons (Content, Sync, Tools, Preview)
- **AND** main content area displays selected workspace content

#### Scenario: Render Console view without sidebar
- **WHEN** Console view is mounted with `disableSidebar={true}`
- **THEN** no sidebar is rendered
- **AND** content area uses full width

### Requirement: MUI-Based Layout Components

The system SHALL use Material-UI (MUI) components with standard patterns instead of custom positioning.

#### Scenario: AppBar positioning
- **WHEN** AppLayout renders the toolbar
- **THEN** it uses MUI `AppBar` with `position: fixed`
- **AND** z-index is set to `theme.zIndex.drawer + 1`
- **AND** height is `LAYOUT_CONSTANTS.topBarHeight`

#### Scenario: Drawer implementation
- **WHEN** AppLayout renders the sidebar
- **THEN** it uses MUI `Drawer` with `variant: permanent`
- **AND** width is `LAYOUT_CONSTANTS.sidebarWidth`
- **AND** transform animations handle collapse/expand states
- **AND** transitions are `transform 0.3s ease-in-out`

### Requirement: Sidebar State Management

The system SHALL provide centralized sidebar state management through `useLayoutState` hook.

#### Scenario: Lock sidebar in expanded state
- **WHEN** user clicks lock button
- **THEN** sidebar remains visible and expanded
- **AND** `isLocked` state is `true`
- **AND** sidebar does not auto-collapse on content area click

#### Scenario: Unlock and auto-collapse sidebar
- **WHEN** user clicks unlock button
- **THEN** `isLocked` state becomes `false`
- **AND** sidebar shows collapsed (partial width)
- **AND** clicking content area collapses sidebar fully

#### Scenario: Expand unlocked sidebar temporarily
- **WHEN** sidebar is unlocked and user hovers/clicks sidebar trigger
- **THEN** sidebar expands to full width
- **AND** clicking outside collapses it back
- **AND** `isExpanded` state updates accordingly

#### Scenario: Skip transition on lock toggle
- **WHEN** user toggles lock state
- **THEN** `skipTransition` is set to `true`
- **AND** window resize event is dispatched
- **AND** `skipTransition` resets to `false` on next frame
- **AND** layout changes happen instantly without animation

### Requirement: Layout Constants

The system SHALL use `LAYOUT_CONSTANTS` from theme configuration for all dimensional values.

#### Scenario: No hardcoded dimensions
- **WHEN** any layout component renders
- **THEN** all widths, heights, and offsets come from `LAYOUT_CONSTANTS`
- **AND** no hardcoded values like `52px`, `280px`, `214px` exist in component code

#### Scenario: Constants available from theme
- **WHEN** components access layout values
- **THEN** they reference:
  - `LAYOUT_CONSTANTS.topBarHeight` (toolbar height)
  - `LAYOUT_CONSTANTS.sidebarWidth` (280px, full sidebar)
  - `LAYOUT_CONSTANTS.sidebarCollapsedOffset` (amount to shift left)
  - `LAYOUT_CONSTANTS.sidebarVisibleWidth` (visible strip when collapsed)

### Requirement: Toolbar Configuration

The system SHALL accept flexible toolbar configuration via `ToolbarConfig` interface.

#### Scenario: Configure toolbar sections
- **WHEN** parent component provides toolbar config
- **THEN** `title` appears in left section (280px width)
- **AND** `leftItems` render as button group on left of main toolbar
- **AND** `centerItems` render centered in toolbar
- **AND** `rightItems` render aligned to right edge

#### Scenario: Empty toolbar sections
- **WHEN** toolbar section arrays are empty or undefined
- **THEN** that section renders empty space
- **AND** layout remains stable

### Requirement: Controlled and Uncontrolled State

The system SHALL support both controlled and uncontrolled sidebar state patterns.

#### Scenario: Uncontrolled mode (default)
- **WHEN** `AppLayout` is used without `sidebarState` prop
- **THEN** internal `useLayoutState` hook manages state
- **AND** components can call `toggleLock`, `toggleExpand`, `collapseIfUnlocked` directly

#### Scenario: Controlled mode
- **WHEN** parent provides `sidebarState` and `onSidebarStateChange` props
- **THEN** `AppLayout` uses provided state values
- **AND** state changes are reported via `onSidebarStateChange` callback
- **AND** parent is responsible for updating state

### Requirement: Functional Components

The system SHALL use functional components with hooks instead of class components for all layout-related components.

#### Scenario: All layout components are functional
- **WHEN** reviewing layout component implementations
- **THEN** `AppLayout`, `AppToolbar`, `AppSidebar` are functional components
- **AND** all sidebar components (SiteLibrarySidebar, WorkspaceSidebar, etc.) are functional
- **AND** all toolbar components (TopToolbarRight, ToolbarButton, etc.) are functional
- **AND** no class components exist in the layout system

## REMOVED Requirements

### Requirement: MainLayout Component
**Reason**: Duplicated functionality now handled by unified `AppLayout` component  
**Migration**: Replace `<MainLayout>` usage with `<AppLayout>` and configure via props
