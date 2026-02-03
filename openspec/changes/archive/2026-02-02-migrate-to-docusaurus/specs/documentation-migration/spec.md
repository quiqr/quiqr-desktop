# Spec: documentation-migration

**Status**: draft  
**Capability**: Documentation Content Migration  
**Related To**: [docusaurus-setup], [documentation]

---

## ADDED Requirements

### Requirement: Legacy Documentation Migration

All existing documentation from legacy sources MUST be migrated to Docusaurus format.

**Rationale**: Preserving existing documentation ensures continuity for users and developers while providing a foundation for future documentation improvements.

#### Scenario: Getting Started Documentation

**Given** legacy documentation in `docs/legacy-quiqr-documentation/docs/10-getting-started/`  
**When** the migration is complete  
**Then** getting started content exists in `packages/docs/docs/getting-started/`  
**And** installation instructions are available and accurate  
**And** quick start guides are available and functional  
**And** site import documentation is available

#### Scenario: Developer Reference Documentation

**Given** legacy documentation in `docs/legacy-quiqr-documentation/docs/20-Quiqr-Developer-Reference/`  
**When** the migration is complete  
**Then** developer reference content exists in `packages/docs/docs/developer-guide/`  
**And** site anatomy documentation is available  
**And** content model documentation is available  
**And** preferences documentation is available  
**And** examples are included and functional

#### Scenario: Field Type Documentation

**Given** legacy field type documentation  
**When** the migration is complete  
**Then** field reference content exists in `packages/docs/docs/field-reference/`  
**And** data field types are documented  
**And** container field types are documented  
**And** layout field types are documented  
**And** each field type includes configuration examples

#### Scenario: Next Generation Documentation

**Given** raw NG documentation in `docs/raw-ng-quiqr-documentation/`  
**When** the migration is complete  
**Then** field development guide is available in `packages/docs/docs/developer-guide/field-development.md`  
**And** prompt templates documentation is available  
**And** SukohForm architecture is documented  
**And** code examples are current and accurate

---

### Requirement: Image and Asset Migration

All images and assets referenced in documentation MUST be migrated and functional.

**Rationale**: Visual aids are essential for documentation comprehension. Broken images create a poor user experience.

#### Scenario: Image Files Copied

**Given** images in legacy documentation folders  
**When** the migration is complete  
**Then** all images are copied to `packages/docs/static/img/`  
**And** images are organized by documentation section  
**And** image filenames are preserved or mapped consistently

#### Scenario: Image References Updated

**Given** documentation pages with image references  
**When** the pages are viewed on the deployed site  
**Then** all images load correctly  
**And** image URLs include the proper base path `/quiqr-desktop/docs/img/`  
**And** no broken image links exist

#### Scenario: Image Optimization

**Given** migrated image files  
**When** images are committed to the repository  
**Then** images are reasonably optimized (not excessively large)  
**And** images maintain sufficient quality for documentation purposes

---

### Requirement: Link Integrity

All internal and external links in documentation MUST be functional and accurate.

**Rationale**: Broken links frustrate users and reduce documentation credibility. Link validation ensures documentation quality.

#### Scenario: Internal Links Updated

**Given** documentation pages with internal links to other docs pages  
**When** the pages are built  
**Then** Docusaurus validates internal links automatically  
**And** build fails if internal links are broken  
**And** internal links use Docusaurus-compatible format

#### Scenario: External Links Validated

**Given** documentation pages with external links  
**When** the migration is validated  
**Then** all external links point to valid, accessible URLs  
**And** external links open in new tabs (when appropriate)  
**And** external links include HTTPS protocol

#### Scenario: Cross-Reference Links

**Given** documentation with references to other sections  
**When** a user clicks a cross-reference link  
**Then** the link navigates to the correct section  
**And** the target section is highlighted or scrolled into view

---

### Requirement: Frontmatter Conversion

Documentation frontmatter MUST be converted from Hugo/legacy format to Docusaurus format.

**Rationale**: Frontmatter controls page metadata, sidebar position, and page behavior. Proper conversion ensures documentation displays correctly.

#### Scenario: Hugo Frontmatter Conversion

