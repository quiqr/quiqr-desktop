---
sidebar_position: 2
---

# Object Field

The `object` field (also known as `section`) groups related fields together visually and logically. It creates a nested object in the output with all child field values.

:::info Field Type
**Type:** `object` or `section`  
**Category:** Container Field  
**Output:** Single nested object
:::

## Visual Example

![Object Field](/img/fields/section.png)

The object field creates a visually grouped section containing its child fields.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the object |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `fields` | array | Yes | - | Array of field definitions within the object |

## Examples

### Example 1: Address Object

**Configuration:**

```yaml
- key: address
  title: Address
  type: object
  fields:
    - key: street
      type: string
      title: Street
    - key: city
      type: string
      title: City
    - key: postal_code
      type: string
      title: Postal Code
    - key: country
      type: string
      title: Country
```

**Output:**

```yaml
address:
  street: 123 Main St
  city: San Francisco
  postal_code: "94102"
  country: USA
```

### Example 2: Social Media Links

**Configuration:**

```yaml
- key: social
  title: Social Media
  type: object
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
social:
  twitter: https://twitter.com/username
  github: https://github.com/username
  linkedin: https://linkedin.com/in/username
```

### Example 3: SEO Metadata

**Configuration:**

```yaml
- key: seo
  type: object
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

## Object vs Bundle

| Feature | Object | Bundle |
|---------|--------|--------|
| Output structure | Same | Same |
| UI grouping | No | Yes (collapsible) |
| Visual separation | Minimal | Clear box |
| Use case | Data structure | UI organization |

## Related Fields

- [Bundle](./bundle.md) - Similar with collapsible UI grouping
- [List](./list.md) - For arrays of items
- [Nested](./nested.md) - For deeply nested tree structures
