---
sidebar_position: 3
---

# List Field

The `list` field (also known as `leaf-array`) creates an array of repeating items. Each item can contain multiple fields, making it perfect for managing lists of structured data.

:::info Field Type
**Type:** `list` or `leaf-array`  
**Category:** Container Field  
**Output:** Array of objects
:::

## Visual Example

![List Field](/img/fields/leaf-array.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the list |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `item_type` | string | No | string | Type of items (string, number, object) |
| `fields` | array | Conditional | - | Required if item_type is 'object' |
| `min_items` | number | No | - | Minimum number of items |
| `max_items` | number | No | - | Maximum number of items |

## Examples

### Example 1: Simple String List

**Configuration:**

```yaml
- key: features
  title: Features
  type: list
  item_type: string
```

**Output:**

```yaml
features:
  - Fast performance
  - Easy to use
  - Highly customizable
```

### Example 2: Number List

**Configuration:**

```yaml
- key: dimensions
  title: Dimensions (cm)
  type: list
  item_type: number
  min_items: 3
  max_items: 3
```

**Output:**

```yaml
dimensions:
  - 10
  - 20
  - 30
```

### Example 3: Complex Object List

**Configuration:**

```yaml
- key: team_members
  title: Team Members
  type: list
  item_type: object
  fields:
    - key: name
      type: string
      title: Name
    - key: role
      type: string
      title: Role
    - key: email
      type: string
      title: Email
    - key: active
      type: boolean
      title: Active
      default: true
```

**Output:**

```yaml
team_members:
  - name: Alice Johnson
    role: Developer
    email: alice@example.com
    active: true
  - name: Bob Smith
    role: Designer
    email: bob@example.com
    active: true
```

### Example 4: FAQ List

**Configuration:**

```yaml
- key: faqs
  title: Frequently Asked Questions
  type: list
  item_type: object
  fields:
    - key: question
      type: string
      title: Question
    - key: answer
      type: markdown
      title: Answer
```

**Output:**

```yaml
faqs:
  - question: How do I get started?
    answer: Follow the installation guide...
  - question: Is it free?
    answer: Yes, it's open source!
```

## Features

- **Add/Remove**: Add or remove items dynamically
- **Reorder**: Drag to reorder items (if supported)
- **Item types**: Simple values or complex objects
- **Validation**: Min/max item constraints

## Use Cases

- **Simple lists**: Features, tags, categories
- **Structured lists**: Team members, products, events
- **FAQs**: Question and answer pairs
- **Timeline**: Events with dates and descriptions
- **Portfolio**: Projects with details

## Item Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text values | Names, titles, descriptions |
| `number` | Numeric values | Quantities, prices, IDs |
| `object` | Complex items | Team members, products |

## Related Fields

- [Chips](../data-fields/chips.md) - For simple tag lists
- [Object](./object.md) - For single nested objects
- [Nested](./nested.md) - For tree structures
