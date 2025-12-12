---
title: User Roles
weight: 10
---

# User Roles

Quiqr has two major target user type: Content Editors and Site Developers.

Developers need the same tools as editors, plus some extra tools. To make the
experience for content editors as pleasant as possible we hide some information
and tools in their interface.

## Content Editor

The default role of Quiqr is Content Editor. A content editor download templates, import
sites, change content and add synchronization targets and finally sync to this
target.

## Site Developer

As site developer you have direct access to more tools.

### Tools in Site

In a site, in the toolbar next to Content and Sync, there is the Tools button.

This Tools button gives access to several developer utilities and tools.

{{< figure src="./tools-in-toolbar.png" caption="Tools only visible in Site Developers role">}}

### Content Menu items for developer

The Content sidebar can have Menu items only visible for Site Developers by
setting the matchRole property. See [Menu Properties](/docs/20-quiqr-developer-reference/03-content-model/02-model-file-structure/01-root-properties/04-menu).



## Switch Role

In Windows and Linux roles are in the Edit Menu.

{{< figure src="./switch-roles.png" caption="Switch Role">}}

In macOS the roles are in the Quiqr Menu.

{{< figure src="./switch-roles-mac.png" caption="Switch Role in macOS" width="400" >}}

