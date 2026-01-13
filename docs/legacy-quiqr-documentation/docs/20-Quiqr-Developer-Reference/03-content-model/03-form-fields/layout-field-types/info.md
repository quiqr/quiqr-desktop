---
title: Info
---

# Info

The `info` field is shows a readonly information box. It generates no output.

{{< figure src="../info.png" caption="Info field" >}}

## Properties

| property   | value type                                                                   | optional                     | description                                          |
|------------|------------------------------------------------------------------------------|------------------------------|------------------------------------------------------|
| key        | string                                                                       | mandatory                    | Keys are for internal use and must be unique         |
| content    | string                                                                       | mandatory                    | The content of the box in Markdown formatted textent |
| size       | string (normal, small, large)                                                | optional (default: normal)   | Fontsize of small is 85%, normal 100%, large 110%    |
| lineHeight | string                                                                       | optional (default: null)     | css value for the line height property. E.g. `150%`  |
| theme      | strings (default, bare, warn, warn-bare, black, black-bare, gray, gray-bare) | optional: (default: default) | theme used to render to info box                     |

## Themes

| theme   | preview                  |
|---------|--------------------------|
| default | ![](../info_default.png) |
| bare | ![](../info_bare.png) |
| warn | ![](../info_warn.png) |
| black | ![](../info_black.png) |
| gray | ![](../info_gray.png) |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
type: info
size: small
content: |-
  ## I love \n\n![](https://quiqr.org/images/logo-nav.svg)

  * it's smart
  * it's fast
  * it has Quiqr One"
{{< /code-toggle >}}

### Output

{{< figure src="../info_output.png" caption="Info field" >}}
