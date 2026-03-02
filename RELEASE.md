# Release Guide

This document describes the release process, versioning policy, and procedures for Quiqr Desktop.

## Semantic Versioning Policy

Quiqr Desktop follows a semantic versioning policy adapted for pre-1.0 development:

### Version Number Format

- **`Quiqr v[future-major].0.0`** - Reserved for post-1.0 releases (not currently used)
- **`Quiqr v0.[major].0`** - Major version update
  - Includes significant new features or improvements
  - May include breaking changes
  - Accompanied by public press release
  - Will have dedicated documentation website
- **`Quiqr v0.0.[minor]`** - Minor version update
  - Small changes and enhancements
  - Bug fixes
  - No breaking changes expected

### Version Numbering and Documentation

Major versions (v0.X.0) will each have their own documentation website. This allows users to access version-specific documentation and ensures that breaking changes between major versions are clearly documented.

Currently, we remain on the 0.x.x series until the project reaches sufficient maturity for a 1.0.0 release.

## Release Script

The release process is automated via `npm run release`. The script handles:

- Validating CHANGELOG.md has content under "## Next Release"
- Verifying the git working directory is clean
- Interactive version selection (patch/minor/major)
- Updating CHANGELOG.md with version header and date
- Updating package.json and package-lock.json versions
- Creating git commit and tag
- Pushing to remote
- Creating GitHub release with release notes

### Usage

```bash
# Run the release script
npm run release

# Preview what would happen (no changes made)
npm run release -- --dry-run
```

### Prerequisites

- `gh` CLI must be installed and authenticated (`gh auth login`)
- Working directory must be clean (no uncommitted changes)
- CHANGELOG.md must have content under "## Next Release"

## Release Runbook

### 1. Pre-Release Validation

Before releasing, verify the build succeeds:

```bash
npm run build
```

Ensure the build completes without warnings or errors.

### 2. Update CHANGELOG

Add your changes under the `## Next Release` section in CHANGELOG.md:

```markdown
## Next Release
- feature: description of new feature
- fix: description of bug fix
- chore: description of maintenance task
```

For major public releases, consider adding statistics:
- New GitHub stars
- NPM costs/downloads
- New community templates

### 3. Run the Release Script

```bash
npm run release
```

The script will:
1. Validate prerequisites
2. Prompt for version bump type (patch/minor/major)
3. Update all version files
4. Create commit with message "Release X.Y.Z"
5. Create git tag vX.Y.Z
6. Push commits and tags
7. Prompt for pre-release status and title
8. Create GitHub release

### 4. Post-Release

After the release script completes, GitHub Actions will automatically:
- Build installers for all platforms
- Attach installers to the GitHub release
- Deploy documentation to GitHub Pages at `https://quiqr.github.io/quiqr-desktop/docs/`
- Deploy OpenSpec UI to GitHub Pages at `https://quiqr.github.io/quiqr-desktop/specs/`

### Documentation Updates (Major Releases)

For major releases (v0.X.0):
- Ensure all documentation is up to date in `/packages/docs/`
- Add release notes to `/packages/docs/docs/release-notes/`
- Verify documentation builds successfully: `npm run build -w @quiqr/docs`
- Documentation is automatically deployed to GitHub Pages when changes are merged to main

## Best Practices

- **Test before release**: Always run the full build and test locally before releasing
- **CHANGELOG first**: Add your changes to CHANGELOG.md before running the release script
- **Use dry-run**: Preview the release with `npm run release -- --dry-run` before committing
- **Coordinate major releases**: Major version updates should be coordinated with documentation updates and press releases

## Known Issues

- The GitHub Action that builds the installers creates a broken `.dmg` file due to missing code signing

## Related Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history and detailed change log
- [README.md](./README.md) - Project overview and development setup
