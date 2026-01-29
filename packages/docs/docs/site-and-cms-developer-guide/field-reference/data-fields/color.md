---
sidebar_position: 12
---

# Color Field

The `color` field provides a color picker interface for selecting colors.

:::info Field Type
**Type:** `color`  
**Category:** Data Field  
**Output:** String (hex color code)
:::

## Visual Example

![Color Field](/img/fields/color1.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default color (hex format) |
| `autoSave` | boolean | No | false | Auto-save form after changing value |

## Examples

### Example 1: Brand Color

**Configuration:**

```yaml
key: primary_color
title: Primary Brand Color
type: color
default: "#0055bb"
```

**Output:**

```yaml
primary_color: "#3498db"
```

### Example 2: Background Color

**Configuration:**

```yaml
key: bg_color
title: Background Color
type: color
default: "#ffffff"
tip: Choose a background color for the section
```

**Output:**

```yaml
bg_color: "#f8f9fa"
```

### Example 3: Text Color

**Configuration:**

```yaml
key: text_color
title: Text Color
type: color
default: "#333333"
```

**Output:**

```yaml
text_color: "#1a1a1a"
```

## Output Format

Colors are output as hex strings:
- 6-digit hex: `#rrggbb` (e.g., `#0055bb`)
- Includes the `#` symbol
- Uppercase or lowercase letters

## Features

- **Visual picker**: Click to open color picker dialog
- **Hex input**: Type hex values directly
- **Preview**: See selected color in the field
- **Recent colors**: Quick access to recently used colors

## Use Cases

- **Theming**: Brand colors, theme customization
- **Design**: Layout colors, accent colors
- **Styling**: Text colors, background colors, borders
- **Highlighting**: Important sections, callouts

## Related Fields

- [String](./string.md) - For entering hex colors as text
- [Select](./select.md) - For predefined color choices
