---
sidebar_position: 11
---

# Slider Field

The `slider` field provides a visual slider for selecting numeric values within a range.

:::info Field Type
**Type:** `slider`  
**Category:** Data Field  
**Output:** Number
:::

## Visual Example

![Slider Field](/img/fields/slider.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | number | No | null | Default value |
| `min` | number | Yes | - | Minimum value |
| `max` | number | Yes | - | Maximum value |
| `step` | number | No | 1 | Increment step |
| `autoSave` | boolean | No | false | Auto-save form after changing value |

## Examples

### Example 1: Volume Control

**Configuration:**

```yaml
key: volume
title: Volume
type: slider
min: 0
max: 100
step: 5
default: 50
```

**Output:**

```yaml
volume: 75
```

### Example 2: Quality Setting

**Configuration:**

```yaml
key: image_quality
title: Image Quality
type: slider
min: 1
max: 10
step: 1
default: 7
tip: Higher values = better quality but larger file size
```

**Output:**

```yaml
image_quality: 8
```

### Example 3: Opacity

**Configuration:**

```yaml
key: opacity
title: Opacity
type: slider
min: 0
max: 1
step: 0.1
default: 1.0
```

**Output:**

```yaml
opacity: 0.7
```

## Features

- **Visual feedback**: See value change in real-time
- **Range limits**: Enforce min/max constraints
- **Step increments**: Control precision of values
- **Touch-friendly**: Works well on mobile devices

## Use Cases

- **Settings**: Volume, brightness, quality sliders
- **Ranges**: Price ranges, date ranges, size ranges
- **Ratings**: Visual rating scales
- **Percentages**: Progress, completion, allocation
- **Adjustments**: Opacity, saturation, balance

## Related Fields

- [Number](./number.md) - For numeric input with keyboard
- [Select](./select.md) - For discrete value selection
