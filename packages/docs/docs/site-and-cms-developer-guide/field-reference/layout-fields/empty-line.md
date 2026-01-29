---
sidebar_position: 2
---

# Empty Line

The empty line field adds vertical spacing between form fields to improve visual organization and readability. It's a simple but effective way to create visual hierarchy in complex forms.

:::info Field Type
**Type:** `empty-line`  
**Category:** Layout Field  
**Output:** None (display only)
:::

## Basic Configuration

```yaml
- key: space
  type: empty-line
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `amount` | integer | No | `1` | Number of empty lines to display |

## Visual Example

![Empty Line Field](/img/field-reference/layout-fields/empty-line.png)

The screenshot shows two empty lines creating space between the title field and description field.

## Usage Examples

### Single Empty Line

Add one line of spacing (default):

```yaml
fields:
  - key: title
    type: string
    title: Title
  
  - key: spacer1
    type: empty-line
  
  - key: description
    type: string
    title: Description
```

### Multiple Empty Lines

Create larger gaps with the `amount` property:

```yaml
fields:
  - key: section1-field
    type: string
    title: Section 1
  
  - key: section-break
    type: empty-line
    amount: 3
  
  - key: section2-field
    type: string
    title: Section 2
```

## Use Cases

### Grouping Related Fields

```yaml
fields:
  # Personal Information Group
  - key: first-name
    type: string
    title: First Name
  
  - key: last-name
    type: string
    title: Last Name
  
  - key: email
    type: string
    title: Email
  
  - key: group-separator
    type: empty-line
    amount: 2
  
  # Address Information Group
  - key: street
    type: string
    title: Street Address
  
  - key: city
    type: string
    title: City
```

### Separating Sections

```yaml
fields:
  - key: content-section
    type: info
    content: "## Content Settings"
  
  - key: title
    type: string
    title: Title
  
  - key: body
    type: markdown
    title: Body
  
  - key: section-spacer
    type: empty-line
    amount: 2
  
  - key: meta-section
    type: info
    content: "## Metadata"
  
  - key: author
    type: string
    title: Author
  
  - key: date
    type: date
    title: Date
```

### Creating Visual Hierarchy

```yaml
fields:
  - key: main-title
    type: string
    title: Page Title
  
  - key: space-after-title
    type: empty-line
  
  - key: subtitle
    type: string
    title: Subtitle
  
  - key: space-before-content
    type: empty-line
    amount: 2
  
  - key: content
    type: markdown
    title: Content
```

### Before Important Fields

```yaml
fields:
  # ... various fields ...
  
  - key: important-spacer
    type: empty-line
    amount: 3
  
  - key: important-notice
    type: info
    theme: warn
    content: |
      **Important:** The following settings affect your entire site.
  
  - key: critical-setting
    type: boolean
    title: Enable Critical Feature
```

## Best Practices

1. **Use Sparingly:** Too much spacing can make forms feel disconnected
2. **Combine with Info Fields:** Use empty lines with info fields to create clear section breaks
3. **Consistent Spacing:** Use the same `amount` value throughout your form for consistency
4. **Name Descriptively:** Use descriptive keys like `section-separator` or `group-spacer` for maintainability

## Common Patterns

### Section Header Pattern

```yaml
- key: section-spacer-before
  type: empty-line
  amount: 2

- key: section-header
  type: info
  theme: bare
  content: "## Section Title"

- key: section-spacer-after
  type: empty-line

# ... section fields ...
```

### Grouped Fields Pattern

```yaml
# Group 1
- key: field1
  type: string
  title: Field 1

- key: field2
  type: string
  title: Field 2

- key: group-break
  type: empty-line
  amount: 2

# Group 2
- key: field3
  type: string
  title: Field 3

- key: field4
  type: string
  title: Field 4
```

### Important Field Highlight

```yaml
- key: regular-field
  type: string
  title: Regular Field

- key: emphasis-space
  type: empty-line
  amount: 3

- key: important-field
  type: string
  title: Important Field (Emphasized by Space)

- key: emphasis-space-2
  type: empty-line
  amount: 3

- key: another-regular-field
  type: string
  title: Another Regular Field
```

## Comparison with Alternatives

### Empty Line vs. Info Field

```yaml
# Using empty line (minimal)
- key: spacer
  type: empty-line
  amount: 2

# Using info field (with visual element)
- key: separator
  type: info
  theme: bare
  content: "---"
```

**When to use empty-line:**
- Pure spacing without visual elements
- Minimal, clean separation
- Grouping fields within the same conceptual section

**When to use info field:**
- Need to add textual context or labels
- Want a visual separator like a line or border
- Creating named sections

## Output

The empty line field generates **no output** in your content files. It only affects the visual layout of the form interface.

## Tips

- **Start Small:** Begin with `amount: 1` and increase only if needed
- **Mobile Consideration:** Large spacing amounts may push content off-screen on mobile devices
- **Accessibility:** Proper spacing improves form usability for all users
- **Maintenance:** Use consistent key naming like `spacer-{number}` or `{section}-separator`

## Related Fields

- [Info](./info.md) - Display informational content with markdown
- [Object](../container-fields/object.md) - Group fields within a container (alternative to visual grouping)
