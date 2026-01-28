# ci-automation Specification

## Purpose
Defines automated continuous integration (CI) testing requirements for pull requests. Ensures code quality through automated test execution and type checking before code is merged into main or ng branches. Enables local workflow testing using the act tool to validate changes before pushing to GitHub.
## Requirements
### Requirement: Automated PR Testing
Pull requests to the main or ng (Next Generation) branches SHALL trigger automated tests to validate code quality before merging.

#### Scenario: Tests run on pull request
- **GIVEN** a pull request is opened or updated targeting the main or ng branch
- **WHEN** the pull request is submitted
- **THEN** a GitHub Actions workflow MUST automatically trigger
- **AND** the workflow MUST run all frontend tests using vitest
- **AND** the workflow MUST run TypeScript type checking
- **AND** the PR status checks MUST show pass/fail results

#### Scenario: All tests must pass to merge
- **GIVEN** a pull request with automated tests running
- **WHEN** any test fails
- **THEN** the PR status check MUST show as failed
- **AND** the PR SHOULD be blocked from merging until tests pass

#### Scenario: Fast feedback on test failures
- **GIVEN** a pull request with failing tests
- **WHEN** viewing the PR checks
- **THEN** the test results MUST be visible within 5 minutes of submission
- **AND** the failure details MUST be accessible in the workflow logs
- **AND** the logs MUST clearly indicate which tests failed

### Requirement: Local Workflow Testing
Developers SHALL be able to test GitHub Actions workflows locally before pushing.

#### Scenario: Test workflow with act tool
- **GIVEN** a developer has made changes to the test workflow
- **WHEN** they run `act pull_request` locally
- **THEN** the workflow MUST execute in a local container
- **AND** the workflow MUST produce the same results as GitHub Actions
- **AND** any failures MUST be visible in the local output

#### Scenario: Validate workflow syntax
- **GIVEN** a developer edits a workflow file
- **WHEN** they test locally with act
- **THEN** syntax errors MUST be caught before pushing to GitHub
- **AND** the developer MUST receive clear error messages

### Requirement: Test Workflow Configuration
The test workflow SHALL use consistent Node.js versions and dependencies.

#### Scenario: Use project Node.js version
- **GIVEN** the test workflow is running
- **WHEN** setting up the environment
- **THEN** it MUST use Node.js version 22.x
- **AND** it MUST cache npm dependencies for faster runs
- **AND** it MUST install dependencies in the frontend workspace

#### Scenario: Run tests in CI environment
- **GIVEN** the workflow environment is set up
- **WHEN** running tests
- **THEN** it MUST execute `cd packages/frontend && npm test`
- **AND** it MUST capture test output for GitHub display
- **AND** it MUST fail the workflow if tests exit with non-zero code

#### Scenario: Run type checking
- **GIVEN** the workflow is running tests
- **WHEN** checking code quality
- **THEN** it MUST execute `cd packages/frontend && npx tsc --noEmit`
- **AND** it MUST report type errors if any exist
- **AND** type errors SHOULD fail the workflow (configurable)

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

### Requirement: Code Coverage Badge
The project SHALL display a code coverage badge in the README on the ng branch that automatically updates when code is pushed to the ng branch.

#### Scenario: Coverage badge displays in README on ng branch
- **GIVEN** the README.md file on the ng branch
- **WHEN** viewing the repository ng branch on GitHub
- **THEN** a coverage badge MUST be visible at the top of the README
- **AND** the badge MUST show the current code coverage percentage for the ng branch
- **AND** the badge MUST be clickable and link to GitHub Actions
- **AND** the badge MUST NOT appear in the main branch README

#### Scenario: Badge updates automatically on push to ng
- **GIVEN** code is pushed to the ng branch
- **WHEN** the test workflow completes successfully
- **THEN** the coverage badge MUST be automatically regenerated
- **AND** the badge SVG MUST be committed to the gh-pages branch
- **AND** the badge MUST reflect the latest coverage from the ng branch push
- **AND** the badge update MUST complete within 2 minutes of workflow completion
- **AND** pushes to main branch MUST NOT update the badge

#### Scenario: Badge shows accurate coverage
- **GIVEN** the frontend package has test coverage
- **WHEN** tests run with coverage enabled on ng branch
- **THEN** vitest MUST generate a coverage-summary.json file
- **AND** the badge action MUST read the coverage percentage from the JSON
- **AND** the badge MUST display the percentage rounded to nearest integer
- **AND** the badge color MUST indicate coverage level (red <50%, yellow 50-80%, green >80%)

#### Scenario: Badge hosted on GitHub Pages
- **GIVEN** the repository has GitHub Pages enabled
- **WHEN** the badge is generated
- **THEN** the badge SVG MUST be stored in the gh-pages branch at `badges/coverage.svg`
- **AND** the badge MUST be accessible at `https://<user>.github.io/<repo>/badges/coverage.svg`
- **AND** GitHub Pages MUST serve the badge with proper content-type headers

#### Scenario: Badge updates only on ng branch
- **GIVEN** a pull request is opened with test changes
- **WHEN** the PR workflow runs tests
- **THEN** the badge update step MUST be skipped for PR builds
- **AND** the badge update step MUST only run on pushes to ng branch
- **AND** the badge update step MUST NOT run on pushes to main branch
- **AND** the branch condition MUST use: `if: github.ref == 'refs/heads/ng'`

#### Scenario: Prerequisites are documented
- **GIVEN** a developer wants to enable the coverage badge
- **WHEN** reviewing the workflow file
- **THEN** the workflow MUST include comments explaining gh-pages setup
- **AND** the comments MUST explain the required workflow permissions
- **AND** the README or documentation MUST link to GitHub Pages setup instructions

### Requirement: Build Status Badge

The project SHALL display a build status badge in the README that shows the pass/fail status of the test workflow and automatically updates when tests run.

#### Scenario: Build status badge displays in README

- **GIVEN** the README.md file in the repository root
- **WHEN** viewing the repository on GitHub
- **THEN** a build status badge MUST be visible near the top of the README
- **AND** the badge MUST show the current status of the "Test Pull Request" workflow
- **AND** the badge MUST display "passing" when tests pass or "failing" when tests fail
- **AND** the badge MUST be clickable and link to the workflow runs page

#### Scenario: Badge updates automatically on workflow completion

- **GIVEN** the test workflow runs on a pull request or push
- **WHEN** the workflow completes with pass or fail status
- **THEN** the build status badge MUST automatically reflect the latest status
- **AND** the badge MUST update within 1 minute of workflow completion
- **AND** the badge MUST accurately represent the workflow outcome

#### Scenario: Badge shows workflow status

- **GIVEN** the build status badge is displayed
- **WHEN** a user views or clicks the badge
- **THEN** the badge MUST indicate the status of the test.yml workflow
- **AND** clicking the badge MUST navigate to https://github.com/{owner}/{repo}/actions/workflows/test.yml
- **AND** the badge MUST use the standard GitHub Actions badge format

#### Scenario: Badge placement is consistent with other badges

- **GIVEN** the README contains a code coverage badge
- **WHEN** viewing the badges section
- **THEN** the build status badge MUST be placed in the same centered paragraph as the coverage badge
- **AND** the badges MUST be visually aligned and consistent in style

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

