---
sidebar_position: 2
---

# build

The `build` property configures how Hugo builds your site for production. This determines the command and environment used when generating the final static site.

## Basic Structure

```yaml
build:
  command: hugo --minify
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | No | Hugo build command (default: `hugo`) |
| `environment` | object | No | Environment variables for build |
| `flags` | array | No | Additional command-line flags |

## Examples

### Example 1: Basic Build

```yaml
build:
  command: hugo
```

This uses the default Hugo build command.

### Example 2: Minified Build

```yaml
build:
  command: hugo --minify
```

Builds with minification enabled for smaller file sizes.

### Example 3: Production Build with Environment

```yaml
build:
  command: hugo --minify --gc
  environment:
    HUGO_ENV: production
    NODE_ENV: production
```

Sets production environment variables and enables garbage collection.

### Example 4: Custom Destination

```yaml
build:
  command: hugo --destination public --cleanDestinationDir
```

Specifies output directory and cleans it before building.

### Example 5: Build with Base URL

```yaml
build:
  command: hugo --baseURL https://example.com --minify
  environment:
    HUGO_ENV: production
```

## Common Build Commands

### Basic Commands

```yaml
# Standard build
build:
  command: hugo

# Fast build (skip cache)
build:
  command: hugo --ignoreCache

# Build with drafts
build:
  command: hugo -D
```

### Production Builds

```yaml
# Production with minification
build:
  command: hugo --minify --gc

# Production with environment
build:
  command: hugo --minify
  environment:
    HUGO_ENV: production
    
# Full production build
build:
  command: hugo --minify --gc --cleanDestinationDir
  environment:
    HUGO_ENV: production
```

### Advanced Builds

```yaml
# Multi-language build
build:
  command: hugo --minify --enableGitInfo

# Build with custom config
build:
  command: hugo --config config.yaml,config.production.yaml

# Build with theme
build:
  command: hugo --theme my-theme --minify
```

## Environment Variables

Common environment variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `HUGO_ENV` | Hugo environment | `production`, `development` |
| `NODE_ENV` | Node environment | `production` |
| `HUGO_VERSION` | Force Hugo version | `0.120.0` |
| `HUGO_CACHEDIR` | Cache directory | `/tmp/hugo_cache` |

Example:

```yaml
build:
  command: hugo --minify
  environment:
    HUGO_ENV: production
    HUGO_CACHEDIR: /tmp/hugo_cache
    NODE_ENV: production
```

## Hugo Build Flags

Common flags:

| Flag | Description |
|------|-------------|
| `--minify` | Minify HTML, CSS, JS |
| `--gc` | Run garbage collection |
| `--cleanDestinationDir` | Clean destination before build |
| `--destination <dir>` | Output directory |
| `--baseURL <url>` | Base URL for site |
| `-D` | Include drafts |
| `-F` | Include future posts |
| `-E` | Include expired posts |
| `--ignoreCache` | Ignore cache directory |
| `--enableGitInfo` | Enable Git info |

## Best Practices

1. **Use minification** - Always minify for production
2. **Set HUGO_ENV** - Helps conditional logic in templates
3. **Clean destination** - Prevents stale files
4. **Use --gc** - Helps with memory on large sites
5. **Test locally** - Verify build command works before deploying

## Build vs Serve

| Aspect | Build | Serve |
|--------|-------|-------|
| Purpose | Production output | Development preview |
| Speed | Slower (optimized) | Faster (live reload) |
| Minification | Usually yes | Usually no |
| Drafts | Usually no | Usually yes |
| Watch | No | Yes |

## Use Cases

### Blog Site

```yaml
build:
  command: hugo --minify
  environment:
    HUGO_ENV: production
```

### Documentation Site

```yaml
build:
  command: hugo --minify --enableGitInfo
  environment:
    HUGO_ENV: production
```

### E-commerce Site

```yaml
build:
  command: hugo --minify --gc --cleanDestinationDir
  environment:
    HUGO_ENV: production
    NODE_ENV: production
```

## Troubleshooting

### Build Fails

Check:
- Hugo command is valid
- All required themes/modules are installed
- Content files have valid frontmatter
- No syntax errors in templates

### Slow Builds

Try:
- Remove `--ignoreCache`
- Use `--gc` flag
- Optimize images before building
- Check for circular references

### Missing Files

Ensure:
- `--cleanDestinationDir` isn't removing needed files
- Output directory has write permissions
- All content files are committed

## Next Steps

- [serve](./serve.md) - Development server configuration
- [hugover](./hugover.md) - Hugo version management
- [Build Actions](../../build-actions/index.md) - Custom build scripts

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
