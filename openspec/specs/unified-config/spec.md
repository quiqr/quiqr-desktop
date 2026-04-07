# Unified Configuration System

**Capability:** `unified-config`
**Related Change:** `unify-configuration-architecture`
**Status:** Implemented (Simplified)
**Last Updated:** 2026-02-24

## Purpose

This capability defines the simplified unified configuration system with a 2-layer architecture (App Defaults → User Preferences) for single-user desktop deployments, providing clear separation between instance settings and user preferences.

## Overview

This specification describes the implemented unified configuration system with a 2-layer architecture (App Defaults → User Preferences) for single-user desktop deployments.

**Architecture Change (2026-02-24):** This implementation uses a simplified 2-layer system instead of the originally proposed 5-layer system. The following features were removed to reduce complexity:
- Forced/overridable preferences
- Group-based preferences
- Instance default preferences layer
- Site-specific settings (deferred to future)

**Current Implementation:**
- **Layer 1**: App Defaults (hardcoded in ConfigResolver)
- **Layer 2**: User Preferences (from `user_prefs_ELECTRON.json`)
- **Instance Settings**: Direct access (not layered), can be overridden by environment variables
- **User State**: lastOpenedSite, skipWelcomeScreen, etc. (stored in user config, not layered)

## Requirements

### Requirement: CONFIG-TREE-001 - Hierarchical Configuration Tree

The system SHALL organize configuration as a hierarchical tree with dot-notation paths supporting instance settings and user preferences.

**Note:** Groups and multi-user features are deferred to future changes.

#### Scenario: Accessing instance storage setting
- GIVEN a Quiqr instance with configured storage
- WHEN the system requests `storage.type` via getInstanceSetting()
- THEN the system SHALL return the configured storage type ("fs" or "s3")

#### Scenario: Accessing user preference
- GIVEN a user with configured interface style
- WHEN the system requests `interfaceStyle` via getEffectivePreference()
- THEN the system SHALL return the user's interface style preference

---

### Requirement: CONFIG-LAYER-001 - Simplified 2-Layer Configuration Precedence

The system SHALL resolve configuration values through 2 layers: App Defaults (lowest priority) and User Preferences (highest priority).

**Removed:** Instance defaults, forced preferences, and group preferences have been removed from this simplified architecture.

#### Scenario: User preference overrides app default
- GIVEN app default `interfaceStyle` is "quiqr10-light"
- AND user preference `interfaceStyle` is "quiqr10-dark"
- WHEN resolving `interfaceStyle` for the user
- THEN the system SHALL return "quiqr10-dark" with source='user'

#### Scenario: App defaults used when no user preference exists
- GIVEN app default `interfaceStyle` is "quiqr10-light"
- AND no user preference is set for `interfaceStyle`
- WHEN resolving `interfaceStyle` for the user
- THEN the system SHALL return "quiqr10-light" with source='app-default'

#### Scenario: Instance settings are not layered
- GIVEN instance setting `storage.dataFolder` is "/custom/path"
- WHEN resolving instance setting `storage.dataFolder`
- THEN the system SHALL return "/custom/path" directly without layer resolution

---

### Requirement: CONFIG-FILE-001 - File-Based Persistent Storage

The system SHALL store configuration in JSON files in the platform-specific configuration directory: `$HOME/.config/quiqr/` (Linux), `~/Library/Application Support/quiqr/` (macOS), `%AppData%\quiqr\` (Windows).

#### Scenario: Instance settings file location
- GIVEN a Linux system
- WHEN the system loads instance configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/instance_settings.json`

#### Scenario: User preferences file for Electron edition
- GIVEN a single-user Electron desktop deployment
- WHEN the system loads user configuration
- THEN the system SHALL read from `$HOME/.config/quiqr/user_prefs_ELECTRON.json`
- AND use "ELECTRON" as the default userId

#### Scenario: Site settings (Future)
Site-specific settings files (`site_settings_*.json`) are supported in the codebase but not currently used in the simplified architecture. This feature is deferred to a future change.

---

### Requirement: CONFIG-ENV-001 - Environment Variable Override

The system SHALL allow environment variables with `QUIQR_` prefix to override file-based configuration values using path mapping.

