---
title: Accordion
---

# Accordion

The `accordion` field is a container field. It can define multiple input
fields, which are displayed as subform. The output is an array of dictionaries.

{{< figure src="../accordion.png" caption="Accordion" >}}

## Properties

| property              | value type                                               | optional                  | description                                                                                                                                                                                                                                                                              |
|-----------------------|----------------------------------------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| key                   | string                                                   | mandatory                 | Keys are for internal use and must be unique                                                                                                                                                                                                                                             |
| title                 | string                                                   | optional                  | The title of the accordion element                                                                                                                                                                                                                                                       |
| dynFormSearchKey      | string                                                   | optional (default: null)  | key of one of the child field of which the value refers to a custom partial form                                                                                                                                                                                                         |
| dynFormObjectFile     | string with relative path to file without file extension | optional (default: null)  | if dynFormSearchKey is set this path points to the file containing a subform. **Do not define the used file extension**. Quiqr will automatically try to open json, toml or yaml files. If dynFormObjectFile is not set it refers to the partials in the ./quiqr/model/base file itself. |
| dynFormObjectRoot     | string                                                   | optional (default: null)  | if dynFormObjectFile is set this points to the root node where the subform is defined e.g. components                                                                                                                                                                                    |
| arrayIndicesAreKeys   | boolean                                                  | optional (default: false  | Enables read/write dictionaries which are actually arrays with keys as indeces                                                                                                                                                                                                           |
| disableCreate         | boolean                                                  | optional (default: false  | Disables creating new items                                                                                                                                                                                                                                                              |
| disableDelete         | boolean                                                  | optional (default: false  | Disables deleting items                                                                                                                                                                                                                                                                  |
| disableSort           | boolean                                                  | optional (default: false  | Disables sorting items                                                                                                                                                                                                                                                                   |
| fields                | array of dictionaries                                    | mandatory                 | These are the form input fields.                                                                                                                                                                                                                                                         |
| fields.[n].arrayTitle | boolean                                                  | optional (default: false) | The value of the child field which has arrayTitle=true will be displayed as the accordion item title                                                                                                                                                                                     |

## Disabled child fields

if a child field of an accordion has a boolean field with a `disabled` and this
is set to `true`, the item will display light grey text to indicate it's
disabled.

## Sample 1: Regular accordion

### Configuration

Below an example of a regular accordion configuration without dynamic forms.

{{< code-toggle file="./quiqr/model/base" >}}
key: my-accordion
title: "accordion"
type: "accordion"
fields:
  - key: title
    title: Title
    type: string
    arrayTitle: true
  - key: boolean1
    title: boolean1
    type: boolean
  - key: boolean2
    title: boolean2
    type: boolean
  - key: boolean3
    title: boolean3
    type: boolean
{{< /code-toggle >}}

### Output

{{< code-toggle file="./data/sample" >}}
my-accordion:
  - title: some title
    boolean1: false
    boolean2: false
    boolean3: false
  - title: second item
    boolean1: true
    boolean2: false
    boolean3: true
{{< /code-toggle >}}

## Sample 2: Accordion with dynamic forms defined in ./quiqr/model/base.yaml

### Configuration

Fragments of the `./quiqr/model/base.yaml` with a dynamic accordion and a  partials section

{{< code-toggle file="./quiqr/model/base" >}}
key: page_sections
title: Page sections
type: accordion
dynFormSearchKey: component_type
fields:
  - key: title
    title: Title
    type: string
    arrayTitle: true
  - key: component_type
    title: Component Type
    type: select
    multiple: false
    options:
      - text: Poppy Banner
        value: poppy-banner
      - text: Poppy Shortlist
        value: poppy-shortlist
{{< /code-toggle >}}

{{< code-toggle file="./quiqr/model/base" >}}
dynamics:
  - key: poppy-banner
    component_type: poppy-banner
    fields:
      - key: poppy_variant
        title: Quiqr Variant
        type: select
        multiple: false
        options:
          - text: Full height
            value: header-banner-full-height
          - text: Regular
            value: header-banner
      - key: bg_image
        title: Background image
        type: string
      - key: buttontxt
        title: Button text
        type: string
  - key: poppy-shortlist
    component_type: poppy-shortlist
    type: section
    groupdata: true
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

### Output

{{< code-toggle file="./data/sample" >}}
page_sections:
  - title: some title
    component_type: component1 
    poppy_variant: header-banner-full-height
    bg_image: img1.png
    buttontxt: ORDER NOW
  - title: another page element
    text1: foo
    text2: bar
    text3: bar
{{< /code-toggle >}}

## Sample 3: Accordion with dynamic forms defined in a seperate file

### Configuration

Fragments of the `./quiqr/model/base.yaml` with a dynamic accordion.

{{< code-toggle file="./quiqr/model/base" >}}
key: page_sections
title: Page sections
type: accordion
dynFormSearchKey: component_type
dynFormObjectFile: data/pageComponentsTree
dynFormObjectRoot: components
fields:
  - key: title
    title: Title
    type: string
    arrayTitle: true
  - key: component_type
    title: Component Type
    type: select
    multiple: false
    options:
      - text: Component 1
        value: component1
      - text: Component 2
        value: component2
{{< /code-toggle >}}

The complete object file in this case `data/pageComponentsTree.yaml`

{{< code-toggle file="data/pageComponentsTree" >}}
components:
  - key: component1
    component_type: poppy-banner
    fields:
      - key: poppy_variant
        title: Quiqr Variant
        type: select
        multiple: false
        options:
          - text: Full height
            value: header-banner-full-height
          - text: Regular
            value: header-banner
      - key: bg_image
        title: Background image
        type: string
      - key: buttontxt
        title: Button text
        type: string
  - key: component2
    component_type: poppy-shortlist
    type: section
    groupdata: true
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

### Output

{{< code-toggle file="./data/sample" >}}
page_sections:
  - title: some title
    component_type: component1 
    poppy_variant: header-banner-full-height
    bg_image: img1.png
    buttontxt: ORDER NOW
  - title: another page element
    text1: foo
    text2: bar
    text3: bar
{{< /code-toggle >}}

## Sample 4: Accordion for data that is stored in an array with keys as indices (Object used as Array)

### Configuration

Below an example of a accordion configuration with the option arrayIndicesAreKeys enabled.

{{< code-toggle file="./quiqr/model/base" >}}
key: my-accordion
title: "accordion"
arrayIndicesAreKeys: true
type: "accordion"
fields:
  - key: title
    title: Title
    type: string
    arrayTitle: true
  - key: boolean1
    title: boolean1
    type: boolean
  - key: boolean2
    title: boolean2
    type: boolean
  - key: boolean3
    title: boolean3
    type: boolean
{{< /code-toggle >}}

### Output

{{< code-toggle file="./data/sample" >}}
my-accordion:
  item1: 
    title: some title
    boolean1: false
    boolean2: false
    boolean3: false
  item2:
    title: second item
    boolean1: true
    boolean2: false
    boolean3: true
{{< /code-toggle >}}

