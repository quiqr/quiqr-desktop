# Quiqr Docusaurus Theme

This documentation uses a custom theme matching the Quiqr branding from [book.quiqr.org](https://book.quiqr.org/).

## Branding Elements

### Colors

**Primary Blue**: `#0055bb` (Quiqr brand color)
- Used for links, active navigation, and primary UI elements
- Dark mode uses lighter blue: `#84b2ff` for better contrast

**Grays**: Clean gray palette for backgrounds and borders
- Light mode: `#f8f9fa`, `#e9ecef`, `#adb5bd`
- Dark mode: Uses semi-transparent whites for depth

### Typography

**Font Family**: Roboto (matching Quiqr Book)
- Body: Roboto (300, 400, 700 weights)
- Code: Roboto Mono

**Font Sizes**:
- H1: 2.5rem
- H2: 2rem  
- H3: 1.5rem
- Body: 1rem
- Code: 90% of body

### Logo

The navigation uses the official Quiqr logo from book.quiqr.org:
- `static/img/quiqr-logo.svg` - Main logo
- `static/img/favicon.png` - Favicon

### Search

Client-side full-text search using Lunr.js:
- No external dependencies or API keys
- Indexes all documentation during build
- Search bar integrated into navbar
- Styled to match Quiqr branding

## Theme Files

### `src/css/custom.css`

Main theme stylesheet defining:
- Color variables for light/dark modes
- Typography (Roboto fonts)
- Component styling (navbar, sidebar, tables, code blocks)
- Admonitions (note, warning, danger boxes)
- Smooth transitions between modes

### `docusaurus.config.ts`

Configuration includes:
- Logo reference: `img/quiqr-logo.svg`
- Favicon: `img/favicon.png`
- Title: "Quiqr Desktop"
- Tagline: "Local-first CMS for static site generators"

## Customization

To modify the theme:

1. **Colors**: Edit CSS variables in `src/css/custom.css` under `:root` (light) and `[data-theme='dark']` (dark)
2. **Fonts**: Change `--ifm-font-family-base` variable or import different Google Fonts
3. **Logo**: Replace `static/img/quiqr-logo.svg` with new logo file
4. **Spacing/Layout**: Modify component-specific styles in `custom.css`

## Matching Quiqr Book

The theme intentionally matches book.quiqr.org for brand consistency:
- Same primary blue color (#0055bb)
- Same Roboto font family
- Similar table styling
- Similar code block styling
- Clean, documentation-focused design

## Dark Mode

Docusaurus automatically handles dark mode based on user system preferences or manual toggle. The theme provides optimized colors for both modes while maintaining brand identity.
