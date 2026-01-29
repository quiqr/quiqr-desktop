---
sidebar_position: 1
---

# Image Field

The `image` field provides image upload and selection with preview capabilities.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default image path |
| `path` | string | No | static/images/ | Upload directory path |
| `max_size` | number | No | 5 | Maximum file size in MB |
| `allowed_types` | array | No | [jpg,png,gif,webp] | Allowed file extensions |

## Examples

### Example 1: Hero Image

**Configuration:**

```yaml
key: hero_image
title: Hero Image
type: image
path: static/images/heroes/
tip: Upload a high-resolution hero image
```

**Output:**

```yaml
hero_image: /images/heroes/my-hero.jpg
```

### Example 2: Profile Picture

**Configuration:**

```yaml
key: avatar
title: Profile Picture
type: image
path: static/avatars/
max_size: 2
allowed_types:
  - jpg
  - png
tip: Square images work best (min 200x200px)
```

**Output:**

```yaml
avatar: /avatars/john-doe.jpg
```

### Example 3: Featured Image

**Configuration:**

```yaml
key: featured_image
title: Featured Image
type: image
path: static/featured/
default: /featured/default.jpg
```

**Output:**

```yaml
featured_image: /featured/my-post-image.png
```

## Features

- **Upload**: Drag-and-drop or browse to upload
- **Preview**: See uploaded image preview
- **Select**: Choose from existing images
- **Remove**: Clear selected image
- **Validation**: File size and type checking

## Upload Process

1. User selects or drags image file
2. File is validated (size, type)
3. Image is uploaded to specified path
4. Path is stored in frontmatter
5. Preview is displayed

## Path Handling

Images are stored relative to the site root:
- Upload to: `static/images/photo.jpg`
- Stored as: `/images/photo.jpg`
- Hugo serves from: `static/images/photo.jpg`

## Use Cases

- **Content images**: Hero images, featured images, thumbnails
- **User content**: Avatars, profile pictures
- **Gallery**: Photo collections, portfolios
- **Metadata**: Social share images, OpenGraph images

## File Size Tips

Recommended max sizes by use:
- **Thumbnails**: 1 MB
- **Content images**: 3-5 MB
- **Hero images**: 5-10 MB
- **High-res**: 10+ MB (use caution)

## Related Fields

- [Image Select](../data-fields/image-select.md) - Choose from predefined images
- [File](./file.md) - For non-image files
- [String](../data-fields/string.md) - For manual image URLs
