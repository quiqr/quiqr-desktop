---
sidebar_position: 1
---

# Info

The info field displays read-only informational content using markdown formatting. It's perfect for providing instructions, warnings, contextual help, or examples directly within your forms.

:::info Field Type
**Type:** `info`  
**Category:** Layout Field  
**Output:** None (display only)
:::

## Basic Configuration

```yaml
- key: welcome-message
  type: info
  content: |
    # Welcome to the Content Editor
    
    This form allows you to edit your **homepage content**.
    Please fill in all required fields before saving.
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `content` | markdown | Yes | - | Markdown content to display |
| `size` | string | No | `normal` | Display size: `small`, `normal`, or `large` |
| `lineHeight` | string | No | - | CSS line-height value (e.g., `1.5`, `2em`) |
| `theme` | string | No | `default` | Visual theme (see Themes section) |

## Themes

The info field supports multiple themes for different use cases:

### Default Theme
Standard informational box with light blue background.

![Default Theme](/img/field-reference/layout-fields/info_default.png)

```yaml
- key: info-default
  type: info
  theme: default
  content: "This is the default theme."
```

### Bare Theme
Minimal styling without background color.

![Bare Theme](/img/field-reference/layout-fields/info_bare.png)

```yaml
- key: info-bare
  type: info
  theme: bare
  content: "This is the bare theme with no background."
```

### Warning Theme
Yellow/orange background for important warnings or cautions.

![Warning Theme](/img/field-reference/layout-fields/info_warn.png)

```yaml
- key: info-warning
  type: info
  theme: warn
  content: |
    **Warning:** Changing this setting may affect site performance.
```

### Warning Bare Theme
Warning color without background.

```yaml
- key: info-warning-bare
  type: info
  theme: warn-bare
  content: "⚠️ Important: Review before proceeding."
```

### Black Theme
Dark background with light text.

![Black Theme](/img/field-reference/layout-fields/info_black.png)

```yaml
- key: info-black
  type: info
  theme: black
  content: "Dark themed information box."
```

### Black Bare Theme
Black text without background.

```yaml
- key: info-black-bare
  type: info
  theme: black-bare
  content: "Black text, no background."
```

### Gray Theme
Subtle gray background for secondary information.

![Gray Theme](/img/field-reference/layout-fields/info_gray.png)

```yaml
- key: info-gray
  type: info
  theme: gray
  content: "Gray background for subtle emphasis."
```

### Gray Bare Theme
Gray text without background.

```yaml
- key: info-gray-bare
  type: info
  theme: gray-bare
  content: "Gray text, no background."
```

## Size Options

### Small
Compact display with reduced padding.

```yaml
- key: brief-note
  type: info
  size: small
  content: "Brief informational note."
```

### Normal (Default)
Standard size for most use cases.

```yaml
- key: standard-info
  type: info
  size: normal
  content: "Standard informational content."
```

### Large
Expanded display for prominent information.

```yaml
- key: important-notice
  type: info
  size: large
  content: |
    # Important Notice
    
    This section contains critical information for editors.
```

## Markdown Support

The info field supports full markdown syntax:

```yaml
- key: rich-content
  type: info
  content: |
    ## Features Supported
    
    - **Bold** and *italic* text
    - [Links](https://example.com)
    - `inline code`
    - Lists and nested lists
    - Images: ![alt text](/path/to/image.png)
    
    ```javascript
    // Code blocks with syntax highlighting
    const example = "Hello World";
    ```
```

## Use Cases

### Form Instructions

```yaml
fields:
  - key: instructions
    type: info
    theme: default
    content: |
      ## How to Use This Form
      
      1. Fill in the **title** and **description**
      2. Upload a featured image
      3. Select relevant categories
      4. Click **Save** when complete
  
  - key: title
    type: string
    title: Title
```

### Warnings and Cautions

```yaml
fields:
  - key: danger-warning
    type: info
    theme: warn
    size: large
    content: |
      **⚠️ Caution**
      
      Deleting this content cannot be undone. Make sure you have
      a backup before proceeding.
  
  - key: confirm-delete
    type: boolean
    title: I understand the risks
```

### Contextual Help

```yaml
fields:
  - key: seo-title
    type: string
    title: SEO Title
  
  - key: seo-help
    type: info
    size: small
    theme: bare
    content: |
      💡 **Tip:** Keep your SEO title under 60 characters for
      best results in search engines.
```

### Code Examples

```yaml
fields:
  - key: shortcode-example
    type: info
    theme: gray
    content: |
      ### Using the Gallery Shortcode
      
      ```markdown
      {{</* gallery dir="/images/photos/" */>}}
      ```
      
      This will display all images from the specified directory.
```

## Line Height Control

Adjust spacing for better readability:

```yaml
- key: tight-spacing
  type: info
  lineHeight: "1.2"
  content: "Content with reduced line spacing."

- key: loose-spacing
  type: info
  lineHeight: "2em"
  content: "Content with increased line spacing."
```

## Best Practices

1. **Keep It Concise:** Info boxes should provide quick, scannable information
2. **Choose Appropriate Themes:** Use warning themes for important notices, bare themes for subtle hints
3. **Position Strategically:** Place info fields near related form fields for context
4. **Use Markdown Wisely:** Format content for readability with headers, lists, and emphasis
5. **Consider Size:** Use small size for brief notes, large size for critical information

## Common Patterns

### Section Headers

```yaml
- key: section-header
  type: info
  theme: bare
  size: large
  content: "## Personal Information"

- key: first-name
  type: string
  title: First Name

- key: last-name
  type: string
  title: Last Name
```

### Progressive Disclosure

```yaml
- key: basic-settings
  type: info
  content: "Configure basic settings below."

# ... basic fields ...

- key: advanced-warning
  type: info
  theme: warn
  content: |
    ## Advanced Settings
    
    Only modify these if you know what you're doing.

# ... advanced fields ...
```

## Output

The info field generates **no output** in your content files. It exists purely for the form interface.

## Related Fields

- [Empty Line](./empty-line.md) - Add vertical spacing between fields
- [String](../data-fields/string.md) - Editable text field
- [Readonly](../data-fields/readonly.md) - Display read-only values from content
