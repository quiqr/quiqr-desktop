# Change: Add Contributors List to README

## Why
The project should recognize and showcase all contributors who have helped build Quiqr Desktop. A dynamically maintained contributors list in the README provides visibility and appreciation for community contributions while reducing maintenance burden through automation.

## What Changes
- Add a Contributors section at the bottom of README.md with placeholder markers for automated updates
- Create a GitHub Actions workflow (`.github/workflows/contributors.yml`) that automatically updates the contributors list
- The workflow triggers on pushes to main and ng branches, and can be manually triggered
- Uses the `akhilmhdh/contributors-readme-action@v2.3.11` action to fetch contributors from GitHub API and update README

## Impact
- Affected specs: `ci-automation`
- Affected code:
  - `README.md` - Added Contributors section with automation markers
  - `.github/workflows/contributors.yml` - New workflow file for automation
- No breaking changes
