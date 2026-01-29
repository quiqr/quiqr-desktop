---
sidebar_position: 13
---

# Image Select

The image select field provides a visual file picker interface for selecting images from a specified directory. Unlike the basic [image](../special-fields/image.md) field which handles uploads, this field lets users choose from existing images.

:::info Field Type
**Type:** `image-select`  
**Category:** Data Field  
**Output:** String (filename)
:::

## Basic Configuration

```yaml
- key: hero-image
  type: image-select
  title: Hero Image
  path: images/heroes
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |
| `default` | string | No | - | Default filename value |
| `autoSave` | boolean | No | `false` | Automatically save when value changes |
| `path` | string | Yes | - | Directory path to look for images (relative or absolute) |
| `real_fs_path` | string | No | - | Actual filesystem path (for mapping virtual paths) |
| `buttonTitle` | string | No | `"Select File"` | Text displayed on the selection button |

## Visual Examples

### Selection Dialog

![Image Select Form](/img/fields/image-select1.png)

The field displays a button to open the image picker dialog.

![Image Select Dialog](/img/fields/image-select2.png)

The dialog shows thumbnail previews of all images in the specified directory.

## Usage Examples

### Basic Image Selection

```yaml
- key: featured-image
  type: image-select
  title: Featured Image
  path: images/featured
```

**Output:**
```yaml
featured-image: "mountain-landscape.jpg"
```

### With Default Value

```yaml
- key: author-avatar
  type: image-select
  title: Author Avatar
  path: images/avatars
  default: "default-avatar.png"
```

**Output (when not changed):**
```yaml
author-avatar: "default-avatar.png"
```

### Custom Button Title

```yaml
- key: logo
  type: image-select
  title: Logo
  path: assets/logos
  buttonTitle: "Choose Logo"
```

### With Tooltip

```yaml
- key: background-image
  type: image-select
  title: Background Image
  tip: "Select a background image from the available options. Recommended size: 1920x1080"
  path: images/backgrounds
```

## Path Configuration

### Relative Paths

Relative paths are resolved from the Hugo content directory:

```yaml
- key: thumbnail
  type: image-select
  title: Thumbnail
  path: images/thumbnails
```

This looks for images in `content/images/thumbnails/`.

### Absolute Paths with Leading Slash

Use leading slash to reference from site root:

```yaml
- key: banner
  type: image-select
  title: Banner Image
  path: /static/images/banners
```

This looks for images in `static/images/banners/`.

### Virtual Path Mapping

Map virtual paths to actual filesystem locations using `real_fs_path`:

```yaml
- key: gallery-image
  type: image-select
  title: Gallery Image
  path: /images
  real_fs_path: /static/images
```

**How it works:**
- **Virtual path:** `/images` (used in output)
- **Real path:** `/static/images` (actual filesystem location)
- **Output:** `/images/photo.jpg`
- **File location:** `static/images/photo.jpg`

### Assets Directory Mapping

```yaml
- key: hero-image
  type: image-select
  title: Hero Image
  path: /assets
  real_fs_path: /static/assets
```

Images selected from `static/assets/` will be referenced as `/assets/filename.jpg` in the output.

## Advanced Examples

### Multiple Image Selects

```yaml
fields:
  - key: header-image
    type: image-select
    title: Header Image
    path: images/headers
    buttonTitle: "Select Header"
  
  - key: footer-image
    type: image-select
    title: Footer Image
    path: images/footers
    buttonTitle: "Select Footer"
  
  - key: sidebar-image
    type: image-select
    title: Sidebar Image
    path: images/sidebars
    buttonTitle: "Select Sidebar"
```

### Product Images

```yaml
- key: product-image
  type: image-select
  title: Product Image
  tip: "Choose the main product photo. Images should be 800x800 pixels."
  path: images/products
  buttonTitle: "Choose Product Photo"
  autoSave: true
```

### Category Icons

```yaml
- key: category-icon
  type: image-select
  title: Category Icon
  path: /assets/icons
  real_fs_path: /static/assets/icons
  buttonTitle: "Select Icon"
```

## Use Cases

### Theme Customization

```yaml
singles:
  - key: site-config
    title: Site Configuration
    file: config/_default/params.yaml
    fields:
      - key: logo
        type: image-select
        title: Site Logo
        path: /assets/logos
        real_fs_path: /static/assets/logos
      
      - key: favicon
        type: image-select
        title: Favicon
        path: /assets/icons
        real_fs_path: /static/assets/icons
```

### Blog Post Management

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts
    fields:
      - key: title
        type: string
        title: Title
      
      - key: featured-image
        type: image-select
        title: Featured Image
        path: images/featured
        tip: "Select a featured image for this post"
      
      - key: content
        type: markdown
        title: Content
```

### Landing Page Builder

```yaml
- key: hero-section
  type: object
  title: Hero Section
  fields:
    - key: hero-background
      type: image-select
      title: Background Image
      path: images/heroes
      buttonTitle: "Choose Background"
    
    - key: hero-overlay-image
      type: image-select
      title: Overlay Image
      path: images/overlays
      buttonTitle: "Choose Overlay"
```

## Comparison with Image Field

### Image Select vs. Image

| Feature | Image Select | Image Field |
|---------|--------------|-------------|
| **Purpose** | Choose from existing images | Upload new images |
| **Source** | Specified directory | User's computer |
| **Output** | Filename string | File path (after upload) |
| **Use Case** | Pre-curated image library | User-generated content |
| **Management** | Images managed outside Quiqr | Images managed through Quiqr |

**When to use image-select:**
- Working with a predefined set of images
- Images managed by designers/developers
- Consistent branding with approved assets
- Faster selection from limited options

**When to use image field:**
- Users need to upload their own images
- Dynamic, user-generated content
- No predetermined image library
- Flexible image management

## Best Practices

1. **Organize Directories:** Group images by purpose (e.g., `images/heroes`, `images/thumbnails`)
2. **Use Virtual Paths:** Map Hugo's `/static` directory using `real_fs_path` for cleaner output
3. **Descriptive Button Titles:** Use `buttonTitle` to make the action clear ("Select Logo" vs. "Select File")
4. **Provide Tips:** Use the `tip` property to guide users on image requirements
5. **Set Defaults:** Provide sensible defaults for optional images
6. **Consider Performance:** Don't point to directories with thousands of images

## Supported Image Formats

The field displays images with common formats:
- **JPEG/JPG** - `.jpg`, `.jpeg`
- **PNG** - `.png`
- **GIF** - `.gif`
- **WebP** - `.webp`
- **SVG** - `.svg`

## Troubleshooting

### No Images Appear

If the selection dialog is empty:

1. **Check Path:** Verify the `path` value points to an existing directory
2. **Verify Images:** Ensure the directory contains supported image formats
3. **Check real_fs_path:** If using virtual paths, confirm `real_fs_path` is correct
4. **File Permissions:** Ensure Quiqr has read access to the directory

### Wrong Images Displayed

If unexpected images appear:

1. **Review Path:** Double-check the `path` value
2. **Check Nesting:** Ensure you're not accidentally including subdirectories
3. **Clear Cache:** Restart Quiqr Desktop to refresh the file index

## Output

The image select field outputs a simple string value containing the selected filename:

```yaml
# Simple filename
hero-image: "mountain-sunset.jpg"

# With virtual path
banner: "/images/banner-home.png"
```

## Related Fields

- [Image](../special-fields/image.md) - Upload and manage images
- [File](../special-fields/file.md) - Select or upload any file type
- [String](./string.md) - Basic text field (can also store filenames)
- [Select](./select.md) - Dropdown selection for predefined options
