# Change Proposal: migrate-to-docusaurus

## Title
Migrate Documentation to Docusaurus in Monorepo

## Summary
Migrate the existing legacy documentation (currently in `docs/`) to a Docusaurus-based documentation website integrated into the monorepo. The Docusaurus site will be a new workspace package at `packages/docs`, deployed to GitHub Pages at `/docs/` path alongside the existing OpenSpec UI at `/specs/`. Documentation updates will become a standard part of the development workflow, with CI/CD automation for building and deploying the site on every release.

## Motivation

### Problems Addressed
1. **Scattered Documentation**: Legacy documentation exists in three locations (`docs/legacy-quiqr-documentation/`, `docs/legacy-vibecoding-docs/`, `docs/raw-ng-quiqr-documentation/`) with inconsistent formats and outdated content
2. **No Live Documentation Site**: Currently no public-facing documentation website for end users and developers
3. **Documentation Drift**: No process to ensure documentation stays in sync with new features and changes
4. **Poor Developer Experience**: No easy way to preview or test documentation changes locally
5. **Manual Publishing**: Documentation updates require manual intervention rather than automated deployment

### Benefits
1. **Modern Documentation Platform**: Docusaurus provides excellent UX with built-in search, versioning, and responsive design
2. **Integrated Workflow**: Documentation lives in the monorepo alongside code, enabling atomic commits
3. **Automated Publishing**: CI/CD automatically builds and deploys documentation on every release
4. **Better Discoverability**: Published documentation at a predictable URL structure improves accessibility
5. **Version Management**: Docusaurus supports versioned docs, aligning with the versioning policy where major versions get dedicated documentation sites
6. **Developer Testing**: Developers can render and test documentation locally between releases

## Scope

### In Scope
- Set up Docusaurus as a new workspace package (`packages/docs`)
- Migrate content from legacy documentation folders to Docusaurus format
- Configure CI/CD pipeline to build and deploy docs alongside OpenSpec UI
- Update GitHub Pages deployment to serve both Docusaurus (`/docs/`) and OpenSpec UI (`/specs/`)
- Add documentation build validation to PR checks
- Update OpenSpec specs to require documentation updates for new features
- Document the documentation authoring process in AGENTS.md
- Keep legacy docs folder for reference during migration

