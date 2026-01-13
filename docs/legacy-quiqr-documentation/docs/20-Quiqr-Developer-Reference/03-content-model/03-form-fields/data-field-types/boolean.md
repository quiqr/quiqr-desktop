---
title: Boolean
---

# Boolean

The `boolean` field generates a switch. The output value is _true_ or _false_

{{< figure src="../boolean.png" caption="Boolean" >}}

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
type: boolean
{{< /code-toggle >}}

### Output

```yaml
sample_field: true
```
