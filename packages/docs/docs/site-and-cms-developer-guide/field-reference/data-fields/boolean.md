---
sidebar_position: 3
---

# Boolean Field

The `boolean` field generates a checkbox or toggle for true/false values.

![Boolean field](/img/fields/boolean.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | boolean | No | false | Default value when the key is not set |
| `autoSave` | boolean | No | false | Auto-save form after toggling |

## Examples

### Example 1: Simple Boolean

**Configuration:**

```yaml
key: published
title: Published
type: boolean
default: false
```

**Output:**

```yaml
published: true
```

### Example 2: Feature Toggle with Auto-Save

**Configuration:**

```yaml
key: enable_comments
title: Enable Comments
type: boolean
default: true
autoSave: true
tip: Allow readers to comment on this post
```

**Output:**

```yaml
enable_comments: false
```

## Use Cases

- **Publishing**: Published/draft status, visibility toggles
- **Features**: Enable/disable features, show/hide sections
- **Settings**: Configuration flags, option toggles
- **Metadata**: Featured content, sticky posts, highlighted items

## Related Fields

- [Select](./select.md) - For more than two options
- [Hidden](./hidden.md) - For system-managed boolean values
