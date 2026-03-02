# Proposal: Add Release Script

## Problem

The previous release script was not maintained and has been removed. Releases are now done manually, which leads to:
- Forgotten steps (tagging, pushing tags, creating GitHub releases)
- Inconsistent CHANGELOG formatting
- Risk of releasing with uncommitted changes
- Manual version number management across files
- Version drift between package.json and actual releases (e.g., 0.22.3 vs 0.22.4)

## Solution

Create a custom Node.js release script (`scripts/release.js`) that automates the entire release workflow with interactive prompts and safety checks.

## Scope

### In Scope
- Pre-flight validation (CHANGELOG content, clean git status)
- Interactive version selection (patch/minor/major)
- CHANGELOG.md updates (version header, date, new placeholder)
- package.json and package-lock.json version updates
- Git commit, tag, and push operations
- GitHub release creation via `gh` CLI
- Pre-release vs latest release selection
- Custom release title option
- Dry-run mode for previewing changes

### Out of Scope
- Automated changelog generation from commits (keeping manual entries)
- CI-triggered releases (CI integration already exists)
- npm publishing (not applicable - Electron app)
- Multi-package versioning (monorepo packages are internal)

## Approach

Custom Node.js script using:
- `@inquirer/prompts` - Modern ESM-compatible prompts
- `semver` - Version parsing and comparison (may already be transitive)
- Native `fs` for file operations
- `child_process` for git and gh CLI commands

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Release Script Flow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   1. Pre-flight Checks │
                 ├────────────────────────┤
                 │ • CHANGELOG has items  │
                 │   under "Next Release" │
                 │ • Git working dir clean│
                 └───────────┬────────────┘
                             │ fail? → exit with error
                             ▼
                 ┌────────────────────────┐
                 │  2. Version Selection  │
                 ├────────────────────────┤
                 │ Current: 0.22.4        │
                 │ ┌─────────────────────┐│
                 │ │ ○ 0.22.5 (patch)   ││
                 │ │ ○ 0.23.0 (minor)   ││
                 │ │ ○ 1.0.0  (major)   ││
                 │ └─────────────────────┘│
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │    3. Update Files     │
                 ├────────────────────────┤
                 │ • CHANGELOG.md         │
                 │   - Add version header │
                 │   - New placeholder    │
                 │ • package.json         │
                 │ • package-lock.json    │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │   4. Git Operations    │
                 ├────────────────────────┤
                 │ • git add              │
                 │ • git commit           │
                 │ • git tag vX.Y.Z       │
                 │ • git push             │
                 │ • git push --tags      │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │  5. GitHub Release     │
                 ├────────────────────────┤
                 │ • Pre-release? [y/n]   │
                 │ • Custom title? [y/n]  │
                 │ • Extract release notes│
                 │ • gh release create    │
                 └───────────┬────────────┘
                             │
                             ▼
                        ┌─────────┐
                        │  Done!  │
                        └─────────┘
```

## Requirements

### Commit Message Format
Git commits created by this script must:
- Use minimal, factual commit messages (e.g., "Release 0.22.5")
- Use the git user configured on the system (whoever runs the script)
- NOT include AI attribution, co-author tags, or tool signatures
- NOT include unnecessary metadata or decorations

### Dependencies

New dev dependencies:
- `@inquirer/prompts` - Modern ESM-compatible prompts
- `semver` - Version parsing and comparison (may already be transitive)

## Usage

```bash
# Normal release
npm run release

# Preview without making changes
npm run release -- --dry-run
```

## Success Criteria

- [ ] Script validates CHANGELOG has content under "## Next Release"
- [ ] Script fails if git working directory is not clean
- [ ] User can select patch/minor/major version bump
- [ ] CHANGELOG.md is correctly updated with version and date
- [ ] package.json and package-lock.json versions are updated
- [ ] Git commit is created with minimal message "Release X.Y.Z"
- [ ] Git commit uses system git user (no AI attribution)
- [ ] Git tag vX.Y.Z is created
- [ ] Changes are pushed to remote
- [ ] GitHub release is created with correct notes
- [ ] Dry-run mode shows what would happen without making changes
