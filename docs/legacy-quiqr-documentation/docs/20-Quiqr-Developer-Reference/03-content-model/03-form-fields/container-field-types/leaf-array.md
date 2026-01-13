---
title: Leaf array
---

# Leaf array

The `lead array` field is a container field for a single child field. The
output is a collection of values of the child field value type.

{{< figure src="../leaf-array.png" caption="Leaf array with dates" >}}

## Properties

### Bundle manager Properties

| property | value type | optional  | description                                   |
|----------|------------|-----------|-----------------------------------------------|
| key      | string     | mandatory | Keys are for internal use and must be unique. |
| title    | string     | optional  | The title of the element.                     |
| field    | dictionary | mandatory | Dictionary witg child field definition.       |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: some_parent_field
title: Some parent field
type: leaf-array
field:
  key: some_child_field
  title: Some chield field
  type: date
{{< /code-toggle >}}

### Output

```yaml
some_parent_field:
  - "2021-04-02"
  - "2021-04-21"
  - "2021-05-07"
```
