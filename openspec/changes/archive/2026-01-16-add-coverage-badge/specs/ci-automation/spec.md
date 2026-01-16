# ci-automation Specification Delta

## ADDED Requirements

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
