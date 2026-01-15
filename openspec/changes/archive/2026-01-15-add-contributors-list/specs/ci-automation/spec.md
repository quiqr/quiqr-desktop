## ADDED Requirements

### Requirement: Contributors List Automation
The project SHALL automatically maintain a contributors list in the README that displays all repository contributors with their avatars and GitHub profiles.

#### Scenario: Contributors section in README
- **GIVEN** the README.md file
- **WHEN** viewing the Contributors section
- **THEN** it MUST contain special HTML comment markers for automation
- **AND** the markers MUST follow the format `<!-- readme: contributors -start -->` and `<!-- readme: contributors -end -->`

#### Scenario: Workflow updates contributors automatically
- **GIVEN** code is pushed to main or ng branch
- **WHEN** the push triggers the contributors workflow
- **THEN** the workflow MUST fetch all contributors from GitHub API
- **AND** the workflow MUST generate a formatted table with contributor avatars
- **AND** the workflow MUST update the README between the automation markers
- **AND** the workflow MUST commit the changes (or create a PR if branch is protected)

#### Scenario: Manual workflow trigger
- **GIVEN** a maintainer wants to update contributors manually
- **WHEN** they trigger the contributors workflow via workflow_dispatch
- **THEN** the workflow MUST execute immediately
- **AND** the contributors list MUST be updated

#### Scenario: Contributors display configuration
- **GIVEN** the contributors workflow is running
- **WHEN** generating the contributors table
- **THEN** each contributor avatar MUST be 100 pixels square
- **AND** the table MUST display 6 contributors per row
- **AND** each contributor entry MUST link to their GitHub profile

### Requirement: Contributors Workflow Permissions
The contributors automation workflow SHALL have appropriate permissions to update repository content.

#### Scenario: Workflow has write permissions
- **GIVEN** the contributors workflow is defined
- **WHEN** checking workflow permissions
- **THEN** it MUST have `contents: write` permission to commit changes
- **AND** it MUST have `pull-requests: write` permission to create PRs on protected branches

#### Scenario: Protected branch handling
- **GIVEN** the target branch (main or ng) is protected
- **WHEN** the workflow attempts to update contributors
- **THEN** it MUST create a pull request instead of direct commit
- **AND** the PR MUST have a descriptive title indicating contributor update
