# Tasks: migrate-to-docusaurus

This document outlines the implementation tasks for migrating documentation to Docusaurus. Tasks are ordered to deliver incremental, verifiable progress.

## Phase 1: Docusaurus Setup and Integration

### Task 1.1: Create Docusaurus workspace package
**Description**: Initialize Docusaurus as a new workspace package at `packages/docs`

**Steps**:
1. Run `npx create-docusaurus@latest packages/docs classic --typescript`
2. Add `packages/docs` to root `package.json` workspaces array
3. Configure `packages/docs/package.json` with proper name (`@quiqr/docs`) and scripts
4. Add `.gitignore` entries for `packages/docs/.docusaurus/` and `packages/docs/build/`

**Validation**:
- [x] `npm install` succeeds in root
- [x] `cd packages/docs && npm start` launches dev server
- [x] Documentation site loads at http://localhost:3000

**Dependencies**: None

---

### Task 1.2: Configure Docusaurus for monorepo
**Description**: Configure Docusaurus settings for GitHub Pages deployment and monorepo integration

**Steps**:
1. Update `packages/docs/docusaurus.config.ts`:
   - Set `url: 'https://quiqr.github.io'`
   - Set `baseUrl: '/quiqr-desktop/docs/'`
   - Set `organizationName: 'quiqr'`
   - Set `projectName: 'quiqr-desktop'`
   - Configure `themeConfig` with project branding
2. Update `packages/docs/package.json` scripts:
   - Add `"build": "docusaurus build"`
   - Add `"serve": "docusaurus serve"`
   - Add `"clear": "docusaurus clear"`

**Validation**:
- [x] `npm run build -w @quiqr/docs` succeeds
- [x] Build output in `packages/docs/build/` contains HTML files
- [x] `npm run serve -w @quiqr/docs` serves built site correctly
- [x] All links work with `/quiqr-desktop/docs/` base path

**Dependencies**: Task 1.1

---

### Task 1.3: Configure Docusaurus theme and branding
**Description**: Customize Docusaurus appearance to match Quiqr branding

**Steps**:
1. Update `docusaurus.config.ts` theme configuration:
   - Set project title and tagline
   - Configure navbar with links to GitHub, OpenSpec UI
   - Configure footer with social links
2. Add logo and favicon to `packages/docs/static/img/`
3. Configure dark mode support
4. Set up docs-only mode (remove blog if not needed)

**Validation**:
- [ ] Site displays Quiqr branding correctly
- [x] Dark mode toggle works
- [x] Navbar links to GitHub and OpenSpec UI are functional
- [x] Footer displays proper attribution

**Dependencies**: Task 1.2

---

## Phase 2: Content Migration

### Task 2.1: Set up documentation structure
**Description**: Create initial documentation structure in Docusaurus

**Steps**:
1. Create `packages/docs/docs/` directory structure:
   - `getting-started/`
   - `user-guide/`
   - `developer-guide/`
   - `field-reference/`
   - `contributing/`
   - `release-notes/`
2. Create category `_category_.json` files for each section
3. Create `packages/docs/docs/intro.md` as landing page

**Validation**:
- [x] Directory structure exists
- [x] Sidebar renders all categories correctly
- [x] Navigation between sections works

**Dependencies**: Task 1.3

---

### Task 2.2: Migrate getting started documentation
**Description**: Migrate content from `docs/legacy-quiqr-documentation/docs/10-getting-started/`

**Steps**:
1. Convert `01.installation/_index.md` to `docs/getting-started/installation.md`
2. Convert `02.import-site/_index.md` to `docs/getting-started/import-site.md`
3. Convert `10.quick-start-video/_index.md` to `docs/getting-started/quick-start.md`
4. Copy and fix image references
5. Update links to use Docusaurus format
6. Test all links and images

**Validation**:
- [x] All getting started pages render correctly
- [x] Images display properly
- [x] Internal links work
- [x] External links work
- [x] Video embeds work (if applicable)

**Dependencies**: Task 2.1

---

### Task 2.3: Migrate developer reference documentation
**Description**: Migrate content from `docs/legacy-quiqr-documentation/docs/20-Quiqr-Developer-Reference/`

**Steps**:
1. Convert anatomy of Quiqr site docs to `docs/developer-guide/anatomy.md`
2. Migrate content model documentation to `docs/developer-guide/content-model/`
3. Migrate global preferences documentation to `docs/developer-guide/preferences/`
4. Migrate examples to `docs/developer-guide/examples/`
5. Copy and fix all images
6. Update all links

**Validation**:
- [x] All developer reference pages render correctly
- [x] Code examples have proper syntax highlighting
- [x] All images display properly
- [x] All links work

**Dependencies**: Task 2.1

---

### Task 2.4: Migrate field type documentation
**Description**: Migrate field type reference from `docs/legacy-quiqr-documentation/docs/20-Quiqr-Developer-Reference/03-content-model/03-form-fields/`

