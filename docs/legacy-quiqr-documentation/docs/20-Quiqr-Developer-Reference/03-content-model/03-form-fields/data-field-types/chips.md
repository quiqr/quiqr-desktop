---
title: Chips
---

# Chips

The `chips` field generates a field that helps creating tags of keywords from
entered strings instantly. The output value is an array with strings.

{{< figure src="../chips.png" caption="Chips" >}}

## Properties

| property | value type       | optional                 | description                                                                               |
|----------|------------------|--------------------------|-------------------------------------------------------------------------------------------|
| key      | string           | mandatory                | Keys are for internal use and must be unique                                              |
| title    | string           | optional                 | The title of the element                                                                  |
| tip      | string           | optional (default: null) | Text entered here with markdown formatting is displayed as context help in an overlay box |
| default  | array of strings | optional (default: null) | default value when the key is not set yet                                                 |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: chips
default:
  - one
  - two
{{< /code-toggle >}}

### Output

```yaml
sample_field:
  - one
  - three
```

## Known issues

When `tip` property is not working.
