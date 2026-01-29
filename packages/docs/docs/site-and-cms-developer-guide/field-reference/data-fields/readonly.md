---
sidebar_position: 10
---

# Readonly Field

The `readonly` field displays a value in the form but prevents the user from editing it.

![Readonly field](/img/fields/readonly.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | any | No | null | Default value when the key is not set |

## Examples

### Example 1: Display File Path

**Configuration:**

```yaml
key: file_path
title: File Path
type: readonly
```

**Output (displayed but not editable):**

```yaml
file_path: /content/posts/my-article.md
```

### Example 2: Last Modified Date

**Configuration:**

```yaml
key: last_modified
title: Last Modified
type: readonly
default: now
tip: Automatically updated when content is saved
```

**Output:**

```yaml
last_modified: 2026-01-29T10:30:00Z
```

## Use Cases

- **System info**: File paths, URLs, internal IDs
- **Timestamps**: Creation date, last modified date
- **Metadata**: Author, word count, reading time
- **Status**: Processing status, publication state
- **References**: Parent page, original source

## Behavior

- Field displays in the form UI
- Value cannot be edited by the user
- Value can be set via defaults or programmatically
- Useful for showing context or system information

## Related Fields

- [Hidden](./hidden.md) - Stores value but doesn't display in UI
- [String](./string.md) - For editable text fields
