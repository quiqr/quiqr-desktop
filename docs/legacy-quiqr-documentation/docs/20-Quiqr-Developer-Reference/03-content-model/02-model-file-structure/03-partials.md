---
title: Partials
weight: 10
---

# Partials

Partials are reusable configuration blocks that can be used in a form
definition inside singles, collections and dynamics.

Partials can be used with the property ```_mergePartial```. The value of this property is points to the location of the partial file to
use.

Partials are merged with to other form attributes. Attributes which are also
defined in the form with overwrite the partial attributes.


## Relative partial pointer
This location can point to a file in the ./quiqr/model/partials
directory. In this case the value is a string with the name of the partial file
without it's extension. E.g: `single_images` This converts to
`./quiqr/model/partials.{yml,yaml,toml,json}`

## Remote partial pointers
The location can also point to an URI location prefixed with `file://`, `https://`
or `http://`. Locations with file:// point to the absolute location on your
local machine. The http-protocols point to a location on internet. Quiqr
Desktop will always make a copy of the remote file in the directory
`./quiqr/model/partialsRemoteCache`. Therefor it's safe to publish and share
your site with users that not have access to these resources. If you want to
refresh the remotePartial, just remove the directory partialsRemoteCache and
they wil automatically copied again. You can also turn on the Disable Partial
Cache toggle in the `menu`

## Example

In ```./quiqr/model/base.yaml``` a form definition in ```singles``` points to ```minimal_configuration```.

### The base

```./model/base.yaml```
```yaml
singles:
  - key: config
    file: config.toml
    title: Settings
    _mergePartial: minimal_configuration
```

### The partial

```./model/partial/minimal_configuration.yaml```
```yaml
- dataformat: yaml
  fields:
    - key: title
      title: Title
      type: string
    - key: description
      title: Description
      type: string
    - key: theme
      theme: Theme
      type: string
  title: Minimal Configuration
```

### The compiled end result

```yaml
singles:
  - key: config
    file: config.toml
    title: Settings
    dataformat: yaml
    fields:
      - key: description
        title: Description
        type: string
      - key: title
        title: Title
        type: string
      - key: theme
        theme: Theme
        type: string
```

{{< hint info >}}
The title or the partial *Minimal Configuration* is overwritten the the calling
definition in ```base.yml```, leaving it *Settings*.
{{< /hint >}}

## Example 2

In ```./quiqr/model/base.yaml``` a form definition in ```singles``` points to a
remote file containing a lot of hugo config options.

### The base

```./model/base.yaml```

```yaml
singles:
  - key: config
    file: config.toml
    title: Settings
    _mergePartial: https://raw.githubusercontent.com/quiqr/model-partials/main/singles/configuration-hugo-076.yml
```

## Example 2

In ```./quiqr/model/base.yaml``` a form definition in ```singles``` points to a
local file on the users computer containing a lot of hugo config options. This
file:// URI is useful when developing remote configurations and you do not want
to push at every change.

### The base

```./model/base.yaml```

```yaml
singles:
  - key: config
    file: config.toml
    title: Settings
    _mergePartial: file:///home/pim/cQuiqr/model-partials/singles/configuration-hugo-076.yml
```

