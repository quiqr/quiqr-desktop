---
sidebar_position: 6
---

# Chips Field

The `chips` field allows multiple tag/chip selection with autocomplete and quick adding.

![Chips field](/img/fields/chips.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | array | No | [] | Default selected values |
| `autoSave` | boolean | No | false | Auto-save form after changing value |
| `options` | array | No | [] | Predefined chip options |

## Examples

### Example 1: Tags

**Configuration:**

```yaml
key: tags
title: Tags
type: chips
options:
  - JavaScript
  - TypeScript
  - React
  - Vue
  - Node.js
  - Docker
```

**Output:**

```yaml
tags:
  - JavaScript
  - React
  - Docker
```

### Example 2: Categories with Default

**Configuration:**

```yaml
key: categories
title: Categories
type: chips
default:
  - General
options:
  - General
  - Technology
  - Design
  - Business
```

**Output:**

```yaml
categories:
  - General
  - Technology
```

### Example 3: Free-form Keywords

**Configuration:**

```yaml
key: keywords
title: Keywords
type: chips
tip: Add custom keywords for SEO
```

**Output:**

```yaml
keywords:
  - custom-keyword-1
  - another-keyword
  - third-keyword
```

## Features

- **Autocomplete**: Type-ahead suggestions from options
- **Quick add**: Press Enter to add new chips
- **Remove**: Click X or press Backspace to remove chips
- **Custom values**: Can add values not in options list
- **Visual feedback**: Selected chips displayed as colored badges

## Use Cases

- **Tagging**: Blog tags, article tags, categorization
- **Keywords**: SEO keywords, search terms
- **Categories**: Multiple categories, topic selection
- **Features**: Product features, capability lists
- **Skills**: Skill tags, technology stacks

## Output Format

Always outputs as a YAML array:

```yaml
tags:
  - tag1
  - tag2
  - tag3
```

## Related Fields

- [Select](./select.md) - Alternative for predefined multiple selection
- [String](./string.md) - For single values or comma-separated text
