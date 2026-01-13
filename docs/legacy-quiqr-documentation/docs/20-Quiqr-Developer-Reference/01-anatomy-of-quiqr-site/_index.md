---
title: Anatomy of a Quiqr Site
weight: 10
---

# Anatomy of a Quiqr Site

## Quiqr Data Directory

Quiqr stores it's data in the ```Quiqr Data``` directory in the Home directory of the current user.

### Quiqr Data on Windows

```batch
C:\Users\robin\Quiqr Data
```

### Quiqr Data on macOS

```bash
/Users/robin/Quiqr Data
```

### Quiqr Data on Linux/BSD

```bash
/home/robin/Quiqr Data
```

## Site configuration

All Quiqr sites store their top-level-configuration file in the root of the
Quiqr Data Directory. This top-level-configuration file provides Quiqr path
information to a Quiqr website.

```bash
~/Quiqr Data/
  ./config.my-site.json
```

## Hugo and Quiqr Site directory structure

```bas
./my_hugo_site/
  ./content/                          (hugo content directory)
  ./static/                           (hugo static files directory)
  ./data/                             (hugo data files directory)
  ./themes/                           (hugo themes directory)
  ./resources/                        (hugo temporary build resources directory)
  ./public/                           (hugo final build directory)
  ./config.toml                       (hugo main config file)
  ./.quiqr-cache                      (quiqr thumbnails cache folder)
  ./quiqr/                            (quiqr config folder)
     ./home/index.md                  (optional message to the content editor in Quiqr)
     ./forms/index.md                 (forms end point configuration files)
     ./model/base.yaml                (main Quiqr Model Configuration File)
     ./model/partials/                (directory with model configuration partials files)
     ./model/partialsRemoteCache/     (directory with cached remote model configuration partials files)
     ./model/includes/                (directory with model configuration include files)
```

