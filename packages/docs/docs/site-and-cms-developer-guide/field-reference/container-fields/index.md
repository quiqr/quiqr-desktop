---
sidebar_position: 2
---

# Container Fields

Container fields organize and group other fields in Quiqr's form system. They provide structure for complex data models and enable hierarchical content organization.

## Available Container Fields

- [Bundle](./bundle.md) - File-based content manager with visual list
- [Object](./section.md) - Single nested object with sub-fields
- [List](./leaf-array.md) - Array of repeating items
- [Nested](./nested.md) - Hierarchical tree structure
- [Accordion](./accordion.md) - Collapsible array items
- [Pull](./pull.md) - Inline container (logical grouping without visual nesting)

## Common Use Cases

### Bundle Fields
Use bundle fields when you need to manage multiple files or content items with a visual interface. Ideal for galleries, team member profiles, or any collection where visual preview is important.

### Object/Section Fields
Use object fields to group related data together. Perfect for structured data like addresses, contact information, or configuration blocks.

### List/Array Fields
Use list fields for repeating content items with the same structure. Common for tags, related links, or any list of similar items.

### Nested Fields
Use nested fields for hierarchical data structures. Ideal for navigation menus, category trees, or any tree-like data.

### Accordion Fields
Use accordion fields for long lists of complex items where you want to save screen space. Each item can be collapsed/expanded independently.

### Pull Fields
Use pull fields when you want to logically group fields without adding visual nesting. Useful for flattening data structures in the UI.

## Common Properties

Container fields share these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the field |
| `type` | string | Container field type |
| `title` | string | Display label |
| `tip` | string | Help text with markdown support |
| `fields` | array | Child field definitions |

See individual container field documentation for type-specific properties and detailed examples.
