---
sidebar_position: 6
---

# Pull

The pull field is a special container that displays child fields at the same visual level as its parent, while storing their values under a grouped key. It's useful for organizing related fields without adding visual nesting.

:::info Field Type
**Type:** `pull`  
**Category:** Container Field  
**Output:** Object (dictionary) under the pull key
:::

## Basic Configuration

```yaml
- key: metadata
  type: pull
  fields:
    - key: author
      type: string
      title: Author
    
    - key: date
      type: date
      title: Date
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `fields` | array | Yes | - | Child fields to display |
| `group` | string | No | (uses `key`) | Override the output grouping key |

## Visual Example

![Pull Field](/img/fields/pull.png)

Child fields appear at the same level visually, but are grouped in output.

## How It Works

**Visual Display:**
- Child fields are rendered inline with other fields
- No visual container or grouping UI
- Appears "pulled up" to the parent level

**Data Output:**
- Values are stored under the pull field's key
- Creates a nested object in the output
- Maintains logical grouping in data structure

## Usage Examples

### Basic Metadata

```yaml
fields:
  - key: title
    type: string
    title: Title
  
  - key: meta
    type: pull
    fields:
      - key: author
        type: string
        title: Author
      
      - key: date
        type: date
        title: Date
```

**Visual Layout (how it appears in the form):**
```
Title: [input]
Author: [input]
Date: [input]
```

**Output:**
```yaml
title: "My Article"
meta:
  author: "John Doe"
  date: 2024-01-15
```

### Custom Group Key

```yaml
- key: meta-fields
  type: pull
  group: params
  fields:
    - key: description
      type: string
      title: Description
    
    - key: keywords
      type: chips
      title: Keywords
```

**Output:**
```yaml
params:
  description: "Article description"
  keywords:
    - "hugo"
    - "cms"
```

Note: Even though the field key is `meta-fields`, the `group` property overrides it to use `params` in the output.

## Use Cases

### Hugo Params Organization

```yaml
fields:
  - key: title
    type: string
    title: Title
  
  - key: content
    type: markdown
    title: Content
  
  - key: params-group
    type: pull
    group: params
    fields:
      - key: author
        type: string
        title: Author
      
      - key: featured
        type: boolean
        title: Featured
      
      - key: categories
        type: chips
        title: Categories
```

**Output:**
```yaml
title: "My Post"
content: "Post content..."
params:
  author: "Alice"
  featured: true
  categories:
    - "tech"
    - "tutorial"
```

### Metadata Without Visual Clutter

```yaml
- key: page-title
  type: string
  title: Page Title

- key: seo-meta
  type: pull
  group: seo
  fields:
    - key: meta-title
      type: string
      title: SEO Title
    
    - key: meta-description
      type: string
      title: SEO Description
    
    - key: og-image
      type: image
      title: Open Graph Image

- key: content
  type: markdown
  title: Content
```

The SEO fields appear inline with other fields, but are grouped under `seo` in output.

### Front Matter Organization

```yaml
singles:
  - key: homepage
    title: Homepage
    file: content/_index.md
    fields:
      - key: title
        type: string
        title: Title
      
      - key: hero
        type: pull
        fields:
          - key: heading
            type: string
            title: Hero Heading
          
          - key: subheading
            type: string
            title: Hero Subheading
          
          - key: background
            type: image
            title: Background Image
      
      - key: content
        type: markdown
        title: Content
```

**Output:**
```yaml
title: "Welcome"
hero:
  heading: "Build Fast Websites"
  subheading: "With Hugo and Quiqr"
  background: "/images/hero-bg.jpg"
content: "Homepage content..."
```

### Settings Grouping

```yaml
- key: site-title
  type: string
  title: Site Title

- key: appearance
  type: pull
  fields:
    - key: theme
      type: select
      title: Theme
      options:
        - label: "Light"
          value: "light"
        - label: "Dark"
          value: "dark"
    
    - key: accent-color
      type: color
      title: Accent Color

- key: social
  type: pull
  fields:
    - key: twitter
      type: string
      title: Twitter Handle
    
    - key: github
      type: string
      title: GitHub Username
```

**Output:**
```yaml
site-title: "My Site"
appearance:
  theme: "light"
  accent-color: "#0055bb"
social:
  twitter: "@username"
  github: "username"
```

## Comparison with Object Field

| Feature | Pull | Object |
|---------|------|--------|
| **Visual Display** | Inline (same level) | Grouped container |
| **UI Indication** | None (invisible) | Visual grouping box |
| **Output** | Nested under key | Nested under key |
| **Use Case** | Logical grouping without visual clutter | Visual and logical grouping |

**When to use pull:**
- Want logical grouping in output without visual nesting
- Form has many related fields that would benefit from flat display
- Need to organize output structure without changing form layout
- Working with Hugo params or other nested configurations

**When to use object:**
- Want visual grouping to help users understand relationships
- Fields are conceptually grouped and should look grouped
- Need collapsible sections for complex forms

## Best Practices

1. **Use `group` Property:** Override the key with `group` for cleaner output structure
2. **Logical Grouping:** Group related fields that belong together in the data model
3. **Avoid Overuse:** Don't use pull just for nesting - it should have a purpose
4. **Clear Naming:** Use descriptive keys/group names that indicate the grouping purpose
5. **Documentation:** Comment your model file to explain pull field groupings

## Common Patterns

### Hugo Params Pattern

```yaml
- key: hugo-params
  type: pull
  group: params
  fields:
    # All fields here go under params in front matter
```

### SEO Metadata Pattern

```yaml
- key: seo-fields
  type: pull
  group: seo
  fields:
    - key: title
      type: string
      title: SEO Title
    - key: description
      type: string
      title: SEO Description
    - key: canonical
      type: string
      title: Canonical URL
```

### Settings Namespace Pattern

```yaml
- key: theme-settings
  type: pull
  group: theme
  fields:
    - key: color
      type: color
      title: Theme Color
    - key: font
      type: font-picker
      title: Theme Font
```

## Output

The pull field creates nested objects in the output:

```yaml
# Without group property
metadata:
  author: "Alice"
  date: 2024-01-15

# With group property
params:
  description: "Article description"
  keywords:
    - "hugo"
```

## Limitations

1. **No Visual Indication:** Users don't see that fields are grouped
2. **Flat Display Only:** Can't collapse/expand like object fields
3. **No Validation Grouping:** Validation errors don't reference the pull container
4. **Potential Confusion:** May confuse users about output structure

## Tips

- **Document the Structure:** Add info fields explaining the output structure
- **Use with Hugo:** Particularly useful for Hugo's `params` section
- **Combine with Info Fields:** Add context about the grouping
- **Test Output:** Verify the output structure matches expectations

```yaml
- key: params-info
  type: info
  content: "The following fields will be grouped under `params` in the front matter."

- key: site-params
  type: pull
  group: params
  fields:
    # ... fields
```

## Related Fields

- [Object](./object.md) - Container with visual grouping
- [Nested](./nested.md) - Hierarchical tree structure
- [Accordion](./accordion.md) - Collapsible array items
- [Bundle](./bundle.md) - File-based content manager
