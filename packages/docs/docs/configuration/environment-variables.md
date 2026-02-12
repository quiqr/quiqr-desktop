---
sidebar_position: 3
---

# Environment Variables

Quiqr Desktop supports configuration via environment variables, allowing you to override settings without modifying configuration files. This is particularly useful for:

- CI/CD pipelines
- Docker deployments
- Testing different configurations
- Enforcing settings across multiple installations

## Variable Naming Convention

Environment variables use the `QUIQR_` prefix followed by the setting path in uppercase with underscores:

```
QUIQR_<SETTING_PATH>
```

For nested settings, use underscores to separate path segments:

```
QUIQR_STORAGE_TYPE=s3
QUIQR_DEV_LOCAL_API=true
```

## Standard Mappings

These environment variables have predefined mappings to configuration settings:

### Storage Settings

| Variable | Config Path | Type | Description |
|----------|-------------|------|-------------|
| `QUIQR_STORAGE_TYPE` | `instance.storage.type` | string | Storage backend type (`fs` or `s3`) |
| `QUIQR_STORAGE_DATAFOLDER` | `instance.storage.dataFolder` | string | Path to data folder |

### Feature Flags

| Variable | Config Path | Type | Description |
|----------|-------------|------|-------------|
| `QUIQR_EXPERIMENTAL_FEATURES` | `instance.experimentalFeatures` | boolean | Enable experimental features |
| `QUIQR_DISABLE_PARTIAL_CACHE` | `instance.disablePartialCache` | boolean | Disable partial caching |

### Developer Settings

| Variable | Config Path | Type | Description |
|----------|-------------|------|-------------|
| `QUIQR_DEV_LOCAL_API` | `instance.dev.localApi` | boolean | Use local API endpoint |
| `QUIQR_DEV_DISABLE_AUTO_HUGO_SERVE` | `instance.dev.disableAutoHugoServe` | boolean | Disable automatic Hugo server |
| `QUIQR_DEV_SHOW_CURRENT_USER` | `instance.dev.showCurrentUser` | boolean | Show current user in UI |

### Hugo Settings

| Variable | Config Path | Type | Description |
|----------|-------------|------|-------------|
| `QUIQR_HUGO_SERVE_DRAFT_MODE` | `instance.hugo.serveDraftMode` | boolean | Serve draft content in preview |

## Auto-Discovery

Variables with the `QUIQR_` prefix that have at least two path segments are automatically discovered and mapped. The variable name is converted to a configuration path:

```
QUIQR_SOME_NESTED_SETTING → some.nested.setting
```

### Type Inference

Values are automatically converted based on their content:

| Value Pattern | Inferred Type | Example |
|---------------|---------------|---------|
| `true`, `false`, `TRUE`, `FALSE` | boolean | `QUIQR_FEATURE=true` |
| Integer numbers | number | `QUIQR_PORT=3000` |
| Decimal numbers | number | `QUIQR_RATIO=1.5` |
| JSON syntax | object/array | `QUIQR_CONFIG={"key":"value"}` |
| Everything else | string | `QUIQR_NAME=mysite` |

## Examples

### Basic Usage

```bash
# Set storage location
export QUIQR_STORAGE_DATAFOLDER="/custom/data/path"

# Enable experimental features
export QUIQR_EXPERIMENTAL_FEATURES=true

# Start Quiqr
npm run dev
```

### Development Configuration

```bash
# Development settings
export QUIQR_DEV_LOCAL_API=true
export QUIQR_DEV_DISABLE_AUTO_HUGO_SERVE=true
export QUIQR_HUGO_SERVE_DRAFT_MODE=true

npm run dev:backend:standalone
```

### Docker Deployment

```dockerfile
ENV QUIQR_STORAGE_TYPE=s3
ENV QUIQR_STORAGE_DATAFOLDER=/data
ENV QUIQR_EXPERIMENTAL_FEATURES=false
```

### CI/CD Pipeline

```yaml
env:
  QUIQR_STORAGE_DATAFOLDER: ${{ github.workspace }}/test-data
  QUIQR_DEV_LOCAL_API: true
```

## Priority

Environment variables have the **highest priority** in the configuration layer system. They override:

1. Instance forced preferences
2. User preferences  
3. Instance defaults
4. Application defaults

This means environment variables can override even "locked" settings that users normally cannot change.

## Debugging

To see which environment variables are being applied, check the server startup logs. Applied overrides are logged when the configuration system initializes.
