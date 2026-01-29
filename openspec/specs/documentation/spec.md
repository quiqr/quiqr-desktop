# documentation Specification

## Purpose

This specification defines documentation requirements for the Quiqr Desktop project, including release documentation, user-facing documentation (Docusaurus), and developer guidelines.

## Requirements
### Requirement: Release Documentation

The project SHALL maintain a dedicated RELEASE.md file at the repository root that documents the release process, versioning policy, and release procedures.

#### Scenario: Release documentation exists

- **WHEN** a contributor needs to understand the release process
- **THEN** they can refer to RELEASE.md in the project root
- **AND** the file contains complete release runbook steps
- **AND** the file documents the semantic versioning policy

#### Scenario: Semantic versioning policy is documented

- **WHEN** determining the appropriate version number for a release
- **THEN** RELEASE.md SHALL document that:
  - `Quiqr v0.[major].0` represents major version updates with possible breaking changes and public press releases
  - `Quiqr v0.0.[minor]` represents minor version updates for small changes and bug fixes
  - Major versions (v[major].0.0) are reserved for future use post-v1.0.0
  - Major versions will have separate documentation websites

#### Scenario: Release runbook is accessible

- **WHEN** performing a release
- **THEN** RELEASE.md SHALL contain step-by-step instructions including:
  - Pre-release validation steps
  - CHANGELOG update procedures
  - Version number update locations
  - Git tagging commands
  - Build verification steps

#### Scenario: README references release documentation

- **WHEN** a user reads README.md
- **THEN** README.md SHALL reference RELEASE.md for release-related information
- **AND** README.md SHALL NOT duplicate the full release runbook

### Requirement: Documentation Organization

Project documentation SHALL be organized with clear separation between user-facing information (README.md) and contributor/maintainer processes (RELEASE.md, CHANGELOG.md).

#### Scenario: Documentation files have clear purposes

- **WHEN** looking for project documentation
- **THEN** each documentation file SHALL have a distinct purpose:
  - README.md: Project overview, getting started, development setup
  - RELEASE.md: Release process, versioning policy, release procedures
  - CHANGELOG.md: Version history and changes
  - AGENTS.md: AI assistant instructions for working with the codebase
  - packages/docs/: User-facing documentation (Docusaurus)

### Requirement: Docusaurus Documentation Site

The project SHALL maintain a Docusaurus-based documentation site at `packages/docs/` that provides comprehensive user and developer documentation.

#### Scenario: Documentation site structure

- **WHEN** accessing the documentation site
- **THEN** it SHALL be organized into these sections:
  - Getting Started: Installation, quick start, import guides
  - User Guide: Using Quiqr features
  - Developer Guide: Architecture, content model, field system
  - Field Reference: Field types and their options
  - Contributing: Contribution guidelines
  - Release Notes: Version history

#### Scenario: Documentation deployment

- **WHEN** changes are merged to main branch
- **THEN** documentation SHALL be automatically deployed to GitHub Pages at `/quiqr-desktop/docs/`
- **AND** OpenSpec UI SHALL be deployed at `/quiqr-desktop/specs/`
- **AND** deployment SHALL be handled by `.github/workflows/deploy.yml`

#### Scenario: Documentation in PR checks

- **WHEN** a pull request is created
- **THEN** documentation SHALL be built as part of PR checks
- **AND** documentation build failures SHALL be non-blocking (continue-on-error: true)
- **AND** warnings SHALL be reported for broken links

### Requirement: Documentation for New Features

New features and significant changes SHALL include appropriate documentation updates.

#### Scenario: Adding a new feature

- **WHEN** implementing a new user-facing feature
- **THEN** user documentation SHALL be added to `packages/docs/docs/`
- **AND** relevant sections SHALL be updated (getting-started, user-guide, or field-reference)

#### Scenario: Adding a new API or backend change

- **WHEN** implementing a new API endpoint or backend change
- **THEN** developer documentation SHALL be updated in `packages/docs/docs/developer-guide/`
- **AND** API reference SHALL be updated if applicable

#### Scenario: Adding a new field type

- **WHEN** implementing a new field type
- **THEN** field reference documentation SHALL be added to `packages/docs/docs/field-reference/`
- **AND** FIELD_DEVELOPMENT_GUIDE.md SHALL be updated if needed

#### Scenario: Breaking changes

- **WHEN** implementing breaking changes
- **THEN** release notes SHALL be updated in `packages/docs/docs/release-notes/`
- **AND** migration guide SHALL be provided if applicable

### Requirement: Documentation Writing Standards

Documentation SHALL follow consistent writing standards and formatting.

#### Scenario: Documentation frontmatter

- **WHEN** creating a new documentation page
- **THEN** it SHALL include frontmatter with `sidebar_position` for ordering
- **AND** it SHALL use a descriptive title starting with `#`

Example:
```markdown
---
sidebar_position: 1
---

# Page Title

Content here...
```

#### Scenario: Documentation style

- **WHEN** writing documentation
- **THEN** it SHALL use clear, concise language
- **AND** it SHALL include code examples where appropriate
- **AND** it SHALL use Docusaurus admonitions for notes, warnings, and tips (:::note, :::warning, :::tip)
- **AND** it SHALL link to related pages and external resources

#### Scenario: Link validation

- **WHEN** building documentation
- **THEN** broken links SHALL be detected
- **AND** link validation SHALL be set to 'warn' mode during development
- **AND** link validation SHALL be set to 'throw' mode once all content is complete

### Requirement: Documentation Build Commands

The documentation workspace SHALL provide standard NPM scripts for building and serving documentation.

#### Scenario: Development server

- **WHEN** developing documentation locally
- **THEN** running `npm run start -w @quiqr/docs` SHALL start a development server
- **AND** the server SHALL provide hot-reload for content changes

#### Scenario: Production build

- **WHEN** building documentation for production
- **THEN** running `npm run build -w @quiqr/docs` SHALL create an optimized build
- **AND** the build output SHALL be in `packages/docs/build/`
- **AND** the build SHALL validate links and report errors

#### Scenario: Serving production build

- **WHEN** testing the production build locally
- **THEN** running `npm run serve -w @quiqr/docs` SHALL serve the built documentation
- **AND** it SHALL be accessible at a local URL

### Requirement: Documentation in AGENTS.md

The AGENTS.md file SHALL include a Documentation section that references this spec and provides quick reference information for AI assistants.

#### Scenario: Documentation section in AGENTS.md

- **WHEN** an AI assistant reads AGENTS.md
- **THEN** it SHALL find a Documentation section
- **AND** the section SHALL reference this OpenSpec documentation specification
- **AND** the section SHALL provide quick links to documentation commands
- **AND** the section SHALL summarize when to document (new features, API changes, etc.)

