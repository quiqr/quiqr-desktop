---
title: Hidden
---

# Hidden

The `hidden` field is hidden for the user but outputs a default value.

## Properties

| property | value type | optional  | description                                  |
|----------|------------|-----------|----------------------------------------------|
| key      | string     | mandatory | Keys are for internal use and must be unique |
| default  | string     | optional  | default value when the key is not set yet    |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
default: some value
type: hidden
{{< /code-toggle >}}

### Output

```yaml
sample_field: some value
```
