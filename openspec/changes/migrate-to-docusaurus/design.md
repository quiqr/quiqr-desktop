# Design Document: migrate-to-docusaurus

## Overview

This design document outlines the technical approach for migrating documentation to Docusaurus in the Quiqr Desktop monorepo. The solution integrates a Docusaurus-based documentation site as a new workspace package, with automated CI/CD deployment to GitHub Pages alongside the existing OpenSpec UI.

## Goals

1. **Modern Documentation Platform**: Provide users and developers with a professional, searchable documentation website
2. **Integrated Development Workflow**: Enable documentation updates as part of the normal development process
3. **Automated Publishing**: Ensure documentation is automatically built and deployed on every release
4. **Coexistence with OpenSpec**: Maintain both technical specifications (OpenSpec UI) and user/developer guides (Docusaurus)
5. **Developer Testing**: Allow developers to preview and test documentation locally

## Non-Goals

1. Restructuring the content organization (initial migration preserves existing structure)
2. Creating documentation for undocumented features (separate effort)
3. Implementing version-specific documentation sites (future work for major versions)
4. Internationalization/localization (future work)

## Architecture

### Monorepo Integration

```
qultra/
├── packages/
│   ├── frontend/          # React frontend
│   ├── backend/           # Node.js backend
│   ├── types/             # Shared TypeScript types
│   ├── adapters/          # Electron/standalone adapters
│   └── docs/              # NEW: Docusaurus documentation site
│       ├── docs/          # Markdown documentation files
│       ├── static/        # Images, assets
│       ├── src/           # React components (customization)
│       ├── docusaurus.config.ts
│       └── package.json
├── docs/                  # EXISTING: Legacy documentation (kept as reference)
│   ├── legacy-quiqr-documentation/
│   ├── legacy-vibecoding-docs/
│   └── raw-ng-quiqr-documentation/
├── openspec/              # EXISTING: OpenSpec specifications
└── .github/workflows/     # CI/CD workflows (updated)
```

### Docusaurus Package Structure

The `packages/docs` workspace will be created using the Docusaurus classic template with TypeScript:

```
packages/docs/
├── docs/                  # Documentation content
│   ├── intro.md          # Landing page
│   ├── getting-started/  # Installation, quick start
│   ├── user-guide/       # End user guides
│   ├── developer-guide/  # Developer reference
│   ├── field-reference/  # Field type documentation
│   ├── contributing/     # Contribution guidelines
│   └── release-notes/    # Version release notes
├── static/
│   ├── img/              # Images and screenshots
│   └── files/            # Downloadable assets
├── src/
│   ├── components/       # Custom React components (optional)
│   ├── css/              # Custom styles
│   └── pages/            # Custom standalone pages (optional)
├── docusaurus.config.ts  # Main configuration
├── sidebars.ts           # Sidebar navigation
├── package.json
└── tsconfig.json
```

### GitHub Pages Deployment Architecture

GitHub Pages will serve three distinct resources at different paths:

```
https://quiqr.github.io/quiqr-desktop/
├── badges/
│   └── coverage.svg      # EXISTING: Coverage badge (from coverage job)
├── specs/                # EXISTING: OpenSpec UI (from publish-openspec job)
│   ├── index.html
│   └── ...
└── docs/                 # NEW: Docusaurus site (from new publish-docs job)
    ├── index.html
    └── ...
```

**Key Design Decision**: Using path-based routing (`/docs/`, `/specs/`) instead of subdomain routing ensures:
- Simple deployment workflow (single GitHub Pages site)
- No DNS configuration required
- Easy cross-linking between Docusaurus and OpenSpec
- Coverage badge remains at stable URL

### CI/CD Workflow Architecture

#### Current State

The `deploy.yml` workflow has two jobs:
1. **coverage**: Builds, tests, generates coverage badge, deploys to `gh-pages` branch
2. **publish-openspec**: Uses Nix to build OpenSpec UI, deploys to GitHub Pages at `/specs/`

#### Target State

Add a third job to the deployment workflow:
3. **publish-docs**: Builds Docusaurus, deploys to GitHub Pages at `/docs/`

**Deployment Strategy**: All three jobs deploy artifacts that are combined into a single GitHub Pages deployment:
- Coverage job deploys badge to `/badges/`
- OpenSpec job deploys UI to `/specs/`  
- Docs job deploys Docusaurus to `/docs/`

