# Unified Configuration System

**Capability:** `unified-config`
**Related Change:** `unify-configuration-architecture`
**Status:** Draft

## Overview

This capability defines the unified configuration system that supports hierarchical, layered configuration for both single-user desktop and multi-user server deployments.

## ADDED Requirements

### Requirement: CONFIG-TREE-001 - Hierarchical Configuration Tree

The system SHALL organize configuration as a hierarchical tree with dot-notation paths supporting instance settings, group preferences, user preferences, and site settings.

#### Scenario: Accessing instance storage setting
- GIVEN a Quiqr instance with configured storage
- WHEN the system requests `instance.settings.storage.type`
- THEN the system SHALL return the configured storage type ("fs", "s3", or "gcs")

#### Scenario: Accessing nested preference path
- GIVEN a user with configured interface style
- WHEN the system requests `instance.users[userId].preferences.interfaceStyle`
- THEN the system SHALL return the user's interface style preference

---

### Requirement: CONFIG-LAYER-001 - Layered Configuration Precedence

The system SHALL resolve configuration values through 4 layers in order of precedence: App Defaults (lowest), Instance Defaults, User Preferences, Instance Forced (highest).

> **Note:** Group-based preferences are out of scope for this change. Group membership and group preferences may be added in a future change as a separate concern.

#### Scenario: User preference overrides instance default
- GIVEN instance default `interfaceStyle` is "quiqr10-light"
- AND user preference `interfaceStyle` is "quiqr10-dark"
- WHEN resolving `interfaceStyle` for the user
- THEN the system SHALL return "quiqr10-dark"

#### Scenario: Forced preference cannot be overridden
- GIVEN instance forced preference `logRetentionDays` is 30
- AND user preference `logRetentionDays` is 90
- WHEN resolving `logRetentionDays` for the user
- THEN the system SHALL return 30 (forced value)

#### Scenario: App defaults used when no override exists
- GIVEN app default `dataFolder` is "~/Quiqr"
- AND no instance default or user preference is set for `dataFolder`
- WHEN resolving `dataFolder` for the user
- THEN the system SHALL return "~/Quiqr" (app default)

---

### Requirement: CONFIG-FILE-001 - File-Based Persistent Storage

The system SHALL store configuration in JSON files in the platform-specific configuration directory: `$HOME/.config/quiqr/` (Linux), `~/Library/Application Support/quiqr/` (macOS), `%AppData%\quiqr\` (Windows).

#### Scenario: Instance settings file location
- GIVEN a Linux system
- WHEN the system loads instance configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/instance_settings.json`

#### Scenario: User preferences file location
- GIVEN a multi-user deployment with user "alice"
- WHEN the system loads user configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/user_prefs_alice.json`

#### Scenario: Single-user mode default file
- GIVEN a single-user desktop deployment
- WHEN the system loads user configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/user_prefs_default.json`

#### Scenario: Site settings use separate files
- GIVEN a site with key "my-blog"
- WHEN the system loads site configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/site_settings_my-blog.json`
- AND each site SHALL have its own separate settings file

---

### Requirement: CONFIG-ENV-001 - Environment Variable Override

The system SHALL allow environment variables with `QUIQR_` prefix to override file-based configuration values using path mapping.

#### Scenario: Storage data folder override
- GIVEN `QUIQR_STORAGE_DATAFOLDER` environment variable is set to "/data/quiqr"
- AND instance settings file specifies `dataFolder` as "~/Quiqr"
- WHEN resolving `instance.settings.storage.dataFolder`
- THEN the system SHALL return "/data/quiqr"

#### Scenario: Environment override precedence
- GIVEN `QUIQR_STORAGE_TYPE` is set to "s3"
- AND all file-based layers specify storage type as "fs"
- WHEN resolving storage type
- THEN the system SHALL return "s3" (environment overrides all file layers)

---

### Requirement: CONFIG-SCHEMA-001 - Zod Schema Validation

The system SHALL validate all configuration files against Zod schemas defined in `@quiqr/types` and provide typed access to configuration values.

#### Scenario: Valid configuration loading
- GIVEN a valid `instance_settings.json` file
- WHEN the system loads instance configuration
- THEN the system SHALL parse and validate against `instanceConfigSchema`
- AND return a typed configuration object

#### Scenario: Invalid configuration fallback
- GIVEN an `instance_settings.json` with invalid values
- WHEN the system attempts to load configuration
- THEN the system SHALL log a validation warning
- AND fall back to default values for invalid fields

---

### Requirement: CONFIG-SINGLE-001 - Single-User Mode Compatibility

The system SHALL support a single-user mode where multi-user features are transparent and no explicit user authentication is required.

#### Scenario: Single-user mode detection
- GIVEN instance settings with `multiUserEnabled: false` or missing
- WHEN the system initializes
- THEN the system SHALL operate in single-user mode
- AND use "default" as the effective user ID

#### Scenario: Single-user API compatibility
- GIVEN single-user mode is active
- WHEN frontend calls `api.getUserPreference('interfaceStyle')`
- THEN the system SHALL return the preference without requiring user ID parameter

---

### Requirement: CONFIG-MIGRATE-001 - Migration from Legacy Format

The system SHALL automatically migrate existing `quiqr-app-config.json` configuration to the new unified format on first run.

#### Scenario: Successful migration
- GIVEN an existing `quiqr-app-config.json` in legacy format
- WHEN the system starts for the first time after upgrade
- THEN the system SHALL extract user preferences to `user_prefs_default.json`
- AND extract instance settings to `instance_settings.json`
- AND preserve the original file as `quiqr-app-config.json.v1-backup`

#### Scenario: Migration marker prevents re-migration
- GIVEN migration has already been completed
- WHEN the system starts
- THEN the system SHALL NOT attempt migration again

#### Scenario: Migration preserves all data
- GIVEN legacy config with `prefs.interfaceStyle: "quiqr10-dark"`
- WHEN migration completes
- THEN `user_prefs_default.json` SHALL contain `preferences.interfaceStyle: "quiqr10-dark"`

---

### Requirement: CONFIG-API-001 - Unified Configuration API

The system SHALL expose a unified API for reading and writing configuration that abstracts the layered resolution.

#### Scenario: Reading resolved preference
- GIVEN a configured user with layered preferences
- WHEN frontend calls `api.getEffectivePreference('interfaceStyle', userId)`
- THEN the system SHALL return the resolved value after applying all layers

#### Scenario: Writing user preference
- GIVEN a user in multi-user mode
- WHEN frontend calls `api.setUserPreference('interfaceStyle', 'quiqr10-dark', userId)`
- THEN the system SHALL update only the user's preference file
- AND NOT modify instance or group settings

#### Scenario: Reading instance setting
- GIVEN an instance with configured storage
- WHEN frontend calls `api.getInstanceSetting('storage.type')`
- THEN the system SHALL return the instance-level setting

---

## Cross-References

- **backend-architecture**: Container and service patterns
- **type-system**: Zod schema conventions
- **dependency-injection**: Container integration
