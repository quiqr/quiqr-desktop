---
sidebar_position: 16
---

# Fonticon Picker

The fonticon picker field provides an interface for selecting Font Awesome icons. It's perfect for adding icons to navigation items, features, or any content that benefits from visual symbols.

:::info Field Type
**Type:** `fonticon-picker`  
**Category:** Data Field  
**Output:** String (React Font Awesome icon name)  
**Version:** Available since Quiqr v0.17.5
:::

## Basic Configuration

```yaml
- key: icon
  type: fonticon-picker
  title: Icon
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |
| `default` | string | No | - | Default icon name |

## Visual Example

![Fonticon Picker Field](/img/fields/fonticon-picker.png)

The field provides a searchable interface for selecting Font Awesome icons.

## Usage Examples

### Basic Icon Selection

```yaml
- key: icon
  type: fonticon-picker
  title: Icon
```

**Output:**
```yaml
icon: "FaBusinessTime"
```

### With Default Value

```yaml
- key: feature-icon
  type: fonticon-picker
  title: Feature Icon
  default: "FaStar"
```

### With Tooltip

```yaml
- key: menu-icon
  type: fonticon-picker
  title: Menu Icon
  tip: "Select an icon to display next to this menu item"
```

## Use Cases

### Navigation Menu

```yaml
- key: main-menu
  type: list
  title: Main Menu
  fields:
    - key: label
      type: string
      title: Label
    
    - key: icon
      type: fonticon-picker
      title: Icon
    
    - key: url
      type: string
      title: URL
```

**Output:**
```yaml
main-menu:
  - label: "Home"
    icon: "FaHome"
    url: "/"
  - label: "About"
    icon: "FaInfoCircle"
    url: "/about"
  - label: "Contact"
    icon: "FaEnvelope"
    url: "/contact"
```

### Feature List

```yaml
- key: features
  type: list
  title: Features
  fields:
    - key: title
      type: string
      title: Title
    
    - key: icon
      type: fonticon-picker
      title: Icon
    
    - key: description
      type: markdown
      title: Description
```

**Output:**
```yaml
features:
  - title: "Fast Performance"
    icon: "FaRocket"
    description: "Lightning-fast load times"
  - title: "Secure"
    icon: "FaLock"
    description: "Enterprise-grade security"
  - title: "Responsive"
    icon: "FaMobile"
    description: "Works on all devices"
```

### Social Media Links

```yaml
- key: social-links
  type: list
  title: Social Media
  fields:
    - key: platform
      type: string
      title: Platform
    
    - key: icon
      type: fonticon-picker
      title: Icon
      default: "FaGlobe"
    
    - key: url
      type: string
      title: URL
```

**Output:**
```yaml
social-links:
  - platform: "Twitter"
    icon: "FaTwitter"
    url: "https://twitter.com/username"
  - platform: "GitHub"
    icon: "FaGithub"
    url: "https://github.com/username"
  - platform: "LinkedIn"
    icon: "FaLinkedin"
    url: "https://linkedin.com/in/username"
```

### Service Cards

```yaml
- key: services
  type: bundle
  title: Services
  path: content/services
  fields:
    - key: title
      type: string
      title: Title
    
    - key: icon
      type: fonticon-picker
      title: Icon
    
    - key: description
      type: markdown
      title: Description
    
    - key: price
      type: number
      title: Price
```

## Icon Name Format

The field outputs React Font Awesome icon names in PascalCase format:

| Display Name | Output Value | Usage in React |
|--------------|--------------|----------------|
| Business Time | `FaBusinessTime` | `<FaBusinessTime />` |
| Home | `FaHome` | `<FaHome />` |
| Star | `FaStar` | `<FaStar />` |
| Envelope | `FaEnvelope` | `<FaEnvelope />` |

## Hugo Integration

### Using Icons in Templates

**Install React Font Awesome:**
```bash
npm install react-icons
```

**In your Hugo partial:**
```go-html-template
{{ if .Params.icon }}
<div class="icon">
  <!-- Icon will be rendered by JavaScript -->
  <span data-icon="{{ .Params.icon }}"></span>
