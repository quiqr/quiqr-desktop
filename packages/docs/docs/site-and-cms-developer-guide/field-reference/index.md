---
sidebar_position: 2
---

# Field Reference

This reference documents all available field types in Quiqr's form system.

## Field Categories

### [Data Fields](./data-fields/)

Data fields are the primary input fields for content editing:

**Text Input:**
- [String](./data-fields/string.md) - Single or multi-line text input
- [Markdown](./data-fields/markdown.md) - Markdown editor with preview
- [EasyMDE](./data-fields/easymde.md) - Alternative markdown editor

**Numeric:**
- [Number](./data-fields/number.md) - Numeric input field
- [Slider](./data-fields/slider.md) - Numeric slider input

**Selection:**
- [Boolean](./data-fields/boolean.md) - Checkbox or toggle
- [Select](./data-fields/select.md) - Dropdown selection
- [Chips](./data-fields/chips.md) - Multiple tag selection
- [Select From Query](./data-fields/select-from-query.md) - Dynamic select from content
- [Image Select](./data-fields/image-select.md) - Visual image picker

**Dates & Colors:**
- [Date](./data-fields/date.md) - Date picker with calendar
- [Color](./data-fields/color.md) - Color picker with preview

**Typography & Icons:**
- [Font Picker](./data-fields/font-picker.md) - Google Fonts selection
- [Fonticon Picker](./data-fields/fonticon-picker.md) - Font Awesome icon picker

**Special Data:**
- [Uniq](./data-fields/uniq.md) - Unique identifier generator
- [Hidden](./data-fields/hidden.md) - Hidden field for system values
- [Readonly](./data-fields/readonly.md) - Display-only field

**Advanced:**
- [Eisenhouwer](./data-fields/eisenhouwer.md) - Priority matrix (Eisenhower Matrix)

### [Container Fields](./container-fields/)

Container fields organize and group other fields:

- [Bundle](./container-fields/bundle.md) - File-based content manager with visual list
- [Object](./container-fields/object.md) - Single nested object with sub-fields
- [List](./container-fields/list.md) - Array of repeating items
- [Nested](./container-fields/nested.md) - Hierarchical tree structure
- [Accordion](./container-fields/accordion.md) - Collapsible array items
- [Pull](./container-fields/pull.md) - Inline container (logical grouping without visual nesting)

### [Layout Fields](./layout-fields/)

Layout fields organize form presentation without storing data:

- [Info](./layout-fields/info.md) - Display informational content with markdown
- [Empty Line](./layout-fields/empty-line.md) - Add vertical spacing between fields
- [Bundle Image Thumbnail](./layout-fields/bundle-image-thumbnail.md) - Display thumbnails in bundles

### [Special Fields](./special-fields/)

File handling fields:

- [File](./special-fields/file.md) - File upload and selection
- [Image](./special-fields/image.md) - Image upload and management

## Common Properties

All fields support these common properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the field |
| `type` | string | Yes | Field type (string, number, etc.) |
| `title` | string | No | Display label |
| `tip` | string | No | Help text with markdown support |
| `default` | varies | No | Default value |

## Field Configuration Example

```yaml
fields:
  - key: title
    type: string
    title: Page Title
    tip: Enter a descriptive title for this page
    default: ""
    
  - key: published
    type: boolean
    title: Published
    default: false
    
  - key: date
    type: date
    title: Publication Date
```

## Next Steps

- Browse individual field documentation for detailed properties and examples
- See [Content Model Guide](../developer-guide/content-model.md) for using fields in your model
- Check [Field Development Guide](../developer-guide/field-system.md) for creating custom fields
