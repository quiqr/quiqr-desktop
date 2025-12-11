---
title: Font Icon Picker
---

**Quiqr version >= 0.17.5**

# Font Icon Picker

The `fonticon-picker` field creates a font iconpicker field populated with Font
Awesome Icons. The output is a string with the Font Icon Class Name.

{{< figure src="../fonticon-picker.png" caption="Font Picker" >}}

## Properties

| property   | value type       | optional                  | description                                                                                                                                         |
|------------|------------------|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| key        | string           | mandatory                 | Keys are for internal use and must be unique                                                                                                        |
| title      | string           | optional                  | The title of the element                                                                                                                            |
| tip        | string           | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box                                                           |
| default    | string           | optional (default: null)  | default value when the key is not set yet                                                                                                           |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: fonticon-picker
{{< /code-toggle >}}

### Output

```yaml
sample_field: FaBusinessTime
```

## Credits

Font Picker is based on [React FA Icon Picker](https://github.com/DATechnologies/react-fa-icon-picker).
