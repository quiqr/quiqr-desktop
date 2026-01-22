## MODIFIED Requirements

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
