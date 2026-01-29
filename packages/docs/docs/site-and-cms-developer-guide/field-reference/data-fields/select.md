---
sidebar_position: 5
---

# Select Field

The `select` field generates a dropdown selectbox for selecting strings or numbers. Supports single or multiple selection.

![Select field](/img/fields/select1.png)

![Select multiple field](/img/fields/select2.png)

![Select dropdown with options](/img/fields/select3.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string/number/array | No | null | Default value when the key is not set |
| `multiple` | boolean | No | false | Enable multiple selection |
| `autoSave` | boolean | No | false | Auto-save form after changing value |
| `options` | array | Yes | - | Array of options (see below) |
| `option_image_path` | string | No | null | Path to option images |
| `option_image_width` | number | No | null | Width for option images |
| `option_image_extension` | string | No | null | Image extension (e.g., 'jpg') |

### Options Format

Options can be defined in two ways:

**1. Text and value pairs (when they differ):**

```yaml
options:
  - text: Display Text
    value: actual_value
```

**2. Simple strings (when text and value are the same):**

```yaml
options:
  - Option 1
  - Option 2
```

## Examples

### Example 1: Different Text and Value

**Configuration:**

```yaml
key: category
title: Category
type: select
multiple: false
default: 2
options:
  - text: Technology
    value: 1
  - text: Design
    value: 2
  - text: Marketing
    value: 3
```

**Output:**

```yaml
category: 2
```

### Example 2: Same Text and Value

**Configuration:**

```yaml
key: status
title: Status
type: select
default: Draft
options:
  - Draft
  - Published
  - Archived
```

**Output:**

```yaml
status: Draft
```

### Example 3: Multiple Selection

**Configuration:**

```yaml
key: tags
title: Tags
type: select
multiple: true
options:
  - JavaScript
  - TypeScript
  - React
  - Vue
  - Angular
```

**Output:**

```yaml
tags:
  - JavaScript
  - React
```

### Example 4: Visual Options with Images

**Configuration:**

```yaml
key: theme
title: Theme
type: select
option_image_path: assets/themes
option_image_width: 200
option_image_extension: png
options:
  - text: Light Theme
    value: light
  - text: Dark Theme
    value: dark
  - text: Auto
    value: auto
```

This will look for images at:
- `assets/themes/light.png`
- `assets/themes/dark.png`
- `assets/themes/auto.png`

## Use Cases

- **Single selection**: Category, status, type selection
- **Multiple selection**: Tags, features, capabilities
- **With images**: Theme selection, layout selection, icon selection

## Known Issues

- Default property may not work in all cases

## Related Fields

- [Chips](./chips.md) - Alternative for multiple tag selection
- [Image Select](./image-select.md) - Image-based selection
- [Select from Query](./select-from-query.md) - Dynamic options from data
