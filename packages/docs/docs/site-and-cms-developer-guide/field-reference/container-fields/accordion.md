---
sidebar_position: 5
---

# Accordion

The accordion field is a container for managing arrays of items with collapsible panels. Each array item can be expanded/collapsed individually, providing a clean interface for managing multiple complex records.

:::info Field Type
**Type:** `accordion`  
**Category:** Container Field  
**Output:** Array of objects
:::

## Basic Configuration

```yaml
- key: team-members
  type: accordion
  title: Team Members
  fields:
    - key: name
      type: string
      title: Name
    
    - key: role
      type: string
      title: Role
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `fields` | array | Yes | - | Child fields for each accordion item |
| `dynFormSearchKey` | string | No | - | Key for dynamic partials selection |
| `dynFormObjectFile` | string | No | - | Path to dynamic form file (no extension) |
| `dynFormObjectRoot` | string | No | - | Root key in dynamic form file |
| `arrayIndicesAreKeys` | boolean | No | `false` | Use array indices as dict keys |
| `disableCreate` | boolean | No | `false` | Disable creating new items |
| `disableDelete` | boolean | No | `false` | Disable deleting items |
| `disableSort` | boolean | No | `false` | Disable reordering items |

### Field-Level Properties

Within the `fields` array, you can use:

| Property | Type | Description |
|----------|------|-------------|
| `arrayTitle` | boolean | Use this field's value as the accordion item title |

## Visual Example

![Accordion Field](/img/fields/accordion.png)

Each item appears as a collapsible panel with expand/collapse controls.

## Usage Examples

### Basic Team Members

```yaml
- key: team
  type: accordion
  title: Team Members
  fields:
    - key: name
      type: string
      title: Name
      arrayTitle: true
    
    - key: role
      type: string
      title: Role
    
    - key: bio
      type: markdown
      title: Biography
```

**Output:**
```yaml
team:
  - name: "Alice Johnson"
    role: "Lead Developer"
    bio: "10 years of experience..."
  - name: "Bob Smith"
    role: "Designer"
    bio: "Award-winning designer..."
```

### Disable Controls

```yaml
- key: fixed-items
  type: accordion
  title: Fixed Items
  disableCreate: true
  disableDelete: true
  disableSort: true
  fields:
    - key: title
      type: string
      title: Title
```

### Array Title from Multiple Fields

```yaml
- key: products
  type: accordion
  title: Products
  fields:
    - key: name
      type: string
      title: Product Name
      arrayTitle: true
    
    - key: sku
      type: string
      title: SKU
      arrayTitle: true
    
    - key: price
      type: number
      title: Price
```

The accordion title will show: "Product Name - SKU"

## Dynamic Forms

### Inline Dynamic Partials

```yaml
- key: content-blocks
  type: accordion
  title: Content Blocks
  dynFormSearchKey: "block_type"
  fields:
    - key: block_type
      type: select
      title: Block Type
      options:
        - label: "Text Block"
          value: "text"
        - label: "Image Block"
          value: "image"
        - label: "Video Block"
          value: "video"
    
    # Text block fields
    - key: text_content
      type: markdown
      title: Content
      dynPartial: "text"
    
    # Image block fields
    - key: image_url
      type: image
      title: Image
      dynPartial: "image"
    
    - key: image_caption
      type: string
      title: Caption
      dynPartial: "image"
    
    # Video block fields
    - key: video_url
      type: string
      title: Video URL
      dynPartial: "video"
```

Fields are shown/hidden based on the `block_type` value.

### External Dynamic Form File

```yaml
- key: widgets
  type: accordion
  title: Widgets
  dynFormSearchKey: "widget_type"
  dynFormObjectFile: "models/widgets/base"
  dynFormObjectRoot: "fields"
  fields:
    - key: widget_type
      type: select
      title: Widget Type
      options:
        - label: "Map"
          value: "map"
        - label: "Chart"
          value: "chart"
```

**File: models/widgets/base.yaml:**
```yaml
fields:
  map:
    - key: latitude
      type: number
      title: Latitude
    - key: longitude
      type: number
      title: Longitude
  
  chart:
    - key: chart_data
      type: string
      title: Chart Data
    - key: chart_type
      type: select
      title: Chart Type
      options:
        - label: "Bar"
          value: "bar"
        - label: "Line"
          value: "line"
