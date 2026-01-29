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

## Release Runbook

Follow these steps when preparing a release:

### Pre-Release Validation

1. **Verify build succeeds**
   ```bash
   npm run build
   ```
   Ensure the build completes without warnings or errors.

### Update CHANGELOG

2. **Update CHANGELOG.md**
   - Set the new version number
   - Set the release date
   - List all changes since the last release
   - If this is a public release, add statistics:
     - New GitHub stars
     - NPM costs/downloads
     - New community templates

### Update Version Numbers

3. **Update package.json**
   - Update the `version` field in `/package.json` to the new version number

### Create Release Commit and Tag

4. **Commit changes**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "release: prepare v[version]"
   ```

5. **Create Git tag**
   ```bash
   git tag v[version]
   ```

6. **Push tag to remote**
   ```bash
   git push --tags
   ```

### Post-Release

After pushing the tag, the GitHub Actions workflow will automatically:
- Build installers for all platforms
- Create a GitHub release
- Attach installers to the release
- Deploy documentation to GitHub Pages at `https://quiqr.github.io/quiqr-desktop/docs/`
- Deploy OpenSpec UI to GitHub Pages at `https://quiqr.github.io/quiqr-desktop/specs/`

### Documentation Updates

For major releases (v0.X.0):
- Ensure all documentation is up to date in `/packages/docs/`
- Add release notes to `/packages/docs/docs/release-notes/`
- Verify documentation builds successfully: `npm run build -w @quiqr/docs`
- Documentation is automatically deployed to GitHub Pages when changes are merged to main

## Best Practices

- **Test before release**: Always run the full build and test locally before tagging
- **CHANGELOG first**: Update the CHANGELOG before committing the version bump
- **Consistent format**: Use the `release: prepare v[version]` commit message format
- **Coordinate major releases**: Major version updates should be coordinated with documentation updates and press releases

## Known Issues

- The GitHub Action that builds the installers creates a broken `.dmg` file due to missing code signing

## Related Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history and detailed change log
- [README.md](./README.md) - Project overview and development setup
