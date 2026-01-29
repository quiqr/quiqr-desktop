---
sidebar_position: 8
---

# EasyMDE Field

The `easymde` field provides an alternative markdown editor using the EasyMDE library.

:::info Field Type
**Type:** `easymde`  
**Category:** Data Field  
**Output:** String (markdown)
:::

## Visual Example

![EasyMDE Field](/img/fields/easymde.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default markdown content |
| `autoSave` | boolean | No | false | Auto-save form after changing value |

## Examples

### Example 1: Documentation Content

**Configuration:**

```yaml
key: documentation
title: Documentation
type: easymde
tip: Write documentation in markdown format
```

**Output:**

```yaml
documentation: |-
  # Getting Started
  
  Follow these steps to get started with the application.
```

### Example 2: Release Notes

**Configuration:**

```yaml
key: release_notes
title: Release Notes
type: easymde
default: |-
  ## What's New
  
  - Feature 1
  - Feature 2
```

**Output:**

```yaml
release_notes: |-
  ## What's New
  
  - Added user authentication
  - Improved performance
```

## Features

- **Toolbar**: Rich formatting toolbar with buttons
- **Preview**: Side-by-side or toggle preview
- **Auto-save**: Built-in auto-save functionality
- **Full-screen**: Distraction-free writing mode
- **Spell checker**: Optional spell checking
- **Image upload**: Drag-and-drop image support

## EasyMDE vs Standard Markdown

| Feature | EasyMDE | Markdown |
|---------|---------|----------|
| Toolbar | More visual | Simpler |
| Preview | Side-by-side | Toggle |
| Auto-save | Built-in | Optional |
| Image upload | Drag-and-drop | Manual |
| File size | Larger library | Lighter |

## Use Cases

- **Long-form content**: Articles, blog posts, documentation
- **Rich editing**: When users need more visual guidance
- **Image-heavy**: Content with many images
- **Non-technical users**: Prefer visual toolbar over keyboard shortcuts

## Supported Markdown

Same markdown support as the standard markdown field:
- Headings, bold, italic
- Lists, links, images
- Code blocks, blockquotes
- Tables (GitHub-flavored)

## Related Fields

- [Markdown](./markdown.md) - Standard markdown editor
- [String](./string.md) - For plain text without formatting
