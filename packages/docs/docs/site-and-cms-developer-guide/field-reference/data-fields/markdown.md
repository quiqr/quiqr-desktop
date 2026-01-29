---
sidebar_position: 7
---

# Markdown Field

The `markdown` field provides a markdown editor with preview and formatting tools.

![Markdown editor](/img/fields/markdown1.png)

![Markdown preview](/img/fields/markdown2.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default markdown content |
| `autoSave` | boolean | No | false | Auto-save form after changing value |

## Examples

### Example 1: Article Content

**Configuration:**

```yaml
key: content
title: Article Content
type: markdown
tip: Write your article content in markdown format
```

**Output:**

```yaml
content: |-
  # Introduction
  
  This is the article content with **bold** and *italic* text.
  
  ## Features
  
  - Lists
  - Links
  - Images
```

### Example 2: Description with Default

**Configuration:**

```yaml
key: description
title: Description
type: markdown
default: |-
  Add your description here...
```

**Output:**

```yaml
description: |-
  Custom description goes here.
```

## Supported Markdown Features

- **Headings**: `# H1`, `## H2`, `### H3`, etc.
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Lists**: Ordered and unordered
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Code blocks**: ` ```language ` 
- **Inline code**: `` `code` ``
- **Blockquotes**: `> quote`
- **Horizontal rules**: `---`
- **Tables**: GitHub-flavored markdown tables

## Editor Features

- Live preview toggle
- Syntax highlighting
- Formatting toolbar
- Keyboard shortcuts
- Full-screen mode

## Use Cases

- **Content**: Blog posts, articles, documentation
- **Descriptions**: Rich product descriptions, bios
- **Notes**: Meeting notes, project notes
- **Documentation**: README files, guides

## Related Fields

- [EasyMDE](./easymde.md) - Alternative markdown editor with different features
- [String](./string.md) - For plain text without formatting
