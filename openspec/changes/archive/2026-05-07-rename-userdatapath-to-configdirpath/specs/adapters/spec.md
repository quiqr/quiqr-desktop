## MODIFIED Requirements

### Requirement: QUIQR_CONF_DIR environment variable

The standalone adapter SHALL support a `QUIQR_CONF_DIR` environment variable that overrides the default configuration directory (`~/.quiqr-standalone`). This directory contains configuration files, auth data, runtime state, and logs — not site content.

#### Scenario: QUIQR_CONF_DIR is set
- **WHEN** the `QUIQR_CONF_DIR` environment variable is set to `/var/lib/quiqr`
- **THEN** the server SHALL use `/var/lib/quiqr` as the `configDirPath`
- **AND** all configuration files (instance_settings.json, runtime_state.json, users.json, logs) SHALL be stored under that directory

#### Scenario: QUIQR_CONF_DIR is not set
- **WHEN** the `QUIQR_CONF_DIR` environment variable is not set
- **THEN** the server SHALL default to `~/.quiqr-standalone` (unchanged behavior)

### Requirement: QUIQR_CONFIG_FILE environment variable

The standalone adapter SHALL support a `QUIQR_CONFIG_FILE` environment variable to specify an external config file path.

#### Scenario: QUIQR_CONFIG_FILE is set
- **WHEN** `QUIQR_CONFIG_FILE` is set to `/etc/quiqr/instance_settings.json`
- **THEN** the server SHALL copy that file to `<configDirPath>/instance_settings.json` on startup
- **AND** the unified config service SHALL read from the copied file

#### Scenario: QUIQR_CONFIG_FILE is not set
- **WHEN** `QUIQR_CONFIG_FILE` is not set
- **THEN** the server SHALL read config from `<configDirPath>/instance_settings.json` (unchanged behavior)

### Requirement: Separate runtime state from config

The standalone adapter SHALL separate server-managed runtime state from read-only configuration by using a dedicated `runtime_state.json` file in the configuration directory.

#### Scenario: Session secret auto-generation
- **WHEN** the server starts and no session secret exists in `runtime_state.json`
- **THEN** the server SHALL generate a random session secret
- **AND** persist it to `runtime_state.json` (NOT `instance_settings.json`)

#### Scenario: Session secret persistence across restarts
- **WHEN** the server restarts and `runtime_state.json` contains a session secret
- **THEN** the server SHALL reuse the persisted secret
- **AND** existing user sessions SHALL remain valid

#### Scenario: External config not overwritten
- **WHEN** the server starts with a NixOS-managed `instance_settings.json`
- **THEN** the server SHALL NOT write to `instance_settings.json`
- **AND** only `runtime_state.json` SHALL be written by the server

## RENAMED Requirements

### Requirement: QUIQR_DATA_DIR environment variable
- **FROM:** QUIQR_DATA_DIR environment variable
- **TO:** QUIQR_CONF_DIR environment variable
