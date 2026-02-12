# Design: Unified Configuration Architecture

**Change ID:** `unify-configuration-architecture`

## Overview

This document captures architectural decisions for the unified configuration system that supports both single-user desktop and multi-user server deployments.

## Architecture Decisions

### ADR-1: Configuration Tree Structure

**Context:** Need a hierarchical structure that can represent instance-level settings, group preferences, user preferences, and site settings.

**Decision:** Use a tree-based entity/property structure with dot-notation paths:

```
instance.settings.storage.type          # "fs" | "s3"
instance.settings.storage.dataFolder    # "~/Quiqr"
instance.settings.user_default_preferences.interfaceStyle  # default for new users
instance.settings.user_forced_preferences.logRetentionDays # cannot be overridden
instance.groups[groupId].preferences.interfaceStyle
instance.users[userId].preferences.interfaceStyle
instance.sites[siteKey].settings.hugoVersion
```

**Consequences:**
- Firefox-style "about:config" inspection becomes possible
- Paths can be environment-variable mapped: `QUIQR_STORAGE_DATAFOLDER` → `instance.settings.storage.dataFolder`
- Clear ownership and precedence at each level

### ADR-2: Layered Configuration Precedence

**Context:** Different deployment scenarios require different precedence rules.

**Decision:** Implement 5 configuration layers with merge semantics:

| Layer | Priority | Override-able | Source |
|-------|----------|---------------|--------|
| App Defaults | 1 (lowest) | Yes | Hardcoded |
| Instance Defaults | 2 | Yes | `instance_settings.json` |
| Group Preferences | 3 | Yes | `instance_settings.json` |
| User Preferences | 4 | Yes | `user_prefs_[user].json` |
| Instance Forced | 5 (highest) | No | `instance_settings.json` |

**Resolution Algorithm:**
```typescript
function resolvePreference(key: string, userId: string, groupId?: string): unknown {
  // Check forced preferences first (cannot be overridden)
  if (instanceConfig.settings.user_forced_preferences?.[key] !== undefined) {
    return instanceConfig.settings.user_forced_preferences[key];
  }
  
  // User preference overrides group/default
  if (userConfig[userId]?.preferences?.[key] !== undefined) {
    return userConfig[userId].preferences[key];
  }
  
  // Group preference overrides instance default
  if (groupId && instanceConfig.groups?.[groupId]?.preferences?.[key] !== undefined) {
    return instanceConfig.groups[groupId].preferences[key];
  }
  
  // Instance default overrides app default
  if (instanceConfig.settings.user_default_preferences?.[key] !== undefined) {
    return instanceConfig.settings.user_default_preferences[key];
  }
  
  // App default
  return APP_DEFAULTS[key];
}
```

**Consequences:**
- Admins can enforce policies via forced preferences
- Users retain agency over non-forced settings
- Group-level settings enable team configurations

### ADR-3: File-Based Storage with Environment Override

**Context:** Need persistent storage that works on all platforms while supporting secrets injection.

**Decision:** Use JSON files in platform-specific config directory with environment variable overrides.

**Storage Location:** `$HOME/.config/quiqr/` (Linux), `~/Library/Application Support/quiqr/` (macOS), `%AppData%\quiqr\` (Windows)

**Files:**
```
instance_settings.json    # Instance-level config, defaults, forced prefs, groups
user_prefs_[userId].json  # Per-user preferences (multi-user mode)
site_settings_[key].json  # Per-site settings (optional, for large deployments)
```

**Environment Variable Mapping:**
```
QUIQR_STORAGE_TYPE           → instance.settings.storage.type
QUIQR_STORAGE_DATAFOLDER     → instance.settings.storage.dataFolder
QUIQR_LLM_PROVIDER_0         → instance.settings.llm.providers[0]
QUIQR_SECRETS_*              → age-encrypted secret refs
```

**Consequences:**
- Secrets never stored in plaintext files
- Docker/K8s deployments can inject config via env vars
- File-based config enables version control of instance settings

### ADR-4: Single-User Mode Compatibility

**Context:** Desktop users should not experience complexity from multi-user features.

**Decision:** Implement transparent single-user mode where:
- No explicit user ID required
- `user_prefs_default.json` stores preferences
- Group features disabled
- All APIs work identically (userId defaults to "default")

**Detection:**
```typescript
const isSingleUserMode = !instanceConfig.settings.multiUserEnabled;
const effectiveUserId = isSingleUserMode ? 'default' : authenticatedUserId;
```

**Consequences:**
- Zero behavior change for existing desktop users
- Migration path preserves all current preferences
- Same codebase supports both modes

### ADR-5: Zod Schema Organization

**Context:** Need comprehensive type definitions for the new configuration tree.

**Decision:** Organize schemas in `@quiqr/types`:

```typescript
// packages/types/src/schemas/config.ts