</div>
{{ end }}
```

**JavaScript to render icons:**
```javascript
import * as Icons from 'react-icons/fa';

document.querySelectorAll('[data-icon]').forEach(el => {
  const iconName = el.dataset.icon;
  const IconComponent = Icons[iconName];
  if (IconComponent) {
    ReactDOM.render(<IconComponent />, el);
  }
});
```

### CSS-Based Approach

Alternatively, map icon names to Font Awesome CSS classes:

```go-html-template
{{ $iconMap := dict
  "FaHome" "fa-home"
  "FaStar" "fa-star"
  "FaEnvelope" "fa-envelope"
}}

{{ if .Params.icon }}
<i class="fas {{ index $iconMap .Params.icon }}"></i>
{{ end }}
```

## Icon Categories

Font Awesome icons are organized into categories:

- **Interface:** FaHome, FaBars, FaCog, FaSearch
- **Business:** FaBriefcase, FaBusinessTime, FaChartLine
- **Communication:** FaEnvelope, FaPhone, FaComment
- **Social:** FaFacebook, FaTwitter, FaGithub, FaLinkedin
- **Media:** FaPlay, FaPause, FaVideo, FaMusic
- **Files:** FaFile, FaFolder, FaDownload, FaUpload
- **UI Elements:** FaCheck, FaTimes, FaPlus, FaMinus
- **Arrows:** FaArrowRight, FaArrowLeft, FaChevronUp

## Best Practices

1. **Consistent Style:** Use icons from the same style (solid, regular, brands) throughout your site
2. **Meaningful Icons:** Choose icons that clearly represent the content or action
3. **Accessibility:** Always provide text labels alongside icons for screen readers
4. **Default Values:** Set sensible defaults for optional icons
5. **Documentation:** Add tooltips explaining what the icon will be used for

## Common Patterns

### Icon with Label

```yaml
- key: button-icon
  type: fonticon-picker
  title: Button Icon
  default: "FaArrowRight"

- key: button-label
  type: string
  title: Button Label
  default: "Learn More"
```

### Conditional Icon

```yaml
- key: show-icon
  type: boolean
  title: Show Icon
  default: true

- key: icon
  type: fonticon-picker
  title: Icon
  default: "FaStar"
```

### Icon Set

```yaml
- key: icon-primary
  type: fonticon-picker
  title: Primary Icon

- key: icon-hover
  type: fonticon-picker
  title: Hover Icon
  tip: "Icon shown on mouse hover"
```

## Accessibility Considerations

When using icons in your templates, ensure accessibility:

```html
<!-- Bad: Icon only -->
<i class="fa fa-home"></i>

<!-- Good: Icon with label -->
<i class="fa fa-home" aria-label="Home"></i>
<span class="sr-only">Home</span>

<!-- Better: Icon as decoration -->
<a href="/">
  <i class="fa fa-home" aria-hidden="true"></i>
  <span>Home</span>
</a>
```

## Font Awesome Version

The fonticon-picker is based on React Font Awesome Icon Picker and supports Font Awesome 5 icon names.

:::note Icon Availability
Not all Font Awesome icons may be available. The specific icon set depends on the React Font Awesome Icon Picker library version included in Quiqr Desktop.
:::

## Output

```yaml
# Single icon
icon: "FaBusinessTime"

# In list
menu:
  - label: "Home"
    icon: "FaHome"
  - label: "About"
    icon: "FaInfoCircle"

# In object
feature:
  title: "Fast"
  icon: "FaRocket"
  description: "Lightning fast"
```

## Limitations

1. **Icon Set:** Limited to Font Awesome icons (no custom SVG icons)
2. **Style Selection:** Cannot choose between solid/regular/brands styles within the picker
3. **Size Control:** Icon size must be controlled in your templates/CSS
4. **Color Control:** Icon colors must be controlled in your templates/CSS

## Related Fields

- [String](./string.md) - For custom icon class names
- [Select](./select.md) - For predefined icon choices
- [Image Select](./image-select.md) - For custom icon images
- [Image](../special-fields/image.md) - For custom icon SVG files
