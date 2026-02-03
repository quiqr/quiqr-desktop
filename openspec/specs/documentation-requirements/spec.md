# documentation-requirements Specification

## Purpose
TBD - created by archiving change migrate-to-docusaurus. Update Purpose after archive.
## Requirements
### Requirement: Documentation Requirements for New Features

New features and capabilities MUST include documentation before being merged.

**Rationale**: Documentation should be created alongside features to ensure accuracy and prevent documentation debt. Developers are most familiar with features when they're building them.

#### Scenario: New Feature Documentation Requirement

**Given** a pull request that adds a new user-facing feature  
**When** the PR is reviewed  
**Then** the PR includes documentation for the feature  
**And** documentation is in the appropriate Docusaurus section  
**And** documentation explains what the feature does  
**And** documentation includes usage examples

#### Scenario: New Field Type Documentation Requirement

**Given** a pull request that adds a new SukohForm field type  
**When** the PR is reviewed  
**Then** the PR includes field reference documentation  
**And** documentation is in `packages/docs/docs/field-reference/`  
**And** documentation includes field configuration schema  
**And** documentation includes working examples  
**And** documentation cross-references the Zod schema definition

#### Scenario: New API Endpoint Documentation Requirement

**Given** a pull request that adds a new backend API endpoint  
**When** the PR is reviewed  
**Then** the PR includes developer guide documentation  
**And** documentation explains the endpoint purpose  
**And** documentation includes request/response examples  
**And** documentation notes any authentication requirements

---

### Requirement: Documentation Requirements for Breaking Changes

Breaking changes MUST update affected documentation to reflect the new behavior.

**Rationale**: Outdated documentation for breaking changes causes user frustration and support burden. Documentation must accurately reflect current behavior.

#### Scenario: Breaking Change Documentation Update

**Given** a pull request that introduces a breaking change  
**When** the PR is reviewed  
**Then** the PR updates all affected documentation pages  
**And** updated documentation explains the new behavior  
**And** updated documentation notes the change from previous behavior  
**And** release notes document the breaking change

#### Scenario: API Change Documentation

**Given** a breaking change to a public API  
**When** the change is documented  
**Then** documentation includes migration guide  
**And** documentation shows before/after examples  
**And** documentation is added to the version's release notes

---

### Requirement: Documentation Optional for Non-User-Facing Changes

Internal refactoring, bug fixes, and performance improvements that do not affect user-facing behavior MUST NOT require documentation updates unless they impact documented developer APIs or workflows.

**Rationale**: Not all code changes require documentation updates. Avoiding unnecessary documentation churn for internal changes improves development velocity while ensuring user-facing changes are always documented.

#### Scenario: Internal Refactoring Without Documentation

**Given** a pull request that refactors internal code without changing behavior  
**When** the PR is reviewed  
**Then** documentation updates are optional  
**And** the PR can be merged without documentation changes  
**And** reviewers may request documentation if the change affects developers

#### Scenario: Bug Fix Documentation Decision

**Given** a pull request that fixes a bug  
**When** the PR is reviewed  
**Then** IF the bug affects documented behavior, documentation MUST be updated  
**And** IF the bug is internal, documentation updates are optional  
**And** release notes should mention significant bug fixes

---

### Requirement: Documentation Authoring Guidelines in AGENTS.md

The AGENTS.md file MUST include comprehensive guidelines for documentation authoring.

**Rationale**: AI coding agents need clear instructions on when and how to create documentation. These guidelines ensure consistent documentation quality.

#### Scenario: Documentation Guidelines Section

**Given** the AGENTS.md file  
**When** the file is examined  
**Then** a "Documentation Guidelines" section exists  
**And** the section is prominently placed in the file  
**And** the section is clearly written for AI agents

#### Scenario: When to Document Guidelines

**Given** the AGENTS.md documentation guidelines  
**When** an AI agent determines whether to update documentation  
**Then** guidelines specify that new features MUST be documented  
**And** guidelines specify that breaking changes MUST update documentation  
**And** guidelines specify that bug fixes MAY update documentation  
**And** guidelines specify that internal changes generally don't need documentation

#### Scenario: How to Document Guidelines

**Given** the AGENTS.md documentation guidelines  
**When** an AI agent creates documentation  
**Then** guidelines explain the Docusaurus structure  
**And** guidelines explain where different types of docs go  
**And** guidelines provide examples of good documentation  
**And** guidelines link to the documentation authoring guide in Docusaurus

#### Scenario: Documentation Local Testing Guidelines

**Given** the AGENTS.md documentation guidelines  
**When** an AI agent updates documentation  
**Then** guidelines instruct to run `npm start -w @quiqr/docs` to preview  
**And** guidelines instruct to verify images load correctly  
**And** guidelines instruct to verify links work correctly  
**And** guidelines instruct to run `npm run build -w @quiqr/docs` to validate

---

### Requirement: Pull Request Template Documentation Checklist

The pull request template MUST include a checklist item for documentation.

**Rationale**: PR templates remind contributors to consider documentation, reducing the chance documentation is forgotten.

#### Scenario: Documentation Checklist Item

**Given** the `.github/PULL_REQUEST_TEMPLATE.md` file  
**When** a new PR is created  
**Then** the PR description includes a documentation checklist item  
**And** the checklist prompts: "Documentation updated (if applicable)"  
**And** the checklist is optional (can be checked N/A)

#### Scenario: Documentation Checklist Guidance

**Given** the PR template documentation checklist  
**When** a contributor reads the template  
**Then** guidance explains when documentation is required  
**And** guidance links to documentation authoring guide  
**And** guidance allows marking N/A for non-user-facing changes

---

### Requirement: Release Process Documentation Updates

The release runbook (RELEASE.md) MUST include steps for documentation validation and deployment.

**Rationale**: Documentation deployment should be an explicit part of the release process to ensure documentation is up-to-date before releases.

#### Scenario: Pre-Release Documentation Validation

**Given** the RELEASE.md runbook  
**When** a release is prepared  
**Then** the runbook includes a step to verify documentation is up-to-date  
**And** the runbook includes a step to review release notes  
**And** the runbook instructs to verify documentation builds successfully

#### Scenario: Post-Release Documentation Verification

**Given** the RELEASE.md runbook  
**When** a release is completed  
**Then** the runbook includes a step to verify documentation deployed  
**And** the runbook instructs to check `/quiqr-desktop/docs/` is accessible  
**And** the runbook instructs to verify new features are documented

#### Scenario: Automatic Documentation Deployment

**Given** the release process  
**When** changes are pushed to main or ng branch  
**Then** documentation deploys automatically via CI/CD  
**And** no manual deployment step is required  
**And** the runbook notes that deployment is automatic

---

### Requirement: Commit Message Guidelines for Documentation

Commit messages for documentation changes MUST follow project conventional commits format with `docs:` prefix.

**Rationale**: Consistent commit messages improve changelog generation and make it easier to understand documentation changes in git history.

#### Scenario: Documentation-Only Commit Messages

**Given** a commit that only updates documentation  
**When** the commit message is written  
**Then** the commit message starts with `docs:` prefix  
**And** the commit message briefly describes what was documented  
**And** the commit message follows conventional commits format

**Examples**:
- `docs: add installation guide for Windows`
- `docs: update field reference for SelectField`
- `docs: fix broken links in developer guide`

#### Scenario: Feature with Documentation Commit Messages

**Given** a commit that adds a feature and documentation  
**When** the commit message is written  
**Then** the commit message uses the feature type prefix (e.g., `feat:`, `fix:`)  
**And** the commit message may mention documentation in the body  
**And** documentation is considered part of the feature, not separate

---