// Leaf value schemas (reusable)
const storageTypeSchema = z.enum(['fs', 's3', 'gcs']);
const interfaceStyleSchema = z.enum(['quiqr10-light', 'quiqr10-dark']);

// Preference schemas (user-configurable)
const userPreferencesSchema = z.object({
  interfaceStyle: interfaceStyleSchema.optional(),
  dataFolder: z.string().optional(),
  // ... all preference keys
});

// Instance settings schema
const instanceSettingsSchema = z.object({
  multiUserEnabled: z.boolean().default(false),
  storage: z.object({
    type: storageTypeSchema.default('fs'),
    dataFolder: z.string().default('~/Quiqr'),
  }),
  user_default_preferences: userPreferencesSchema.optional(),
  user_forced_preferences: userPreferencesSchema.partial().optional(),
});

// Group schema
const groupConfigSchema = z.object({
  name: z.string(),
  preferences: userPreferencesSchema.partial().optional(),
});

// Full instance config
const instanceConfigSchema = z.object({
  settings: instanceSettingsSchema,
  groups: z.record(z.string(), groupConfigSchema).optional(),
});

// User config (separate file)
const userConfigSchema = z.object({
  userId: z.string(),
  preferences: userPreferencesSchema,
  groupId: z.string().optional(),
});
```

**Consequences:**
- Full TypeScript inference for all config paths
- Runtime validation of config files
- Self-documenting configuration structure

### ADR-6: Migration Strategy

**Context:** Existing users have preferences in `quiqr-app-config.json`.

**Decision:** Implement automatic migration on first run with new version:

1. Detect old config format
2. Extract user preferences → `user_prefs_default.json`
3. Extract instance-level settings → `instance_settings.json`
4. Preserve old file as backup: `quiqr-app-config.json.v1-backup`
5. Write migration marker to prevent re-migration

**Mapping:**
```
OLD                           → NEW
lastOpenedSite               → instance.users[key].lastOpenedSite
prefs.*                      → user_prefs_default.preferences.*
skipWelcomeScreen            → user_prefs_default.preferences.skipWelcomeScreen
experimentalFeatures         → instance.settings.experimentalFeatures
devLocalApi                  → instance.settings.dev.localApi
hugoServeDraftMode           → instance.sites[key].hugo.serveDraftMode 
lastOpenedPublishTargetForSite → instance.sites[key].lastPublishTarget
```

**Consequences:**
- Zero data loss for existing users
- Rollback possible via backup file
- Clear mapping enables automated validation

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  api.getConfig('instance.settings.storage.type')           │
│  api.setUserPreference('interfaceStyle', 'dark')           │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼───────────────────────────────────┐
│                     Backend (Express)                       │
│  ConfigHandlers → UnifiedConfigService                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              UnifiedConfigService                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ConfigResolver                                       │  │
│  │  - resolveValue(path, userId, groupId)               │  │
│  │  - getEffectivePreferences(userId)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ConfigStore                                          │  │
│  │  - loadInstanceConfig()                              │  │
│  │  - loadUserConfig(userId)                            │  │
│  │  - saveUserPreference(userId, key, value)            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  EnvOverrideLayer                                     │  │
│  │  - getEnvOverride(configPath)                        │  │
│  │  - QUIQR_* env var mapping                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Open Questions

1. **Site-level settings file granularity:** Should each site have its own file, or store all in `instance_settings.json`?
   - Recommendation: Separate files for deployments with many sites

> Answer: Seperate files

2. **Group membership storage:** Where to store user-to-group mappings in multi-user mode?
   - Recommendation: In `instance_settings.json` for admin control

> Answer: This is out of scope for now. This is a seperate concern.

3. **Config file permissions:** Should config files have restricted permissions (0600)?
   - Recommendation: Yes, especially for files that may contain secrets

> Anser: Out of scope: This is not a concern for the Quiqr application.

## Alternatives Considered

### Alternative A: SQLite Database
- Pros: Atomic writes, querying capability
- Cons: Binary format, harder to debug, overkill for config

### Alternative B: Single Merged Config File
- Pros: Simpler implementation
- Cons: Multi-user editing conflicts, large file for many users

### Alternative C: Platform Keychain for Secrets
- Pros: OS-level security
- Cons: Cross-platform complexity, not scriptable
- Decision: May add as optional enhancement later
