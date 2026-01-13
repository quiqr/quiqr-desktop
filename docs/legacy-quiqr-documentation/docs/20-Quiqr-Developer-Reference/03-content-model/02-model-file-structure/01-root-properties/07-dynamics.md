---
title: dynamics
weight: 70
---

# Root property: dynamics

The ```dynamics``` property is optional. Dynamics are used to dynamically mount
sub-forms in the
[accordion form field](/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/container-field-types/accordion)

The dynamics property contains an array of dictionaries which itself it a form field definition.

## Supported fields in dynamic sub form

**Note** Not all field types can be used in a subform. This list with field types is known to work:

- string
- image-select
- nest
- accordion
- boolean
- unique

These field types are know NOT to work:

- section
- pull

## Example

{{< code-toggle file="model/base" >}}
dynamics:
  - key: component-banner
    component_type: banner
    fields:
      - key: bg_image
        title: Background image
        type: string
      - key: buttontxt
        title: Button text
        type: string

  - key: component-bullet-list
    component_type: bullet-list
    fields:
      - key: text1
        title: Text 1
        type: string
      - key: text2
        title: Text 2
        type: string
      - key: text3
        title: Text 3
        type: string
{{< /code-toggle >}}

