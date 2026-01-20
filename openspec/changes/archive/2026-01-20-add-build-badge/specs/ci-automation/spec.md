## ADDED Requirements

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
