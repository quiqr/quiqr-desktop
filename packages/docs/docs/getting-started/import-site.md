---
sidebar_position: 3
---

# Import Existing Site

Learn how to import your existing Hugo, Quarto, or other static site generator project into Quiqr.

## Before You Begin

### Check Compatibility

Quiqr works best with:

- **Hugo** (v0.80+) - Full support
- **Quarto** - Experimental support
- **Jekyll** - Basic support
- **Eleventy** - Experimental support

### Prepare Your Site

1. Ensure your site has a valid configuration file:
   - Hugo: `config.toml`, `config.yaml`, or `hugo.toml`
   - Quarto: `_quarto.yml`
2. Back up your site before importing
3. Close any running development servers

## Import Methods

### Method 1: Import from Local Folder

1. Open Quiqr Desktop
2. Click **"Import Existing Site"** from the welcome screen
3. Browse to your site's root directory
4. Click **"Select Folder"**
5. Quiqr will analyze your site and create a workspace

### Method 2: Import from Git Repository

1. Open Quiqr Desktop
2. Click **"Import from Git"**
3. Enter the repository URL (e.g., `https://github.com/user/my-site.git`)
4. Choose a local directory for the site
5. Click **"Clone and Import"**

### Method 3: Drag and Drop

Simply drag your site folder onto the Quiqr window to start the import process.

## Post-Import Configuration

After importing, you may need to configure Quiqr to work with your site:

### 1. Verify Content Detection

Check that Quiqr has detected your content directories:

- Hugo: Usually `content/` directory
- Content types: Posts, pages, etc.

### 2. Configure Model File (Optional)

If you want custom form fields for your content, create a `model.yaml` or `model.json` file in your site root. See [Content Model](../site-and-cms-developer-guide/content-model/index.md) for details.

### 3. Set Up Preview

Test the integrated Hugo server:

1. Click **"Preview in Browser"**
2. Verify your site renders correctly at `http://localhost:1313`

If preview doesn't work:

- Check Hugo version compatibility
- Review Hugo configuration for custom paths
- See [Troubleshooting](./troubleshooting.md)

### 4. Configure Sync (Optional)

If you want to publish changes:

1. Go to Site Settings > Synchronization
2. Configure your preferred sync method:
   - GitHub/GitLab integration
   - Folder sync for backups

## Import Scenarios

### Scenario 1: Hugo Blog with Default Structure

**Site Structure:**
```
my-blog/
├── config.toml
├── content/
│   └── posts/
│       ├── first-post.md
│       └── second-post.md
└── themes/
    └── my-theme/
```

**Import Steps:**
1. Import the `my-blog` folder
2. Quiqr auto-detects `content/posts/` as a collection
3. Open any post to edit with default fields
4. Preview and publish

### Scenario 2: Hugo Site with Custom Content Types

**Site Structure:**
```
my-site/
├── hugo.toml
├── content/
│   ├── blog/
│   ├── docs/
│   └── projects/
└── model.yaml  ← Custom content model
```

**Import Steps:**
1. Import the `my-site` folder
2. Quiqr reads `model.yaml` for custom field definitions
3. Each content type (blog, docs, projects) gets custom forms
4. Edit content with specialized fields

### Scenario 3: Quarto Documentation Site

**Site Structure:**
```
my-docs/
├── _quarto.yml
├── index.qmd
└── docs/
    ├── intro.qmd
    └── guide.qmd
```

**Import Steps:**
1. Import the `my-docs` folder
2. Quiqr detects Quarto project
3. Edit `.qmd` files with markdown editor
4. Preview using Quarto preview (external)

## Common Issues

### Issue: Content Not Detected

**Solution:**
- Verify content directory path in site config
- Check for non-standard content directory names
- Create a `model.yaml` to explicitly define content locations

### Issue: Preview Server Fails

**Solution:**
- Check Hugo version: `hugo version` in terminal
- Ensure no other server is using port 1313
- Review Hugo config for errors
- Check Quiqr logs: Help > Show Logs

### Issue: Images Not Displaying

**Solution:**
- Verify image paths in content files
- Check static/assets directory structure
- Use relative paths from content file location

### Issue: Custom Fields Not Appearing

**Solution:**
- Create or update `model.yaml` in site root
- Define fields for each content type
- Restart Quiqr after model changes
- See [Content Model Guide](../site-and-cms-developer-guide/content-model/index.md)

## Advanced Import Options

### Preserve Git History

When importing from a Git repository, Quiqr preserves your commit history and branches. You can:

- Switch branches from Site Settings
- View commit history
- Continue making Git commits

### Import with Custom Hugo Binary

If you have a specific Hugo version:

1. Go to Preferences > Hugo Settings
2. Set custom Hugo binary path
3. Re-import or restart preview

### Batch Import Multiple Sites

1. Import first site
2. Return to site library (Home button)
3. Click **"Import"** again for additional sites
4. Switch between sites from the site library

## Next Steps

After importing your site:

- [Configure Quiqr](../configuration/index.md) - Customize settings
- [Content Model](../site-and-cms-developer-guide/content-model/index.md) - Define custom forms
- [Field Reference](../site-and-cms-developer-guide/field-reference/index.md) - Learn about field types
- [Publishing](./publishing.md) - Deploy your site

## Video Tutorial

[Import Existing Site Video Placeholder]
