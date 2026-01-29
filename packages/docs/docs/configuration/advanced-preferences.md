---
sidebar_position: 3
---

# Advanced preferences

Advanced settings provide power-user features for customizing Quiqr Desktop's behavior and integrating with external tools.

## Custom Open-In Command

The custom open-in command allows you to define a shell command that executes when you click the "Open Site" icon in the Site Toolbox section.

![Custom Open-In Command Location](/img/configuration/custom-open-in-command.png)

### Use Cases

Common use cases include:
- **Open in terminal:** Launch a terminal window in the site directory
- **Open in IDE:** Start your preferred code editor with the site loaded
- **Custom workflows:** Execute scripts that set up your development environment

### Available Variables

You can use these variables in your command:
- `%SITE_PATH`: Full path to the site directory
- `%SITE_NAME`: Name of the current site

### Example Commands

#### Open in Visual Studio Code

```bash
code "%SITE_PATH"
```

#### Open in Terminal (macOS)

```bash
open -a Terminal "%SITE_PATH"
```

#### Open in Windows Terminal

```cmd
wt -d "%SITE_PATH"
```

#### Open in tmux Session

This example creates a new tmux window for the site (requires an existing tmux session named `quiqr-data`):

```bash
zsh -c "tmux new-window -d -n '%SITE_NAME' -c '%SITE_PATH' -t quiqr-data:"
```

#### Open in iTerm2 (macOS)

```bash
open -a iTerm "%SITE_PATH"
```

### Configuration

**Through the UI:**
1. Open **Preferences** from the main menu
2. Navigate to **Advanced** settings
3. Enter your command in the **Custom Open-In Command** field
4. Click **Save**

**Manual Configuration:**

Edit `quiqr-app-config.json`:

```json
{
  "prefs": {
    "customOpenCommand": "code \"%SITE_PATH\""
  }
}
```

:::tip Platform-Specific Commands
You can use different commands on different platforms by checking the OS in your script or by maintaining separate configuration files.
:::

## OpenAI API Key

When configured with a valid OpenAI API key, Quiqr Desktop enables AI-powered text assistance for all text fields in your content forms.

![OpenAI Assistant Popup](/img/configuration/openai-assistant-popup.png)

### Features

The OpenAI assistant provides:
- **Content suggestions:** Generate text based on prompts
- **Text improvements:** Enhance existing content with AI
- **Quick actions:** Common writing tasks like summarizing, expanding, or rephrasing

### Configuration

**Through the UI:**
1. Open **Preferences** from the main menu
2. Navigate to **Advanced** settings
3. Enter your OpenAI API key in the **OpenAI API Key** field
4. Click **Save**

**Manual Configuration:**

Edit `quiqr-app-config.json`:

```json
{
  "prefs": {
    "openaiApiKey": "sk-your-api-key-here"
  }
}
```

### Obtaining an API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key and paste it into Quiqr Desktop preferences

:::warning API Costs
OpenAI API usage incurs costs based on the number of tokens processed. Monitor your usage on the OpenAI dashboard to avoid unexpected charges.
:::

:::warning Security
Your API key is stored in plain text in the configuration file. Protect this file with appropriate file system permissions. Never share your configuration file or commit it to version control.
:::

### Using the Assistant

Once configured, the AI assistant is available in all text fields:
1. Click the **AI Assistant** icon in the field toolbar
2. Choose an action (Generate, Improve, Summarize, etc.)
3. Provide any necessary prompts or context
4. Review and accept or modify the AI-generated content

### Disabling the Assistant

To disable the AI assistant:
1. Open **Preferences** from the main menu
2. Navigate to **Advanced** settings
3. Clear the **OpenAI API Key** field
4. Click **Save**

## Related Configuration

- [General Preferences](./preferences.md) - Basic application settings
- [Variables](./variables.md) - Configure global variables for build actions