**Given** a legacy doc page with Hugo frontmatter (e.g., `title`, `weight`, `menu`)  
**When** the page is migrated  
**Then** frontmatter uses Docusaurus format  
**And** page title is preserved  
**And** sidebar position is determined by `sidebar_position` or file structure  
**And** unnecessary Hugo-specific fields are removed

#### Scenario: Page Metadata

**Given** a migrated documentation page  
**When** the page is viewed  
**Then** page title displays correctly in browser tab  
**And** page title displays in sidebar navigation  
**And** page metadata is accessible to search engines

---

### Requirement: Code Example Formatting

Code examples in documentation MUST use proper syntax highlighting and be accurate.

**Rationale**: Properly formatted code examples improve readability and comprehension. Accurate examples enable users to copy-paste and use immediately.

#### Scenario: Code Block Syntax Highlighting

**Given** a documentation page with code examples  
**When** the page is viewed  
**Then** code blocks use syntax highlighting  
**And** language is correctly identified (JavaScript, TypeScript, JSON, YAML, etc.)  
**And** syntax highlighting is readable in both light and dark modes

#### Scenario: Code Example Accuracy

**Given** code examples in developer documentation  
**When** examples are migrated  
**Then** code examples reflect current API and syntax  
**And** outdated examples are updated or marked as legacy  
**And** examples include necessary imports and context

#### Scenario: Multi-Language Code Tabs

**Given** documentation that shows examples in multiple formats  
**When** the page is viewed  
**Then** code tabs allow switching between languages/formats  
**And** only one code tab is displayed at a time  
**And** tab selection persists across page navigation

---

### Requirement: Contributing Documentation

The Docusaurus site MUST include comprehensive contributing guidelines.

**Rationale**: Clear contributing guidelines lower the barrier for external contributions and ensure consistent documentation quality.

#### Scenario: Contribution Getting Started

**Given** the contributing section  
**When** a potential contributor views the documentation  
**Then** getting started guide is available  
**And** guide explains how to set up development environment  
**And** guide links to code-level CONTRIBUTING.md

#### Scenario: Documentation Authoring Guide

**Given** the contributing section  
**When** a contributor wants to update documentation  
**Then** documentation authoring guide is available  
**And** guide explains Docusaurus basics  
**And** guide provides templates and examples  
**And** guide explains local preview workflow

#### Scenario: Pull Request Guidelines

**Given** the contributing section  
**When** a contributor prepares a pull request  
**Then** PR guidelines are available  
**And** guidelines explain documentation requirements  
**And** guidelines link to PR template checklist

---

### Requirement: Release Notes Migration

Release notes MUST be extracted from CHANGELOG and made available in Docusaurus format.

**Rationale**: Version-specific release notes help users understand what changed in each release and whether they should upgrade.

#### Scenario: Recent Release Notes

**Given** the CHANGELOG.md file  
**When** release notes are migrated  
**Then** the last 3-4 major releases have dedicated documentation pages  
**And** release notes include version number and release date  
**And** release notes include notable changes and breaking changes  
**And** release notes link to full CHANGELOG for complete history

#### Scenario: Release Notes Organization

**Given** the release notes section  
**When** a user browses release notes  
**Then** releases are listed in reverse chronological order (newest first)  
**And** each release is a separate page  
**And** release notes are navigable via sidebar

---

### Requirement: Legacy Documentation Preservation

The legacy documentation folders MUST be preserved as reference during and after migration.

**Rationale**: Keeping legacy docs ensures nothing is lost during migration and provides fallback if issues are discovered.

#### Scenario: Legacy Folders Retained

**Given** the repository after migration  
**When** the file structure is examined  
**Then** `docs/legacy-quiqr-documentation/` still exists  
**And** `docs/legacy-vibecoding-docs/` still exists  
**And** `docs/raw-ng-quiqr-documentation/` still exists

#### Scenario: Legacy Documentation Marked Deprecated

**Given** the legacy documentation folders  
**When** a developer or user encounters them  
**Then** a README or notice indicates they are deprecated  
**And** the notice points to the new Docusaurus site  
**And** the notice explains these are kept for reference only

---

## MODIFIED Requirements

*No existing requirements are modified by this capability.*

---

## REMOVED Requirements

*No existing requirements are removed by this capability.*
