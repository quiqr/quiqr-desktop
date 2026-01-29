---
sidebar_position: 6
---

# collections

The `collections` property defines repeating content types stored in folders. Use collections for blog posts, products, team members, documentation pages, or any content that has multiple items with the same structure.

## Basic Structure

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    fields:
      - key: title
        type: string
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for this collection |
| `title` | string | Yes | Display name in Quiqr UI |
| `folder` | string | Yes | Path to folder (relative to site root) |
| `fields` | array | Yes | Field definitions for items |
| `extension` | string | No | File extension (default: `.md`) |
| `format` | string | No | File format: `yaml-frontmatter` (default), `toml`, `json` |
| `create` | boolean | No | Allow creating new items (default: `true`) |
| `delete` | boolean | No | Allow deleting items (default: `true`) |
| `preview` | object | No | Preview configuration |
| `matchRole` | string | No | User role restriction: `developer` or `editor` |
| `itemtitle` | string | No | Template for item titles in UI |
| `sort` | object | No | Default sorting configuration |

## Examples

### Example 1: Blog Posts

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts/
    create: true
    itemtitle: "{{title}}"
    fields:
      - key: title
        type: string
        title: Post Title
      - key: date
        type: date
        title: Publish Date
      - key: author
        type: string
        title: Author
      - key: tags
        type: chips
        title: Tags
      - key: content
        type: markdown
        title: Content
```

### Example 2: Products

```yaml
collections:
  - key: products
    title: Products
    folder: content/products/
    itemtitle: "{{name}} - ${{price}}"
    fields:
      - key: name
        type: string
      - key: price
        type: number
      - key: description
        type: text
      - key: image
        type: image
        path: static/images/products/
      - key: in_stock
        type: boolean
```

### Example 3: Team Members

```yaml
collections:
  - key: team
    title: Team Members
    folder: content/team/
    sort:
      field: order
      direction: asc
    fields:
      - key: name
        type: string
      - key: role
        type: string
      - key: order
        type: number
      - key: photo
        type: image
      - key: bio
        type: markdown
```

### Example 4: Documentation

```yaml
collections:
  - key: docs
    title: Documentation
    folder: content/docs/
    extension: .md
    fields:
      - key: title
        type: string
      - key: weight
        type: number
        title: Page Order
      - key: draft
        type: boolean
        default: false
      - key: content
        type: markdown
```

## File Extension

Specify the file extension for new items:

```yaml
collections:
  - key: posts
    folder: content/posts/
    extension: .md  # Default
```

Supported extensions:
- `.md` - Markdown (default)
- `.html` - HTML
- `.json` - JSON
- `.toml` - TOML
- `.yaml` - YAML

## Create and Delete

Control whether users can create or delete items:

```yaml
collections:
  - key: posts
    folder: content/posts/
    create: true   # Allow creating new posts
    delete: true   # Allow deleting posts
```

Set to `false` to prevent creation or deletion:

```yaml
collections:
  - key: legacy_posts
    folder: content/legacy/
    create: false  # Cannot create new items
    delete: false  # Cannot delete items
```

## Item Titles

Customize how items appear in the content list:

```yaml
collections:
  - key: posts
    folder: content/posts/
    itemtitle: "{{title}} by {{author}}"
```

Use field keys in double curly braces: `{{field_key}}`

Examples:
- `"{{title}}"` - Just the title
- `"{{date}} - {{title}}"` - Date and title
- `"{{name}} ({{category}})"` - Name with category

## Sorting

Set default sorting for the collection:

```yaml
collections:
  - key: posts
    folder: content/posts/
    sort:
      field: date
      direction: desc  # desc or asc
```

## Role-Based Access

Restrict collections to specific user roles:

```yaml
collections:
  - key: internal_docs
    title: Internal Documentation
    folder: content/internal/
    matchRole: developer
    fields: [...]
```

## Preview Configuration

Configure preview behavior:

```yaml
collections:
  - key: posts
    folder: content/posts/
    preview:
      url_template: "/posts/{{slug}}/"
      auto_reload: true
```

## Common Use Cases

### Blog

```yaml
collections:
  - key: blog
    title: Blog Posts
    folder: content/blog/
    sort:
      field: date
      direction: desc
    fields:
      - key: title
        type: string
      - key: date
        type: date
        default: now
      - key: draft
        type: boolean
        default: true
      - key: content
        type: markdown
```

### Portfolio

```yaml
collections:
  - key: projects
    title: Portfolio Projects
    folder: content/projects/
    itemtitle: "{{title}} ({{year}})"
    fields:
      - key: title
        type: string
      - key: year
        type: number
      - key: client
        type: string
      - key: image
        type: image
      - key: description
        type: markdown
```

### Events

```yaml
collections:
  - key: events
    title: Events
    folder: content/events/
    sort:
      field: event_date
      direction: asc
    fields:
      - key: name
        type: string
      - key: event_date
        type: date
      - key: location
        type: string
      - key: description
        type: text
```

### FAQ

```yaml
collections:
  - key: faq
    title: FAQ Items
    folder: content/faq/
    fields:
      - key: question
        type: string
      - key: answer
        type: markdown
      - key: category
        type: select
        options:
          - General
          - Technical
          - Billing
```

## Best Practices

1. **Use plural keys** - `posts` not `post`, `products` not `product`
2. **Descriptive titles** - Clear collection names
3. **Set itemtitle** - Makes content list easier to scan
4. **Configure sorting** - Default sort that makes sense
5. **Use create/delete** - Control content management appropriately
6. **Group by folder** - Organize content logically

## Differences from Singles

| Feature | Collections | Singles |
|---------|-------------|---------|
| File location | Folder with multiple files | Fixed path |
| Number of items | Many | One |
| Can create new | Yes (configurable) | No |
| Can delete | Yes (configurable) | No |
| Use case | Repeating content | Unique pages |

## File Naming

When creating new items, Quiqr generates filenames based on:

1. **Slug field** (if present)
2. **Title field** (slugified)
3. **Timestamp** (fallback)

Example: `my-first-post.md` or `2026-01-29-my-post.md`

## Troubleshooting

### Collection Not Appearing

Check:
- Key is unique
- Folder path is correct
- Folder exists or can be created
- matchRole allows your current role

### Cannot Create Items

Check:
- `create: true` is set (or omitted, as true is default)
- Folder has write permissions
- Fields are properly defined

### Items Not Showing

Check:
- Files in folder have correct extension
- Files have valid frontmatter
- Folder path is correct

## Next Steps

- [singles](./singles.md) - Individual pages
- [Field Reference](../../../field-reference/index.md) - Available field types
- [menu](./menu.md) - Add collections to sidebar

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
