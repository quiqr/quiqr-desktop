---
title: Date
---

# Date

The `date` field generates a date field with a date picker. The output value is
a date string.

{{< figure src="../date1.png" caption="Date field" >}}

{{< figure src="../date2.png" caption="Date picker popup" >}}

## Properties

| property   | value type | optional                      | description                                                                               |
|------------|------------|-------------------------------|-------------------------------------------------------------------------------------------|
| key        | string     | mandatory                     | Keys are for internal use and must be unique                                              |
| title      | string     | optional                      | The title of the element                                                                  |
| tip        | string     | optional (default: null)      | Text entered here with markdown formatting is displayed as context help in an overlay box |
| default    | string     | optional (default: null)      | Default value when the key is not set yet                                                 |
| dateFormat | string     | optional (default: dd/MM/yyyy | Dateformat to use. only 'dd' 'MM' and yyyy are supported currently.                       |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: date
default: "2021-04-12"
dateFormat: dd-MM-yyyy
{{< /code-toggle >}}

### Output

```yaml
sample_field: "2021-03-21"
```
