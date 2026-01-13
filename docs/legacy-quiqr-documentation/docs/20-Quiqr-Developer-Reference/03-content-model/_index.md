---
title: Content Model
weight: 30
bookCollapseSection: false
---

# Content Model Configuration

Quiqr can create advanced advanced models with customized forms for editing
any kind of content. These forms are configured in the ```./quiqr/model/``` directory
with ```base.json``` as the main configuration file. The model-files can be in
YAML, JSON or TOML-formatting.

## Root Properties

The model is split up in several main properties:

- **build**: information how to build the hugo website
- **serve**: information how to serve the hugo website
- **hugover**: the hugo version to use. The correct hugo version is downloaded automatically.
- **collections**: main key for collections with pages. E.g. _blog posts_
- **singles**: main key for single page configurations. E.g. _home page_ or _about_
- **menu**: main key for the menu configuration of the CMS.
- **dynamics**: main key for the dynamics form definitions to be used in dynamic forms.

## Model File Structure

Quiqr has helpers to organize complex models and prevent redundant
configuration code. ```Includes``` are used to split the main-file into
seperate files and partials makes it possible to reuse configuration code.

## Form Fields

The main keys Singles, Collections and Dynamics can have form fields definitions.
These are the building blocks for creating forms.

All available form field types are described in the section Form Fields. Form
fields have their own properties for configuration. All form fields share
the following properties:

### Properties

| property | value type | optional                 | description                                                                               |
|----------|------------|--------------------------|-------------------------------------------------------------------------------------------|
| key      | string     | mandatory                | Keys are for internal use and must be unique                                              |
| disabled | boolean    | optional                 | Disabled elements are completely ignored and not visible in the form                      |

### Full Example

[The Kitchen Sink
Template](https://github.com/quiqr/quiqr-template-kitchen-sink) has a every
field type configured. Use this template to learn and play around with the
Quiqr model.




