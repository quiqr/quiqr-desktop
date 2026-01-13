---
title: Readonly
---

# Readonly

The `readonly` field is shows a value but cannot be modified by the form user.
The value can be a string or a number.

{{< figure src="../readonly.png" caption="Readonly" >}}

## Properties

| property | value type | optional                | description                                                                            |
|----------|------------|-------------------------|----------------------------------------------------------------------------------------|
| key      | string     | mandatory               | Keys are for internal use and must be unique                                           |
| title    | string     | optional                | The title of the element                                                               |
| default  | string     | mandatory               | The value of the element                                                               |
| tip      | string     | optional (default: null) | Text entered here with markdown formatting is displayed as context help in an overlay box |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: readonly
default: some value
{{< /code-toggle >}}

### Output

```yaml
sample_field: some value
```
