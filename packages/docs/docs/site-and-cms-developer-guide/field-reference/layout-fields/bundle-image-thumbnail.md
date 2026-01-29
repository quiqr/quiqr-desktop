---
sidebar_position: 3
---

# Bundle Image Thumbnail

The bundle image thumbnail field displays thumbnail images within bundle managers, making it easier to visually identify content items in a list.

:::info Field Type
**Type:** `bundle-image-thumbnail`  
**Category:** Layout Field  
**Output:** None (display only)  
**Compatibility:** Only works with [bundle](../container-fields/bundle.md) field
:::

## Basic Configuration

```yaml
- key: articles
  type: bundle
  title: Articles
  path: content/articles
  fields:
    - key: thumbnail
      type: bundle-image-thumbnail
    
    - key: title
      type: string
      title: Title
    
    - key: featured-image
      type: image
      title: Featured Image
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |

## How It Works

The bundle image thumbnail field automatically:
1. Looks for an image field in the same bundle item
2. Displays that image as a thumbnail in the bundle list view
3. Provides visual identification for content items

:::tip Image Source
The field typically displays the first image field found in the bundle's fields configuration.
:::

## Usage Example

### Article Bundle with Thumbnails

```yaml
collections:
  - key: blog-posts
    title: Blog Posts
    folder: content/blog
    fields:
      - key: posts-bundle
        type: bundle
        title: Posts
        path: content/blog
        fields:
          - key: thumb
            type: bundle-image-thumbnail
          
          - key: title
            type: string
            title: Post Title
          
          - key: featured-image
            type: image
            title: Featured Image
          
          - key: excerpt
            type: string
            title: Excerpt
```

In this example, the bundle list will show:
- Thumbnail preview of the featured image
- Post title
- Quick visual identification of each blog post

### Gallery Bundle

```yaml
- key: photo-gallery
  type: bundle
  title: Photo Gallery
  path: content/gallery
  fields:
    - key: preview
      type: bundle-image-thumbnail
    
    - key: photo
      type: image
      title: Photo
    
    - key: caption
      type: string
      title: Caption
    
    - key: photographer
      type: string
      title: Photographer
```

### Portfolio Projects

```yaml
- key: portfolio
  type: bundle
  title: Portfolio Projects
  path: content/portfolio
  fields:
    - key: project-thumb
      type: bundle-image-thumbnail
    
    - key: project-name
      type: string
      title: Project Name
    
    - key: cover-image
      type: image
      title: Cover Image
    
    - key: description
      type: markdown
      title: Description
```

## Best Practices

1. **Position First:** Place the thumbnail field as the first field in the bundle for consistent visual layout
2. **Include Image Field:** Ensure the bundle contains at least one `image` field for the thumbnail to display
3. **Descriptive Keys:** Use clear key names like `thumbnail`, `preview`, or `thumb`
4. **Single Thumbnail:** Use only one thumbnail field per bundle to avoid confusion

## Visual Benefits

The thumbnail field provides several UX improvements:

- **Quick Identification:** Easily distinguish between items at a glance
- **Visual Memory:** Users can find content by remembering the image rather than text
- **Professional Appearance:** Creates a more polished, media-rich interface
- **Faster Navigation:** Reduces time spent reading titles to find specific content

## Common Use Cases

### Blog Post Management

```yaml
# Blog posts with featured images
- key: blog-bundle
  type: bundle
  title: Blog Posts
  path: content/posts
  fields:
    - key: post-thumbnail
      type: bundle-image-thumbnail
    - key: title
      type: string
      title: Title
    - key: featured-image
      type: image
      title: Featured Image
    - key: content
      type: markdown
      title: Content
```

### Product Catalog

```yaml
# Products with product photos
- key: products
  type: bundle
  title: Products
  path: content/products
  fields:
    - key: product-preview
      type: bundle-image-thumbnail
    - key: product-name
      type: string
      title: Product Name
    - key: product-image
      type: image
      title: Product Image
    - key: price
      type: number
      title: Price
```

### Team Members

```yaml
# Team members with profile photos
- key: team
  type: bundle
  title: Team Members
  path: content/team
  fields:
    - key: profile-thumbnail
      type: bundle-image-thumbnail
    - key: name
      type: string
      title: Name
    - key: photo
      type: image
      title: Profile Photo
    - key: bio
      type: markdown
      title: Biography
```

### Event Listings

```yaml
# Events with event banners
- key: events
  type: bundle
  title: Events
  path: content/events
  fields:
    - key: event-thumb
      type: bundle-image-thumbnail
    - key: event-title
      type: string
      title: Event Title
    - key: banner-image
      type: image
      title: Event Banner
    - key: date
      type: date
      title: Event Date
```

## Limitations

1. **Bundle Only:** Cannot be used outside of bundle fields
2. **Image Dependency:** Requires an image field in the same bundle to display anything
3. **No Configuration:** Limited customization options (thumbnail size, aspect ratio, etc.)
4. **No Output:** Does not affect content output, purely for UI

## Troubleshooting

### Thumbnail Not Displaying

If the thumbnail doesn't appear:

1. **Check for Image Field:** Ensure the bundle contains an `image` field
2. **Field Order:** Try placing the image field after the thumbnail field
3. **Image Path:** Verify that images are properly uploaded and accessible

### Multiple Thumbnails

If you have multiple image fields in a bundle:

```yaml
fields:
  - key: thumbnail
    type: bundle-image-thumbnail
  
  # Primary image (typically displayed as thumbnail)
  - key: cover-image
    type: image
    title: Cover Image
  
  # Additional images (may not be used for thumbnail)
  - key: gallery-images
    type: image
    title: Gallery Images
```

The thumbnail typically displays the first image field found.

## Output

The bundle image thumbnail field generates **no output** in your content files. It only affects the visual display of bundle items in the Quiqr Desktop interface.

## Related Fields

- [Bundle](../container-fields/bundle.md) - Container field for managing multiple content items
- [Image](../special-fields/image.md) - Image upload and selection field
- [Image Select](../data-fields/image-select.md) - Image picker from a specified path
