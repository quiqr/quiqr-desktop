---
sidebar_position: 3
---

# Leaf-Array Field

The `leaf-array` field  creates an array of repeating items. Each item can contain multiple fields, making it perfect for managing lists of structured data.

:::info Field Type
**Type:** `leaf-array`  
**Category:** Container Field  
**Output:** Array of item of a single field type
:::

## Visual Example

![Leaf-Array Field](/img/fields/leaf-array.png)

## Properties

| property | value type | optional  | description                                   |
|----------|------------|-----------|-----------------------------------------------|
| key      | string     | mandatory | Keys are for internal use and must be unique. |
| title    | string     | optional  | The title of the element.                     |
| field    | dictionary | mandatory | Dictionary with child field definition.       |


## Examples

### Example 1: Simple String List

**Configuration:**

```yaml
- key: some_parent_field
  title: Some parent field
  type: leaf-array
  field:
    key: some_child_field
    title: Some chield field
    type: date

```

**Output:**

```yaml
some_parent_field:
  - "2021-04-02"
  - "2021-04-21"
  - "2021-05-07"
```

## Features

- **Add/Remove**: Add or remove items dynamically

## Use Cases

- **Simple lists**: Features, tags, categories
