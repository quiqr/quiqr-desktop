---
sidebar_position: 17
---

# Font Picker

The font picker field provides an interface for selecting Google Fonts using the Google Fonts API. It's perfect for theme customization and typography settings.

:::info Field Type
**Type:** `font-picker`  
**Category:** Data Field  
**Output:** String (font family name)  
**Library:** Based on [Font Picker React](https://github.com/samuelmeuli/font-picker-react)
:::

## Basic Configuration

```yaml
- key: body-font
  type: font-picker
  title: Body Font
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |
| `default` | string | No | - | Default font family name |
| `autoSave` | boolean | No | `false` | Automatically save when value changes |
| `limit` | integer | No | `50` | Maximum number of fonts to load |
| `families` | array | No | - | Specific font families to include |
| `categories` | array | No | - | Font categories to include |

## Visual Example

![Font Picker Field](/img/fields/font-picker.png)

The field provides a searchable dropdown with live font previews.

:::tip Video Demo
A video demonstration is available at `/img/fields/font-picker.mp4` showing the font picker in action.
:::

## Usage Examples

### Basic Font Selection

```yaml
- key: heading-font
  type: font-picker
  title: Heading Font
```

**Output:**
```yaml
heading-font: "lato"
```

### With Default Value

```yaml
- key: body-font
  type: font-picker
  title: Body Font
  default: "roboto"
```

### Limit Number of Fonts

```yaml
- key: display-font
  type: font-picker
  title: Display Font
  limit: 30
  tip: "Loading fewer fonts improves performance"
```

### Auto-Save

```yaml
- key: font-family
  type: font-picker
  title: Font Family
  autoSave: true
```

## Font Categories

Restrict fonts by category using the `categories` property:

### Sans-Serif Fonts

```yaml
- key: body-font
  type: font-picker
  title: Body Font
  categories:
    - sans-serif
```

### Serif Fonts

```yaml
- key: heading-font
  type: font-picker
  title: Heading Font
  categories:
    - serif
```

### Display Fonts

```yaml
- key: hero-font
  type: font-picker
  title: Hero Font
  categories:
    - display
```

### Multiple Categories

```yaml
- key: mixed-font
  type: font-picker
  title: Font
  categories:
    - sans-serif
    - serif
```

### All Categories

Available categories:
- `sans-serif` - Clean, modern fonts without decorative strokes
- `serif` - Traditional fonts with decorative strokes
- `display` - Decorative fonts for headings and emphasis
- `handwriting` - Script and handwritten-style fonts
- `monospace` - Fixed-width fonts for code

## Specific Font Families

Limit selection to specific font families:

```yaml
- key: brand-font
  type: font-picker
  title: Brand Font
  families:
    - "Open Sans"
    - "Roboto"
    - "Lato"
    - "Montserrat"
```

This restricts the picker to only the specified fonts, useful for:
- Brand compliance
- Performance (fewer API calls)
- Curated design systems

## Use Cases

### Theme Typography Settings

```yaml
singles:
  - key: theme-config
    title: Theme Configuration
    file: config/_default/params.yaml
    fields:
      - key: heading-font
        type: font-picker
        title: Heading Font
        default: "montserrat"
        categories:
          - sans-serif
          - display
      
      - key: body-font
        type: font-picker
        title: Body Font
        default: "open sans"
        categories:
          - sans-serif
      
      - key: code-font
        type: font-picker
        title: Code Font
        default: "fira code"
        categories:
          - monospace
```

### Section-Specific Fonts

```yaml
- key: hero-section
  type: object
  title: Hero Section
  fields:
    - key: hero-font
      type: font-picker
      title: Hero Font
      categories:
        - display
        - serif
      
    - key: subtitle-font
      type: font-picker
      title: Subtitle Font
      categories:
        - sans-serif
```

### Blog Post Custom Fonts

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts
    fields:
      - key: title
        type: string
        title: Title
      
      - key: custom-font
        type: font-picker
        title: Custom Font
        tip: "Optional custom font for this post"
        limit: 20
```

### Multi-Language Typography

```yaml
- key: en-font
  type: font-picker
  title: English Font
  default: "roboto"

- key: ja-font
  type: font-picker
  title: Japanese Font
  families:
    - "Noto Sans JP"
    - "M PLUS Rounded 1c"
```

## Hugo Integration

### Basic Font Loading

In your Hugo partial or base template:

```go-html-template
{{ if .Site.Params.body_font }}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family={{ replace .Site.Params.body_font " " "+" }}:wght@400;700&display=swap" rel="stylesheet">
{{ end }}
```

### CSS Variable Approach

**In your template:**
```go-html-template
<style>
  :root {
    {{ if .Site.Params.heading_font }}
    --font-heading: "{{ .Site.Params.heading_font }}", sans-serif;
    {{ end }}
    {{ if .Site.Params.body_font }}
    --font-body: "{{ .Site.Params.body_font }}", sans-serif;
    {{ end }}
  }
</style>
```

**In your CSS:**
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, system-ui);
}

