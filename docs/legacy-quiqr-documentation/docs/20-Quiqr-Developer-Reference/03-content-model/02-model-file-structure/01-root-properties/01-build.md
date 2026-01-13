---
title: build
weight: 10
---

# Build

The ```build``` property tells Quiqr which Hugo configuration file should be used when the
site will be build. A build occurs when a site is published.

{{< code-toggle file="./model/base" >}}
build:
  - config: config.toml
    key: default
{{</ code-toggle >}}


