---
title: Easy Markdown Editor
---

# Easy Markdown Editor

The `easymde` field generates a lightweight markdown editor for entering markdown enabled strings.

{{< figure src="../easymde.png" caption="Easy Markdown Editor" >}}

## Properties

| property  | value type | optional                  | description                                                                               |
|-----------|------------|---------------------------|-------------------------------------------------------------------------------------------|
| key       | string     | mandatory                 | Keys are for internal use and must be unique                                              |
| title     | string     | optional                  | The title of the element                                                                  |
| tip       | string     | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: easymde
{{< /code-toggle >}}

### Output

```yaml
sample_field: |-
  # Welcome at this course

  You will learn a lot

  Good luck!
```
