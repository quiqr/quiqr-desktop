---
sidebar_position: 4
---

# hugover

The `hugover` property specifies the Hugo version required for your site. Quiqr uses this to ensure compatibility and can automatically download the correct Hugo version.

## Basic Structure

```yaml
hugover: "0.120.0"
```

## Format

The Hugo version should be specified as a string:

```yaml
hugover: "0.120.0"  # Exact version
```

## Examples

### Example 1: Specific Version

```yaml
hugover: "0.120.0"
```

Requires exactly Hugo 0.120.0.

### Example 2: Minimum Version

```yaml
hugover: "0.80.0"
```

Requires Hugo 0.80.0 or newer (but check Hugo's breaking changes).

### Example 3: Extended Version

```yaml
hugover: "0.120.0"
```

Note: Quiqr typically uses Hugo extended edition by default, which includes Sass/SCSS processing.

## Why Specify Hugo Version?

1. **Compatibility** - Ensures your site works with a specific Hugo version
2. **Consistency** - Team members use the same version
3. **CI/CD** - Deployment uses correct version
4. **Auto-download** - Quiqr can download the specified version
5. **Avoid breaks** - Hugo sometimes has breaking changes between versions

## Version Requirements

### Minimum Recommended

```yaml
hugover: "0.80.0"
```

Hugo 0.80.0+ is recommended for modern features.

### Latest Features

```yaml
hugover: "0.120.0"
```

Use the latest stable version for newest features.

### Legacy Sites

```yaml
hugover: "0.55.0"
```

Some older sites may require specific legacy versions.

## Hugo Extended vs Standard

Quiqr typically uses **Hugo Extended**, which includes:
- Sass/SCSS processing
- WebP image processing
- Additional image processing capabilities

If your site uses Sass/SCSS, you need Extended.

## Version Selection Best Practices

1. **Use explicit versions** - Don't rely on "latest"
2. **Test before updating** - Hugo can have breaking changes
3. **Document requirements** - Note in README if specific version needed
4. **Check theme requirements** - Themes may require specific versions
5. **Stay reasonably current** - Balance stability with features

## Hugo Version History

Major milestones:

| Version | Notable Features |
|---------|------------------|
| 0.120.0+ | Latest features, improved performance |
| 0.100.0+ | Modern module system |
| 0.80.0+ | Improved assets pipeline |
| 0.60.0+ | Hugo Modules |
| 0.55.0+ | Hugo Pipes |

## Checking Hugo Version

### In Quiqr

Quiqr shows the Hugo version in the developer tools or logs.

### Command Line

```bash
hugo version
```

Output:
```
hugo v0.120.0+extended darwin/arm64
```

## Updating Hugo Version

To update:

1. Update `hugover` in model.yaml
2. Quiqr will use new version on next launch
3. Test thoroughly before committing

Example:

```yaml
# Before
hugover: "0.100.0"

# After
hugover: "0.120.0"
```

## Common Issues

### Site Breaks After Update

- Review [Hugo release notes](https://github.com/gohugoio/hugo/releases)
- Check for breaking changes
- Test incrementally (e.g., 0.100 → 0.110 → 0.120)
- Review theme compatibility

### Sass/SCSS Not Working

Ensure you're using Hugo Extended:

```yaml
hugover: "0.120.0"  # Quiqr uses extended by default
```

### Theme Requires Specific Version

Check theme documentation:

```yaml
# Theme requires Hugo 0.100.0+
hugover: "0.100.0"
```

## Examples by Site Type

### Basic Blog

```yaml
title: My Blog
hugover: "0.120.0"

collections:
  - key: posts
    folder: content/posts/
```

### Documentation Site

```yaml
title: Documentation
hugover: "0.100.0"

collections:
  - key: docs
    folder: content/docs/
```

### Complex Site with Sass

```yaml
title: Corporate Site
hugover: "0.120.0"  # Extended for Sass

build:
  command: hugo --minify
```

## CI/CD Integration

When deploying, ensure your CI uses the correct version:

### GitHub Actions

```yaml
- name: Setup Hugo
  uses: peaceiris/actions-hugo@v2
  with:
    hugo-version: '0.120.0'
    extended: true
```

### Netlify

```toml
# netlify.toml
[build.environment]
  HUGO_VERSION = "0.120.0"
```

### Vercel

```json
{
  "build": {
    "env": {
      "HUGO_VERSION": "0.120.0"
    }
  }
}
```

## Best Practices

1. **Pin to specific version** - Avoid surprises
2. **Use Extended** - Unless you have a reason not to
3. **Stay updated** - But test first
4. **Document in README** - Help contributors
5. **Match CI/CD** - Same version everywhere

## Next Steps

- [build](./build.md) - Hugo build configuration
- [serve](./serve.md) - Hugo server configuration
- [Hugo Releases](https://github.com/gohugoio/hugo/releases) - Check versions

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
