---
title: String
---

# String

The `string` field generates a field for entering strings. Multiline string
values are allowed by enableing this property.

{{< figure src="../string1.png" caption="Single line string" >}}

{{< figure src="../string2.png" caption="Multi line string" >}}

## Properties

| property         | value type       | optional                  | description                                                                               |
|:-----------------|:-----------------|:--------------------------|:------------------------------------------------------------------------------------------|
| key              | string           | mandatory                 | Keys are for internal use and must be unique                                              |
| title            | string           | optional                  | The title of the element                                                                  |
| tip              | string           | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box |
| default          | string           | optional (default: null)  | default value when the key is not set yet                                                 |
| multiLine        | boolean          | optional (default: false) | Enable multi line value                                                                   |
| txtInsertButtons | array of strings | optional                  | Array with strings of which quick text insert buttons are created                         |

## Sample 1

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: string
multiLine: true
{{< /code-toggle >}}

### Output

```yaml
sample_field: |-
  Some multiline
  string value
```

## Sample 2:

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: string
txtInsertButtons:
  - 'YES'
  - 'NO'
  - 'MAYBE'
{{< /code-toggle >}}

### Output

```yaml
sample_field: YES
```
