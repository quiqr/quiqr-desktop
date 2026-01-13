---
title: Markdown
---

# Markdown

The `string` field generates a field for entering strings. Multiline string
values are allowed by enableing this property.

{{< figure src="../markdown1.png" caption="Single markdown" >}}

{{< figure src="../markdown2.png" caption="Multi line markdown" >}}

## Properties

| property  | value type | optional                  | description                                                                               |
|-----------|------------|---------------------------|-------------------------------------------------------------------------------------------|
| key       | string     | mandatory                 | Keys are for internal use and must be unique                                              |
| title     | string     | optional                  | The title of the element                                                                  |
| tip       | string     | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box |
| default   | string     | optional (default: null)  | default value when the key is not set yet                                                 |
| preview   | boolean    | optional (default: false) | Enable preview field with rendered HTML                                                   |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: markdown
{{< /code-toggle >}}

### Output

```yaml
sample_field: |-
  Some multiline
  string value
```

## Known issues

The preview field is broken.
