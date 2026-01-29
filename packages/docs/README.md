# Quiqr Documentation

This directory contains the Docusaurus-based documentation for Quiqr Desktop.

## Viewing the Documentation

### Local Development Server (Recommended)

Start the development server with hot-reload:

```bash
npm run start -w @quiqr/docs
```

This will start a development server at `http://localhost:3000` and automatically open your browser. The page will reload when you make changes to documentation files.

### Production Build

Build and serve the production version locally:

```bash
# Build the documentation
npm run build -w @quiqr/docs

# Serve the built documentation
npm run serve -w @quiqr/docs
```

The production build will be available at `http://localhost:3000` (or another port if 3000 is in use).

### Deployed Version

View the live documentation after merging to main:
- **Documentation**: https://quiqr.github.io/quiqr-desktop/docs/
- **OpenSpec UI**: https://quiqr.github.io/quiqr-desktop/specs/

## Documentation Structure

```
docs/
├── intro.md              # Landing page
├── getting-started/      # Installation, quick start, import guides
├── user-guide/           # Using Quiqr features
├── developer-guide/      # Architecture, APIs, field system
├── field-reference/      # Field types reference
├── contributing/         # Contribution guidelines
└── release-notes/        # Version history
```

## Search Functionality

The documentation includes a client-side full-text search powered by [Lunr.js](https://lunrjs.com/). The search:
- ✅ Works completely offline (no external service required)
- ✅ Indexes all documentation pages automatically during build
- ✅ Provides instant search results as you type
- ✅ Searches titles, headings, and content
- ✅ No API keys or external dependencies needed

The search bar appears in the navigation bar. Simply start typing to search through all documentation.

## Writing Documentation

### Frontmatter Template

Every documentation page should have frontmatter:

```markdown
---
sidebar_position: 1
---

# Page Title

Content here...
```

### Documentation Guidelines

- Use clear, concise language
- Include code examples where appropriate
- Use Docusaurus admonitions for notes/warnings/tips:
  - `:::note` for informational notes
  - `:::warning` for important warnings
  - `:::tip` for helpful tips
- Link to related pages and external resources
- Test that documentation builds successfully

### MDX Features

Docusaurus uses MDX, which means you can:
- Use standard Markdown syntax
- Import and use React components
- Use JSX in your markdown (be careful with `<` and `{` characters - escape them in code blocks)

## Commands Reference

```bash
# Development server with hot reload
npm run start -w @quiqr/docs

# Production build (validates links)
npm run build -w @quiqr/docs

# Serve production build locally
npm run serve -w @quiqr/docs

# Clear build cache (if having issues)
npm run clear -w @quiqr/docs
```

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are merged to the `main` branch.

The deployment workflow:
1. PR checks build documentation (non-blocking) to catch errors
2. On merge to main, `.github/workflows/deploy.yml` runs
3. Docusaurus builds to `/docs/`, OpenSpec UI to `/specs/`
4. Combined output deploys to GitHub Pages

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Docusaurus will automatically try the next available port (3001, 3002, etc.).

### Build Errors

If you encounter build errors:

1. Check for broken links - Docusaurus validates all internal links
2. Check for MDX syntax errors - curly braces `{}` and angle brackets `<>` in content may be interpreted as JSX
3. Clear the build cache: `npm run clear -w @quiqr/docs`
4. Ensure dependencies are installed: `npm install`

### Broken Links

The documentation is configured with `onBrokenLinks: 'warn'` during development. This means broken links will show warnings but won't fail the build. Once all content is complete, this should be changed to `'throw'`.

## More Information

For complete documentation requirements and standards, see:
- `openspec/specs/documentation/spec.md` - Documentation specification
- [Docusaurus Documentation](https://docusaurus.io/docs) - Official Docusaurus docs