**Technical Approach**:
- Use GitHub Actions artifacts to pass build outputs between jobs
- Use a final deployment step that combines all artifacts
- Ensure proper routing with `.nojekyll` file and index redirects

#### PR Check Integration

Add a new job to `pr-check.yml`:
- **docs-build**: Builds Docusaurus to validate documentation changes
- Non-blocking: Warns on failure but doesn't block PR merge
- Uses caching for faster builds

### Content Migration Strategy

#### Phase 1: Direct Migration
Migrate existing content from legacy docs folders to Docusaurus format with minimal changes:
- Convert Hugo-style `_index.md` to Docusaurus-compatible filenames
- Fix frontmatter format (Hugo → Docusaurus)
- Update image paths to reference `static/` directory
- Convert internal links to Docusaurus format

#### Phase 2: Link and Asset Fixing
- Copy images from legacy docs to `packages/docs/static/img/`
- Update all image references to use Docusaurus static path (`/quiqr-desktop/docs/img/...`)
- Fix internal links to use Docusaurus routing
- Validate external links

#### Phase 3: Enhancement
- Add missing documentation for new features (out of scope for initial migration, but structure supports it)
- Improve navigation and organization (future work)

### Documentation Requirements in Development Process

#### When Documentation Updates Are Required

**MUST update documentation**:
- Adding a new feature or capability
- Making a breaking change to existing functionality
- Adding a new field type to SukohForm
- Changing user-facing behavior

**SHOULD update documentation**:
- Fixing a bug that affects documented behavior
- Changing configuration options
- Updating dependencies that affect usage

**MAY update documentation**:
- Internal refactoring with no user impact
- Performance improvements
- Test improvements

#### Enforcement Mechanism

1. **OpenSpec Specs**: Updated to require documentation for new capabilities
2. **PR Template**: Checklist item for documentation updates
3. **CI Validation**: Docs build runs on every PR (non-blocking initially)
4. **AGENTS.md**: Guidelines for AI agents on documentation requirements
5. **Review Process**: Reviewers check documentation completeness

### Configuration

#### Docusaurus Configuration (`docusaurus.config.ts`)

```typescript
{
  url: 'https://quiqr.github.io',
  baseUrl: '/quiqr-desktop/docs/',
  organizationName: 'quiqr',
  projectName: 'quiqr-desktop',
  trailingSlash: false,
  
  themeConfig: {
    navbar: {
      title: 'Quiqr Desktop',
      items: [
        { to: '/getting-started/installation', label: 'Getting Started' },
        { to: '/developer-guide/anatomy', label: 'Developer Guide' },
        { to: '/field-reference/data-fields', label: 'Field Reference' },
        { href: '/quiqr-desktop/specs/', label: 'OpenSpec', position: 'right' },
        { href: 'https://github.com/quiqr/quiqr-desktop', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/getting-started/installation' },
            { label: 'Developer Guide', to: '/developer-guide/anatomy' },
            { label: 'Contributing', to: '/contributing/getting-started' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/quiqr/quiqr-desktop' },
            { label: 'OpenSpec', href: '/quiqr-desktop/specs/' },
          ],
        },
      ],
    },
  },
}
```

#### Workspace Configuration (`packages/docs/package.json`)

```json
{
  "name": "@quiqr/docs",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids"
  },
  "dependencies": {
    "@docusaurus/core": "^3.5.2",
    "@docusaurus/preset-classic": "^3.5.2",
    "@mdx-js/react": "^3.0.0",
    "clsx": "^2.0.0",
    "prism-react-renderer": "^2.3.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "^3.5.2",
    "@docusaurus/tsconfig": "^3.5.2",
    "@docusaurus/types": "^3.5.2",
    "typescript": "~5.6.0"
  }
}
```

## Implementation Approach

### 1. Docusaurus Setup (Week 1)

**Task 1.1-1.3**: Create workspace, configure for GitHub Pages, customize theme

- Use `npx create-docusaurus@latest` to scaffold
- Configure for monorepo workspace pattern
- Set up GitHub Pages routing with proper `baseUrl`
- Test local development workflow

### 2. Content Migration (Weeks 2-3)

**Task 2.1-2.7**: Migrate all legacy documentation content

- Create documentation structure matching content categories
- Migrate getting started guides (priority: end users first)
- Migrate developer reference (priority: essential APIs)
- Migrate field type documentation (priority: commonly used fields)
- Migrate NG documentation (new architecture content)
- Create contributing guides
- Extract release notes from CHANGELOG

