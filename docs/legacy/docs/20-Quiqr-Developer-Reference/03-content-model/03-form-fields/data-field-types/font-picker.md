---
title: Font Picker
---

# Font Picker

The `font-picker` field creates a font picker field populated by the Google
Fonts Api. The output is a string with a Font Family name.

<embed src="../font-picker.mp4" autostart="false" height="500" width="700" /></embed>

{{< figure src="../font-picker.png" caption="Font Picker" >}}

## Properties

| property   | value type       | optional                  | description                                                                                                                                         |
|------------|------------------|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| key        | string           | mandatory                 | Keys are for internal use and must be unique                                                                                                        |
| title      | string           | optional                  | The title of the element                                                                                                                            |
| tip        | string           | optional (default: null)  | Text entered here with markdown formatting is displayed as context help in an overlay box                                                           |
| default    | string           | optional (default: null)  | default value when the key is not set yet                                                                                                           |
| autoSave   | boolean          | optional (default: false) | Form data is automatically saved after changing the value                                                                                           |
| limit      | integer          | optional (default: 50)    | Max. amount of fonts to load, the most populair fonts are loaded                                                                                    |
| families   | array of strings | optional (default: null)  | Array with Font Family names. If set, only these fonts are loaded                                                                                   |
| categories | array of strings | optional (default: null)  | Array with Font Catogories. If set, only these fonts from these categories are loaded. "sans-serif", "serif", "display", "handwriting", "monospace" |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: font-picker
default: roboto
families:
  - roboto
  - roboto condensed
  - lato
  - open sans
{{< /code-toggle >}}

### Output

```yaml
sample_field: lato
```

## Sample 2

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: sample_field
title: Sample field
type: font-picker
limit: 40
default: roboto
categories:
  - handwriting
{{< /code-toggle >}}

### Output

```yaml
sample_field: lato
```

## Hugo Theme Template Implementation

This is an example implementation for managing 3 fonts with Quiqr in your Hugo Theme. The [video](https://user-images.githubusercontent.com/658612/162726167-788afeb3-5ef6-4e0f-9e83-8c762a4ced81.mp4) shows the result applied to the vex-theme.


**Create a partial model file** with the path `SITEROOT/quiqr/model/partials/single_design.yaml` Add this configuration:

```
---
file: data/design.json
title: Design
fields:
  - key: "primary_font"
    title: "Main Text Font"
    type: "font-picker"
    tip: "choose your font"
    limit: 50
    categories:
      - sans-serif

  - key: "headings_font"
    title: "Headings Font"
    type: "font-picker"
    tip: "choose your font"
    limit: 300
```


**Add partial to your singles file** with the path `SITEROOT`/quiqr/model/include/singles.yaml`

```
- key: design
  _mergePartial: single_design
```

**Add single to your menu file** with the path `SITEROOT`/quiqr/model/include/menu.yaml`

```
- key: Settings
  menuItems:
    - key: design
  title: Settings
```

**Create a partial template in your hugo theme** called `style-fonts-import.html` and include this the `<head>` of your Hugo Theme.

```
<style>

@import url('https://fonts.googleapis.com/css2?family={{ $.Site.Data.design.primary_font }}:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family={{ $.Site.Data.design.secondary_font }}:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family={{ $.Site.Data.design.headings_font }}:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap');
```

**Create a partial template in your hugo theme** called `style-overrides.html` and include this the `<head>` of your Hugo Theme.

```
<style>

body {
  font-family: '{{$.Site.Data.design.primary_font }}', sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: '{{ $.Site.Data.design.headings_font }}', serif;
}
.testimonials .testimonial-block p {
  font-family: '{{ $.Site.Data.design.secondary_font }}', serif;
}
</style>
```

## Credits

Font Picker is based on [Font Picker React](https://github.com/samuelmeuli/font-picker-react).
