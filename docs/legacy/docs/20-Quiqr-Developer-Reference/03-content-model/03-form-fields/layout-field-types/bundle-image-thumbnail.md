---
title: Bundle image thumbnail
---

# Bundle image thumbnail

The `bundle-image-thumbnail` field renders a thumbnail image. It can only be used together
with the `bundle-manager` field. Read ```[bundle-manager documentation]({{< ref
path="../container-field-types/bundle-manager.md" >}})``` for more information.

## Properties

| property | value type | optional                 | description                                  |
|----------|------------|--------------------------|----------------------------------------------|
| key      | string     | mandatory                | Keys are for internal use and must be unique |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: thumb
type: bundle-image-thumbnail
{{< /code-toggle >}}