**Migration Priority**:
1. Getting Started (highest user impact)
2. Field Reference (most frequently referenced)
3. Developer Guide (enables contributions)
4. Contributing (lowers contribution barrier)
5. Release Notes (historical reference)

### 3. CI/CD Integration (Week 4)

**Task 3.1-3.3**: Update workflows for automated deployment

- Add docs build to PR checks (parallel with tests)
- Update deploy workflow to include docs publishing
- Test end-to-end deployment with all three resources
- Validate routing and accessibility

**Deployment Flow**:
```
git push → [trigger deploy.yml]
  ↓
  ├─ coverage job → generate badge → artifact
  ├─ publish-openspec job → build with Nix → artifact
  └─ publish-docs job → build Docusaurus → artifact
  ↓
combine artifacts → deploy to gh-pages branch → GitHub Pages
```

### 4. Process Updates (Week 5)

**Task 4.1-4.4**: Update development process and documentation

- Update AGENTS.md with documentation authoring guidelines
- Update OpenSpec specs to require documentation
- Update RELEASE.md with documentation deployment steps
- Update README.md with links to documentation site

### 5. Validation (Week 5)

**Task 5.1-5.3**: Comprehensive testing and cleanup

- Run link validation across all documentation
- Document migration status and known issues
- Update workspace-level documentation

## Trade-offs and Alternatives

### Trade-off 1: Docusaurus vs. Other Frameworks

**Decision**: Use Docusaurus
**Alternatives Considered**: MkDocs (Python), Hugo (Go), VitePress (Vue)

**Rationale**:
- ✅ React-based: Aligns with frontend technology (React + TypeScript)
- ✅ Excellent documentation features: Search, versioning, MDX support
- ✅ Active ecosystem and community
- ✅ Built-in support for technical documentation patterns
- ❌ Requires Node.js (but already in monorepo)
- ❌ Larger bundle size than simpler alternatives (acceptable for comprehensive docs)

### Trade-off 2: Monorepo Package vs. Separate Repository

**Decision**: Monorepo package at `packages/docs`
**Alternative**: Separate documentation repository

**Rationale**:
- ✅ Atomic commits: Code and docs updated together
- ✅ Easier to keep docs in sync with features
- ✅ Single source of truth for versioning
- ✅ Unified CI/CD pipeline
- ❌ Increases monorepo size (acceptable, docs are text/images)
- ❌ Docs changes trigger full CI (mitigated with smart caching)

### Trade-off 3: Path-Based vs. Subdomain Routing

**Decision**: Path-based routing (`/docs/`, `/specs/`)
**Alternative**: Subdomain routing (`docs.quiqr.io`, `specs.quiqr.io`)

**Rationale**:
- ✅ No DNS configuration required
- ✅ Simple deployment to single GitHub Pages site
- ✅ Easy cross-linking between docs and specs
- ✅ Coverage badge remains at stable URL
- ❌ Slightly longer URLs (acceptable)
- ❌ All content shares same domain (not a concern for this use case)

### Trade-off 4: Documentation Requirements Enforcement

**Decision**: Non-blocking CI checks initially, with process enforcement
**Alternative**: Blocking CI checks that fail PRs without docs

**Rationale**:
- ✅ Doesn't slow down minor fixes
- ✅ Allows "docs: TODO" for minor changes
- ✅ Focuses on cultural adoption, not gatekeeping
- ✅ Reviewers can use judgment
- ❌ Possible to merge without docs (mitigated by PR template and review process)

Future: Can make blocking after initial adoption period

## Testing Strategy

### Local Testing
- Developers run `npm start -w @quiqr/docs` to preview changes
- Hot reload enables rapid iteration
- Build errors caught during development

### CI Testing
- PR checks build documentation on every PR
- Warnings appear in PR status but don't block merge
- Build logs available for debugging

### Deployment Testing
- Staging deployment to test branch before merging
- Validate both OpenSpec and Docusaurus are accessible
- Check for routing conflicts or asset issues

### Link Validation
- Docusaurus built-in link checker catches broken internal links
- Manual testing of external links
- Future: Automated link checking with scheduled workflow

## Security and Privacy

### Build-Time Security
- Docusaurus built in CI with locked dependencies
- No runtime API calls or external data fetching
- Static site generation eliminates server-side vulnerabilities

