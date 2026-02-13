---
sidebar_position: 4
---

# Migration Guide

When upgrading from older versions of Quiqr Desktop, your configuration is automatically migrated to the new unified configuration system.

## Automatic Migration

Migration happens automatically on first startup after upgrading. The process:

1. **Detects** the legacy `quiqr-app-config.json` file
2. **Creates a backup** at `quiqr-app-config.json.v1-backup`
3. **Migrates settings** to the new file format
4. **Creates a marker** file to prevent re-migration

No action is required from users - your settings will be preserved.

## What Gets Migrated

### User Preferences

| Legacy Path | New Location |
|-------------|--------------|
| `prefs.dataFolder` | `user_prefs_default.json` → `preferences.dataFolder` |
| `prefs.interfaceStyle` | `user_prefs_default.json` → `preferences.interfaceStyle` |
| `prefs.sitesListingView` | `user_prefs_default.json` → `preferences.sitesListingView` |
| `prefs.libraryView` | `user_prefs_default.json` → `preferences.libraryView` |
| `prefs.showSplashAtStartup` | `user_prefs_default.json` → `preferences.showSplashAtStartup` |
| `prefs.logRetentionDays` | `user_prefs_default.json` → `preferences.logRetentionDays` |
| `prefs.systemGitBinPath` | `user_prefs_default.json` → `preferences.systemGitBinPath` |
| `prefs.customOpenInCommand` | `user_prefs_default.json` → `preferences.customOpenInCommand` |

### Session State

| Legacy Path | New Location |
|-------------|--------------|
| `lastOpenedSite` | `user_prefs_default.json` → `lastOpenedSite` |
| `lastOpenedPublishTargetForSite` | `user_prefs_default.json` → `lastOpenedPublishTargetForSite` |
| `skipWelcomeScreen` | `user_prefs_default.json` → `skipWelcomeScreen` |

### Instance Settings

| Legacy Path | New Location |
|-------------|--------------|
| `experimentalFeatures` | `instance_settings.json` → `experimentalFeatures` |
| `dev.*` | `instance_settings.json` → `dev.*` |
| `hugo.*` | `instance_settings.json` → `hugo.*` |
| `disablePartialCache` | `instance_settings.json` → `disablePartialCache` |

## Configuration File Locations

After migration, your configuration will be in these locations:

### Electron App (Production)

| Platform | Configuration Directory |
|----------|------------------------|
| **Linux** | `~/.config/quiqr/` |
| **macOS** | `~/Library/Application Support/quiqr/` |
| **Windows** | `%AppData%\quiqr\` |

Files created:
- `instance_settings.json` - Instance-level settings
- `user_prefs_default.json` - User preferences
- `.migration-complete` - Migration marker

### Standalone Development

Configuration directory: `~/.quiqr-standalone/`

## Manual Migration

If automatic migration fails, you can manually migrate:

1. **Locate your legacy config**:
   ```bash
   # Linux
   cat ~/.config/quiqr/quiqr-app-config.json
   
   # macOS
   cat ~/Library/Application\ Support/quiqr/quiqr-app-config.json
   
   # Windows (PowerShell)
   Get-Content "$env:APPDATA\quiqr\quiqr-app-config.json"
   ```

2. **Create the new config files** based on the mappings above

3. **Create the migration marker**:
   ```bash
   touch ~/.config/quiqr/.migration-complete  # Linux
   ```

## Troubleshooting

### Settings Not Preserved

If your settings weren't preserved after migration:

1. Check for a backup file: `quiqr-app-config.json.v1-backup`
2. The backup contains your original settings
3. You can manually copy values to the new config files

### Re-Running Migration

To force re-migration:

1. Delete the `.migration-complete` marker file
2. Restore the backup: `cp quiqr-app-config.json.v1-backup quiqr-app-config.json`
3. Delete the new config files
4. Restart Quiqr

### Migration Errors

Migration errors are logged to the console. Check:
- Server startup logs for migration status
- The backup file exists before troubleshooting

## Rollback

To rollback to the legacy configuration:

1. Stop Quiqr
2. Delete the new config files:
   - `instance_settings.json`
   - `user_prefs_default.json`
   - `.migration-complete`
3. Restore the backup:
   ```bash
   mv quiqr-app-config.json.v1-backup quiqr-app-config.json
   ```
4. Downgrade to an older Quiqr version

:::warning
Rollback requires using an older version of Quiqr that supports the legacy configuration format.
:::
