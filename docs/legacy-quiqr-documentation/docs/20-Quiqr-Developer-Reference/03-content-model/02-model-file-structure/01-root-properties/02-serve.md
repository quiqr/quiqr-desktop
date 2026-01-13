---
title: serve
weight: 20
---

# Serve

The ```serve``` property tells Quiqr which Hugo configuration file should be
used for the live preview server. The server listens to
```http://localhost:13131```.

{{< code-toggle file="./model/base" >}}
serve:
  - config: config.toml
    key: default
    hugoHidePreviewSite: false
{{</ code-toggle >}}

