## ADDED Requirements

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
