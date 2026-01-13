---
title: Blog (single file)
weight: 20
---

# Example 1: minimal one file blog

Here's an example model/base-file containing a minimal configuration for a blog website.

{{< code-toggle file="./model/base" >}}
build:
  - config: config.toml
    key: default
serve:
  - config: config.toml
    key: default
hugover: extended_0.76.5
collections:
  - dataformat: yaml
    extension: md
    fields:
      - key: draft
        title: Draft
        type: boolean
      - key: title
        title: Title
        type: string
      - extensions:
          - jpg
          - png
          - jpeg
          - pdf
          - svg
        fields:
          - key: thumb
            title: Thumb
            type: bundle-image-thumbnail
        key: page_related_images
        path: ''
        title: Page related images
        type: bundle-manager
      - key: mainContent
        title: Main content
        type: markdown
      - key: publishdate
        title: Publishdate
        type: hidden
      - key: tags
        title: Tags
        type: chips
    folder: content/post/
    itemtitle: Post
    key: c__post
    title: Posts
menu:
  - key: singles
    menuItems:
      - key: s__about
    title: Pages
  - key: collections
    menuItems:
      - key: c__post
    title: Groups
  - key: general
    menuItems:
      - key: config
    title: General
singles:
  - dataformat: toml
    fields:
      - key: description
        title: Description
        type: string
      - key: title
        title: Title
        type: string
      - fields:
          - key: author
            title: Author
            type: string
          - key: dateFormat
            title: Date format
            type: string
          - key: description
            title: Description
            type: string
          - key: paginationSinglePost
            title: Pagination single post
            type: boolean
          - key: readMore
            title: Read more
            type: boolean
          - key: style
            title: Style
            type: string
        groupdata: true
        key: params
        title: Params
        type: section
    file: config.toml
    key: config
    title: Settings
  - dataformat: yaml
    fields:
      - key: title
        title: Title
        type: string
      - key: description
        title: Description
        type: string
      - extensions:
          - jpg
          - png
          - jpeg
          - pdf
          - svg
        fields:
          - key: thumb
            title: Thumb
            type: bundle-image-thumbnail
        key: page_related_images
        path: images/
        title: Page related images
        type: bundle-manager
      - key: mainContent
        title: Main content
        type: markdown
    file: content/about.md
    key: s__about
    previewUrl: /about/
    title: About
{{< /code-toggle >}}


