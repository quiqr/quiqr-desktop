---
sidebar_position: 9
---

# Hidden Field

The `hidden` field stores values in frontmatter without displaying them in the UI. Useful for system-managed values.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `default` | any | No | null | Default value when the key is not set |

## Examples

### Example 1: Content Type

**Configuration:**

```yaml
key: type
type: hidden
default: post
```

**Output:**

```yaml
type: post
```

### Example 2: Auto-generated ID

**Configuration:**

```yaml
key: id
type: hidden
default: auto
```

**Output:**

```yaml
id: generated-unique-id-123
```

## Use Cases

- **System values**: Content type, template name, version
- **Auto-generated**: IDs, timestamps, checksums
- **Internal flags**: Processing status, migration markers
- **Metadata**: System-managed metadata not for user editing

## Behavior

- Field never appears in the form UI
- Value is still written to frontmatter
- Can be set programmatically or via defaults
- Users cannot modify via the UI

## Related Fields

- [Readonly](./readonly.md) - Displays value but prevents editing
- String field - For user-editable values
