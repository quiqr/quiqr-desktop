---
title: Uniq
---

# Uniq

The `Uniq` field is generates a unique string if the value is not set. When the
value exists it behaves like a readonly string. With the _generate new token_
button a the string can be regenerated.


{{< figure src="../uniq.png" caption="Uniq" >}}

## Properties

| property | value type | optional                | description                                                                            |
|----------|------------|-------------------------|----------------------------------------------------------------------------------------|
| key      | string     | mandatory               | Keys are for internal use and must be unique                                           |
| title    | string     | optional                | The title of the element                                                               |
| tip      | string     | optional (default: null) | Text entered here with markdown formatting is displayed as context help in an overlay box |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: uniq
{{< /code-toggle >}}

### Output

```yaml
sample_field: 888c-fc97-bb50
```
