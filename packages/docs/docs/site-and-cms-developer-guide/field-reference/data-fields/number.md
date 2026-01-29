---
sidebar_position: 2
---

# Number Field

The `number` field generates a numeric input field for integers or decimals.

![Number field](/img/fields/number.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | number | No | null | Default value when the key is not set |
| `min` | number | No | - | Minimum allowed value |
| `max` | number | No | - | Maximum allowed value |
| `step` | number | No | 1 | Increment/decrement step |
| `autoSave` | boolean | No | false | Auto-save form after changing value |

## Examples

### Example 1: Simple Integer

**Configuration:**

```yaml
key: quantity
title: Quantity
type: number
default: 1
min: 0
max: 100
```

**Output:**

```yaml
quantity: 5
```

### Example 2: Decimal Number

**Configuration:**

```yaml
key: price
title: Price
type: number
default: 0.00
min: 0
step: 0.01
tip: Enter price in dollars
```

**Output:**

```yaml
price: 19.99
```

### Example 3: Rating

**Configuration:**

```yaml
key: rating
title: Rating
type: number
default: 0
min: 0
max: 5
step: 1
```

**Output:**

```yaml
rating: 4
```

## Use Cases

- **Quantities**: Item counts, inventory, limits
- **Measurements**: Dimensions, weights, distances
- **Monetary**: Prices, costs, budgets
- **Ratings**: Scores, ratings, rankings
- **Ordering**: Sort order, priority, position

## Related Fields

- [Slider](./slider.md) - Visual slider for numeric ranges
- [String](./string.md) - For numbers that shouldn't be calculated (like phone numbers)
- [Hidden](./hidden.md) - For system-managed numeric values
