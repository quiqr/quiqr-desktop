# Glob Package Upgrade Guide

## Current Status

**Current Version:** `glob@^10.x.x`
**Target Version:** TBD (latest stable)

## Test Coverage Summary

We have created comprehensive tests covering all glob usage patterns in the backend codebase. The test suite includes **27 test cases** covering **11 distinct usage patterns**.

### Test Results (Before Upgrade)

```
✓ All 27 tests passing with glob@^10.x.x
✓ Test execution time: ~108ms
✓ No errors or warnings
```

## Usage Patterns Tested

### 1. **Config File Discovery** (`configuration-data-provider.ts`)
- **Pattern:** `sites/*/config.json` and `config.*.json`
- **Type:** Async glob
- **Tests:** 3 test cases
- **Use Case:** Finding site configuration files in both new and legacy locations

### 2. **Screenshot and Favicon Discovery** (`configuration-data-provider.ts`)
- **Pattern:** `*.{png,jpg,jpeg,gif}` and `*.{png,jpg,jpeg,gif,ico}`
- **Type:** Sync glob (`glob.sync`)
- **Tests:** 2 test cases
- **Use Case:** Finding showcase images for site library

### 3. **Hugo Tar File Discovery** (`hugo-downloader.ts`)
- **Pattern:** String replacement for extracted archives
- **Type:** Sync glob (`globSync`)
- **Tests:** 1 test case
- **Use Case:** Finding extracted Hugo binaries after unpacking

### 4. **Workspace Config Discovery** (`workspace-config-provider.ts`)
- **Pattern:** `base.{yaml,yml,json,toml}` and `sukoh.{yaml,yml,json,toml}`
- **Type:** Sync glob (`glob.sync`)
- **Tests:** 2 test cases
- **Use Case:** Finding workspace configuration in multiple formats

### 5. **Include Files Discovery** (`workspace-config-provider.ts`)
- **Pattern:** Multiple patterns for includes, singles, collections, menus
- **Type:** Sync glob (`glob.sync`)
- **Tests:** 4 test cases
- **Use Case:** Loading model includes from various directories

### 6. **Partial Files Discovery** (`workspace-config-provider.ts`)
- **Pattern:** `partials/{name}.{yaml,yml,json,toml}`
- **Type:** Sync glob (`glob.sync`)
- **Tests:** 1 test case
- **Use Case:** Finding reusable model partials

### 7. **Bundle Resources** (`workspace-service.ts`)
- **Pattern:** `*` and `targetPath/*` with options
- **Type:** Async glob with options (`nodir: true, absolute: false, cwd: directory`)
- **Tests:** 3 test cases
- **Use Case:** Getting resource files from content bundles

### 8. **Collection Items** (`workspace-service.ts`)
- **Pattern:** Complex patterns with `**/*.{md,html,markdown,qmd}` and negations
- **Type:** Async glob
- **Tests:** 3 test cases
- **Use Case:** Listing content files in collections with optional subdirectories

### 9. **Data Files** (`workspace-service.ts`)
- **Pattern:** `**/*.{yaml,yml,json,toml}`
- **Type:** Async glob
- **Tests:** 1 test case
- **Use Case:** Finding data files recursively

### 10. **Glob Job Generic Wrapper** (`glob-job.ts`)
- **Pattern:** Generic with custom options
- **Type:** Async glob
- **Tests:** 2 test cases
- **Use Case:** Reusable glob functionality

### 11. **GlobSync Handler** (`workspace-handlers.ts`)
- **Pattern:** Pattern with custom `cwd` option
- **Type:** Sync glob (`globSync`)
- **Tests:** 1 test case
- **Use Case:** API handler for frontend glob requests

### Edge Cases and Cross-Platform
- **Tests:** 3 test cases
- **Coverage:** Windows path conversion, empty results, missing directories

### Performance
- **Tests:** 1 test case
- **Coverage:** Large directory structures (100+ files)

## Files Using Glob

1. `src/jobs/glob-job.ts` - Generic glob wrapper
2. `src/services/configuration/configuration-data-provider.ts` - Site config discovery
3. `src/hugo/hugo-downloader.ts` - Hugo binary extraction
4. `src/services/workspace/workspace-service.ts` - Workspace file operations
5. `src/services/workspace/workspace-config-provider.ts` - Config loading
6. `src/api/handlers/workspace-handlers.ts` - API handlers

## Upgrade Process

### Step 1: Run Tests Before Upgrade ✅
```bash
cd packages/backend
npm test glob-patterns.test.ts
```
**Expected:** All 27 tests should pass.

### Step 2: Check Latest Glob Version
```bash
npm view glob version
npm view glob versions --json
```

### Step 3: Update Package Version
```bash
cd packages/backend
npm install glob@latest
```

### Step 4: Run Tests After Upgrade
```bash
npm test glob-patterns.test.ts
```
**Expected:** All 27 tests should still pass.

### Step 5: Run Full Test Suite
```bash
npm test
```

### Step 6: Check for Breaking Changes
Review the glob changelog for any breaking changes between versions:
- https://github.com/isaacs/node-glob/blob/main/changelog.md

## Known Compatibility Concerns

### Glob 10.x → 11.x Potential Changes
1. **Import syntax changes** - May need to update import statements
2. **Option names** - Some options might be renamed or deprecated
3. **Return type changes** - Verify async vs sync behavior
4. **Pattern syntax** - Ensure all patterns still work as expected

### Critical Patterns to Verify After Upgrade
1. ✓ Multi-extension patterns: `*.{ext1,ext2,ext3}`
2. ✓ Negation patterns: `!(_index).md`
3. ✓ Subdirectory patterns: `**/*`
4. ✓ Options: `nodir`, `absolute`, `cwd`, `ignore`
5. ✓ Sync vs Async: Both `glob()` and `globSync()` usage

## Rollback Plan

If tests fail after upgrade:

```bash
# Rollback to previous version
cd packages/backend
npm install glob@^10.x.x

# Verify tests pass again
npm test glob-patterns.test.ts
```

## Testing Checklist

Before merging the upgrade:

- [ ] All glob-patterns tests pass
- [ ] Full backend test suite passes
- [ ] Manual testing of:
  - [ ] Site library loading (config discovery)
  - [ ] Workspace mounting (config loading)
  - [ ] Collection item listing
  - [ ] Bundle resource management
  - [ ] Hugo installation (tar extraction)
  - [ ] Screenshot generation (image discovery)

## References

- Glob GitHub: https://github.com/isaacs/node-glob
- Glob NPM: https://www.npmjs.com/package/glob
- Glob Changelog: https://github.com/isaacs/node-glob/blob/main/changelog.md

## Notes

- Current glob version uses named imports: `import { glob, globSync } from 'glob'`
- All paths are normalized for cross-platform compatibility using `.replace(/\\/g, '/')`
- Tests use real file system operations in temp directories
- Tests clean up after themselves using `beforeEach` and `afterEach` hooks