**Steps**:
1. Create `docs/field-reference/data-fields/` and migrate data field types
2. Create `docs/field-reference/container-fields/` and migrate container field types
3. Create `docs/field-reference/layout-fields/` and migrate layout field types
4. Copy and fix all field images and screenshots
5. Update field configuration examples
6. Cross-reference with `packages/types/src/schemas/fields.ts` for accuracy

**Validation**:
- [x] All field type pages render correctly
- [x] Field examples have correct syntax
- [x] Images display properly
- [x] Each field type has working example configuration

**Dependencies**: Task 2.1

---

### Task 2.5: Migrate NG (Next Generation) documentation
**Description**: Migrate content from `docs/raw-ng-quiqr-documentation/`

**Steps**:
1. Migrate `FIELD_DEVELOPMENT_GUIDE.md` to `docs/developer-guide/field-development.md`
2. Migrate `prompts_templates.md` to `docs/developer-guide/prompts-templates.md`
3. Merge relevant content from `docs/legacy-vibecoding-docs/` if applicable
4. Update references to SukohForm and current architecture
5. Test all code examples

**Validation**:
- [x] NG documentation renders correctly
- [x] Code examples work with current codebase
- [x] Architecture diagrams display properly
- [x] Tutorial steps are accurate

**Dependencies**: Task 2.1

---

### Task 2.6: Create contributing guide
**Description**: Create documentation for contributing to Quiqr, including documentation

**Steps**:
1. Create `docs/contributing/getting-started.md` (link to CONTRIBUTING.md)
2. Create `docs/contributing/documentation.md` with documentation authoring guide
3. Create `docs/contributing/testing.md` with testing guidelines
4. Create `docs/contributing/pull-requests.md` with PR guidelines
5. Include examples of good documentation

**Validation**:
- [x] Contributing guide renders correctly
- [x] Documentation authoring guide is clear and actionable
- [x] Examples are helpful and accurate

**Dependencies**: Task 2.1

---

### Task 2.7: Migrate release notes
**Description**: Migrate release notes to Docusaurus format

**Steps**:
1. Create `docs/release-notes/` directory
2. Extract relevant sections from CHANGELOG.md
3. Create version-specific pages (e.g., `v0.21.md`, `v0.20.md`)
4. Link to full CHANGELOG.md for historical reference
5. Add frontmatter with version metadata

**Validation**:
- [x] Release notes render correctly
- [x] Versions are clearly differentiated
- [x] Links to CHANGELOG.md work

**Dependencies**: Task 2.1

---

## Phase 3: CI/CD Integration

### Task 3.1: Add documentation build to PR checks
**Description**: Update `pr-check.yml` to build documentation on every PR

**Steps**:
1. Add new job `docs-build` to `.github/workflows/pr-check.yml`
2. Install dependencies and build docs workspace
3. Configure job to run in parallel with tests
4. Make job non-blocking (continue on failure but report status)
5. Add caching for node_modules

**Validation**:
- [x] PR checks build documentation successfully
- [x] Documentation build errors are visible in PR status
- [x] Build completes in under 3 minutes
- [x] Caching reduces build time on subsequent runs

**Dependencies**: Task 2.7

---

### Task 3.2: Update GitHub Pages deployment workflow
**Description**: Update `deploy.yml` to deploy Docusaurus alongside OpenSpec UI

**Steps**:
1. Add new job `publish-docs` to `.github/workflows/deploy.yml`
2. Build Docusaurus site in CI
3. Configure artifact upload for docs build output
4. Update GitHub Pages deployment to include both OpenSpec and Docusaurus
5. Configure proper routing: OpenSpec at `/specs/`, Docusaurus at `/docs/`
6. Test that both sites are accessible after deployment

**Validation**:
- [x] Workflow builds both OpenSpec UI and Docusaurus
- [x] Both sites deploy to GitHub Pages
- [x] OpenSpec UI accessible at https://quiqr.github.io/quiqr-desktop/specs/
- [x] Docusaurus accessible at https://quiqr.github.io/quiqr-desktop/docs/
- [ ] Coverage badge remains accessible at https://quiqr.github.io/quiqr-desktop/badges/coverage.svg
- [x] Deployment completes within 5 minutes

**Dependencies**: Task 2.7, Task 3.1

---

### Task 3.3: Test deployment in staging
**Description**: Test the full deployment workflow before merging

**Steps**:
1. Create test branch for deployment workflow
2. Push to test branch and trigger workflow manually
3. Verify both OpenSpec and Docusaurus deploy correctly
4. Test all routes and paths
5. Check for any conflicts or issues
6. Document any issues found and resolutions

**Validation**:
- [ ] Test deployment succeeds
- [ ] Both OpenSpec and Docusaurus are accessible
- [ ] No conflicts between deployments
- [ ] All assets load correctly

**Dependencies**: Task 3.2

---

## Phase 4: Process and Documentation Updates

### Task 4.1: Update AGENTS.md with documentation guidelines
**Description**: Add documentation authoring guidelines to AGENTS.md

