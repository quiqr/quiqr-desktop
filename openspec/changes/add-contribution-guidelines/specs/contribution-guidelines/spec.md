# contribution-guidelines Specification Delta

## ADDED Requirements

### Requirement: Pull Request Description Standards

All pull requests SHALL include a clear description explaining what changes are being made and why.

#### Scenario: PR has adequate description

- **WHEN** a contributor submits a pull request
- **THEN** the PR description SHALL explain what changes were made
- **AND** the PR description SHALL explain why the changes were necessary
- **AND** the description SHALL be sufficient for reviewers to understand the scope and impact

#### Scenario: PR description for bug fixes

- **WHEN** a contributor submits a bug fix PR
- **THEN** the PR description SHALL include reproduction steps for the bug
- **AND** the description SHALL explain how the fix addresses the issue

#### Scenario: PR description for features

- **WHEN** a contributor submits a feature PR
- **THEN** the PR description SHALL explain the feature's purpose
- **AND** the description SHALL reference any related issues or discussions

### Requirement: CI Validation Gates

All pull requests SHALL pass automated tests and linters before being eligible for merge.

#### Scenario: Tests must pass

- **WHEN** a pull request is submitted
- **THEN** all automated tests in the CI pipeline SHALL pass
- **AND** the PR cannot be merged until tests are green

#### Scenario: Linters must pass

- **WHEN** a pull request is submitted
- **THEN** all linting checks (type checking, code formatting) SHALL pass
- **AND** the PR cannot be merged until linters are satisfied

#### Scenario: Failed checks block merge

- **WHEN** CI checks fail on a pull request
- **THEN** the contributor SHALL fix the failing checks
- **AND** the PR SHALL not be merged with failing checks

### Requirement: Change Size Classification

The project SHALL classify contributions by size to determine appropriate process and requirements.

#### Scenario: Small changes definition

- **WHEN** evaluating a contribution's size
- **THEN** small changes SHALL be defined as:
  - Typo fixes in documentation
  - Simple documentation updates
  - Minor bug fixes affecting single function or component
  - Changes that do not alter behavior or add features

#### Scenario: Large changes definition

- **WHEN** evaluating a contribution's size
- **THEN** large changes SHALL be defined as:
  - New user-facing features
  - Architectural changes
  - Breaking changes to APIs or behavior
  - Changes affecting multiple components or systems
  - Performance optimizations that change behavior

#### Scenario: Small changes have minimal requirements

- **WHEN** a small change is submitted
- **THEN** it SHALL only require:
  - Clear PR description
  - Passing CI checks
  - No OpenSpec proposal required
  - Basic testing if applicable

### Requirement: Testing Requirements by Scope

Testing requirements SHALL scale with the size and impact of the contribution.

#### Scenario: Small changes testing

- **WHEN** a small change (typo, doc fix) is submitted
- **THEN** no new tests are required
- **AND** existing tests must still pass

#### Scenario: Bug fix testing

- **WHEN** a bug fix is submitted
- **THEN** a regression test SHOULD be added to prevent the bug from reoccurring
- **AND** all existing tests SHALL pass

#### Scenario: Large changes testing requirement

- **WHEN** a large change (new feature, architectural change) is submitted
- **THEN** comprehensive automated tests SHALL be included
- **AND** tests SHALL cover the new functionality
- **AND** tests SHALL cover edge cases and error conditions

#### Scenario: Utility function testing

- **WHEN** new utility functions are added
- **THEN** unit tests for those functions SHALL be included
- **AND** tests SHALL cover all code paths and edge cases

### Requirement: OpenSpec Workflow for Vibe Coding

Changes created through vibe coding (exploratory, rapid prototyping) SHALL follow the OpenSpec workflow before being merged.

#### Scenario: Vibe-coded changes require proposal

- **WHEN** a contributor uses vibe coding to explore and prototype a change
- **THEN** they SHALL create an OpenSpec proposal before submitting the PR
- **AND** the proposal SHALL document the change retroactively
- **AND** the proposal SHALL be approved before the PR is reviewed for merge

