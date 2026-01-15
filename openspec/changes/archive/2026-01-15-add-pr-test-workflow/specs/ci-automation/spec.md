## ADDED Requirements

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
- **THEN** it MUST use Node.js version 20.x or higher
- **AND** it MUST cache npm dependencies for faster runs
- **AND** it MUST install dependencies in the frontend workspace

#### Scenario: Run tests in CI environment
- **GIVEN** the workflow environment is set up
- **WHEN** running tests
- **THEN** it MUST execute `cd frontend && npm test`
- **AND** it MUST capture test output for GitHub display
- **AND** it MUST fail the workflow if tests exit with non-zero code

#### Scenario: Run type checking
- **GIVEN** the workflow is running tests
- **WHEN** checking code quality
- **THEN** it MUST execute `cd frontend && npx tsc --noEmit`
- **AND** it MUST report type errors if any exist
- **AND** type errors SHOULD fail the workflow (configurable)
