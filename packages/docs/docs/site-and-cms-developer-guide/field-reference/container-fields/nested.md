---
sidebar_position: 4
---

# Nested Field

The `nested` field (also known as `nest`) provides a hierarchical tree structure for managing parent-child relationships. It's perfect for nested categories, menu structures, or any hierarchical data.

:::info Field Type
**Type:** `nested` or `nest`  
**Category:** Container Field  
**Output:** Nested array with parent-child relationships
:::

## Visual Examples

### Nested Tree View

![Nested Field Tree](/img/fields/nest1.png)

The nested field displays items in an expandable tree structure.

### Nested Item Editing

![Nested Field Detail](/img/fields/nest2.png)

Each nested item can be expanded to show its child fields and sub-items.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the nested structure |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `fields` | array | Yes | - | Field definitions for each item |
| `max_depth` | number | No | 5 | Maximum nesting depth |

## Examples

### Example 1: Navigation Menu

**Configuration:**

```yaml
- key: main_menu
  title: Main Navigation
  type: nested
  max_depth: 3
  fields:
    - key: label
      type: string
      title: Menu Label
    - key: url
      type: string
      title: URL
    - key: icon
      type: string
      title: Icon (optional)
```

**Output:**

```yaml
main_menu:
  - label: Home
    url: /
  - label: Products
    url: /products
    children:
      - label: Software
        url: /products/software
      - label: Hardware
        url: /products/hardware
        children:
          - label: Laptops
            url: /products/hardware/laptops
          - label: Desktops
            url: /products/hardware/desktops
  - label: About
    url: /about
```

### Example 2: Category Tree

**Configuration:**

```yaml
- key: categories
  title: Product Categories
  type: nested
  max_depth: 4
  fields:
    - key: name
      type: string
      title: Category Name
    - key: slug
      type: string
      title: URL Slug
    - key: description
      type: text
      title: Description
```

**Output:**

```yaml
categories:
  - name: Electronics
    slug: electronics
    description: Electronic devices and accessories
    children:
      - name: Computers
        slug: computers
        description: Laptops, desktops, and accessories
        children:
          - name: Laptops
            slug: laptops
          - name: Desktops
            slug: desktops
```

### Example 3: Organization Structure

**Configuration:**

```yaml
- key: organization
  title: Organization Chart
  type: nested
  fields:
    - key: name
      type: string
      title: Name
    - key: title
      type: string
      title: Job Title
    - key: email
      type: string
      title: Email
```

**Output:**

```yaml
organization:
  - name: Jane Doe
    title: CEO
    email: jane@example.com
    children:
      - name: John Smith
        title: CTO
        email: john@example.com
        children:
          - name: Alice Johnson
            title: Senior Developer
            email: alice@example.com
      - name: Bob Williams
        title: CFO
        email: bob@example.com
```

## Features

- **Hierarchical**: Unlimited nesting (up to max_depth)
- **Add/Remove**: Add children at any level
- **Reorder**: Drag to reorder items and subtrees
- **Expand/Collapse**: Toggle visibility of branches
- **Custom fields**: Define any fields for items

## Structure

Each item in a nested field can have:
- All defined fields
- `children` array containing child items
- Child items have the same structure recursively

## Use Cases

- **Navigation**: Site menus, sidebars, breadcrumbs
- **Categories**: Product categories, topic hierarchies
- **Organization**: Org charts, team structures
- **File systems**: Folder structures, document trees
- **Taxonomy**: Classification systems, tag hierarchies

## Best Practices

1. **Limit depth**: Use `max_depth` to prevent overly deep nesting
2. **Keep it simple**: Complex nested structures can be hard to manage
3. **Clear labels**: Use descriptive field titles
4. **Consider alternatives**: Sometimes a flat list with parent references is simpler

## Related Fields

- [List](./leaf-array.md) - For flat arrays without nesting
- [Object](./section.md) - For single-level nesting
- [Bundle](./bundle.md) - For grouping fields visually
