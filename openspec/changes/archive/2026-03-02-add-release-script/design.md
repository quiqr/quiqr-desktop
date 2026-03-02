# Design: Add Release Script

## Context

Quiqr Desktop releases are currently done manually, which has led to missed steps and version drift (e.g., package.json showed 0.22.3 when the actual release was 0.22.4). The project needs an automated release script that enforces consistency while remaining simple and maintainable.

The project already has:
- A `scripts/` directory with Node.js utility scripts
- A `CHANGELOG.md` with a `## Next Release` placeholder pattern
- GitHub Actions CI that builds and publishes releases on tags
- The `gh` CLI for GitHub operations

### Stakeholders
- **Release managers**: Need reliable, repeatable release process
- **Contributors**: Need clear changelog format to follow
- **Users**: Benefit from consistent release notes on GitHub

### Constraints
- Must use the existing CHANGELOG format (manual entries, not auto-generated)
- Commits must use system git user, no AI attribution or co-author tags
- Must work on developer machines (not CI-triggered)
- Should fit existing patterns in `scripts/` directory

## Goals / Non-Goals

### Goals
- Automate the complete release workflow from version bump to GitHub release
- Prevent common mistakes (releasing with dirty working directory, empty changelog)
- Support dry-run mode for safe previewing
- Keep the script simple and maintainable (single file, minimal dependencies)

### Non-Goals
- Auto-generating changelog from commits (manual entries preferred)
- CI-triggered releases (existing CI handles build/publish on tags)
- npm package publishing (Electron app, not npm package)
- Monorepo package versioning (internal packages follow root version)

## Decisions

### Decision 1: Single JavaScript File with Minimal Dependencies
**Choice**: Create `scripts/release.js` as a single CommonJS file using only `@inquirer/prompts` and `semver` as external dependencies.

**Rationale**:
- Matches existing scripts in `scripts/` directory (all `.js` files)
- CommonJS works without additional build configuration
- Two focused dependencies vs. a large framework like `release-it`
- Easy to understand and maintain

**Alternatives considered**:
- TypeScript: Would require build step or `tsx` runner
- `release-it`: Overkill for this use case, harder to customize
- Bash script: Harder to parse JSON/CHANGELOG, less portable

### Decision 2: Explicit Pre-flight Checks with Clear Error Messages
**Choice**: Validate CHANGELOG content and git status before any prompts, with specific error messages.

**Rationale**:
- Fail fast before user spends time answering prompts
- Clear error messages help users fix issues quickly
- Prevents accidental releases with uncommitted changes

**Checks**:
1. CHANGELOG.md has content under `## Next Release` (not just the header)
2. `git status --porcelain` returns empty (working directory clean)

### Decision 3: Semver-based Version Selection Menu
**Choice**: Show three options based on current version: patch, minor, major.

**Rationale**:
- Covers all standard version bump scenarios
- Uses `semver` package for reliable version calculation
- Simple menu prevents typos in version numbers

**Example menu**:
```
Current version: 0.22.4
Select new version:
  ○ 0.22.5 (patch)
  ○ 0.23.0 (minor)
  ○ 1.0.0 (major)
```

### Decision 4: In-place File Updates with String Manipulation
**Choice**: Read files, manipulate strings, write back. No AST parsing.

**Rationale**:
- CHANGELOG format is simple enough for string replacement
- `package.json` version field is easy to update via JSON parse/stringify
- `package-lock.json` has lockfileVersion that must be preserved

**File updates**:
1. **CHANGELOG.md**: Replace `## Next Release\n` with `## Next Release\n\n## X.Y.Z (YYYY-MM-DD)\n`
2. **package.json**: Parse JSON, update `version` field, stringify with 2-space indent
3. **package-lock.json**: Parse JSON, update `version` and `packages[""].version`, stringify with 2-space indent

### Decision 5: Minimal Commit Messages Without Attribution
**Choice**: Use simple commit message format `Release X.Y.Z` with no additional metadata.

**Rationale**:
- User explicitly requested no AI attribution or co-author tags
- Minimal message is clear and professional
- System git user (from `~/.gitconfig`) is the author

