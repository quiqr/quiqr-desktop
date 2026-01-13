# Spec Deltas: Spec-Driven Development

## ADDED Requirements

### Requirement: Three-Stage Workflow
The project SHALL support a three-stage workflow for managing changes: proposal creation, implementation, and archiving.

#### Scenario: Create new proposal
- **WHEN** a developer or AI assistant needs to plan a significant change
- **THEN** they create a proposal in `openspec/changes/[change-id]/` with `proposal.md`, `tasks.md`, and spec deltas

#### Scenario: Implement approved proposal
- **WHEN** a proposal is approved
- **THEN** the implementation follows the tasks in `tasks.md` and updates task checkboxes as work progresses

#### Scenario: Archive completed change
- **WHEN** a change is deployed and complete
- **THEN** it is moved to `openspec/changes/archive/YYYY-MM-DD-[change-id]/` and affected specs are updated

### Requirement: Proposal Structure
Each change proposal SHALL include a `proposal.md` file documenting why the change is needed, what changes, and the impact on existing code and specs.

#### Scenario: Complete proposal documentation
- **WHEN** creating a new proposal
- **THEN** the proposal.md MUST include Why, What Changes, and Impact sections

#### Scenario: Breaking changes marked
- **WHEN** a change includes breaking changes
- **THEN** breaking changes SHALL be marked with **BREAKING** in the What Changes section

### Requirement: Task Tracking
Each change proposal SHALL include a `tasks.md` file with a checklist of implementation steps.

#### Scenario: Task completion tracking
- **WHEN** implementing a change
- **THEN** each task is marked with `- [ ]` when pending and `- [x]` when completed

#### Scenario: Sequential implementation
- **WHEN** tasks have dependencies
- **THEN** they MUST be completed in order as listed in tasks.md

### Requirement: Spec Deltas
Change proposals SHALL include spec deltas in `specs/[capability]/spec.md` files under the change directory, documenting requirements that are ADDED, MODIFIED, REMOVED, or RENAMED.

#### Scenario: New capability added
- **WHEN** a change introduces a new capability
- **THEN** spec deltas use `## ADDED Requirements` headers

#### Scenario: Existing capability modified
- **WHEN** a change modifies existing behavior
- **THEN** spec deltas use `## MODIFIED Requirements` and include the complete updated requirement

#### Scenario: Capability removed
- **WHEN** a change removes functionality
- **THEN** spec deltas use `## REMOVED Requirements` with Reason and Migration information

#### Scenario: Requirement renamed
- **WHEN** only the requirement name changes
- **THEN** spec deltas use `## RENAMED Requirements` with FROM and TO entries

### Requirement: Scenario Format
Every requirement in spec deltas SHALL have at least one scenario using the format `#### Scenario: [name]`.

#### Scenario: Valid scenario structure
- **WHEN** writing a scenario
- **THEN** it MUST use `#### Scenario:` (4 hashtags) followed by the scenario name
- **AND** include WHEN/THEN bullet points describing the behavior

#### Scenario: Invalid scenario formats rejected
- **WHEN** a scenario uses bullet points, bold text, or wrong heading level
- **THEN** validation SHALL fail with clear error message

### Requirement: Project Context Documentation
The project SHALL maintain a `project.md` file in the openspec directory documenting project purpose, tech stack, conventions, domain context, constraints, and external dependencies.

#### Scenario: AI assistant onboarding
- **WHEN** an AI assistant needs project context
- **THEN** project.md provides all necessary information about architecture, patterns, and conventions

#### Scenario: Consistent coding standards
- **WHEN** implementing changes
- **THEN** developers and AI assistants follow conventions documented in project.md

### Requirement: Agent Instructions
The project SHALL maintain an `AGENTS.md` file with detailed instructions for AI assistants on using the OpenSpec workflow.

#### Scenario: Workflow guidance
- **WHEN** an AI assistant needs to create a proposal
- **THEN** AGENTS.md provides step-by-step instructions and examples

#### Scenario: Validation and troubleshooting
- **WHEN** validation fails
- **THEN** AGENTS.md provides troubleshooting guidance and common error solutions

### Requirement: Directory Structure
The project SHALL maintain a standard directory structure with `openspec/specs/` for current truth and `openspec/changes/` for proposals.

#### Scenario: Capability specifications
- **WHEN** a capability is implemented and deployed
- **THEN** its specification exists in `openspec/specs/[capability]/spec.md`

#### Scenario: Active proposals
- **WHEN** a change is proposed but not yet deployed
- **THEN** it exists in `openspec/changes/[change-id]/`

#### Scenario: Archived changes
- **WHEN** a change is completed and deployed
- **THEN** it is moved to `openspec/changes/archive/YYYY-MM-DD-[change-id]/`

### Requirement: Integration with Existing Workflow
OpenSpec instructions SHALL be integrated into the project's `CLAUDE.md` file via a managed comment block.

#### Scenario: AI assistant sees OpenSpec instructions
- **WHEN** relevant requests are made (planning, proposals, specs)
- **THEN** AI assistants are directed to read `@/openspec/AGENTS.md`

#### Scenario: Instructions stay updated
- **WHEN** OpenSpec updates its instruction template
- **THEN** running `openspec update` updates the managed block in CLAUDE.md

### Requirement: Validation Support
The workflow SHALL support validation of proposals and specs to ensure correctness.

#### Scenario: Validate before sharing
- **WHEN** a proposal is created
- **THEN** `openspec validate [change-id] --strict` is run to catch errors

#### Scenario: Validation error feedback
- **WHEN** validation fails
- **THEN** clear error messages indicate what needs to be fixed