#### Scenario: Storage data folder override
- GIVEN `QUIQR_STORAGE_DATAFOLDER` environment variable is set to "/data/quiqr"
- AND instance settings file specifies `storage.dataFolder` as "~/Quiqr"
- WHEN resolving `storage.dataFolder`
- THEN the system SHALL return "/data/quiqr"

#### Scenario: Environment override precedence
- GIVEN `QUIQR_STORAGE_TYPE` is set to "s3"
- AND instance settings file specifies storage type as "fs"
- WHEN resolving storage type
- THEN the system SHALL return "s3" (environment overrides instance settings file)

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

### Requirement: CONFIG-SINGLE-001 - Single-User Electron Mode

The system SHALL operate in single-user mode for Electron desktop deployments using "ELECTRON" as the user ID.

**Note:** Multi-user support is deferred to future changes.

#### Scenario: Electron user ID
- GIVEN an Electron desktop deployment
- WHEN the system initializes UnifiedConfigService
- THEN the system SHALL use "ELECTRON" as the default user ID
- AND create/read from `user_prefs_ELECTRON.json`

#### Scenario: Single-user API
- GIVEN the Electron edition
- WHEN frontend calls `api.getEffectivePreference('interfaceStyle')`
- THEN the system SHALL return the preference for the ELECTRON user
- WITHOUT requiring an explicit user ID parameter

---

### ~~Requirement: CONFIG-MIGRATE-001 - Migration from Legacy Format~~ (REMOVED)

**Decision:** No migration will be implemented.

**Rationale:**
- Current user base is small with minimal existing settings
- Hardcoded defaults provide comprehensive initial configuration
- Migration complexity not justified by current usage
- Clean break enables simpler implementation

Users will start with fresh configuration using hardcoded defaults when upgrading to the unified configuration system.

---

### Requirement: CONFIG-API-001 - Unified Configuration API

The system SHALL expose a unified API for reading and writing configuration that abstracts the layered resolution.

#### Scenario: Reading resolved preference
- GIVEN a configured user with layered preferences
- WHEN frontend calls `api.getEffectivePreference('interfaceStyle', userId)`
- THEN the system SHALL return the resolved value after applying all layers

#### Scenario: Writing user preference
- GIVEN the ELECTRON user
- WHEN frontend calls `api.setUserPreference('interfaceStyle', 'quiqr10-dark')`
- THEN the system SHALL update `user_prefs_ELECTRON.json`
- AND NOT modify instance settings

#### Scenario: Reading instance setting
- GIVEN an instance with configured storage
- WHEN frontend calls `api.getInstanceSetting('storage.type')`
- THEN the system SHALL return the instance-level setting

### Requirement: Auth Configuration in Instance Settings

The instance settings schema SHALL include an `auth` configuration block for authentication settings.

#### Scenario: Auth config structure
- **WHEN** reading instance settings
- **THEN** the `auth` property SHALL be an optional object with:
  - `enabled`: boolean (default: false)
  - `provider`: string (`"local"` for Phase 1)
  - `local`: object with `usersFile` (string, default: `"users.json"`)
  - `session`: object with `secret` (string), `accessTokenExpiry` (string, default: `"15m"`), `refreshTokenExpiry` (string, default: `"7d"`)

#### Scenario: Auth config validated with Zod
- **WHEN** instance settings are loaded
- **THEN** the `auth` block SHALL be validated against a Zod schema
- **AND** missing optional fields SHALL receive default values

#### Scenario: Session secret auto-generation
- **WHEN** `auth.enabled` is `true`
- **AND** `auth.session.secret` is not set
- **THEN** the system SHALL generate a cryptographically random secret
- **AND** persist it to instance settings

#### Scenario: Environment variable overrides
- **WHEN** `QUIQR_AUTH_ENABLED` is set
- **THEN** it SHALL override `auth.enabled` in instance settings
- **AND** `QUIQR_AUTH_SESSION_SECRET` SHALL override `auth.session.secret`

---

## Cross-References

- **backend-architecture**: Container and service patterns
- **type-system**: Zod schema conventions
- **dependency-injection**: Container integration
