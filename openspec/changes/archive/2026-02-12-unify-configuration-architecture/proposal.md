# Change Proposal: Unify Configuration Architecture

**Change ID:** `unify-configuration-architecture`
**Status:** Draft
**Created:** 2026-02-12
**GitHub Issue:** [#629](https://github.com/quiqr/quiqr-desktop/issues/629)

## Summary

Redesign the configuration system from a single-user model to a unified, multi-user/multi-instance architecture that supports both local desktop deployments and server-based deployments with multiple users.

## Problem Statement

The current configuration system was designed for a single-user desktop application paradigm:

- **1 app = 1 user** → settings ≡ preferences

This model doesn't scale for:
- Multi-user server deployments
- Enterprise environments with default/forced preferences
- Instance-level settings separate from user preferences
- Group-based configuration inheritance

The current `AppConfig` class stores everything in a single flat JSON file (`quiqr-app-config.json`) mixing instance settings, user preferences, and site-specific state.

## Proposed Solution

Implement a hierarchical, layered configuration system:

```
Quiqr Instance (Local/Online)
  └─ Instance Settings (storage, defaults, forced prefs)
  └─ Groups[group] → preferences
  └─ Users[user] → preferences  
  └─ Sites[site] → settings
```

### Configuration Layers (Precedence: lowest to highest)

1. **App Defaults** - Hardcoded sensible defaults
2. **Instance Defaults** - `instance.settings.user_default_preferences`
3. **Group Preferences** - `instance.groups[group].preferences`
4. **User Preferences** - `instance.users[user].preferences`
5. **Instance Forced** - `instance.settings.user_forced_preferences` (cannot be overridden)

### Configuration Sources

| Source | Use Case |
|--------|----------|
| Hardcoded defaults | Safe fallbacks |
| Config files (`$HOME/.config/quiqr/*.json`) | Persistent settings |
| Environment variables (`QUIQR_*`) | Secrets, deployment config |
| `age`-encrypted files | Sensitive credentials (optional) |

### Storage Location

All configuration files in `$HOME/.config/quiqr/` (platform-equivalent), NOT in the Quiqr data folder:

```
$HOME/.config/quiqr/
  ├── instance_settings.json
  ├── site_settings_[sitekey].json
  └── user_prefs_[user].json
```

## Impact Analysis

### Breaking Changes

- Migration required from current `quiqr-app-config.json` format
- API methods `readConfKey`/`saveConfPrefKey` will need updates
- Zod schemas in `@quiqr/types` will change significantly

### Affected Components

| Component | Impact |
|-----------|--------|
| `packages/backend/src/config/app-config.ts` | Major rewrite |
| `packages/types/src/schemas/config.ts` | New schemas |
| `packages/backend/src/api/handlers/config-handlers.ts` | Updated handlers |
| `packages/frontend/src/api.ts` | Updated API methods |
| Preferences UI (`containers/Prefs/`) | May need updates |

### Dependencies

- Existing `dependency-injection` spec (container pattern)
- `backend-architecture` spec
- `type-system` spec (Zod schemas)

## Success Criteria

1. All configuration persists correctly across app restarts
2. Lift-and-shift migration preserves existing user preferences
3. Environment variables can override file-based config
4. Zod schemas fully document the configuration tree
5. Firefox-style "about:config" property inspection possible
6. Multi-user support without breaking single-user desktop mode

## Out of Scope

- User authentication/authorization system (separate concern)
- Remote configuration sync
- Configuration backup/restore UI

## References

- GitHub Issue: https://github.com/quiqr/quiqr-desktop/issues/629
- Current implementation: `packages/backend/src/config/app-config.ts`
- Current schema: `packages/types/src/schemas/config.ts`