### Deployment Security
- GitHub Actions runs with minimal permissions
- Deployment uses GitHub-provided tokens
- No secrets or credentials stored in documentation

### Content Security
- Documentation is public and open-source
- No sensitive information in docs content
- Images and assets reviewed before commit

## Performance Considerations

### Build Performance
- **Target**: Documentation build under 3 minutes in CI
- **Optimization**: Cache node_modules between builds
- **Parallelization**: Run docs build parallel with tests

### Site Performance
- **Static Generation**: All pages pre-rendered at build time
- **Code Splitting**: Docusaurus automatically splits JavaScript bundles
- **Image Optimization**: Optimize images before committing
- **Lazy Loading**: Images lazy-loaded by default

### Development Performance
- **Hot Reload**: Fast feedback during local development
- **Incremental Builds**: Docusaurus only rebuilds changed pages

## Monitoring and Observability

### Build Monitoring
- CI logs provide build output and errors
- Failed builds visible in PR checks
- GitHub Actions logs retained for debugging

### Deployment Monitoring
- GitHub Pages deployment status visible in repository settings
- Deployment logs available in Actions workflow runs

### Usage Monitoring
- GitHub Pages provides basic traffic statistics
- Future: Add analytics (optional, privacy-respecting)

## Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Set up Docusaurus package
- Deploy to test branch
- Verify workflow with small content sample

### Phase 2: Content Migration (Weeks 2-3)
- Migrate documentation in priority order
- Team reviews migrated content for accuracy
- Fix images and links incrementally

### Phase 3: CI/CD Integration (Week 4)
- Update workflows with docs build
- Test deployment to production GitHub Pages
- Verify coexistence with OpenSpec UI

### Phase 4: Process Rollout (Week 5)
- Update all process documentation
- Announce documentation site to team
- Begin requiring docs for new features

### Phase 5: Public Launch
- Announce documentation site in release notes
- Link from README and project website
- Promote in community channels

## Future Enhancements

### Version-Specific Documentation Sites
When Quiqr reaches v1.0.0, implement versioned documentation:
- Use Docusaurus versioning feature
- Deploy v0.x docs to `/quiqr-desktop/docs/v0/`
- Deploy v1.x docs to `/quiqr-desktop/docs/v1/`
- Align with versioning policy in project.md

### Internationalization
Add translations for non-English documentation:
- Use Docusaurus i18n support
- Start with commonly requested languages
- Accept community translations

### Enhanced Search
Integrate advanced search capabilities:
- Algolia DocSearch (free for open source)
- Better search relevance and filtering

### API Documentation
Auto-generate API documentation:
- Extract JSDoc comments from TypeScript
- Generate API reference automatically
- Keep API docs in sync with code

### Interactive Examples
Add interactive code examples:
- Live field configuration editor
- Schema validation playground
- Model scaffolding preview

## Success Metrics

### Launch Metrics
- [ ] Documentation site deployed and accessible
- [ ] All legacy content migrated and validated
- [ ] CI/CD pipeline building and deploying automatically
- [ ] Zero broken links in documentation
- [ ] OpenSpec UI remains functional

### Adoption Metrics (Post-Launch)
- Documentation referenced in >80% of PRs for new features
- Documentation build failures caught in CI
- Positive team feedback on documentation workflow
- External contributors able to use documentation successfully

### Quality Metrics
- Documentation build time <3 minutes
- Page load time <2 seconds
- Search functionality working
- Mobile-responsive rendering

## Open Questions

**Q: Should we add analytics to track documentation usage?**
A: Out of scope for initial launch. Can be added later if needed, with privacy-respecting solution (e.g., Plausible).

**Q: Should we migrate all historical release notes or just recent versions?**
A: Migrate last 3-4 major releases, link to CHANGELOG.md for full history.

**Q: What happens to the legacy docs folders after migration?**
A: Keep them in `docs/` for reference during migration, mark as deprecated in README. Can be removed in a future cleanup PR after migration is validated.

**Q: Should documentation build be blocking in CI?**
A: Start non-blocking to allow adoption period. Revisit after 2-3 months to consider making it blocking.

## Next Steps

1. Implementation according to tasks.md
2. Test local build and development server
3. Verify GitHub Pages deployment works correctly
4. Gradually expand placeholder pages with full content
5. Update documentation requirements in `openspec/specs/documentation/spec.md`

## Related Specifications

- `openspec/specs/documentation/spec.md` - Documentation requirements and standards