**Steps**:
1. Add section "Documentation Guidelines" to AGENTS.md
2. Document when documentation updates are required:
   - New features MUST include documentation
   - Breaking changes MUST update affected documentation
   - Bug fixes MAY include documentation updates
   - New field types MUST include field reference documentation
3. Document documentation structure and conventions
4. Provide examples of good documentation
5. Link to Docusaurus documentation

**Validation**:
- [ ] AGENTS.md includes comprehensive documentation guidelines
- [ ] Guidelines are clear and actionable
- [ ] Examples are helpful

**Dependencies**: Task 2.7

---

### Task 4.2: Update OpenSpec specs to require documentation
**Description**: Update relevant specs to enforce documentation requirements

**Steps**:
1. Update `openspec/specs/documentation/spec.md` to add:
   - Requirement: Documentation Requirements for New Features
   - Requirement: Documentation Requirements for Breaking Changes
   - Requirement: Field Type Documentation Requirements
2. Update `openspec/specs/spec-driven-development/spec.md` to include documentation in change proposals
3. Add scenarios for documentation validation in CI
4. Reference Docusaurus documentation site

**Validation**:
- [ ] Documentation spec includes clear requirements
- [ ] Requirements are testable and verifiable
- [ ] Scenarios cover all documentation situations
- [ ] `openspec validate` passes

**Dependencies**: Task 4.1

---

### Task 4.3: Update RELEASE.md with documentation deployment
**Description**: Update release runbook to include documentation deployment

**Steps**:
1. Add step to verify documentation is up-to-date before release
2. Document that documentation deploys automatically on push to main/ng
3. Add verification step to check deployed documentation after release
4. Link to Docusaurus site in release checklist

**Validation**:
- [ ] RELEASE.md includes documentation steps
- [ ] Steps are clear and actionable
- [ ] Release process remains efficient

**Dependencies**: Task 3.2

---

### Task 4.4: Update README.md with documentation links
**Description**: Update README.md to link to the new documentation site

**Steps**:
1. Add "Documentation" section to README.md
2. Link to Docusaurus site at https://quiqr.github.io/quiqr-desktop/docs/
3. Link to OpenSpec UI at https://quiqr.github.io/quiqr-desktop/specs/
4. Add badges for documentation build status (if available)
5. Update existing documentation references

**Validation**:
- [ ] README.md includes documentation links
- [ ] Links are correct and functional
- [ ] Badges display correctly

**Dependencies**: Task 3.2

---

## Phase 5: Validation and Cleanup

### Task 5.1: Comprehensive link validation
**Description**: Validate all internal and external links in documentation

**Steps**:
1. Run Docusaurus link checker: `npm run build -w @quiqr/docs`
2. Test all internal links manually
3. Verify external links are valid
4. Fix any broken links
5. Document any intentionally external links

**Validation**:
- [ ] No broken internal links
- [ ] All external links are valid
- [ ] Link checker reports no errors

**Dependencies**: Task 2.7

---

### Task 5.2: Document migration status and known issues
**Description**: Create documentation tracking migration status

**Steps**:
1. Create `docs/meta/migration-status.md`
2. List what has been migrated
3. List what is in progress
4. List known issues or limitations
5. List future work (versioned docs, etc.)

**Validation**:
- [ ] Migration status document is comprehensive
- [ ] Known issues are documented
- [ ] Future work is clearly outlined

**Dependencies**: Task 5.1

---

### Task 5.3: Update workspace documentation
**Description**: Update root-level documentation to reference new docs structure

**Steps**:
1. Update CONTRIBUTING.md to reference Docusaurus docs
2. Create `.github/PULL_REQUEST_TEMPLATE.md` checklist item for documentation
3. Add documentation section to commit message guidelines

**Validation**:
- [ ] CONTRIBUTING.md references Docusaurus
- [ ] PR template includes documentation checklist
- [ ] Commit message guidelines updated

**Dependencies**: Task 4.4

---

## Parallelization Opportunities

These tasks can be worked on in parallel:
- **Phase 1**: Can be done serially (each task depends on previous)
- **Phase 2**: Tasks 2.2-2.7 can be done in parallel after Task 2.1
- **Phase 3**: Task 3.1 can be done in parallel with Task 2.x
- **Phase 4**: All tasks can be done in parallel after Phase 3

## Dependencies Summary

```
1.1 → 1.2 → 1.3 → 2.1 → [2.2, 2.3, 2.4, 2.5, 2.6, 2.7]
                      ↓
                    3.1 (parallel with 2.x)
                      ↓
                    3.2 → 3.3 → [4.1, 4.2, 4.3, 4.4] → [5.1, 5.2, 5.3]
```

## Success Metrics

- All tasks completed with validation criteria met
- Documentation site deployed and accessible
- CI/CD pipeline builds and deploys documentation automatically
- OpenSpec specs updated with documentation requirements
- Zero broken links in documentation
- Documentation build time under 3 minutes
