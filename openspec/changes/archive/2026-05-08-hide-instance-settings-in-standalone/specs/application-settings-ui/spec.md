## ADDED Requirements

### Requirement: Hide instance settings in standalone mode

The Preferences UI SHALL hide the entire "Application Settings" section when running in standalone mode, since instance settings are managed externally and changes would be lost on restart.

#### Scenario: Standalone mode — sidebar hides Application Settings
- **WHEN** the app is running in standalone mode (`isStandalone` is true)
- **AND** the user navigates to Preferences
- **THEN** the sidebar SHALL NOT display the "Application Settings" section
- **AND** only the "Preferences" section (Appearance, Behaviour) SHALL be visible

#### Scenario: Electron mode — sidebar shows all sections
- **WHEN** the app is running in Electron mode (`isStandalone` is false)
- **AND** the user navigates to Preferences
- **THEN** the sidebar SHALL display both "Preferences" and "Application Settings" sections

#### Scenario: Standalone mode — direct URL access to hidden settings
- **WHEN** the app is running in standalone mode
- **AND** the user navigates directly to a hidden settings route (e.g., `/prefs/storage`, `/prefs/git`, `/prefs/hugo`, `/prefs/logging`, `/prefs/variables`, `/prefs/appsettings-general`)
- **THEN** the router SHALL redirect to `/prefs/general`

#### Scenario: Electron mode — direct URL access to settings
- **WHEN** the app is running in Electron mode
- **AND** the user navigates directly to any settings route
- **THEN** the route SHALL render normally (unchanged behavior)
