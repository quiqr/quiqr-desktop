---
sidebar_position: 1
---

# Bundle Field

The `bundle` field (also known as `bundle-manager`) is a powerful container for managing file-based content with a visual list interface. It's ideal for managing collections where each item is stored as a separate file.

:::info Field Type
**Type:** `bundle` or `bundle-manager`  
**Category:** Container Field  
**Output:** Array of files in the specified directory
:::

## Visual Examples

### Bundle List View

![Bundle Manager List](/img/fields/bundle-manager1.png)

The bundle field displays a visual list of all content items with quick actions.

### Bundle Detail View

![Bundle Manager Detail](/img/fields/bundle-manager2.png)

Each bundle item opens as a form for editing individual content files.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the bundle |
| `title` | string | No | - | Display label for the bundle header |
| `tip` | string | No | null | Help text with markdown support |
| `fields` | array | Yes | - | Array of field definitions within the bundle |
| `expanded` | boolean | No | false | Whether bundle starts expanded |

## Examples

### Example 1: SEO Settings Bundle

**Configuration:**

```yaml
- key: seo
  title: SEO Settings
  type: bundle
  expanded: false
  fields:
    - key: meta_title
      type: string
      title: Meta Title
    - key: meta_description
      type: string
      title: Meta Description
      multiLine: true
    - key: meta_keywords
      type: chips
      title: Keywords
```

**Output:**

```yaml
seo:
  meta_title: My Page Title
  meta_description: A comprehensive description...
  meta_keywords:
    - keyword1
    - keyword2
```

### Example 2: Author Information

**Configuration:**

```yaml
- key: author
  title: Author Information
  type: bundle
  expanded: true
  fields:
    - key: name
      type: string
      title: Name
    - key: email
      type: string
      title: Email
    - key: bio
      type: markdown
      title: Biography
```

**Output:**

```yaml
author:
  name: John Doe
  email: john@example.com
  bio: "Software developer and writer..."
```

## Features

- **Collapsible**: Click header to expand/collapse
- **Organization**: Group related fields visually
- **Nested structure**: Creates object in frontmatter
- **Visual hierarchy**: Makes complex forms more manageable

## Use Cases

- **Settings groups**: SEO, social media, advanced options
- **Complex data**: Author info, address, contact details
- **Optional sections**: Advanced settings, metadata, extras
- **Related fields**: Group fields that logically belong together

## Output Format

Bundles create a nested object in frontmatter:

```yaml
bundle_key:
  field1: value1
  field2: value2
```

## Related Fields

- [Object](./section.md) - Similar nesting without the UI grouping
- [List](./leaf-array.md) - For arrays of items
- [Nested](./nested.md) - For deeply nested structures