#### Scenario: Vibe coding is allowed for exploration

- **WHEN** a contributor wants to experiment with an approach
- **THEN** vibe coding and rapid prototyping is allowed and encouraged
- **AND** the contributor SHALL follow OpenSpec workflow before requesting merge
- **AND** the implementation may inform the proposal

### Requirement: OpenSpec Workflow for Large Changes

Large changes (new features, architectural changes, breaking changes) SHALL follow the OpenSpec workflow with proposal approval before implementation.

#### Scenario: Large changes require OpenSpec proposal

- **WHEN** a contributor plans a large change
- **THEN** they SHALL create an OpenSpec proposal first
- **AND** the proposal SHALL be reviewed and approved before implementation begins
- **AND** the proposal SHALL include spec deltas and implementation tasks

#### Scenario: Large changes require automated tests

- **WHEN** implementing a large change
- **THEN** comprehensive automated tests SHALL be included
- **AND** tests SHALL be part of the OpenSpec tasks checklist
- **AND** tests SHALL validate the requirements in the spec

#### Scenario: Breaking changes require OpenSpec

- **WHEN** a change introduces breaking changes to APIs or behavior
- **THEN** an OpenSpec proposal SHALL be required
- **AND** the proposal SHALL clearly mark breaking changes
- **AND** the proposal SHALL include migration guidance

### Requirement: Code Quality Standards

All contributions SHALL follow established code quality standards and project conventions.

#### Scenario: Follow existing code style

- **WHEN** contributing code changes
- **THEN** the code SHALL follow the style conventions in AGENTS.md
- **AND** TypeScript SHALL be used for all new frontend code
- **AND** existing code patterns SHALL be followed

#### Scenario: Prefer editing over creating

- **WHEN** making changes to the codebase
- **THEN** contributors SHALL prefer editing existing files over creating new ones
- **AND** new abstractions SHALL only be added when clearly necessary
- **AND** over-engineering SHALL be avoided

#### Scenario: No breaking changes without discussion

- **WHEN** a change would break existing functionality
- **THEN** the contributor SHALL discuss the breaking change first
- **AND** an OpenSpec proposal SHALL document the breaking change
- **AND** a migration plan SHALL be provided

### Requirement: Common Mistakes Prevention

The contribution guidelines SHALL document common mistakes to help contributors avoid them.

#### Scenario: No PRs with failing tests

- **WHEN** a contributor submits a pull request
- **THEN** they SHALL verify tests pass locally first
- **AND** they SHALL NOT submit PRs with known failing tests

#### Scenario: No bypass of OpenSpec for architecture changes

- **WHEN** a contributor makes architectural changes
- **THEN** they SHALL NOT bypass the OpenSpec workflow
- **AND** they SHALL create and get approval for proposals

#### Scenario: No undiscussed dependencies

- **WHEN** a contributor wants to add new dependencies
- **THEN** they SHALL discuss the dependency addition first
- **AND** they SHALL provide justification for the new dependency
- **AND** they SHALL NOT add dependencies without maintainer approval

### Requirement: Documentation Accessibility

Contribution guidelines SHALL be easily discoverable and accessible to all contributors.

#### Scenario: CONTRIBUTING.md in repository root

- **WHEN** a contributor looks for contribution guidelines
- **THEN** they SHALL find CONTRIBUTING.md at the repository root
- **AND** GitHub SHALL automatically link to it during PR creation

#### Scenario: README references CONTRIBUTING.md

- **WHEN** a user reads README.md
- **THEN** README.md SHALL reference CONTRIBUTING.md
- **AND** the reference SHALL guide potential contributors to the guidelines

#### Scenario: Guidelines are comprehensive but approachable

- **WHEN** reading the contribution guidelines
- **THEN** the guidelines SHALL be detailed enough to set clear expectations
- **AND** the guidelines SHALL NOT be so complex that they discourage contributions
- **AND** the guidelines SHALL welcome new contributors
