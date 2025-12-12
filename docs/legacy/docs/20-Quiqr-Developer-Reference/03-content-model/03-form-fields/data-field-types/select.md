---
title: Select
---

# Select

The `select` field generates a dropdown selectbox for selecting strings or
numbers. The output is a number or string. If multiple is set true the out is
an array of numbers or strings.

{{< figure src="../select1.png" caption="Select field" >}}

{{< figure src="../select2.png" caption="Select multiple field" >}}

{{< figure src="../select3.png" caption="Select dropdown with options" >}}

## Properties

| property               | value type                                | optional                  | description                                                                                                       |
|------------------------|-------------------------------------------|---------------------------|-------------------------------------------------------------------------------------------------------------------|
| key                    | string                                    | mandatory                 | Keys are for internal use and must be unique                                                                      |
| title                  | string                                    | optional                  | The title of the element                                                                                          |
| tip                    | string                                    | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box                         |
| default                | string OR number OR  array of strings     | optional (default: null)  | default value when the key is not set yet                                                                         |
| multiple               | boolean                                   | optional (default: false) | Enable multiple selection                                                                                         |
| autoSave               | boolean                                   | optional (default: false) | Form data is automatically saved after changing the value                                                         |
| option_image_path      | string                                    | optional (default: null)  | path to images having the same name as the options values e.g. `quiqr/model/images`                               |
| option_image_width     | number                                    | optional (default: null)  | when `option_image_path` is set image width as well to have a aligned option listing                              |
| option_image_extension | string                                    | optional (defaul: null)   | when `option_image_path` is set, optionally set extension to e.g. `jpg`. Then all images should be of type `jpg`. |
| options                | array of dictionaries OR array of strings | mandatory                 | Array with title/value pairs, or an array with strings when text and value are the same                           |
| options.[n].text       | string                                    | optional                  | String with option visible text                                                                                   |
| options.[n].value      | string                                    | optional                  | String with option value to save when selected                                                                    |

## Example 1

This example shows when value and text differ

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: select
multiple: false
default: 2
options:
  - text: Option 1
    value: 1
  - text: Option 2
    value: 2
  - text: Option 3
    value: 3
{{< /code-toggle >}}

### Output

```yaml
sample_field: 2
```

## Example 2

This example shows when value and text are the same

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: select
multiple: false
default: 2
options:
  - Option 1
  - Option 2
  - Option 3
{{< /code-toggle >}}

### Output

```yaml
sample_field: 2
```

## Known issues

Default property is not working.