body {
  font-family: var(--font-body, system-ui);
}
```

### Multiple Font Weights

```go-html-template
{{- $fonts := slice -}}
{{- if .Site.Params.heading_font -}}
  {{- $fonts = $fonts | append (printf "%s:wght@400;700;900" (replace .Site.Params.heading_font " " "+")) -}}
{{- end -}}
{{- if .Site.Params.body_font -}}
  {{- $fonts = $fonts | append (printf "%s:wght@300;400;600" (replace .Site.Params.body_font " " "+")) -}}
{{- end -}}
{{- if $fonts -}}
<link href="https://fonts.googleapis.com/css2?{{ delimit $fonts "&" | safeHTMLAttr }}&display=swap" rel="stylesheet">
{{- end -}}
```

### Advanced Typography System

**params.yaml:**
```yaml
heading_font: "montserrat"
body_font: "open sans"
code_font: "fira code"
```

**Hugo partial (layouts/partials/fonts.html):**
```go-html-template
{{- $fontParams := slice -}}
{{- range $key, $font := (dict "heading" .Site.Params.heading_font "body" .Site.Params.body_font "code" .Site.Params.code_font) -}}
  {{- if $font -}}
    {{- $fontFamily := replace $font " " "+" -}}
    {{- $fontParams = $fontParams | append (printf "family=%s:wght@300;400;600;700" $fontFamily) -}}
  {{- end -}}
{{- end -}}

{{- if $fontParams -}}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?{{ delimit $fontParams "&" | safeURL }}&display=swap" rel="stylesheet">
{{- end -}}
```

## Performance Optimization

### Limit Font Count

```yaml
- key: heading-font
  type: font-picker
  title: Heading Font
  limit: 20  # Load fewer fonts for faster picker
```

### Preload Fonts

```html
<link rel="preload" 
      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" 
      as="style">
```

### Font Display Strategy

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

The `display=swap` parameter ensures text remains visible during font load.

## Best Practices

1. **Limit Selection:** Use `families` or `categories` to constrain choices
2. **Set Defaults:** Provide sensible default fonts
3. **Performance:** Keep `limit` reasonable (20-50 fonts)
4. **Fallbacks:** Always specify fallback fonts in CSS
5. **Weights:** Only load font weights you actually use
6. **Tooltips:** Explain what the font will be used for

## Common Patterns

### Typography Scale

```yaml
- key: display-font
  type: font-picker
  title: Display Font (Hero)
  categories:
    - display
    - serif

- key: heading-font
  type: font-picker
  title: Heading Font (H1-H6)
  categories:
    - sans-serif

- key: body-font
  type: font-picker
  title: Body Font (Paragraphs)
  categories:
    - sans-serif
    - serif

- key: monospace-font
  type: font-picker
  title: Code Font (Monospace)
  categories:
    - monospace
```

### Brand-Compliant Fonts

```yaml
- key: primary-font
  type: font-picker
  title: Primary Font
  families:
    - "Helvetica Neue"
    - "Arial"
    - "Roboto"
  tip: "Must match brand guidelines"
```

## Font Name Format

The field outputs lowercase font family names with spaces preserved:

| Display | Output | CSS Usage |
|---------|--------|-----------|
| Open Sans | `open sans` | `font-family: "Open Sans", sans-serif;` |
| Roboto | `roboto` | `font-family: "Roboto", sans-serif;` |
| Montserrat | `montserrat` | `font-family: "Montserrat", sans-serif;` |

## Troubleshooting

### Font Not Loading

If the font doesn't appear on your site:

1. **Check API Key:** Ensure Google Fonts API is accessible
2. **Verify Name:** Confirm font name is correctly formatted
3. **CSS Capitalization:** Font names in CSS are case-insensitive but should match Google Fonts
4. **Browser Cache:** Clear browser cache
5. **Network Issues:** Check browser console for failed font requests

### Picker Slow to Load

If the font picker is slow:

1. **Reduce Limit:** Lower the `limit` value
2. **Specific Families:** Use `families` to limit options
3. **Category Filter:** Use `categories` to narrow choices

## Output

```yaml
# Simple output
body-font: "open sans"
heading-font: "montserrat"

# In configuration
typography:
  headings: "playfair display"
  body: "lato"
  code: "fira code"
```

## Related Fields

- [Select](./select.md) - For predefined font choices
- [String](./string.md) - For custom font stack input
- [Fonticon Picker](./fonticon-picker.md) - For icon selection
