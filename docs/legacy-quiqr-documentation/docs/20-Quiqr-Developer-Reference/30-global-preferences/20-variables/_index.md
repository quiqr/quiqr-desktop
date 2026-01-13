---
title: Variables
weight: 20
---

# Global Variables

Global variables are used as override values in [build actions](/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/). This is usefull
when for example path to executables differ on various user systems.

Variables must contain alphanumeric characters or underscores. E.g.
`PANDOC_EXECUTABLE` or `pandoc_executable`. The replacer is case sensitive but
the implementor is free to choose lower or upper case.



