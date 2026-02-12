---
sidebar_position: 20
---

# Configuration Overview

Quiqr Desktop uses a unified configuration system that supports multiple layers of settings, environment variable overrides, and automatic migration from older versions.

## Configuration File Locations

Configuration files are stored in different locations depending on how you run Quiqr:

### Electron App (Production)

| Platform | Location |
|----------|----------|
| **Linux** | `~/.config/quiqr/` |
| **macOS** | `~/Library/Application Support/quiqr/` |
| **Windows** | `%AppData%\quiqr\` |

### Standalone Development Server

When running `npm run dev:backend:standalone`, configuration is stored in:

```
~/.quiqr-standalone/
```

## Configuration Files

The unified configuration system uses these files:

| File | Description |
|------|-------------|
| `instance_settings.json` | Instance-level settings (storage, forced preferences, experimental features) |
| `user_prefs_default.json` | User preferences (theme, data folder, UI settings) |
| `site_settings_<siteKey>.json` | Per-site settings and publish status |

### Legacy Configuration

Older versions of Quiqr used a single `quiqr-app-config.json` file. When upgrading, this file is automatically migrated to the new format. See [Migration](./migration.md) for details.

## Configuration Layers

Settings are resolved using a layered system with the following priority (highest to lowest):

1. **Environment Variables** - Override any setting via `QUIQR_*` variables
2. **Instance Forced** - Admin-enforced settings that users cannot change
3. **User Preferences** - User-configurable settings
4. **Instance Defaults** - Default values set by the instance
5. **Application Defaults** - Built-in default values

This allows administrators to lock certain settings while still giving users control over others.

## Quick Links

- [User Preferences](./preferences.md) - Theme, data folder, and UI settings
- [Environment Variables](./environment-variables.md) - Override settings via environment
- [Migration Guide](./migration.md) - Upgrading from older versions
- [All Settings Reference](./all-settings.md) - Complete settings reference
- [LLM Providers](./llm-providers.md) - AI assistant configuration
