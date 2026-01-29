---
sidebar_position: 15
---

# Uniq

The uniq field automatically generates a unique identifier string when the field is empty. Once generated, the value becomes read-only with an option to regenerate if needed.

:::info Field Type
**Type:** `uniq`  
**Category:** Data Field  
**Output:** String (unique identifier)
:::

## Basic Configuration

```yaml
- key: id
  type: uniq
  title: Unique ID
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |

## Visual Example

![Uniq Field](/img/fields/uniq.png)

The field displays the generated unique ID with a regenerate button.

## How It Works

**Initial State (Empty):**
- When the field has no value, a unique ID is automatically generated
- The ID is generated when the form is first opened or when explicitly regenerated

**After Generation:**
- The field becomes read-only
- A "Regenerate" button allows creating a new unique ID if needed
- The value is preserved across edits

## Usage Examples

### Basic Unique ID

```yaml
- key: id
  type: uniq
  title: ID
```

**Output:**
```yaml
id: "888c-fc97-bb50"
```

### Content Item Identifier

```yaml
fields:
  - key: item-id
    type: uniq
    title: Item ID
    tip: "Unique identifier for this item"
  
  - key: title
    type: string
    title: Title
```

### With Tooltip

```yaml
- key: uuid
  type: uniq
  title: UUID
  tip: "This unique identifier is automatically generated and should not be changed unless necessary"
```

## Use Cases

### Content Tracking

```yaml
collections:
  - key: blog-posts
    title: Blog Posts
    folder: content/posts
    fields:
      - key: post-id
        type: uniq
        title: Post ID
      
      - key: title
        type: string
        title: Title
      
      - key: content
        type: markdown
        title: Content
```

Use the unique ID to track posts across renames or moves.

### Database Integration

```yaml
- key: external-id
  type: uniq
  title: External ID
  tip: "Used for syncing with external database"

- key: product-name
  type: string
  title: Product Name
```

### API References

```yaml
- key: api-key
  type: uniq
  title: API Key
  tip: "Unique key for API integration"
```

### Internal References

```yaml
collections:
  - key: projects
    title: Projects
    folder: content/projects
    fields:
      - key: project-id
        type: uniq
        title: Project ID
      
      - key: project-name
        type: string
        title: Project Name
      
      - key: related-projects
        type: select-from-query
        title: Related Projects
        multiple: true
        query_glob: "content/projects/**/*.md"
        query_string: ".project-id[]"
```

Use unique IDs to create reliable relationships between content items.

### Session Management

```yaml
- key: session-id
  type: uniq
  title: Session ID

- key: session-name
  type: string
  title: Session Name
```

## Format

The unique ID format is typically:
```
{4-chars}-{4-chars}-{4-chars}
```

Example: `888c-fc97-bb50`

The format is:
- Short and readable
- URL-safe (alphanumeric and hyphens only)
- Collision-resistant for typical use cases

:::note
The exact format and generation algorithm are implementation-specific. Do not rely on a specific format or character set.
:::

## Regenerating IDs

**When to regenerate:**
- Testing and development
- Resolving ID conflicts (rare)
- Resetting integrations

**How to regenerate:**
1. Click the "Regenerate" button in the Quiqr interface
2. Confirm the action (may require confirmation)
3. The old ID is replaced with a new unique value

:::warning Data Loss Risk
Regenerating an ID may break references to this content from other systems or content items. Only regenerate if you understand the implications.
:::

## Best Practices

1. **Don't Change Manually:** Let Quiqr generate and manage the IDs
2. **Use Descriptive Keys:** Name the field based on its purpose (e.g., `post-id`, `product-uuid`)
3. **Add Tooltips:** Explain what the ID is used for
4. **Avoid Regeneration:** Only regenerate when absolutely necessary
5. **Document Dependencies:** Note where the ID is used (databases, APIs, relationships)

## Common Patterns

### With Created Date

```yaml
- key: id
  type: uniq
  title: ID

- key: created
  type: date
  title: Created Date
  default: now
```

### With Slug

```yaml
- key: id
  type: uniq
  title: Internal ID

- key: slug
  type: string
  title: URL Slug
  tip: "Human-readable URL identifier"
```

### Multiple IDs

```yaml
- key: internal-id
  type: uniq
  title: Internal ID
  tip: "For internal reference only"

- key: public-id
  type: uniq
  title: Public ID
  tip: "Exposed in public APIs"
```

## Integration Examples

### Hugo Taxonomies

```yaml
collections:
  - key: authors
    title: Authors
    folder: content/authors
    fields:
      - key: author-id
        type: uniq
        title: Author ID
      
      - key: name
        type: string
        title: Name
```

Then reference authors by ID:

```yaml
# In post frontmatter
author-id: "888c-fc97-bb50"
```

### External System Sync

```yaml
- key: external-sync-id
  type: uniq
  title: Sync ID
  tip: "Do not modify - used for external system synchronization"

- key: last-synced
  type: date
  title: Last Synced
```

### Version Control

```yaml
- key: content-id
  type: uniq
  title: Content ID
  tip: "Permanent identifier that persists across file renames"

- key: version
  type: number
  title: Version
  default: 1
```

## Comparison with Other Fields

| Feature | Uniq | String | Readonly |
|---------|------|--------|----------|
| **Auto-generation** | Yes | No | No |
| **Editable** | Only regenerate | Yes | No |
| **Use Case** | Unique identifiers | Any text | Display data |
| **User Input** | No (generated) | Yes | No |

**When to use uniq:**
- Need truly unique identifiers
- Tracking content across changes
- Integration with external systems
- Creating reliable internal references

**When to use string:**
- User needs to input custom IDs
- IDs follow specific formats
- Human-readable identifiers (slugs)

## Output

```yaml
# Simple output
id: "888c-fc97-bb50"

# Multiple unique IDs
internal-id: "a1b2-c3d4-e5f6"
public-id: "7g8h-9i0j-k1l2"
```

## Limitations

1. **Format Control:** Cannot customize the ID format
2. **Deterministic Generation:** IDs are randomly generated, not based on content
3. **No Validation:** Cannot enforce specific ID patterns
4. **Regeneration Risk:** Regenerating breaks external references

## Related Fields

- [String](./string.md) - Editable text field for custom IDs
- [Readonly](./readonly.md) - Display read-only values
- [Hidden](./hidden.md) - Store hidden values
