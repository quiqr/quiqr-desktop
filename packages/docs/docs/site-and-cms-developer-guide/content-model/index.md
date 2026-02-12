---
sidebar_position: 3
---

# Content Model

The content model is the heart of a Quiqr site configuration. It defines what content types exist, what fields they have, and how content editors interact with your site.

## What is a Content Model?

A content model is a YAML or JSON configuration file that describes:

- **Content types** - Singles (individual pages) and collections (repeating content)
- **Fields** - What data each content type contains
- **UI behavior** - How content appears in the editing interface
- **Validation** - Rules for content structure
- **Menu structure** - How content is organized in the sidebar

## Model File Location

The model file should be placed at the root of your Hugo site:

- `model.yaml` (recommended)
- `model.json` (alternative)

Quiqr automatically detects and loads this file when you open a site.

## Basic Example

Here's a minimal content model for a blog:

```yaml
# model.yaml
title: My Blog

singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: title
        type: string
        title: Page Title
      - key: description
        type: text
        title: Description

collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    fields:
      - key: title
        type: string
        title: Post Title
      - key: date
        type: date
        title: Publish Date
      - key: content
        type: markdown
        title: Content
```

## Content Model Structure

A complete content model consists of several sections:

### [Model File Structure](./model-file-structure/index.md)

Learn about the overall structure of the model file and how different sections work together.

### [Root Properties](./model-file-structure/root-properties/index.md)

Top-level configuration properties:
- **build** - Hugo build configuration
- **serve** - Hugo server settings  
- **hugover** - Hugo version requirements
- **menu** - Sidebar menu structure
- **singles** - Individual page definitions
- **collections** - Repeating content definitions

### [Build Actions](./build-actions/index.md)

Configure Hugo build commands and customizations.

## Content Types

### Singles

Singles are individual pages with a fixed location:

```yaml
singles:
  - key: about
    title: About Page
    file: content/about.md
    fields: [...]
```

Use singles for:
- Homepage
- About page
- Contact page
- Site configuration

### Collections

Collections are folders containing multiple content items:

```yaml
collections:
  - key: blog
    title: Blog Posts
    folder: content/blog/
    fields: [...]
```

Use collections for:
- Blog posts
- Documentation pages
- Products
- Team members

## Field Definitions

Every content type has a `fields` array that defines what data it contains. See the [Field Reference](../field-reference/index.md) for all available field types.

```yaml
fields:
  - key: title
    type: string
    title: Title
    required: true
    
  - key: author
    type: object
    title: Author
    fields:
      - key: name
        type: string
      - key: email
        type: string
```

## Menu Configuration

Control how content appears in the sidebar:

```yaml
menu:
  - key: content
    title: Content
    items:
      - single: homepage
      - collection: posts
```

## Examples

### Blog Site

```yaml
title: My Blog

singles:
  - key: home
    title: Homepage
    file: content/_index.md
    
collections:
  - key: posts
    title: Posts
    folder: content/posts/
  - key: pages
    title: Pages
    folder: content/pages/
```

### Documentation Site

```yaml
title: Documentation

collections:
  - key: docs
    title: Documentation
    folder: content/docs/
    extension: .md
```

### Multi-language Site

```yaml
title: Multilingual Site

singles:
  - key: home-en
    title: Homepage (English)
    file: content/_index.en.md
  - key: home-fr
    title: Homepage (French)
    file: content/_index.fr.md
```

## Best Practices

1. **Start simple** - Begin with basic singles and collections
2. **Use clear keys** - Keys should be descriptive (e.g., `blog_posts` not `bp`)
3. **Group related fields** - Use bundles or objects for related data
4. **Validate early** - Add validation rules to catch errors
5. **Document your model** - Use comments to explain complex configurations
6. **Test incrementally** - Make changes gradually and test each change

## Next Steps

- [Model File Structure](./model-file-structure/index.md) - Deep dive into model structure
- [Root Properties](./model-file-structure/root-properties/index.md) - All top-level properties
- [Field Reference](../field-reference/index.md) - Available field types
- [Build Actions](./build-actions/index.md) - Hugo build configuration

## Related Documentation

- [Anatomy of a Quiqr Site](../anatomy-of-a-quiqr-site.md) - Site structure overview
- [User Roles](../user-roles.md) - Content Editor vs Site Developer
- [Field Development Guide](../../quiqr-internals-developer-guide/field-system.md) - Creating custom fields
