---
sidebar_position: 7
---

# menu

The `menu` property defines the sidebar navigation structure in Quiqr. It controls how singles, collections, and other menu items appear and are organized in the content editor interface.

## Basic Structure

```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
```

## Menu Item Types

### Reference Singles

```yaml
menu:
  - title: Pages
    items:
      - single: homepage  # References singles key
      - single: about
```

### Reference Collections

```yaml
menu:
  - title: Content
    items:
      - collection: posts  # References collections key
      - collection: pages
```

### Custom Menu Items

```yaml
menu:
  - title: External
    items:
      - title: Documentation
        href: https://docs.example.com
```

## Properties

### Menu Group Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | Yes | Group title in sidebar |
| `items` | array | Yes | Array of menu items |
| `matchRole` | string | No | Show only for role: `developer` or `editor` |
| `collapsed` | boolean | No | Start collapsed (default: false) |

### Menu Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `single` | string | Reference to singles key |
| `collection` | string | Reference to collections key |
| `title` | string | Custom item title |
| `href` | string | External URL |
| `matchRole` | string | Role restriction |

## Examples

### Example 1: Simple Menu

```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
```

### Example 2: Organized Menu

```yaml
menu:
  - title: Pages
    items:
      - single: homepage
      - single: about
      - single: contact
      
  - title: Blog
    items:
      - collection: posts
      - collection: authors
      
  - title: Settings
    matchRole: developer
    items:
      - single: site_config
```

### Example 3: Multi-section Menu

```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
      - collection: pages
      
  - title: Media
    items:
      - collection: images
      - collection: videos
      
  - title: Configuration
    matchRole: developer
    collapsed: true
    items:
      - single: site_settings
      - single: navigation
      - single: footer
```

### Example 4: Mixed Content Menu

```yaml
menu:
  - title: Main Content
    items:
      - single: homepage
      - collection: posts
      - collection: projects
      
  - title: Resources
    items:
      - title: Style Guide
        href: https://style.example.com
      - title: Brand Assets
        href: https://brand.example.com
        
  - title: Advanced
    matchRole: developer
    items:
      - single: config
      - title: Hugo Docs
        href: https://gohugo.io/documentation/
```

## Role-Based Menus

Restrict menu sections to specific roles:

```yaml
menu:
  - title: Content
    items:
      - collection: posts  # Visible to all
      
  - title: Developer Tools
    matchRole: developer  # Only visible to developers
    items:
      - single: config
      - single: redirects
```

## Menu Organization Patterns

### By Content Type

```yaml
menu:
  - title: Singles
    items:
      - single: homepage
      - single: about
      
  - title: Collections
    items:
      - collection: posts
      - collection: pages
```

### By Section

```yaml
menu:
  - title: Marketing
    items:
      - single: homepage
      - collection: landing_pages
      
  - title: Blog
    items:
      - collection: posts
      - collection: authors
      
  - title: Legal
    items:
      - single: privacy
      - single: terms
```

### By Workflow

```yaml
menu:
  - title: To Edit
    items:
      - collection: drafts
      
  - title: Published
    items:
      - collection: posts
      
  - title: Archive
    items:
      - collection: old_posts
```

## Default Menu Behavior

If `menu` is not specified, Quiqr auto-generates a menu with:
1. All singles listed first
2. All collections listed second
3. Single "Content" group containing everything

Auto-generated example:
```yaml
# If you don't specify menu, Quiqr creates:
menu:
  - title: Content
    items:
      - single: homepage
      - single: about
      - collection: posts
      - collection: pages
```

## Collapsed Sections

Start sections collapsed:

```yaml
menu:
  - title: Main Content
    items: [...]
    
  - title: Archive
    collapsed: true  # Starts collapsed
    items:
      - collection: old_posts
```

## External Links

Add external documentation or tools:

```yaml
menu:
  - title: Resources
    items:
      - title: Hugo Documentation
        href: https://gohugo.io/documentation/
      - title: Theme Docs
        href: https://themes.gohugo.io/theme-name/
      - title: Deployment Guide
        href: https://internal.example.com/deploy
```

## Menu Item Ordering

Items appear in the order listed:

```yaml
menu:
  - title: Content
    items:
      - single: homepage      # Appears first
      - collection: posts     # Appears second
      - collection: pages     # Appears third
      - single: about         # Appears fourth
```

## Best Practices

1. **Group logically** - Organize by content type, section, or workflow
2. **Most used first** - Put frequently edited content at the top
3. **Use role restrictions** - Hide developer tools from content editors
4. **Clear titles** - Use descriptive group titles
5. **Collapse archives** - Keep old/rarely used content collapsed
6. **Limit depth** - Don't create too many groups (3-5 is good)

## Common Patterns

### Blog Site

```yaml
menu:
  - title: Content
    items:
      - single: homepage
      - collection: posts
      - collection: authors
      
  - title: Settings
    matchRole: developer
    items:
      - single: config
```

### Documentation Site

```yaml
menu:
  - title: Documentation
    items:
      - single: home
      - collection: guides
      - collection: api_reference
      
  - title: Meta
    items:
      - single: changelog
      - collection: contributors
```

### Corporate Site

```yaml
menu:
  - title: Pages
    items:
      - single: homepage
      - single: about
      - single: contact
      
  - title: Products
    items:
      - collection: products
      - collection: case_studies
      
  - title: Blog
    items:
      - collection: blog_posts
      
  - title: Settings
    matchRole: developer
    collapsed: true
    items:
      - single: navigation
      - single: footer
      - single: seo_config
```

## Troubleshooting

### Menu Item Not Appearing

Check:
- Key exists in singles or collections
- Spelling matches exactly
- No role restrictions preventing access
- Menu structure is valid YAML

### Wrong Order

Items appear in the order listed in the menu configuration, not alphabetically.

### Can't Access Item

Check:
- Your current user role
- `matchRole` restrictions
- Item is defined in singles/collections

## Next Steps

- [singles](./singles.md) - Define individual pages
- [collections](./collections.md) - Define collections
- [User Roles](../../../user-roles.md) - Role-based access

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
