---
sidebar_position: 4
---

# Special Fields

Special fields handle file-related operations in Quiqr's form system. These fields provide functionality for managing files, images, and other media assets.

## Available Special Fields

- [File](./file.md) - File upload and selection
- [Image](./image.md) - Image upload and management

## File Management

### File Fields
Use file fields when you need to handle general file uploads and selection. Supports various file types and provides file browsing capabilities.

### Image Fields
Use image fields specifically for image management. Includes image-specific features like preview, cropping, and optimization.

## Common Properties

Special fields share these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the field |
| `type` | string | Field type (file or image) |
| `title` | string | Display label |
| `tip` | string | Help text with markdown support |

## File Handling

Both file and image fields integrate with Hugo's asset management system:

- Files are stored in the site's static or content directories
- Image fields support page bundles for co-located content and images
- Automatic path resolution relative to content files
- Support for both local and remote file sources

See individual field documentation for detailed configuration options and examples.
