# Change: Add Release Documentation

## Why

The project's release process and versioning policy are currently scattered between README.md and tribal knowledge. Consolidating this information into a dedicated RELEASE.md file will:

- Provide a single source of truth for release procedures
- Document the semantic versioning policy for the 0.x.x series
- Make the release process more accessible to contributors
- Reduce clutter in README.md by moving technical process documentation

## What Changes

- Create new `RELEASE.md` file at project root
- Move "Release Runbook" section from `README.md` to `RELEASE.md`
- Add semantic versioning policy documentation specific to Quiqr's pre-1.0 strategy
- Explain the relationship between version numbers and documentation websites
- Update `README.md` to reference `RELEASE.md` for release information

## Impact

- Affected specs: `documentation`
- Affected code:
  - `/README.md` - Remove release runbook section, add reference to RELEASE.md
  - `/RELEASE.md` - New file to be created
- Users/contributors will have clearer guidance on the release process
- No code changes required - documentation only
