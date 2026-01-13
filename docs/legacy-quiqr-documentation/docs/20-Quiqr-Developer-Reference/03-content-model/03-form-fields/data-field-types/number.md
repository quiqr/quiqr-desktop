---
title: Number
---

# Number

The `number` field generates a field for entering numbers. Both integers and
floating numbers are allowed. It's not possible to enter othert characters.

{{< figure src="../number.png" caption="Number" >}}

## Properties

| property | value type | optional                 | description                                                                               |
|----------|------------|--------------------------|-------------------------------------------------------------------------------------------|
| key      | string     | mandatory                | Keys are for internal use and must be unique                                              |
| title    | string     | optional                 | The title of the element                                                                  |
| tip      | string     | optional (default: null) | Text entered here with markdown formatting is displayed as context help in an overlay box |
| default  | string     | optional (default: null) | default value when the key is not set yet                                                 |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: number
{{< /code-toggle >}}

### Output

```yaml
sample_field: 13.3
```