### Out of Scope
- Rewriting or reorganizing documentation content structure (initial migration preserves existing structure)
- Creating new documentation for currently undocumented features (that's a separate effort)
- Migrating to a different documentation framework (Docusaurus is the chosen solution)
- Version-specific documentation sites (addressed in future work when major versions are released)
- Documentation for the Quarto/Jekyll/Eleventy SSG integrations (focus is on Hugo and core features)

## User Impact

### End Users
- **Positive**: Clear, accessible documentation website with modern search and navigation
- **Positive**: Easy access to both technical specs (OpenSpec UI) and user guides (Docusaurus)
- **Positive**: Up-to-date documentation that reflects current version

### Developers
- **Positive**: Documentation changes can be made alongside code changes in the same PR
- **Positive**: Local documentation preview during development
- **Positive**: Clear guidelines on when and how to update documentation
- **Neutral**: Additional step in development workflow (update docs when adding features)
- **Positive**: Automated validation catches documentation build errors early

### Contributors
- **Positive**: Lowered barrier to contribute documentation improvements
- **Positive**: Clear documentation structure and templates
- **Positive**: Markdown-based format familiar to most contributors

## Dependencies

### Technical Dependencies
- Docusaurus v3 (latest stable)
- Node.js (already available in project)
- GitHub Pages (already configured)
- GitHub Actions (already in use)

### Related Changes
- Depends on: `add-openspecui-publishing` (provides GitHub Pages deployment foundation)
- Blocks: Future work on version-specific documentation sites
- Related: Release process (RELEASE.md) will be updated to include documentation deployment

### External Factors
- GitHub Pages must remain available and configured
- Nix flakes (for OpenSpec UI) must coexist with Node-based Docusaurus deployment

## Risks and Mitigations

### Risk 1: GitHub Pages Deployment Conflicts
**Impact**: Medium | **Likelihood**: Low

**Description**: Deploying both OpenSpec UI and Docusaurus to GitHub Pages might cause routing conflicts or overwrite content.

**Mitigation**: 
- Use separate paths: OpenSpec at `/specs/`, Docusaurus at `/docs/`
- Test deployment workflow in a staging branch first
- Implement deployment validation to check both paths are accessible

### Risk 2: Documentation Migration Errors
**Impact**: Medium | **Likelihood**: Medium

**Description**: Legacy documentation may have formatting, links, or images that don't migrate cleanly to Docusaurus.

**Mitigation**:
- Keep legacy docs folder as reference during migration
- Migrate in phases, validating each section
- Test all internal and external links
- Document known migration issues and workarounds

### Risk 3: Increased PR Complexity
**Impact**: Low | **Likelihood**: Medium

**Description**: Requiring documentation updates may slow down PR velocity or be skipped by contributors.

**Mitigation**:
- Make documentation builds non-blocking (warn but don't fail PRs)
- Provide clear templates and examples
- Accept "docs: TODO" placeholders for minor changes, require full docs for major features
- Document when documentation updates are required vs. optional

### Risk 4: Build Time Increase
**Impact**: Low | **Likelihood**: Medium

**Description**: Building Docusaurus in CI adds time to PR checks and deployment.

**Mitigation**:
- Optimize Docusaurus build configuration
- Use caching for node_modules
- Run docs build in parallel with other CI jobs when possible
- Accept increased build time as worthwhile for documentation quality

## Alternatives Considered

### Alternative 1: Keep Documentation in Separate Repository
**Why Rejected**: Separating documentation from code leads to drift and synchronization issues. Monorepo approach ensures documentation updates happen atomically with code changes.

### Alternative 2: Use MkDocs or Hugo for Documentation
**Why Rejected**: Docusaurus is specifically designed for technical documentation with excellent React integration, versioning support, and active community. The team already has JavaScript/TypeScript expertise.

### Alternative 3: Deploy Only Docusaurus, Remove OpenSpec UI
**Why Rejected**: OpenSpec UI and Docusaurus serve different purposes. OpenSpec UI is for specification browsing, while Docusaurus is for comprehensive user and developer guides. Both are valuable.

### Alternative 4: Manual Documentation Deployment
**Why Rejected**: Manual processes are error-prone and often skipped. Automated deployment ensures documentation is always up-to-date.

## Success Criteria

### Must Have
1. Docusaurus successfully integrated as `packages/docs` workspace
2. Legacy documentation content migrated and accessible in Docusaurus format
3. Documentation site deployed to GitHub Pages at `/docs/` path
4. OpenSpec UI remains functional at `/specs/` path
5. CI/CD pipeline builds and validates documentation on every PR
6. CI/CD pipeline deploys documentation on push to main/ng branches
7. AGENTS.md updated with documentation authoring guidelines
8. OpenSpec specs updated to require documentation for new capabilities
9. Documentation requirements added to `openspec/specs/documentation/spec.md`

**Related Specifications:** See `openspec/specs/documentation/spec.md` for complete documentation requirements.

### Should Have
1. All images and assets from legacy docs working in Docusaurus
2. Internal links between documentation pages working correctly
3. Documentation build completes in under 2 minutes
4. Local development server supports hot reload
5. Documentation includes getting started guide for contributors

### Nice to Have
1. Search functionality working out of the box
2. Dark mode support
3. Automated link checking in CI
4. Documentation coverage metrics

## Timeline Estimate

### Phase 1: Docusaurus Setup (Week 1)
- Set up Docusaurus as workspace package
- Configure basic structure and theme
- Verify local development workflow

### Phase 2: Content Migration (Week 2-3)
- Migrate getting started guides
- Migrate developer reference documentation
- Migrate field development guides
- Fix images and links

### Phase 3: CI/CD Integration (Week 4)
- Update deploy.yml workflow
- Add documentation build to PR checks
- Test deployment to GitHub Pages
- Validate both OpenSpec and Docusaurus are accessible

### Phase 4: Process Updates (Week 5)
- Update AGENTS.md with documentation guidelines
- Update OpenSpec specs with documentation requirements
- Update RELEASE.md to include documentation deployment
- Create documentation for documentation authoring

**Total Estimated Time**: 5 weeks (with parallel work possible)

## Open Questions

None - all clarifying questions have been answered.

## References

- [Docusaurus Documentation](https://docusaurus.io/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [OpenSpec Change: add-openspecui-publishing](openspec/changes/add-openspecui-publishing/)
- [Release Documentation](RELEASE.md)
- [Existing CI/CD Workflows](.github/workflows/)
