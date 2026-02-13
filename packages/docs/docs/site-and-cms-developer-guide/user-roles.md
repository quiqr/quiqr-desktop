---
sidebar_position: 1
---

# User Roles

Quiqr has two major target user types: **Content Editors** and **Site Developers**.

Developers need the same tools as editors, plus some extra tools. To make the experience for content editors as pleasant as possible, we hide some information and tools in their interface.

## Content Editor

The default role of Quiqr is **Content Editor**. A content editor can:

- Download templates from the site library
- Import existing sites
- Edit and create content
- Add synchronization targets (GitHub, GitLab, etc.)
- Publish content by syncing to targets

Content editors see a simplified interface focused on content management tasks, without developer-specific tools that might be confusing.

## Site Developer

As a **Site Developer**, you have access to additional tools and features for building and customizing Quiqr sites.

### Tools in Site

In a site, the toolbar next to **Content** and **Sync** includes a **Tools** button that provides access to several developer utilities.

![Tools button in toolbar](/img/tools-in-toolbar.png)

*The Tools button is only visible in Site Developer role*

Developer tools include:

- **Model Editor** - Edit the content model configuration
- **Site Configuration** - Access to site-level settings
- **Developer Console** - Debugging and troubleshooting
- **File Manager** - Direct access to site files
- **Build Tools** - Hugo build configuration

### Content Menu Items for Developers

The Content sidebar can have menu items that are only visible to Site Developers by setting the `matchRole` property in the model configuration.

This allows you to create developer-specific navigation items for:
- Configuration files
- Template editing
- Advanced settings
- System content

See [Menu Properties](./content-model/model-file-structure/root-properties/menu.md) for more details on configuring role-specific menu items.

## Switch Role

You can easily switch between Content Editor and Site Developer roles from the application menu.

### Windows and Linux

Roles are in the **Edit Menu**:

![Switch Role menu](/img/switch-roles.png)

*Edit > Switch Role menu in Windows/Linux*

### macOS

Roles are in the **Quiqr Menu**:

![Switch Role in macOS](/img/switch-roles-mac.png)

*Quiqr > Switch Role menu in macOS*

## When to Use Each Role

### Use Content Editor Role When:

- Focusing purely on content creation
- Working with non-technical team members
- Want a simpler, cleaner interface
- Don't need access to configuration or code

### Use Site Developer Role When:

- Configuring the content model
- Customizing the site structure
- Troubleshooting issues
- Working with Hugo templates
- Setting up new content types

## Role Comparison

| Feature | Content Editor | Site Developer |
|---------|---------------|----------------|
| Edit content | ✅ Yes | ✅ Yes |
| Sync to GitHub/GitLab | ✅ Yes | ✅ Yes |
| Preview site | ✅ Yes | ✅ Yes |
| Import sites | ✅ Yes | ✅ Yes |
| Access Tools menu | ❌ No | ✅ Yes |
| Edit model configuration | ❌ No | ✅ Yes |
| Developer menu items | ❌ No | ✅ Yes |
| File system access | ❌ Limited | ✅ Full |

## Tips

- **Start as Content Editor**: If you're new to Quiqr, start with the Content Editor role to learn the basics
- **Switch as needed**: You can switch roles at any time without losing work
- **Team setup**: Content-focused team members can stay in Content Editor role permanently
- **Development**: Use Site Developer role when setting up or customizing sites

## Related Documentation

- [Content Model](./content-model/index.md) - Learn about configuring content models
- [Menu Configuration](./content-model/model-file-structure/root-properties/menu.md) - Set up role-specific menus
- [Site Configuration](./index.md) - Developer guide overview
