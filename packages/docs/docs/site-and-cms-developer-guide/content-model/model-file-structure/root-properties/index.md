---
sidebar_position: 1
---

# Root Properties

Root properties are the top-level configuration keys in your model file. Each property serves a specific purpose in defining how Quiqr works with your Hugo site.

## Overview

A complete model file can include these root properties:

```yaml
title: My Site              # Site title in Quiqr UI
hugover: "0.120.0"         # Required Hugo version
build: {...}               # Hugo build configuration
serve: {...}               # Hugo server configuration
menu: [...]                # Sidebar menu structure
singles: [...]             # Individual page definitions
collections: [...]         # Repeating content definitions
dynamics: [...]            # Dynamic form definitions
partials: {...}            # Reusable field definitions
```

## Property Reference

### [build](./build.md)

Configures how Hugo builds your site for production.

**Purpose**: Define the Hugo build command and environment variables.

**Example**:
```yaml
build:
  command: hugo --minify
  environment:
    HUGO_ENV: production
```

### [serve](./serve.md)

Configures the Hugo development server for previewing your site.

**Purpose**: Define the Hugo server command and settings.

**Example**:
```yaml
serve:
  command: hugo server -D
  port: 1313
```

### [hugover](./hugover.md)

Specifies the required Hugo version for your site.

**Purpose**: Ensure compatibility and auto-download the correct Hugo version.

**Example**:
```yaml
hugover: "0.120.0"
```

### [menu](./menu.md)

Defines the sidebar navigation structure in Quiqr.

**Purpose**: Organize how content appears in the Quiqr sidebar.

**Example**:
```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
```

### [singles](./singles.md)

Defines individual page content types with fixed locations.

**Purpose**: Configure standalone pages like homepage, about, contact.

**Example**:
```yaml
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields: [...]
```

### [collections](./collections.md)

Defines repeating content types stored in folders.

**Purpose**: Configure content like blog posts, products, team members.

**Example**:
```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    fields: [...]
```

### [dynamics](./dynamics.md)

Defines reusable dynamic form definitions for advanced use cases.

**Purpose**: Create reusable form structures that can be referenced by content.

**Example**:
```yaml
dynamics:
  - key: author_info
    title: Author Information
    fields: [...]
```

## Required vs Optional

| Property | Required | Default | Purpose |
|----------|----------|---------|---------|
| `title` | Optional | Site name | Display name in UI |
| `hugover` | Optional | Latest | Hugo version |
| `build` | Optional | `hugo` | Build command |
| `serve` | Optional | `hugo server` | Preview command |
| `menu` | Optional | Auto-generated | Sidebar structure |
| `singles` | Optional | None | Individual pages |
| `collections` | Optional | None | Repeating content |
| `dynamics` | Optional | None | Dynamic forms |

## Minimal Model

The absolute minimum model file:

```yaml
title: My Site

collections:
  - key: posts
    folder: content/posts/
```

This creates a basic site with one collection. Quiqr uses defaults for everything else.

## Complete Example

A fully configured model with all properties:

```yaml
title: Complete Blog

hugover: "0.120.0"

build:
  command: hugo --minify
  environment:
    HUGO_ENV: production

serve:
  command: hugo server -D --disableFastRender
  port: 1313

menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
      - collection: pages
  - title: Settings
    matchRole: developer
    items:
      - single: config

singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: title
        type: string
      - key: content
        type: markdown

  - key: config
    title: Site Config
    file: config/_default/params.toml
    format: toml
    fields:
      - key: site_name
        type: string

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

dynamics:
  - key: author_bio
    title: Author Bio
    fields:
      - key: name
        type: string
      - key: bio
        type: text
```

## Property Loading Order

Quiqr loads properties in this order:

1. **hugover** - Determines Hugo version
2. **build/serve** - Sets up Hugo commands
3. **menu** - Creates sidebar structure
4. **singles/collections** - Loads content types
5. **dynamics** - Prepares dynamic forms

## Validation

Quiqr validates your model on load:

- **Duplicate keys** - Keys must be unique within singles/collections
- **Invalid paths** - File and folder paths must exist or be creatable
- **Required fields** - Certain field properties are mandatory
- **Syntax errors** - YAML/JSON must be valid

Errors are shown in the Quiqr console with line numbers.

## Best Practices

1. **Order matters for readability** - Use the standard order shown above
2. **Start with singles and collections** - These are the most important
3. **Add menu last** - Easier to configure after defining content types
4. **Comment your model** - Explain non-obvious configurations
5. **Use meaningful keys** - Descriptive keys help maintenance

## Next Steps

Explore each root property in detail:

- [build](./build.md) - Hugo build configuration
- [serve](./serve.md) - Hugo server configuration
- [hugover](./hugover.md) - Hugo version management
- [menu](./menu.md) - Menu structure configuration
- [singles](./singles.md) - Individual page configuration
- [collections](./collections.md) - Collection configuration
- [dynamics](./dynamics.md) - Dynamic forms

## Related

- [Model File Structure](../index.md) - Overall structure
- [Includes](../includes.md) - Organizing large models
- [Partials](../partials.md) - Reusing field definitions
