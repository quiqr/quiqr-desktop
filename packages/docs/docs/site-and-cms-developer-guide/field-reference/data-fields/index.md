---
sidebar_position: 1
---

# Data Fields

Data fields are the primary input fields for content editing in Quiqr. They allow users to enter, select, and manage various types of content data.

## Text Input Fields

- [String](./string.md) - Single or multi-line text input
- [Markdown](./markdown.md) - Markdown editor with preview
- [EasyMDE](./easymde.md) - Alternative markdown editor

## Numeric Fields

- [Number](./number.md) - Numeric input field
- [Slider](./slider.md) - Numeric slider input

## Selection Fields

- [Boolean](./boolean.md) - Checkbox or toggle
- [Select](./select.md) - Dropdown selection
- [Chips](./chips.md) - Multiple tag selection
- [Select From Query](./select-from-query.md) - Dynamic select from content
- [Image Select](./image-select.md) - Visual image picker

## Date and Color Fields

- [Date](./date.md) - Date picker with calendar
- [Color](./color.md) - Color picker with preview

## Typography and Icon Fields

- [Font Picker](./font-picker.md) - Google Fonts selection
- [Fonticon Picker](./fonticon-picker.md) - Font Awesome icon picker

## Special Data Fields

- [Uniq](./uniq.md) - Unique identifier generator
- [Hidden](./hidden.md) - Hidden field for system values
- [Readonly](./readonly.md) - Display-only field

## Advanced Fields

- [Eisenhouwer](./eisenhouwer.md) - Priority matrix (Eisenhower Matrix)

## Common Properties

All data fields share these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the field |
| `type` | string | Field type |
| `title` | string | Display label |
| `tip` | string | Help text with markdown support |
| `default` | varies | Default value |

See individual field documentation for field-specific properties and examples.
