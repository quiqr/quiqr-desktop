---
sidebar_position: 1
sidebar_label: Introduction
---

# Welcome to Quiqr Desktop

**Quiqr is a local-first Content Management System designed for static site generators.** Built for Hugo, with expanding support for Quarto, Jekyll, and Eleventy, Quiqr provides a powerful visual interface for managing your static sites without sacrificing the benefits of local development.

## Why Quiqr?

Static site generators are powerful, but editing markdown files in a text editor isn't for everyone. Quiqr bridges this gap by providing:

- **User-friendly interface** for non-technical content editors
- **Developer-friendly workflows** with full Git integration
- **Local-first architecture** for maximum speed and privacy
- **Zero vendor lock-in** - your content stays in standard markdown files

## Key Features

### 🚀 Local-First Architecture

All your data stays on your computer. No cloud dependencies, no network latency, complete privacy. Work offline, own your content.

### 🎨 Visual Content Editing

Edit content through customizable forms instead of raw markdown. Perfect for teams where not everyone codes.

- Schema-driven forms with 18+ field types
- Live preview with integrated Hugo server
- Drag-and-drop image uploads
- WYSIWYG markdown editor

### 🔧 Built for Developers

Quiqr enhances your workflow without getting in the way:

- **Git integration**: Commit and push directly from the UI
- **Hugo integration**: Instant preview with hot-reload
- **Customizable forms**: Define your own content models
- **Standard formats**: Content stays in markdown + frontmatter

### 🌐 Flexible Deployment

**Desktop Mode** - Electron app for individual users:
- Blazingly fast with zero latency
- Perfect for developers who also manage content
- Full local control over sites and data

**Server Mode** - Web app for teams:
- Centralized deployment for multiple users
- Pre-configured sites and sync
- Browser-based access, no installation needed
- *Currently experimental in v0.21*

### 📚 Multi-SSG Support

While built primarily for Hugo, Quiqr supports:

- **Hugo** (v0.80+) - Full support
- **Quarto** - Experimental support  
- **Jekyll** - Basic support
- **Eleventy** - Experimental support

## Who Uses Quiqr?

### Content Teams

Marketing teams, documentation writers, and bloggers who need to:
- Update website content without touching code
- Collaborate on content with version control
- Preview changes before publishing

### Solo Developers

Developers who want to:
- Provide clients with an easy content editing interface
- Manage their own Hugo sites more efficiently
- Quickly scaffold new sites from templates

### Agencies

Agencies building sites for clients who need:
- Client-friendly content management
- Git-based workflows for version control
- Custom content models per project

## Real-World Use Cases

**📝 Documentation Sites**
- Technical documentation with complex structures
- API references with consistent formatting
- Knowledge bases with searchable content

**📰 Blogs & News Sites**
- Personal blogs with multiple authors
- Company blogs with approval workflows
- News sites with categorized content

**🏢 Corporate Websites**
- Marketing sites with frequent updates
- Product pages with structured data
- Landing pages with visual editing

**🎓 Educational Content**
- Course materials with multimedia
- Tutorial sites with code examples
- Academic websites with publications

## Quick Start

Get up and running in 3 steps:

1. **[Install Quiqr](./getting-started/installation.md)** - Download for Windows, macOS, or Linux
2. **[Create or Import a Site](./getting-started/quick-start.md)** - Start from a template or import existing Hugo site
3. **[Edit & Publish](./getting-started/quick-start.md#publish-your-site)** - Make changes and push to GitHub

## What Makes Quiqr Different?

Unlike traditional CMSs, Quiqr:

| Feature | Traditional CMS | Quiqr |
|---------|----------------|-------|
| **Data storage** | Database (cloud) | Local files (markdown) |
| **Performance** | Server-dependent | Instant (local) |
| **Privacy** | Data on 3rd party | Data on your computer |
| **Vendor lock-in** | Locked to platform | Standard markdown files |
| **Hosting** | Requires server/SaaS | Static hosting ($0-5/mo) |
| **Offline** | Requires internet | Works completely offline |
| **Developer control** | Limited | Full access to files |

## Documentation Overview

This documentation is organized into sections:

- **[Getting Started](./getting-started/index.md)** - Installation, quick start, import guides
- **[User Guide](./getting-started/quick-start.md)** - Day-to-day usage, editing content, publishing
- **[Site & CMS Developer Guide](./site-and-cms-developer-guide/index.md)** - Content models, customization
- **[Quiqr Internals Developer Guide](./quiqr-internals-developer-guide/index.md)** - Architecture and contributing
- **[Field Reference](./site-and-cms-developer-guide/field-reference/index.md)** - Complete reference for all 18+ field types
- **[Contributing](./quiqr-internals-developer-guide/contributing/index.md)** - How to contribute to Quiqr

## Community & Support

### Get Help

- **[Discord Community](https://discord.gg/nJ2JH7jvmV)** - Chat with other users, ask questions, share tips
- **[GitHub Issues](https://github.com/quiqr/quiqr-desktop/issues)** - Report bugs, request features
- **[GitHub Discussions](https://github.com/quiqr/quiqr-desktop/discussions)** - Q&A, ideas, show & tell

### Stay Updated

- **[GitHub Releases](https://github.com/quiqr/quiqr-desktop/releases)** - Latest versions and changelogs
- **[Quiqr.org](https://quiqr.org)** - Official website
- **[Twitter/X](https://twitter.com/quiqrorg)** - News and updates

## Open Source

Quiqr Desktop is **free and open source** (MIT License). We welcome contributions from the community!

- **Source code**: [github.com/quiqr/quiqr-desktop](https://github.com/quiqr/quiqr-desktop)
- **Contributing**: See our [Contributing Guide](./quiqr-internals-developer-guide/contributing/index.md)
- **Roadmap**: Check [GitHub Projects](https://github.com/quiqr/quiqr-desktop/projects)

## Technology Stack

Built with modern, reliable technologies:

- **Frontend**: React 19, TypeScript, Material-UI v7, Vite
- **Backend**: Node.js, Express, Electron
- **Validation**: Zod schemas for type safety
- **Forms**: Custom SukohForm system with 18+ field types
- **Git**: Native Git integration (no external dependencies)
- **Hugo**: Bundled Hugo binary for instant previews

## Next Steps

Ready to dive in?

1. **[Install Quiqr](./getting-started/installation.md)** - Get it running on your system
2. **[Quick Start Tutorial](./getting-started/quick-start.md)** - Build your first site in 10 minutes
3. **[Import Existing Site](./getting-started/import-site.md)** - Bring your Hugo project into Quiqr

---

*Have questions? Join our [Discord community](https://discord.gg/nJ2JH7jvmV) or check the [FAQ](#) (coming soon).*
