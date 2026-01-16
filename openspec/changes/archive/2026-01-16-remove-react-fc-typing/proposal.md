# Change: Remove React.FC Typing Pattern

## Why

The codebase has 9 remaining instances of `React.FC` usage across 3 files, which violates the project convention stated in `openspec/project.md` and the `frontend-components` spec:

> **No React.FC** - Use const with typed props instead

The `React.FC` type has known issues:
- Implicitly includes `children` prop even when not needed
- Makes prop types less explicit and harder to understand
- Deprecated pattern in modern React TypeScript practices
- Inconsistent with the rest of the codebase which uses explicit prop typing

Current violations:
- `frontend/src/components/Accordion.tsx` - 3 components using `React.FC`
- `frontend/src/components/BundleManager.tsx` - 3 components using `React.FC`
- `frontend/src/containers/WorkspaceMounted/Collection/index.tsx` - 3 components using `React.FC`

Additionally, the legacy `HoForm` directory exists with no active usages and should be removed as dead code.

## What Changes

**Remove React.FC from Components:**
- Convert `React.FC<PropsType>` declarations to explicit const with typed props
- Use pattern: `const Component = ({ prop1, prop2 }: PropsType) => { ... }`
- Maintain all existing functionality and prop destructuring
- Keep React.memo() wrapping where it exists

**Remove Dead Code:**
- Delete `frontend/src/components/HoForm/` directory (3 files, 0 usages)
- This is the legacy form system that has been superseded by SukohForm

## Impact

- **Affected specs**: `frontend-components` (enforces existing Component Type Safety requirement)
- **Affected code**:
  - `frontend/src/components/Accordion.tsx` - 3 component type declarations
  - `frontend/src/components/BundleManager.tsx` - 3 component type declarations
  - `frontend/src/containers/WorkspaceMounted/Collection/index.tsx` - 3 component type declarations
  - `frontend/src/components/HoForm/` - Complete directory removal

- **Breaking changes**: None - this is a refactoring that maintains identical runtime behavior
- **Migration complexity**: Low - purely internal type changes, no API changes
