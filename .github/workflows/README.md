# GitHub Actions Workflows

This directory contains automated workflows for the Quiqr Desktop project.

## Workflows

### test.yml - Pull Request Testing
**Purpose**: Automatically run tests on pull requests to ensure code quality before merging.

**Triggers**:
- Pull requests targeting `main` branch
- Manual dispatch via GitHub UI

**What it does**:
1. Checks out the repository code
2. Sets up Node.js 18.x with npm caching
3. Installs dependencies (root and frontend)
4. Runs frontend tests using vitest
5. Runs TypeScript type checking (non-blocking)

**Notes**:
- Type checking uses `continue-on-error: true` because there are pre-existing type errors
- Once all type errors are fixed, remove `continue-on-error` to make it blocking
- Test results appear in PR status checks within ~5 minutes

### build.yml - Release Builds
**Purpose**: Build and publish Electron app releases when version tags are pushed.

**Triggers**:
- Tags matching `v*` pattern (e.g., `v0.21.6`)

**What it does**:
- Builds the app for Windows, macOS, and Linux
- Creates GitHub releases with installers attached

## Testing Workflows Locally

You can test workflows locally using [act](https://nektosact.com/):

```bash
# List all workflows for pull_request events
act pull_request --list

# Dry run (show what would happen)
act pull_request -n

# Run the workflow locally (requires Docker)
act pull_request
```

See `openspec/project.md` for more details on local testing.

## Adding New Workflows

When adding new workflows:
1. Create a `.yml` file in this directory
2. Add clear comments explaining each step
3. Test locally with `act` before committing
4. Update this README with the new workflow details
5. Document any new triggers or environment requirements
