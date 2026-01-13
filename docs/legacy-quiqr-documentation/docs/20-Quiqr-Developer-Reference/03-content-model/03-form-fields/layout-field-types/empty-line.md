---
title: Empty line
---

# Empty line

The `empty-line` field is renders 1 or more empty lines in the form. It generates no output.

{{< figure src="../empty-line.png" caption="empty line between title and description with amount: 2" >}}

## Properties

| property | value type | optional              | description                                  |
|----------|------------|-----------------------|----------------------------------------------|
| key      | string     | mandatory             | Keys are for internal use and must be unique |
| amount   | integer    | optional (default: 1) | Amount of empty lines to draw                |


## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
type: empty-line
amount: 2
{{< /code-toggle >}}
