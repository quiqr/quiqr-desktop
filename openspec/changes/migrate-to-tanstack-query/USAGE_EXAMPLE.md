# Usage Example: Migrating a Single Component

This document shows how to use this OpenSpec proposal to migrate a single component in a small, reviewable PR.

## Scenario: You're starting a new Claude session and want to migrate one component

### Step 1: Reference the Spec

In your Claude session, say:

> "I want to implement part of the `migrate-to-tanstack-query` OpenSpec proposal. Specifically, I want to migrate the PrefsAdvanced component."

Claude will:
- Load the OpenSpec proposal
- Understand the requirements and patterns
- Follow the test-first workflow
- Create a small, focused PR

### Step 2: Claude's Workflow

Claude will automatically follow this workflow:

#### 2.1 Check for Tests ⚠️ REQUIRED FIRST
```bash
# Claude checks for existing tests
ls packages/frontend/test/containers/Prefs/PrefsAdvanced.test.ts*

# If no tests exist, Claude will write them FIRST
# Tests cover:
# - Data fetching on mount
# - Loading states
# - Error handling
# - Preference save operations

# Claude runs tests to verify current behavior
cd packages/frontend && npm test -- PrefsAdvanced
```

#### 2.2 Migrate the Component
```typescript
// BEFORE (manual state management)
const [prefs, setPrefs] = useState<UserPreferences>();
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error>();

useEffect(() => {
  service.api.readConfKey('prefs')
    .then(data => { setPrefs(data); setLoading(false); })
    .catch(err => { setError(err); setLoading(false); });
}, []);

// AFTER (TanStack Query)
const { data: prefs, isLoading, error } = useQuery(prefsQueryOptions.all());
```

#### 2.3 Validate
```bash
# Run tests again - they MUST pass
cd packages/frontend && npm test -- PrefsAdvanced

# Type check
cd packages/frontend && npx tsc --noEmit

# Manual test the component
npm run dev
```

#### 2.4 Create PR
Claude will create a commit and PR with:
- Title: `feat(tanstack-query): migrate PrefsAdvanced to TanStack Query`
- Body: References this OpenSpec proposal
- Changes: Tests (if written) + migration
- Size: Small, reviewable in < 30 minutes

### Step 3: Next Component

In your NEXT Claude session, say:

> "I want to continue the `migrate-to-tanstack-query` OpenSpec proposal. What component should I migrate next?"

Claude will:
- Check what's already done (git log, existing code)
- Suggest the next high-priority component
- Follow the same test-first workflow
- Create another small PR

## Benefits of This Approach

### For Reviewers
- **Small PRs**: Each PR is 1-5 components, easy to review
- **Clear Changes**: Tests validate behavior is preserved
- **No Surprises**: All PRs follow same pattern

### For Developers
- **Incremental Progress**: Each session delivers value
- **Low Risk**: Small changes, easy to revert if needed
- **Clear Direction**: Spec provides all patterns and requirements

### For the Project
- **Continuous Integration**: PRs can be merged as they complete
- **No Big Bang**: No risky large refactor
- **Quality**: Test-first ensures no regressions

## Example PR Sequence

Here's how the migration might unfold across multiple PRs:

| PR # | Components | Tests Added | Estimated Review Time |
|------|-----------|-------------|---------------------|
| 1 | Type consolidation | N/A | 15 min |
| 2 | PrefsAdvanced | Yes (3 tests) | 20 min |
| 3 | Workspace.tsx completion | No (has tests) | 15 min |
| 4 | Single.tsx completion | No (has tests) | 15 min |
| 5 | useSiteOperations hook | Yes (5 tests) | 25 min |
| 6 | DeleteSiteDialog, CopySiteDialog | Yes (4 tests) | 30 min |
| 7 | RenameSiteDialog, CreateSiteDialog | Yes (4 tests) | 30 min |
| ... | ... | ... | ... |

**Total PRs**: 15-25 small PRs over several weeks

## Quick Reference Commands

```bash
# Check test coverage
cd packages/frontend && npm test -- --coverage

# Run specific test
cd packages/frontend && npm test -- PrefsAdvanced

# Watch mode during development
cd packages/frontend && npm test -- --watch

# Type check
cd packages/frontend && npx tsc --noEmit

# Start dev environment
npm run dev

# Validate OpenSpec proposal
openspec validate migrate-to-tanstack-query --strict
```

## Common Questions

### Q: Can I skip writing tests?
**A: No.** Tests are not optional. They are the validation mechanism that proves the migration worked.

### Q: What if a component is too complex to test?
**A: Start with basic tests.** Even basic tests (data loads, renders without error) are better than no tests. You can improve test quality in follow-up PRs.

### Q: Can I migrate multiple unrelated components in one PR?
**A: Only if they're related.** For example: All SiteLibrary dialogs in one PR is fine (they're related). PrefsAdvanced + Workspace.tsx in one PR is not fine (unrelated).

### Q: How do I know which component to migrate next?
**A: Follow the tasks.md priority order:**
1. High-priority components (Phase 2-3)
2. Batched components (Phase 4)
3. Check git log to see what's already done

### Q: What if I find issues with the spec?
**A: Update the spec!** OpenSpec proposals are living documents. If you find a better pattern or identify a problem, update the proposal and validate it.

## Pro Tips

1. **Start with tested components**: If you're new to the pattern, start with components that already have tests. Easier to validate.

2. **Use TanStack Query DevTools**: Add DevTools in development to debug cache and queries visually.

3. **Check similar components**: If you're unsure about a pattern, look at already-migrated components (Workspace.tsx, Single.tsx, Collection/index.tsx).

4. **Ask Claude for help**: Reference this spec in any Claude session. Claude understands OpenSpec and will follow the patterns.

5. **Keep commits atomic**: Each commit should be: "Add tests for X" or "Migrate X to TanStack Query". Makes git history clean.

## Success Checklist

Before marking a component as "done":

- [ ] Tests exist (written or pre-existing)
- [ ] Tests pass before migration
- [ ] Component migrated to TanStack Query
- [ ] No manual `useState` for loading/error/data
- [ ] Tests pass after migration
- [ ] TypeScript compiles
- [ ] Manual testing shows no regressions
- [ ] PR created and linked to this OpenSpec
- [ ] PR merged

Then move to the next component!
