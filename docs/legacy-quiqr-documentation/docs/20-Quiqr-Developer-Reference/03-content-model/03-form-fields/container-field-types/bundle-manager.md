---
title: Bundle manager
---

# Bundle manager

The `bundle-manager` is a container field for creating a file-manager form for
managing the assets of page bundles. The word page bundle refers to [Hugo's
Page Bundles](https://gohugo.io/content-management/page-bundles/). A page
bundle is a way of organizing a page inside it's own directory together with
it's resources.

It's not possible to use Bundle managers with pages which are not stored as
page bundle.


{{< figure src="../bundle-manager1.png" caption="Bundle Manager together with a Bundle Image Thumbnail" >}}

{{< figure src="../bundle-manager2.png" caption="Bundle Manager with Bundle Image Thumbnail and extra string fields" >}}

## Bundle image thumbnail

The `bundle-image-thumbnail` field is a special field to be used together with
bundle-manager containers. It's creates preview image thumbnails of selected
images.

```Read [bundle-image-thumbnail documentation]({{< ref path="../layout-field-types/bundle-image-thumbnail.md" >}}) for more information.```

## Properties

| property    | value type | optional  | description                                  |
|-------------|------------|-----------|----------------------------------------------|
| key         | string     | mandatory | Keys are for internal use and must be unique |
| title       | string     | optional  | The title of the element                     |
| path        | string     | mandatory | The path to the location of the files. When the path starts with `/` files are stored in the directory relative to the site root directory. Without a leading `/` files are stored in the directory relative to the where the markdown or data file is stored.        |
| maxItems    | integer    | optional  | max amount of files allowed to add           |
| forceFileName | string    | optional  | when forceFileName is set to a filename, the uploaded file is renamed to this filename including it's extension. When forceFileName is set maxItems is automatically set to 1 NOTE, files are not converted, it's wise to only allow the same extension  |
| extensions  | array      | optional  | List of allowed filetypes                    |
| addButtonLocationTop| boolean (default: false) | optional| Show `add` button on top of the widget in stead of at the bottom |
| fields      | array      | optional  | List of fields as subform                    |

## Sample 1

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: images
title: Images
type: bundle-manager
path: images
extensions:
  - jpg
  - png
  - jpeg
  - pdf
  - svg
fields:
  - key: thumb
    type: bundle-image-thumbnail
{{< /code-toggle >}}

### Output

```ls
 ..
 content/portfolio/item2
 ├── images/
 │  ├── backgound-image.jpg
 │  └── foregound-image.jpg
 └── index.md
 static/
 themes/
 ..
```

## Sample 2

This configuration looks the same but the path starts with a `/`
### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: site_images
title: Site Images
type: bundle-manager
path: /static/images
extensions:
  - jpg
  - png
  - jpeg
  - pdf
  - svg
fields:
  - key: thumb
    type: bundle-image-thumbnail
{{< /code-toggle >}}

### Output

```ls
 ..
 content/
 static/
 └── images/
    ├── image1.jpg
    └── image2.jpg
 themes/
 ..
```

## Known issues

A bug currently prevents the values of input fields to be saved in the frontmatter.
