# ci-automation Specification Deltas

## ADDED Requirements

### Requirement: OpenSpec UI Publishing
The CI system SHALL automatically generate and publish an interactive OpenSpec documentation website to GitHub Pages when code is pushed to main or ng branches.

#### Scenario: OpenSpec UI published on push to main
- **GIVEN** code is pushed to the main branch
- **WHEN** the GitHub Actions workflow runs
- **THEN** the workflow MUST install Nix with flakes support
- **AND** the workflow MUST execute the openspecui fork to generate static HTML from the repository
- **AND** the generated website MUST be deployed to GitHub Pages
- **AND** the deployment MUST complete within 5 minutes

#### Scenario: OpenSpec UI published on push to ng
- **GIVEN** code is pushed to the ng branch
- **WHEN** the GitHub Actions workflow runs
- **THEN** the workflow MUST install Nix with flakes support
- **AND** the workflow MUST execute the openspecui fork to generate static HTML from the repository
- **AND** the generated website MUST be deployed to GitHub Pages
- **AND** the deployment MUST complete within 5 minutes

#### Scenario: OpenSpec UI not published on pull requests
- **GIVEN** a pull request is opened or updated
- **WHEN** the test workflow runs
- **THEN** the OpenSpec UI publishing step MUST be skipped
- **AND** no deployment to GitHub Pages MUST occur
- **AND** only tests and validation MUST execute

#### Scenario: OpenSpec UI accessible via GitHub Pages
- **GIVEN** the OpenSpec UI has been published
- **WHEN** accessing the GitHub Pages URL for the repository
- **THEN** the OpenSpec UI MUST be accessible at the root path (e.g., https://quiqr.github.io/quiqr-desktop/)
- **AND** the UI MUST display all specifications from the openspec directory
- **AND** the UI MUST be browsable and interactive
- **AND** the UI MUST be served with appropriate content-type headers
- **AND** SPA routing MUST work correctly via _redirects file

### Requirement: OpenSpec UI and Coverage Badge Coexistence
The OpenSpec UI deployment SHALL not interfere with existing GitHub Pages content such as code coverage badges.

#### Scenario: Coverage badge remains accessible after OpenSpec UI deployment
- **GIVEN** the coverage badge is deployed at /badges/coverage.svg on GitHub Pages
- **WHEN** the OpenSpec UI is published
- **THEN** the coverage badge MUST remain accessible at its original URL
- **AND** the badge MUST display correct coverage information
- **AND** the badge MUST not be overwritten or corrupted

#### Scenario: OpenSpec UI deployed to root path
- **GIVEN** the OpenSpec UI publishing workflow is running
- **WHEN** deploying to GitHub Pages
- **THEN** the OpenSpec UI MUST be deployed to the root path
- **AND** the deployment MUST not affect content in /badges/ subdirectory
- **AND** the GitHub Pages site MUST serve both OpenSpec UI and badges correctly

### Requirement: OpenSpec UI Workflow with Nix
The OpenSpec UI publishing workflow SHALL use Nix with flakes support to run the openspecui fork that provides static export functionality.

#### Scenario: Nix installed with flakes support
- **GIVEN** the OpenSpec UI publishing workflow is running
- **WHEN** the Nix installation step executes
- **THEN** Nix MUST be installed using cachix/install-nix-action
- **AND** Nix MUST be configured with experimental-features for nix-command and flakes
- **AND** the installation MUST complete successfully before the export step

#### Scenario: OpenSpec UI fork executed via Nix
- **GIVEN** Nix is installed with flakes support
- **WHEN** generating the OpenSpec UI
- **THEN** the workflow MUST execute `nix run github:mipmip/openspecui/feature/nixFlake`
- **AND** the export command MUST use `--dir .` to specify the repository root
- **AND** the export command MUST use `--clean` to ensure clean output
- **AND** the export MUST generate a complete static website

### Requirement: OpenSpec UI Workflow Permissions
The OpenSpec UI publishing workflow SHALL have appropriate permissions to deploy to GitHub Pages.

#### Scenario: Workflow has required permissions
- **GIVEN** the OpenSpec UI publishing workflow is defined
- **WHEN** checking workflow permissions
- **THEN** the workflow MUST have contents read permission
- **AND** the workflow MUST have pages write permission
- **AND** the workflow MUST have id-token write permission for attestation

#### Scenario: Workflow uses official GitHub Actions
- **GIVEN** the OpenSpec UI publishing is implemented
- **WHEN** reviewing the workflow definition
- **THEN** the workflow MUST use actions/upload-pages-artifact for artifact upload
- **AND** the workflow MUST use actions/deploy-pages for deployment
- **AND** the workflow MUST use official GitHub Actions where available for better reliability

### Requirement: OpenSpec UI Prerequisites Documentation
The workflow SHALL document prerequisites and configuration requirements for OpenSpec UI publishing.

#### Scenario: Prerequisites documented in workflow comments
- **GIVEN** a developer reviews the workflow file
- **WHEN** reading the OpenSpec UI publishing job
- **THEN** the workflow MUST include comments explaining GitHub Pages setup requirements
- **AND** the comments MUST explain required workflow permissions
- **AND** the comments MUST document the expected GitHub Pages URL format

#### Scenario: README or documentation links to published specs
- **GIVEN** OpenSpec UI is successfully published
- **WHEN** reviewing project documentation
- **THEN** the README or documentation SHOULD include a link to the published OpenSpec UI
- **AND** the link MUST direct users to the correct GitHub Pages URL
- **AND** the documentation SHOULD explain what OpenSpec UI provides
