---
sidebar_position: 2
---

# Quick Start

Get your first Quiqr site up and running in minutes.

## Create Your First Site

### 1. Launch Quiqr

Open Quiqr Desktop. On first launch, you'll see the welcome screen with several options.

### 2. Choose a Template

Click **"Create from Template"** to browse the template gallery.

Popular templates include:

- **Hugo Blog** - A simple, clean blog starter
- **Portfolio** - Showcase your work
- **Documentation Site** - Technical documentation with search
- **Business Site** - Corporate website template

Select a template and click **"Import Template"**.

### 3. Configure Your Site

Provide:

- **Site Name**: A descriptive name for your project
- **Location**: Where to save your site files
- **Workspace Name**: (Optional) Name for this workspace instance

Click **"Create Site"** to import the template.

## Edit Your Content

### Open a Page

Navigate through your site structure in the left sidebar. Click any page to open it in the editor.

### Make Changes

1. Edit the content using the form fields
2. Changes are saved automatically
3. Use the toolbar buttons for common actions:
   - **Save** - Manually save changes
   - **Delete** - Remove the current page
   - **Duplicate** - Create a copy

### Preview Your Site

Click the **"Preview in Browser"** button in the toolbar to launch the integrated Hugo server. Your site will open in your default browser at `http://localhost:1313`.

As you make changes in Quiqr, the preview automatically refreshes!

## Publish Your Site

### Set Up Sync

To publish your site to the web:

1. Click the **site toolbar** (top navigation)
2. Select **"Synchronization"** or **"Sync Settings"**
3. Choose a sync method:
   - **GitHub** - Recommended for most users
   - **GitLab** - Alternative Git hosting
   - **Folder Sync** - Local folder backup

### Configure GitHub Sync

1. Create a new repository on GitHub
2. Generate a Personal Access Token (Settings > Developer settings > Personal access tokens)
3. In Quiqr, enter:
   - Repository URL: `https://github.com/username/repo.git`
   - Access Token: Your GitHub token
   - Branch: `main` or `master`

### Publish Changes

1. Click the **"Sync"** or **"Publish"** button
2. Review the changes to be committed
3. Add a commit message (e.g., "Update homepage content")
4. Click **"Publish"** to push to GitHub

Your changes are now live on GitHub! Set up GitHub Pages or Netlify to deploy automatically.

## Next Steps

Now that you have a working site:

- [Site Configuration](./configuration.md) - Customize your site settings
- [Content Model](../developer-guide/content-model.md) - Understand how content is structured
- [Field Types](../field-reference/index.md) - Learn about available field types
- [Hugo Integration](../developer-guide/hugo-integration.md) - Work with Hugo features

## Common Workflows

### Daily Content Updates

1. Open your site in Quiqr
2. Navigate to the page you want to edit
3. Make your changes
4. Click **"Preview"** to check your work
5. Click **"Publish"** to sync to GitHub

### Adding a New Blog Post

1. Navigate to your posts collection (usually `content/posts` or similar)
2. Click **"New"** or **"Add Post"**
3. Fill in the title, content, and metadata
4. Save and preview
5. Publish when ready

### Updating Site Configuration

1. Look for a "Site Configuration" or "Settings" section
2. Edit values like site title, description, author
3. Save changes
4. Restart preview to see configuration changes

## Video Tutorial

Watch our quick start video for a visual walkthrough:

[Quick Start Video Placeholder]

## Getting Help

- [Discord Community](https://discord.gg/nJ2JH7jvmV) - Chat with other users
- [GitHub Issues](https://github.com/quiqr/quiqr-desktop/issues) - Report bugs or request features
- [Documentation](../intro.md) - Browse the full documentation
