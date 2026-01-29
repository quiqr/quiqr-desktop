---
sidebar_position: 4
---

# Build Actions

Build actions allow you to customize and extend Hugo's build process. This section covers advanced build configurations, custom scripts, and optimization techniques for your Quiqr site.

## Overview

While the [`build`](./model-file-structure/root-properties/build.md) property handles basic Hugo build commands, build actions enable more sophisticated workflows:

- Custom pre-build and post-build scripts
- Asset optimization pipelines
- Multi-stage builds
- Environment-specific configurations
- Integration with external tools

## Basic Build Configuration

The simplest build configuration uses just a command:

```yaml
build:
  command: hugo --minify
```

See [build property reference](./model-file-structure/root-properties/build.md) for complete details.

## Advanced Build Patterns

### Multi-Environment Builds

Configure different builds for different environments:

```yaml
build:
  command: hugo --minify --environment production
  environment:
    HUGO_ENV: production
    NODE_ENV: production
```

Development build (via serve):

```yaml
serve:
  command: hugo server -D
  environment:
    HUGO_ENV: development
    NODE_ENV: development
```

### Build with External Processing

Integrate external tools in your build:

```yaml
build:
  command: hugo --minify && npm run process-assets
  environment:
    HUGO_ENV: production
```

### Multi-Stage Builds

Complex builds with multiple steps:

```yaml
build:
  command: npm run prebuild && hugo --minify && npm run postbuild
```

With corresponding `package.json` scripts:

```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run generate-data",
    "postbuild": "npm run optimize-images && npm run generate-sitemap"
  }
}
```

## Build Optimization

### Minification

Enable minification for production:

```yaml
build:
  command: hugo --minify
```

Hugo minifies:
- HTML
- CSS
- JavaScript
- JSON
- XML

### Garbage Collection

Reduce memory usage on large sites:

```yaml
build:
  command: hugo --minify --gc
```

### Cache Management

Control build caching:

```yaml
# Ignore cache for fresh build
build:
  command: hugo --ignoreCache --minify

# Specify cache directory
build:
  command: hugo --cacheDir /tmp/hugo_cache
  environment:
    HUGO_CACHEDIR: /tmp/hugo_cache
```

### Parallel Processing

Speed up builds on multi-core systems:

```yaml
build:
  command: hugo --minify
  environment:
    GOMAXPROCS: 4  # Use 4 CPU cores
```

## Asset Pipeline Integration

### Sass/SCSS Processing

Hugo Extended includes Sass processing:

```yaml
build:
  command: hugo --minify
  
# Requires Hugo Extended
hugover: "0.120.0"
```

### PostCSS Integration

Process CSS with PostCSS:

```yaml
build:
  command: hugo --minify
```

With `postcss.config.js`:

```javascript
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')
  ]
}
```

### Image Optimization

Optimize images during build:

```yaml
build:
  command: hugo --minify && npm run optimize-images
```

With `package.json`:

```json
{
  "scripts": {
    "optimize-images": "imagemin public/images/* --out-dir=public/images"
  }
}
```

## Environment Variables

### Common Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `HUGO_ENV` | Hugo environment | `production`, `development` |
| `NODE_ENV` | Node environment | `production`, `development` |
| `HUGO_VERSION` | Force Hugo version | `0.120.0` |
| `HUGO_CACHEDIR` | Cache directory | `/tmp/hugo_cache` |
| `GOMAXPROCS` | CPU cores to use | `4` |

### Setting Environment Variables

```yaml
build:
  command: hugo --minify
  environment:
    HUGO_ENV: production
    NODE_ENV: production
    GOMAXPROCS: 4
```

### Conditional Configuration

Use environment variables in Hugo templates:

```go-html-template
{{ if eq (getenv "HUGO_ENV") "production" }}
  <!-- Production-only code -->
  <script src="/analytics.js"></script>
{{ end }}
```

## Build Hooks

### Pre-Build Actions

Execute scripts before Hugo build:

```yaml
build:
  command: npm run prebuild && hugo --minify
```

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-data.js"
  }
}
```

### Post-Build Actions

Execute scripts after Hugo build:

```yaml
build:
  command: hugo --minify && npm run postbuild
```

```json
{
  "scripts": {
    "postbuild": "node scripts/generate-search-index.js"
  }
}
```

## Common Build Patterns

### Blog Site

```yaml
title: My Blog
hugover: "0.120.0"