**Git operations**:
```bash
git add CHANGELOG.md package.json package-lock.json
git commit -m "Release 0.22.5"
git tag v0.22.5
git push
git push --tags
```

### Decision 6: GitHub Release via `gh` CLI with Interactive Options
**Choice**: Use `gh release create` with prompts for pre-release status and title.

**Rationale**:
- `gh` CLI is widely available and well-documented
- Interactive prompts allow flexibility per release
- Release notes extracted from CHANGELOG automatically

**Prompts**:
1. "Is this a pre-release?" (yes/no)
2. "Use default title 'vX.Y.Z' or enter custom title?"

**Command**:
```bash
gh release create vX.Y.Z --title "..." --notes "..." [--prerelease]
```

### Decision 7: Dry-run Mode via `--dry-run` Flag
**Choice**: Support `--dry-run` flag that shows all actions without executing them.

**Rationale**:
- Safe way to preview what will happen
- Useful for testing script changes
- Shows exact commands that would be run

**Behavior in dry-run**:
- Performs all validation checks (real)
- Shows version selection (real)
- Prints file changes that would be made (no write)
- Prints git commands that would be run (no execute)
- Prints gh command that would be run (no execute)

## Implementation Details

### Script Structure
```
scripts/release.js
├── Constants
│   ├── CHANGELOG_PATH
│   ├── PACKAGE_JSON_PATH
│   └── PACKAGE_LOCK_PATH
├── Utility Functions
│   ├── exec(cmd) - Run shell command, return stdout
│   ├── readFile(path) - Read file contents
│   └── writeFile(path, content) - Write file contents
├── Validation Functions
│   ├── checkChangelogHasContent() - Parse and validate CHANGELOG
│   └── checkGitClean() - Verify working directory clean
├── File Update Functions
│   ├── updateChangelog(version, date) - Update CHANGELOG.md
│   ├── updatePackageJson(version) - Update package.json
│   └── updatePackageLock(version) - Update package-lock.json
├── Git Functions
│   ├── commitRelease(version) - Stage, commit, tag
│   └── pushRelease() - Push commits and tags
├── GitHub Functions
│   └── createGitHubRelease(version, notes, options) - Create release
└── Main Function
    └── main() - Orchestrate the release flow
```

### CHANGELOG Parsing
Extract content between `## Next Release` and the next `## X.Y.Z` header:
```javascript
const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
const nextReleaseMatch = changelogContent.match(
  /## Next Release\n([\s\S]*?)(?=\n## \d|$)/
);
const releaseNotes = nextReleaseMatch?.[1]?.trim();
if (!releaseNotes) {
  console.error('Error: No content under "## Next Release"');
  process.exit(1);
}
```

### Package.json Update
```javascript
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
```

### Package-lock.json Update
```javascript
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8'));
lock.version = newVersion;
if (lock.packages && lock.packages['']) {
  lock.packages[''].version = newVersion;
}
fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
```

### npm Script
```json
{
  "scripts": {
    "release": "node scripts/release.js"
  }
}
```

## Risks / Trade-offs

### Risk 1: CHANGELOG Format Changes
**Impact**: If someone changes the `## Next Release` format, the script will fail.
**Mitigation**: Clear error message explaining expected format. Document format in script comments.

### Risk 2: Git Push Failures
**Impact**: If push fails (e.g., branch protection, network), release is partially complete.
**Mitigation**:
- All local changes (commit, tag) happen before push
- User can manually retry push if needed
- Dry-run mode helps catch issues beforehand

### Risk 3: `gh` CLI Not Installed
**Impact**: Script fails at GitHub release creation step.
**Mitigation**: Check for `gh` availability early and provide installation instructions in error message.

### Risk 4: Package-lock.json Format Changes
**Impact**: npm occasionally changes lockfile format between major versions.
**Mitigation**: Simple JSON parse/stringify preserves format. Only update known version fields.

## Open Questions

1. **Should we verify `gh auth status` before starting?**
   - **Answer**: Yes, add early check to fail fast if not authenticated.

2. **Should we support custom version input (not just patch/minor/major)?**
   - **Answer**: No, keep it simple. Three options cover standard use cases.

3. **Should we run tests before releasing?**
   - **Answer**: No, that's the user's responsibility. Script focuses on release mechanics.
