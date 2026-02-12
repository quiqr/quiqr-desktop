---
sidebar_position: 2
---

# User Preferences

User preferences control your personal Quiqr experience. These settings are stored per-user and can be changed through the Preferences UI or configuration files.

## Accessing Preferences

Open the Preferences panel:
- **Menu**: File → Preferences (or Quiqr → Preferences on macOS)
- **Keyboard**: `Ctrl+,` (or `Cmd+,` on macOS)

## General Preferences

### Data Folder

The data folder is where Quiqr stores your sites and content.

| Setting | `dataFolder` |
|---------|--------------|
| **Default** | `~/Quiqr` |
| **Type** | Directory path |

You can change this to any directory where you have read/write permissions. The path supports the `~` shorthand for your home directory.

### Interface Style

Choose between light and dark themes.

| Setting | `interfaceStyle` |
|---------|------------------|
| **Default** | `quiqr10-light` |
| **Options** | `quiqr10-light`, `quiqr10-dark` |

The theme changes immediately when you select a new option.

### Sites Listing View

Control how sites are displayed in the library.

| Setting | `sitesListingView` |
|---------|-------------------|
| **Default** | `all` |
| **Options** | `all`, `recent`, `favorites` |

### Library View

Control the library display mode.

| Setting | `libraryView` |
|---------|---------------|
| **Default** | `default` |

### Show Splash at Startup

Whether to show the welcome splash screen when Quiqr starts.

| Setting | `showSplashAtStartup` |
|---------|----------------------|
| **Default** | `true` |
| **Type** | boolean |

### Log Retention Days

How long to keep log files.

| Setting | `logRetentionDays` |
|---------|-------------------|
| **Default** | `30` |
| **Range** | `0` - `365` days |

Set to `0` to disable log retention (logs are deleted immediately).

## Advanced Preferences

### System Git Path

Path to a custom Git binary.

| Setting | `systemGitBinPath` |
|---------|-------------------|
| **Default** | (uses bundled Git) |
| **Type** | File path |

Only set this if you need to use a specific Git installation instead of the bundled one.

### Custom Open Command

Custom command to open sites in external editors.

| Setting | `customOpenInCommand` |
|---------|----------------------|
| **Default** | (none) |
| **Type** | Command string |

Supports these variables:
- `%SITE_PATH` - Full path to the site directory
- `%SITE_NAME` - Name of the site

Example:
```
code %SITE_PATH
```

## Configuration File

Preferences are stored in `user_prefs_default.json`:

### Electron App Locations

| Platform | Path |
|----------|------|
| **Linux** | `~/.config/quiqr/user_prefs_default.json` |
| **macOS** | `~/Library/Application Support/quiqr/user_prefs_default.json` |
| **Windows** | `%AppData%\quiqr\user_prefs_default.json` |

### Standalone Development

```
~/.quiqr-standalone/user_prefs_default.json
```

### File Format

```json
{
  "userId": "default",
  "preferences": {
    "dataFolder": "~/Quiqr",
    "interfaceStyle": "quiqr10-light",
    "sitesListingView": "all",
    "libraryView": "default",
    "showSplashAtStartup": true,
    "logRetentionDays": 30
  },
  "lastOpenedSite": {
    "siteKey": "my-site",
    "workspaceKey": "main",
    "sitePath": "/home/user/Quiqr/my-site"
  },
  "skipWelcomeScreen": false
}
```

## Locked Preferences

Administrators can lock certain preferences to prevent users from changing them. Locked preferences:

- Are displayed as read-only in the UI
- Cannot be changed through the Preferences panel
- Can only be overridden via environment variables

See [Environment Variables](./environment-variables.md) for override options.
