---
title: collections
weight: 60
---

# Root property: collections

The ```collections``` property is optional. It can define an array with one or more
collections with pages which will get their own navigation item in the Quiqr
Content Menu. In the above example there is a Collection Blog configured
containing blog pages in the folder _content/blog/_. Below the properties of a
single collection dictionary.

| property             | value type                               | optional  | description                                                                                                                            |
|----------------------|------------------------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------|
| key                  | string                                   | mandatory | Keys are for internal use and must be unique                                                                                           |
| dataformat           | string: yaml, toml,json                  | mandatory | Defines the output format of the frontmatter block. Collections can only handle markdown files. the outputs regards to the frontmatter |
| extension            | ???                                      | mandatory | ???                                                                                                                                    |
| title                | string                                   | mandatory | The title of this page in the menu and when Quiqr App refers to this page                                                              |
| itemtitle            | string                                   | mandatory | The singular name of the collection items                                                                                              |
| hideIndex            | boolean                                  | optional  | when set `true` the _index.md is not showed in the list of items                                                                       |
| folder               | string: relative path to dir             | mandatory | The path to the directory containing all files with the configured extension.                                                          |
| previewUrlBase       | string: relative url path to the website | optional  | When set, this path as base path to preview the page                                                                                   |
| hidePreviewIcon      | boolean                                  | optional  | Hide Preview Icon which opens the page in the browser                                                                                  |
| hideExternalEditIcon | boolean                                  | optional  | Hide Enternal Editor Icon which opens the file in the OS Text Editor                                                                   |
| hideSaveButton       | boolean                                  | optional  | Hide form Save button                                                                                                                  |
| buildActions         | array of dictionaries                    | optional  | Defines buttons which triggers a custom [build actions](/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/).        |
| fields               | array of dictionaries                    | mandatory | These are the form input fields.                                                                                                       |
| sortkey              | string                                   | optional  | can be set to a front matter key which will be used for sorting                                                                        |

## Example

{{< code-toggle file="./model/base" >}}
collections:
  - dataformat: yaml
    extension: md
    fields:
      - key: title
        title: Title
        type: string
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
    key: post
    title: Posts
{{</ code-toggle  >}}
