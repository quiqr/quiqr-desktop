---
sidebar_position: 1
---

# General Preferences

General preferences control basic application behavior and appearance in Quiqr Desktop.

## Quiqr Data Folder

The Quiqr Data Folder is the central location where Quiqr Desktop stores all your sites, workspaces, and temporary files.

### Default Locations

- **Linux:** `~/.local/share/quiqr/`
- **macOS:** `~/Library/Application Support/quiqr/`
- **Windows:** `%AppData%\quiqr\`

### Changing the Data Folder

You can customize the data folder location through the preferences interface:

1. Open **Preferences** from the main menu
2. Navigate to **General** settings
3. Click **Choose Folder** next to the Quiqr Data Folder setting
4. Select your desired location
5. Restart Quiqr Desktop for changes to take effect

:::warning Important
Changing the data folder location will not automatically migrate existing sites. You'll need to manually copy your site data to the new location or re-import your sites.
:::

### What's Stored in the Data Folder

The data folder contains:
- **Sites:** All imported Hugo/Quarto site configurations
- **Workspaces:** Content and workspace-specific settings for each site
- **Cache:** Temporary build files and preview data
- **Logs:** Application and build logs for troubleshooting

:::tip Backup Recommendation
The Quiqr Data Folder contains all your site content and configurations. Back up this folder regularly to prevent data loss.
:::

## Interface Style

Quiqr Desktop supports both light and dark interface themes to match your preference and reduce eye strain.

### Available Themes

- **Light:** Traditional light interface with dark text on light backgrounds
- **Dark:** Dark interface with light text on dark backgrounds

### Changing the Theme

1. Open **Preferences** from the main menu
2. Navigate to **General** settings
3. Select your preferred theme from the **Interface Style** dropdown
4. The theme will be applied immediately (no restart required)

:::tip System Theme
Future versions of Quiqr Desktop may support automatic theme switching based on your operating system's theme preference.
:::

## Related Configuration

- [Variables](./variables.md) - Configure global variables for build actions
- [Advanced Settings](./advanced-settings.md) - Power-user configuration options
