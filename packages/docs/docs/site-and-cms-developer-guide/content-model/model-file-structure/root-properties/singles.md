---
sidebar_position: 5
---

# singles

The `singles` property defines individual page content types with fixed file locations. Use singles for unique pages like homepage, about page, contact page, or site configuration.

## Basic Structure

```yaml
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: title
        type: string
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for this single |
| `title` | string | Yes | Display name in Quiqr UI |
| `file` | string | Yes | Path to the file (relative to site root) |
| `fields` | array | Yes | Field definitions for this single |
| `format` | string | No | File format: `yaml-frontmatter` (default), `toml`, `json` |
| `preview` | object | No | Preview configuration |
| `matchRole` | string | No | User role restriction: `developer` or `editor` |

## Examples

### Example 1: Simple Homepage

```yaml
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
      - key: content
        type: markdown
        title: Content
```

### Example 2: About Page

```yaml
singles:
  - key: about
    title: About Us
    file: content/about.md
    fields:
      - key: title
        type: string
      - key: team
        type: list
        item_type: object
        fields:
          - key: name
            type: string
          - key: role
            type: string
          - key: bio
            type: text
```

### Example 3: Site Configuration

```yaml
singles:
  - key: site_config
    title: Site Configuration
    file: config/_default/params.toml
    format: toml
    matchRole: developer
    fields:
      - key: site_name
        type: string
        title: Site Name
      - key: author
        type: string
        title: Default Author
      - key: description
        type: text
        title: Site Description
```

### Example 4: Multi-language Pages

```yaml
singles:
  - key: home-en
    title: Homepage (English)
    file: content/_index.en.md
    fields:
      - key: title
        type: string
        
  - key: home-es
    title: Homepage (Spanish)
    file: content/_index.es.md
    fields:
      - key: title
        type: string
```

## File Formats

### YAML Frontmatter (Default)

```yaml
singles:
  - key: about
    file: content/about.md
    format: yaml-frontmatter  # or omit (default)
```

File structure:
```markdown
---
title: About Us
description: Learn about our team
---

Content goes here...
```

### TOML Format

```yaml
singles:
  - key: config
    file: config/_default/params.toml
    format: toml
```

File structure:
```toml
site_name = "My Site"
author = "John Doe"
```

### JSON Format

```yaml
singles:
  - key: data
    file: data/settings.json
    format: json
```

File structure:
```json
{
  "site_name": "My Site",
  "theme": "dark"
}
```

## Role-Based Access

Restrict singles to specific user roles:

```yaml
singles:
  - key: site_settings
    title: Site Settings
    file: config/_default/params.yaml
    matchRole: developer
    fields: [...]
```

With `matchRole: developer`, only users in Site Developer role can see and edit this single.

## Preview Configuration

Configure how previews work for this single:

```yaml
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    preview:
      url: /
      auto_reload: true
    fields: [...]
```

## Common Use Cases

### Homepage

```yaml
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: hero_title
        type: string
      - key: hero_image
        type: image
      - key: sections
        type: list
        item_type: object
```

### Contact Page

```yaml
singles:
  - key: contact
    title: Contact Page
    file: content/contact.md
    fields:
      - key: title
        type: string
      - key: email
        type: string
      - key: phone
        type: string
      - key: address
        type: text
```

### Site Configuration

```yaml
singles:
  - key: site_config
    title: Site Config
    file: config/_default/params.yaml
    matchRole: developer
    fields:
      - key: baseURL
        type: string
      - key: title
        type: string
      - key: theme
        type: select
        options:
          - light
          - dark
```

### Privacy Policy

```yaml
singles:
  - key: privacy
    title: Privacy Policy
    file: content/privacy.md
    fields:
      - key: title
        type: string
      - key: last_updated
        type: date
      - key: content
        type: markdown
```

## Best Practices

1. **Use descriptive keys** - `homepage` not `hp`, `site_config` not `cfg`
2. **Group related singles** - Keep configuration singles together in the menu
3. **Use matchRole** - Restrict sensitive singles to developers
4. **Validate file paths** - Ensure file paths exist or can be created
5. **Consider format** - Use TOML for config files, YAML frontmatter for content

## Differences from Collections

| Feature | Singles | Collections |
|---------|---------|-------------|
| File location | Fixed path | Folder with multiple files |
| Number of items | One | Many |
| Can create new | No | Yes (if `create: true`) |
| Use case | Unique pages | Repeating content |

## Troubleshooting

### Single Not Appearing

Check:
- Key is unique
- File path is correct
- File exists or can be created
- matchRole allows your current role

### Cannot Edit Single

Check:
- File permissions
- File format matches configuration
- Fields are properly defined

## Next Steps

- [collections](./collections.md) - Repeating content
- [Field Reference](../../../field-reference/index.md) - Available field types
- [menu](./menu.md) - Add singles to sidebar

## Related

- [Root Properties](./index.md) - All root properties
- [Model File Structure](../index.md) - Overall structure
