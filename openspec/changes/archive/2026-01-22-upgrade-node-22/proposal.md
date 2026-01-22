# Change: Upgrade Node.js to version 22 in GitHub Actions

## Why

GitHub issue #606 requests upgrading Node.js in GitHub Actions workflows to version 22, which is preferred over the current version 20. Node.js 22 is the latest LTS (Long Term Support) version that provides:

- Improved performance and stability
- Latest security patches and bug fixes
- Better support for modern JavaScript features
- Alignment with current ecosystem standards

The test workflow currently uses Node.js 20.x, while the build workflow uses Node.js 18 (in matrix strategy). Upgrading to Node.js 22 ensures consistency and keeps the CI environment up-to-date with current best practices.

## What Changes

- Update test workflow (`.github/workflows/test.yml`) from Node.js 20.x to 22.x
- Update build workflow (`.github/workflows/build.yml`) from Node.js 18 to 22 in the matrix strategy
- Update CI automation specification to reflect Node.js 22.x requirement
- Verify compatibility with existing npm dependencies and build processes

## Impact

- Affected specs: `ci-automation`
- Affected code: 
  - `.github/workflows/test.yml` (line 30)
  - `.github/workflows/build.yml` (line 18, matrix configuration)
- Risk: Low - Node.js 22 maintains backward compatibility with code targeting Node.js 18/20
- Testing: All existing tests will run on the new Node.js version to verify compatibility
