# Implementation Tasks

## 1. Setup
- [x] 1.1 Install dependencies: `npm install --save-dev @inquirer/prompts semver`
- [x] 1.2 Add `"release": "node scripts/release.js"` to package.json scripts
- [x] 1.3 Create `scripts/release.js` with basic structure and imports

## 2. Validation Functions
- [x] 2.1 Implement `checkGhCli()` - verify `gh` is installed and authenticated
- [x] 2.2 Implement `checkGitClean()` - verify working directory is clean via `git status --porcelain`
- [x] 2.3 Implement `checkChangelogHasContent()` - parse CHANGELOG.md and verify content under `## Next Release`
- [x] 2.4 Add clear error messages for each validation failure

## 3. Version Selection
- [x] 3.1 Read current version from package.json
- [x] 3.2 Calculate patch, minor, major version options using `semver`
- [x] 3.3 Implement interactive version selection prompt using `@inquirer/prompts`

## 4. File Updates
- [x] 4.1 Implement `updateChangelog(version, date)` - insert version header, add new placeholder
- [x] 4.2 Implement `updatePackageJson(version)` - update version field
- [x] 4.3 Implement `updatePackageLock(version)` - update version and packages[""].version

## 5. Git Operations
- [x] 5.1 Implement `commitRelease(version)` - stage files, commit with message "Release X.Y.Z"
- [x] 5.2 Implement `tagRelease(version)` - create tag vX.Y.Z
- [x] 5.3 Implement `pushRelease()` - push commits and tags to remote

## 6. GitHub Release
- [x] 6.1 Implement `extractReleaseNotes()` - get content for the new version from CHANGELOG
- [x] 6.2 Add prompt for pre-release vs latest release
- [x] 6.3 Add prompt for custom title or default (vX.Y.Z)
- [x] 6.4 Implement `createGitHubRelease(version, notes, options)` using `gh release create`

## 7. Dry-run Mode
- [x] 7.1 Parse `--dry-run` flag from process.argv
- [x] 7.2 Add dry-run checks to all write operations (skip actual writes, print instead)
- [x] 7.3 Add dry-run checks to all shell commands (skip execution, print instead)

## 8. Main Flow Integration
- [x] 8.1 Wire up all functions in correct order in `main()`
- [x] 8.2 Add progress output (e.g., "Updating CHANGELOG.md...", "Creating git tag...")
- [x] 8.3 Add final success message with release URL

## 9. Testing and Verification
- [x] 9.1 Run `npm run release -- --dry-run` to verify script flow
- [x] 9.2 Verify error handling when CHANGELOG has no content under Next Release
- [x] 9.3 Verify error handling when git working directory is dirty
- [x] 9.4 Verify error handling when `gh` is not authenticated
- [ ] 9.5 Test actual release on a test branch (optional)
