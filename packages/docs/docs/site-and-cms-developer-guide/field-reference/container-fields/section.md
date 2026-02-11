---
sidebar_position: 2
---

# Section Field

The `section` field groups related fields together visually and logically. It creates a nested object in the output with all child field values.

:::info Field Type
**Type:** `section`  
**Category:** Container Field  
**Output:** Single nested object
:::

## Visual Example

![Section Field](/img/fields/section.png)

The section field creates a visually grouped section containing its child fields.

## Properties

| property  | value type            | optional                | description                                                                                                                                                           |
|-----------|-----------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| key       | string                | mandatory               | Keys are for internal use and must be unique.                                                                                                                         |
| title     | string                | optional                | The title of the element.                                                                                                                                             |
| fields    | array of dictionaries | mandatory               | These are the subform input fields.                                                                                                                                   |
| groupdata | boolean               | optional (default: true) | When set true to child field value are stored in a hash below the section key. When set false the values are placed at the same level as the section neighbour fields |

## Examples

### Example 1: Address Object

**Configuration:**

```yaml
- key: social
  title: Social Media
  type: section
  groupdata: false
  fields:
    - key: twitter
      type: string
      title: Twitter URL
    - key: github
      type: string
      title: GitHub URL
    - key: linkedin
      type: string
      title: LinkedIn URL
```

**Output:**

```yaml
twitter: https://twitter.com/username
github: https://github.com/username
linkedin: https://linkedin.com/in/username
```

### Example 2: SEO Metadata

**Configuration:**

```yaml
- key: seo
  type: section
  groupdata: true
  fields:
    - key: title
      type: string
      title: SEO Title
    - key: description
      type: string
      title: Meta Description
      multiLine: true
    - key: image
      type: string
      title: Social Share Image
    - key: keywords
      type: chips
      title: Keywords
```

**Output:**

```yaml
seo:
  title: Custom SEO Title
  description: A detailed description for search engines
  image: /images/share.jpg
  keywords:
    - keyword1
    - keyword2
```

## Features

- **Nested structure**: Creates object in frontmatter
- **Type flexibility**: Can contain any field types
- **No UI grouping**: Fields render inline (unlike bundle)
- **Deep nesting**: Can contain other objects

## Use Cases

- **Structured data**: Addresses, contact info, location
- **Related fields**: Group logically related data
- **API data**: Match external API structures
- **Complex types**: Compound data structures

## Section vs Bundle

| Feature | Object | Bundle |
|---------|--------|--------|
| Output structure | Same | Same |
| UI grouping | No | Yes (collapsible) |
| Visual separation | Minimal | Clear box |
| Use case | Data structure | UI organization |

## Related Fields

- [Bundle](./bundle.md) - Similar with collapsible UI grouping
- [Nested](./nested.md) - For deeply nested tree structures