build:
  command: hugo --minify --gc
  environment:
    HUGO_ENV: production

serve:
  command: hugo server -D -F
```

### Documentation Site

```yaml
title: Documentation
hugover: "0.120.0"

build:
  command: hugo --minify --enableGitInfo
  environment:
    HUGO_ENV: production

serve:
  command: hugo server -D --disableFastRender
```

### E-commerce Site

```yaml
title: Store
hugover: "0.120.0"

build:
  command: npm run prebuild && hugo --minify --gc && npm run postbuild
  environment:
    HUGO_ENV: production
    NODE_ENV: production

serve:
  command: hugo server -D
```

### Multi-language Site

```yaml
title: Global Site
hugover: "0.120.0"

build:
  command: hugo --minify --enableGitInfo
  environment:
    HUGO_ENV: production

serve:
  command: hugo server -D --navigateToChanged
```

## Build Performance

### Measuring Build Time

```bash
time hugo --minify
```

### Optimization Strategies

1. **Use --gc flag** - Reduces memory on large sites
2. **Enable caching** - Faster rebuilds (don't use --ignoreCache)
3. **Optimize images** - Smaller images = faster builds
4. **Remove unused assets** - Less to process
5. **Use GOMAXPROCS** - Utilize multiple cores

### Build Performance Example

```yaml
build:
  command: hugo --minify --gc
  environment:
    HUGO_ENV: production
    GOMAXPROCS: 4
    HUGO_CACHEDIR: /tmp/hugo_cache
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.120.0'
          extended: true
      
      - name: Build
        run: hugo --minify --gc
        env:
          HUGO_ENV: production
```

### Netlify

```toml
# netlify.toml
[build]
  command = "hugo --minify --gc"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.120.0"
  HUGO_ENV = "production"
```

### Vercel

```json
{
  "build": {
    "env": {
      "HUGO_VERSION": "0.120.0"
    }
  },
  "buildCommand": "hugo --minify --gc"
}
```

## Troubleshooting

### Build Fails

**Check:**
- Hugo version compatibility
- All dependencies installed (npm, themes, modules)
- Valid frontmatter in all content files
- No syntax errors in templates

**Debug:**
```yaml
build:
  command: hugo --verbose --debug
```

### Slow Builds

**Try:**
- Enable caching (remove --ignoreCache)
- Use --gc flag
- Optimize images beforehand
- Increase GOMAXPROCS
- Profile with `hugo --templateMetrics`

### Memory Issues

**Solutions:**
```yaml
build:
  command: hugo --minify --gc
  environment:
    GOGC: 50  # More aggressive garbage collection
```

### Asset Processing Errors

**For Sass/SCSS:**
- Ensure using Hugo Extended
- Check Sass syntax
- Verify import paths

**For PostCSS:**
- Check postcss.config.js exists
- Verify all PostCSS plugins installed

## Best Practices

1. **Use minification in production** - Smaller files
2. **Enable garbage collection** - Better memory usage
3. **Set HUGO_ENV** - Environment-aware templates
4. **Cache builds** - Faster CI/CD
5. **Version Hugo** - Consistent across environments
6. **Test locally** - Before deploying
7. **Monitor build times** - Optimize if slow
8. **Use environment variables** - Flexible configuration

## Examples

### Complete Build Configuration

```yaml
title: Production Site
hugover: "0.120.0"

build:
  command: npm run prebuild && hugo --minify --gc --cleanDestinationDir && npm run postbuild
  environment:
    HUGO_ENV: production
    NODE_ENV: production
    GOMAXPROCS: 4

serve:
  command: hugo server -D -F --disableFastRender
  environment:
    HUGO_ENV: development
```

With `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run generate-data",
    "postbuild": "npm run optimize && npm run sitemap",
    "clean": "rm -rf public resources",
    "generate-data": "node scripts/fetch-data.js",
    "optimize": "imagemin public/**/*.{jpg,png} --out-dir=public",
    "sitemap": "node scripts/generate-sitemap.js"
  }
}
```

## Next Steps

- [build property](./model-file-structure/root-properties/build.md) - Basic build configuration
- [serve property](./model-file-structure/root-properties/serve.md) - Development server
- [hugover property](./model-file-structure/root-properties/hugover.md) - Version management

## Related

- [Content Model](./index.md) - Back to content model overview
- [Root Properties](./model-file-structure/root-properties/index.md) - All properties
