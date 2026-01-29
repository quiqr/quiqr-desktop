---
sidebar_position: 2
---

# Global Variables

Global variables allow you to define reusable values that can be referenced in [build actions](/docs/site-and-cms-developer-guide/content-model/build-actions/). This is particularly useful when executable paths or configuration values differ across development environments.

## Overview

Variables provide a way to:
- **Abstract system-specific paths:** Reference executables that may be installed in different locations on different machines
- **Share configurations:** Define values once and use them across multiple build actions
- **Customize workflows:** Allow different users to configure their own environment without modifying model files

## Variable Naming Rules

Variable names must follow these rules:
- **Alphanumeric characters and underscores only:** Valid examples include `PANDOC_EXECUTABLE`, `pandoc_executable`, `MY_VAR_1`
- **Case sensitive:** `PANDOC_EXECUTABLE` and `pandoc_executable` are treated as different variables
- **No spaces or special characters:** Avoid using spaces, hyphens, or other special characters

### Naming Conventions

While Quiqr doesn't enforce a naming convention, we recommend:
- **UPPER_CASE:** For constants and paths (e.g., `PANDOC_EXECUTABLE`, `NODE_PATH`)
- **lower_case:** For configurable values (e.g., `deploy_branch`, `base_url`)

## Defining Variables

### Through the UI

1. Open **Preferences** from the main menu
2. Navigate to **Variables** section
3. Click **Add Variable**
4. Enter the variable name (e.g., `PANDOC_EXECUTABLE`)
5. Enter the value (e.g., `/usr/local/bin/pandoc`)
6. Click **Save**

### Manual Configuration

You can also manually edit the `quiqr-app-config.json` file:

```json
{
  "prefs": {
    "variables": {
      "PANDOC_EXECUTABLE": "/usr/local/bin/pandoc",
      "NODE_PATH": "/usr/local/bin/node",
      "deploy_branch": "gh-pages"
    }
  }
}
```

:::warning Manual Editing
Ensure Quiqr Desktop is closed before manually editing the configuration file to prevent your changes from being overwritten.
:::

## Using Variables in Build Actions

Variables are referenced using the syntax `{{VARIABLE_NAME}}` in build action commands:

```yaml
build:
  - key: pandoc-pdf
    label: "Generate PDF with Pandoc"
    buildCommands:
      - "{{PANDOC_EXECUTABLE}} input.md -o output.pdf"
```

### Variable Substitution

When a build action runs:
1. Quiqr scans the command for variable references (`{{VARIABLE_NAME}}`)
2. Each variable is replaced with its defined value from global preferences
3. The final command is executed with all variables substituted

### Example: Platform-Specific Paths

Define different paths for the same tool across platforms:

**On macOS:**
```json
{
  "PYTHON_PATH": "/usr/local/bin/python3"
}
```

**On Windows:**
```json
{
  "PYTHON_PATH": "C:\\Python39\\python.exe"
}
```

**In your build action:**
```yaml
buildCommands:
  - "{{PYTHON_PATH}} scripts/deploy.py"
```

## Common Use Cases

### Custom Executable Paths

```json
{
  "PANDOC_EXECUTABLE": "/usr/local/bin/pandoc",
  "HUGO_EXECUTABLE": "/opt/hugo/hugo",
  "GIT_EXECUTABLE": "/usr/bin/git"
}
```

### Deployment Configuration

```json
{
  "DEPLOY_BRANCH": "gh-pages",
  "DEPLOY_REMOTE": "origin",
  "PRODUCTION_URL": "https://example.com"
}
```

### API Keys and Tokens

```json
{
  "DEPLOY_TOKEN": "your-secret-token",
  "API_ENDPOINT": "https://api.example.com"
}
```

:::warning Sensitive Data
Be cautious when storing sensitive values like API keys in global variables. The configuration file is stored in plain text. Consider using environment variables or secret management tools for production deployments.
:::

## Troubleshooting

### Variable Not Replaced

If a variable isn't being replaced:
1. **Check the variable name:** Variable replacement is case-sensitive
2. **Verify the syntax:** Use `{{VARIABLE_NAME}}` (double curly braces)
3. **Confirm the variable exists:** Check your preferences to ensure the variable is defined
4. **Check for typos:** Variable names must match exactly

### Build Action Fails

If a build action fails after variable substitution:
1. **Verify the path:** Ensure executable paths point to valid files
2. **Check permissions:** Ensure the executable has proper permissions
3. **Test manually:** Try running the substituted command in your terminal to verify it works
4. **Review logs:** Check build logs for detailed error messages

## Related Configuration

- [Build Actions](/docs/site-and-cms-developer-guide/content-model/build-actions/) - Learn how to create custom build actions
- [Advanced Settings](./advanced-settings.md) - Configure additional power-user features
