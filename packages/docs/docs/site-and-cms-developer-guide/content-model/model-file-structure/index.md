---
sidebar_position: 1
---

# Model File Structure

The Quiqr content model file has a specific structure and organization. Understanding this structure is essential for creating effective content models.

## File Format

Model files can be written in three formats:

- **YAML** (`.yaml`) - Recommended for readability
- **JSON** (`.json`) - Good for programmatic generation
- **TOML** (`.toml`) - Alternative format

## File Location

Place your model file at the root of your Hugo site:

```
my-hugo-site/
├── model.yaml          ← Main model file
├── content/
├── themes/
└── config.toml
```

Quiqr automatically detects and loads `model.yaml`, `model.json`, or `model.toml`.

## Basic Structure

A complete model file has the following top-level structure:

```yaml
# Site title (appears in Quiqr UI)
title: My Site

# Hugo build configuration
build:
  command: hugo
  
# Hugo serve configuration  
serve:
  command: hugo server -D
  
# Required Hugo version
hugover: "0.80.0"

# Sidebar menu structure
menu:
  - title: Content
    items: [...]

# Individual pages
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields: [...]

# Repeating content
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    fields: [...]

# Dynamic form definitions (advanced)
dynamics:
  - key: author_info
    fields: [...]
```

## Top-Level Properties

The model file has several root properties, each serving a specific purpose:

### [build](./root-properties/build.md)

Configures how Hugo builds your site:

```yaml
build:
  command: hugo
  environment:
    HUGO_ENV: production
```

### [serve](./root-properties/serve.md)

Configures the Hugo development server:

```yaml
serve:
  command: hugo server -D
  port: 1313
```

### [hugover](./root-properties/hugover.md)

Specifies required Hugo version:

```yaml
hugover: "0.80.0"
```

### [menu](./root-properties/menu.md)

Defines the sidebar navigation structure:

```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
```

### [singles](./root-properties/singles.md)

Defines individual page content types:

```yaml
singles:
  - key: about
    title: About Page
    file: content/about.md
    fields: [...]
```

### [collections](./root-properties/collections.md)

Defines repeating content types:

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    fields: [...]
```



## Example: Complete Model Structure

Here's a complete example showing all major sections:

```yaml
title: My Blog

hugover: "0.120.0"

build:
  command: hugo --minify

serve:
  command: hugo server -D

menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
      - collection: pages

singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: title
        type: string
      - key: hero_image
        type: image
        path: static/images/

collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    create: true
    fields:
      - key: title
        type: string
      - key: date
        type: date
      - key: content
        type: markdown
        
  - key: pages
    title: Pages
    folder: content/pages/
    fields:
      - key: title
        type: string
      - key: content
        type: markdown
```

## Best Practices

1. **Use YAML** - More readable than JSON for manual editing
2. **Comment your model** - Add comments to explain complex configurations
3. **Start simple** - Begin with basic structure, add complexity as needed
4. **Use includes** - Split large models into separate files
5. **Use partials** - Reuse common field definitions
6. **Validate** - Test your model incrementally

## Common Patterns

### Blog Site

```yaml
title: Blog

singles:
  - key: home
    file: content/_index.md

collections:
  - key: posts
    folder: content/posts/
  - key: authors
    folder: content/authors/
```

### Documentation Site

```yaml
title: Documentation

collections:
  - key: docs
    folder: content/docs/
    fields:
      - key: title
        type: string
      - key: weight
        type: number
      - key: content
        type: markdown
```

### Multi-language Site

```yaml
title: Multilingual Site

singles:
  - key: home-en
    file: content/_index.en.md
  - key: home-es  
    file: content/_index.es.md
```

## Next Steps

- [Root Properties](./root-properties/index.md) - Detailed property documentation
- [Build Actions](../build-actions/index.md) - Hugo build configuration

## Related

- [Content Model Overview](../index.md) - Back to content model main page
- [Field Reference](../../field-reference/index.md) - Available field types
