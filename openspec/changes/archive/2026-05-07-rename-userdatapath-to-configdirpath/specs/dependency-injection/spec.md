## MODIFIED Requirements

### Requirement: AppConfig Class

The backend SHALL use an AppConfig class instead of global state for application configuration.

#### Scenario: Load configuration
- **WHEN** AppConfig is instantiated
- **THEN** it loads configuration from the configuration directory (`configDirPath`)
- **AND** validates config against `appConfigSchema` from `@quiqr/types`
- **AND** provides typed getters for all config values

#### Scenario: Save configuration changes
- **WHEN** configuration is modified
- **THEN** AppConfig.save() persists changes to disk
- **AND** validates new config before saving
