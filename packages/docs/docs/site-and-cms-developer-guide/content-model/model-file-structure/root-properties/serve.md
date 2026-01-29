---
sidebar_position: 3
---

# serve

The `serve` property configures the Hugo development server used for previewing your site in Quiqr. This server runs locally and provides live reload capabilities.

## Basic Structure

```yaml
serve:
  command: hugo server -D
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | No | Hugo server command (default: `hugo server`) |
| `port` | number | No | Port number (default: 1313) |
| `host` | string | No | Host address (default: localhost) |
| `environment` | object | No | Environment variables for server |

## Examples

### Example 1: Basic Server

```yaml
serve:
  command: hugo server
```

Default server on port 1313.

### Example 2: Server with Drafts

```yaml
serve:
  command: hugo server -D
```

Includes draft posts in preview (most common for development).

### Example 3: Custom Port

```yaml
serve:
  command: hugo server -D --port 3000
  port: 3000
```

### Example 4: Full Development Server

```yaml
serve:
  command: hugo server -D -F --disableFastRender
  environment:
    HUGO_ENV: development
```

Includes drafts (`-D`), future posts (`-F`), and disables fast render for more accurate previews.

### Example 5: Network Access

```yaml
serve:
  command: hugo server -D --bind 0.0.0.0
  host: 0.0.0.0
```

Allows access from other devices on network.

## Common Server Commands

### Basic Development

```yaml
# Standard dev server
serve:
  command: hugo server -D

# With future posts
serve:
  command: hugo server -D -F

# With expired posts
serve:
  command: hugo server -D -E

# All content visible
serve:
  command: hugo server -D -F -E
```

### Performance Options

```yaml
# Fast render (default)
serve:
  command: hugo server -D

# Disable fast render (more accurate)
serve:
  command: hugo server -D --disableFastRender

# No live reload
serve:
  command: hugo server -D --watch=false

# Specific poll interval
serve:
  command: hugo server -D --poll 1s
```

### Advanced Options

```yaml
# Verbose logging
serve:
  command: hugo server -D --verbose

# Debug mode
serve:
  command: hugo server -D --debug

# Custom base URL
serve:
  command: hugo server -D --baseURL http://localhost:1313
```

## Hugo Server Flags

Common flags for `hugo server`:

| Flag | Description |
|------|-------------|
| `-D` | Include draft content |
| `-F` | Include future-dated content |
| `-E` | Include expired content |
| `--port <num>` | Port number (default: 1313) |
| `--bind <addr>` | Bind address (default: 127.0.0.1) |
| `--disableFastRender` | Full re-render on changes |
| `--watch` | Watch filesystem for changes (default: true) |
| `--poll <duration>` | Poll interval for file changes |
| `--navigateToChanged` | Navigate to changed page |
| `--renderToDisk` | Render to disk instead of memory |
| `--verbose` | Verbose logging |
| `--debug` | Debug output |

## Port Configuration

### Default Port

```yaml
serve:
  command: hugo server -D
  # Uses port 1313
```

### Custom Port

```yaml
serve:
  command: hugo server -D --port 3000
  port: 3000
```

### Random Available Port

```yaml
serve:
  command: hugo server -D --port 0
```

Hugo will choose an available port automatically.

## Environment Variables

```yaml
serve:
  command: hugo server -D
  environment:
    HUGO_ENV: development
    NODE_ENV: development
```

## Best Practices

1. **Include drafts** - Use `-D` flag for development
2. **Consider future posts** - Add `-F` if needed
3. **Disable fast render for accuracy** - Use `--disableFastRender` if seeing issues
4. **Use default port** - 1313 is the standard Hugo port
5. **Watch for changes** - Keep `--watch` enabled (default)

## Serve vs Build

| Aspect | Serve | Build |
|--------|-------|-------|
| Purpose | Development preview | Production output |
| Speed | Faster (in-memory) | Slower (to disk) |
| Live reload | Yes | No |
| Drafts | Usually included | Usually excluded |
| Minification | No | Usually yes |
| Output | Memory or temp | Permanent directory |

## Common Use Cases

### Blog Development

```yaml
serve:
  command: hugo server -D -F
  environment:
    HUGO_ENV: development
```

### Documentation Site

```yaml
serve:
  command: hugo server -D --disableFastRender
```

### Multi-language Site

```yaml
serve:
  command: hugo server -D --navigateToChanged
```

### Theme Development

```yaml
serve:
  command: hugo server -D --disableFastRender --renderToDisk
```

## Network Access

Allow other devices to access preview:

```yaml
serve:
  command: hugo server -D --bind 0.0.0.0
  host: 0.0.0.0
  port: 1313
```

Then access from other devices using:
- Desktop: `http://192.168.1.x:1313`
- Mobile: Same URL

## Troubleshooting

### Server Won't Start

Check:
- Port 1313 isn't already in use
- Hugo is installed and accessible
- Site config is valid
- No syntax errors in templates

### Live Reload Not Working

Try:
- Disable fast render: `--disableFastRender`
- Check if `--watch=false` is set
- Verify browser has live reload connection
- Clear browser cache

### Slow Preview

Try:
- Enable fast render (remove `--disableFastRender`)
- Reduce poll frequency
- Check for large image files
- Optimize content processing

### Wrong Content Showing

Ensure:
- Draft status is correct
- Future/expired flags match expectations
- Caches are cleared
- Fast render isn't causing issues

## Next Steps

- [build](./build.md) - Production build configuration
- [hugover](./hugover.md) - Hugo version management
- [Preview Configuration](./singles.md#preview-configuration) - Content-specific preview

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
