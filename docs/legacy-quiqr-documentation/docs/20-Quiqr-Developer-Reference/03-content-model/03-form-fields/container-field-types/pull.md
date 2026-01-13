---
title: Pull
---

# Section

The `pull` field is a container field. It can define multiple input fields. The
fields defined in a pull are displayed at the same level as other fields next
to the pull field. The values are stored as dictionary below the pull key.

{{< figure src="../pull.png" caption="Example use of the pull field. The fields author and Description are show at the same level as the Title field" >}}

## Properties

### Bundle manager Properties

| property | value type            | optional                 | description                                                                               |
|----------|-----------------------|--------------------------|-------------------------------------------------------------------------------------------|
| key      | string                | mandatory                | Keys are for internal use and must be unique.                                             |
| fields   | array of dictionaries | optional                 | These are the subform input fields.                                                       |
| group    | string                | optional (default: null) | key to store the dictionary in. When not set, the key of the pull element itself is used. |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: some_field
type: pull
group: params
fields:
  - key: author
    title: Author
    type: string
  - key: description
    title: Description
    type: string
    multiLine: true
{{< /code-toggle >}}

### Output

```yaml
params:
  author: "Multiple authors"
  description: |-
    this is a nice
    place.
```
