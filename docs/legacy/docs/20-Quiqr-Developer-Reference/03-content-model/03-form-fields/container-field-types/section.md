---
title: Section
---

# Section

The `section` field is a container field. It can define multiple input fields,
which are displayed as a sub form. The output is a dictionary with values from
the sub form fields.

{{< figure src="../section.png" caption="section" >}}

## Properties

### Bundle manager Properties

| property  | value type            | optional                | description                                                                                                                                                           |
|-----------|-----------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| key       | string                | mandatory               | Keys are for internal use and must be unique.                                                                                                                         |
| title     | string                | optional                | The title of the element.                                                                                                                                             |
| fields    | array of dictionaries | mandatory               | These are the subform input fields.                                                                                                                                   |
| groupdata | boolean               | optional (default: true) | When set true to child field value are stored in a hash below the section key. When set false the values are placed at the same level as the section neighbour fields |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: some_parent_field
title: Some parent field
type: section
groupdata: true
fields:
  - key: some_child_field
    title: Some chield field
    type: date
{{< /code-toggle >}}

### Output

```yaml
some_parent_field:
  some_child_field: "2021-04-02"
```
