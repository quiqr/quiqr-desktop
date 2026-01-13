---
title: Slider
---

# Slider

The `slider` field generates a slider for entering numbers.

{{< figure src="../slider.png" caption="slider" >}}

## Properties

| property | value type | optional                  | description                                                                               |
|----------|------------|---------------------------|-------------------------------------------------------------------------------------------|
| key      | string     | mandatory                 | Keys are for internal use and must be unique                                              |
| title    | string     | optional                  | The title of the element                                                                  |
| step     | number     | mandatory                 | Amount between steps                                                                      |
| min      | number     | mandatory                 | Starting value                                                                            |
| max      | number     | mandatory                 | Ending value                                                                              |
| autoSave | boolean    | optional (default: false) | Form data is automatically saved after changing the value                                 |
| default  | string     | optional (default: null)  | default value when the key is not set yet                                                 |
| tip      | string     | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: slider
step: 10
min: 0
max: 800
{{< /code-toggle >}}

### Output

```yaml
sample_field: 300
```