```

## Dictionary Mode

Use `arrayIndicesAreKeys: true` to store items as a dictionary instead of an array:

```yaml
- key: services
  type: accordion
  title: Services
  arrayIndicesAreKeys: true
  fields:
    - key: name
      type: string
      title: Service Name
      arrayTitle: true
    
    - key: description
      type: string
      title: Description
```

**Output:**
```yaml
services:
  0:
    name: "Web Development"
    description: "Custom websites"
  1:
    name: "Design"
    description: "Brand identity"
```

Instead of:
```yaml
services:
  - name: "Web Development"
    description: "Custom websites"
  - name: "Design"
    description: "Brand identity"
```

## Use Cases

### FAQ Section

```yaml
- key: faqs
  type: accordion
  title: Frequently Asked Questions
  fields:
    - key: question
      type: string
      title: Question
      arrayTitle: true
    
    - key: answer
      type: markdown
      title: Answer
```

### Portfolio Projects

```yaml
- key: projects
  type: accordion
  title: Portfolio Projects
  fields:
    - key: title
      type: string
      title: Project Title
      arrayTitle: true
    
    - key: client
      type: string
      title: Client
    
    - key: cover-image
      type: image
      title: Cover Image
    
    - key: description
      type: markdown
      title: Description
    
    - key: gallery
      type: list
      title: Gallery Images
      fields:
        - key: image
          type: image
          title: Image
```

### Testimonials

```yaml
- key: testimonials
  type: accordion
  title: Testimonials
  fields:
    - key: author
      type: string
      title: Author Name
      arrayTitle: true
    
    - key: role
      type: string
      title: Role/Title
    
    - key: avatar
      type: image
      title: Avatar
    
    - key: quote
      type: markdown
      title: Quote
    
    - key: rating
      type: number
      title: Rating
      default: 5
```

### Features List

```yaml
- key: features
  type: accordion
  title: Product Features
  fields:
    - key: name
      type: string
      title: Feature Name
      arrayTitle: true
    
    - key: icon
      type: fonticon-picker
      title: Icon
    
    - key: description
      type: markdown
      title: Description
    
    - key: enabled
      type: boolean
      title: Enabled
      default: true
```

## Nested Accordions

You can nest accordion fields within accordion fields:

```yaml
- key: departments
  type: accordion
  title: Departments
  fields:
    - key: dept-name
      type: string
      title: Department Name
      arrayTitle: true
    
    - key: employees
      type: accordion
      title: Employees
      fields:
        - key: name
          type: string
          title: Name
          arrayTitle: true
        
        - key: position
          type: string
          title: Position
```

## Disabled Fields Display

When child fields are disabled (via `disableCreate`, `disableDelete`, or `disableSort`), they appear with a light grey background to indicate their read-only or restricted state.

## Best Practices

1. **Use arrayTitle:** Set `arrayTitle: true` on a descriptive field for better UX
2. **Limit Nesting:** Avoid deeply nested accordions (max 2-3 levels)
3. **Meaningful Names:** Use clear, descriptive titles for accordion items
4. **Consider Performance:** Large numbers of accordion items (>50) may impact performance
5. **Dynamic Forms:** Use dynamic partials for complex, variable-structure data
6. **Control Visibility:** Disable unnecessary controls to simplify the interface

## Comparison with Other Container Fields

| Feature | Accordion | List | Nested |
|---------|-----------|------|--------|
| **Display** | Collapsible panels | Inline items | Hierarchical tree |
| **Best For** | Complex items | Simple items | Parent-child relationships |
| **Visual Density** | Low (collapsed) | Medium | Low (expandable) |
| **Ordering** | Manual (drag) | Manual (drag) | Hierarchical |

**When to use accordion:**
- Items are complex with many fields
- Need to manage many items without overwhelming the interface
- Want collapsible interface for better organization

**When to use list:**
- Items are simple (few fields)
- All items should be visible at once
- Prefer compact display

**When to use nested:**
- Data has parent-child relationships
- Need hierarchical organization
- Building tree structures (menus, categories)

## Output

```yaml
# Standard array output
team:
  - name: "Alice"
    role: "Developer"
  - name: "Bob"
    role: "Designer"

# Dictionary mode (arrayIndicesAreKeys: true)
team:
  0:
    name: "Alice"
    role: "Developer"
  1:
    name: "Bob"
    role: "Designer"
```

## Related Fields

- [List](./list.md) - Simple array container
- [Nested](./nested.md) - Hierarchical tree structure
- [Bundle](./bundle.md) - File-based content manager
- [Object](./object.md) - Single grouped object
