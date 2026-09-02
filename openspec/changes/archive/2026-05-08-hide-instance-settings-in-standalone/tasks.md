## 1. Sidebar: Hide Application Settings section

- [x] 1.1 In `PrefsSidebar.tsx`, use `useEnvironment()` to get `isStandalone`, conditionally exclude the `applicationSettingsMenu` when standalone

## 2. Routing: Guard hidden routes

- [x] 2.1 In `PrefsRouted.tsx`, use `useEnvironment()` to get `isStandalone`, redirect standalone-only routes (`storage`, `git`, `logging`, `hugo`, `variables`, `appsettings-general`) to `/prefs/general`

## 3. Tests

- [x] 3.1 Test that `PrefsSidebar` renders both sections when `isStandalone` is false
- [x] 3.2 Test that `PrefsSidebar` hides "Application Settings" section when `isStandalone` is true
- [x] 3.3 Test that `PrefsRouted` renders instance settings routes in Electron mode
- [x] 3.4 Test that `PrefsRouted` redirects instance settings routes to `/prefs/general` in standalone mode

## 4. Verification

- [x] 4.1 TypeScript compiles cleanly (11 pre-existing errors, no new ones)
- [x] 4.2 All 186 frontend tests pass (no regressions)
