---
sidebar_position: 4
---

# Configuration

Quiqr Desktop allows you to customize application behavior through global preferences, environment variables, and advanced settings. All preferences are stored in a JSON configuration file on your local system.

## Configuration File Location

The configuration file `quiqr-app-config.json` is stored in platform-specific locations:

- **Linux:** `~/.config/quiqr/quiqr-app-config.json`
- **macOS:** `~/Library/Application Support/quiqr/quiqr-app-config.json`
- **Windows:** `%AppData%\quiqr\quiqr-app-config.json`

:::tip Backup Your Configuration
The configuration file contains important settings for your Quiqr Desktop installation. Consider backing up this file along with your Quiqr Data Folder.
:::

## Configuration Sections

### [General Preferences](./preferences.md)

Configure basic application settings:
- **Quiqr Data Folder:** Location where all sites and temporary files are stored
- **Interface Style:** Choose between Light and Dark themes

### [Variables](./variables.md)

Set global variables that can be used as overrides in build actions. Useful for:
- Custom executable paths that differ across systems
- Environment-specific configuration values
- Template variables for build scripts

### [LLM Provider Configuration](./llm-providers.md)

Configure AI-powered content assistance with support for multiple LLM providers:
- OpenAI (GPT-4, GPT-3.5, o1)
- AWS Bedrock (Claude, Llama, Titan, Cohere, Mistral)
- Anthropic Direct (Claude)
- Google Gemini
- Azure OpenAI
- Mistral AI
- Cohere

### [Advanced Settings](./advanced-settings.md)

Configure power-user features:
- **Custom Open-In Command:** Custom shell commands to open site directories

## Accessing Configuration

Most configuration options can be accessed through the Quiqr Desktop preferences interface. You can also manually edit the `quiqr-app-config.json` file when the application is closed.

:::warning Manual Editing
When manually editing the configuration file, ensure Quiqr Desktop is closed to prevent your changes from being overwritten. Always validate JSON syntax before saving.
:::

## Next Steps

- Learn about [General Preferences](./preferences.md)
- Configure [LLM Providers](./llm-providers.md) for AI features
- Configure [Global Variables](./variables.md)
- Explore [Advanced Settings](./advanced-settings.md)
