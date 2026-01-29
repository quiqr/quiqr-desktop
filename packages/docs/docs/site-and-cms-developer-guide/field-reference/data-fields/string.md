---
sidebar_position: 1
---

# String Field

The `string` field generates a field for entering text. It supports both single-line and multi-line input.

![Single line string](/img/fields/string1.png)

![Multi line string](/img/fields/string2.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default value when the key is not set |
| `multiLine` | boolean | No | false | Enable multi-line text input |
| `txtInsertButtons` | array | No | - | Quick text insert buttons |

## Examples

### Example 1: Multi-line String

**Configuration:**

```yaml
key: description
title: Description
type: string
multiLine: true
```

**Output:**

```yaml
description: |-
  This is a multi-line
  string value
```

### Example 2: Quick Insert Buttons

**Configuration:**

```yaml
key: status
title: Status
type: string
txtInsertButtons:
  - 'YES'
  - 'NO'
  - 'MAYBE'
```

**Output:**

```yaml
status: YES
```

## Use Cases

- **Single-line**: Page titles, names, short descriptions, URLs
- **Multi-line**: Long descriptions, notes, addresses
- **Quick insert**: Status values, common responses, template text

## Related Fields

- [Markdown](./markdown.md) - For rich text editing with formatting
- [EasyMDE](./easymde.md) - Alternative markdown editor
- [Readonly](./readonly.md) - For displaying non-editable text
