---
title: menu
weight: 40
---

# Root property: menu

The Menu main key is optional. When not defined Quiqr creates two menu sections: Singles and Collections.

When ```menu``` is defined the default Quiqr content navigation is overriden by this configuration.

## Properties

There are the properties of a single menu dictionary.

| property  | value type            | optional  | description                                                                      |
|-----------|-----------------------|-----------|----------------------------------------------------------------------------------|
| key       | string                | mandatory | Keys are for internal use and must be unique                                     |
| title     | string                | mandatory | The title of this menu                                                           |
| menuItems | array of dictionaries | mandatory | contains a menu items                                                            |
| matchRole | string                | optional  | when set to "siteDeveloper" this menu is only visible in the role [Site Developer](/docs/15-site-and-cms-development/01-user-roles/) |

Every menu item has a dictionary with. These are the properties of a menu item.

| property | value type | optional  | description                                                |
|----------|------------|-----------|------------------------------------------------------------|
| key      | string     | mandatory | this refers to the key of the defined Single of Collection |

## Example

{{< code-toggle file="./model/base" >}}
menu:
  - key: pages
    title: Pages
    menuItems:
      - key: about
  - key: blog
    title: Groups
    menuItems:
      - key: posts
  - key: config
    title: Settings
    menuItems:
      - key: config
{{</ code-toggle >}}

