# Change: Refactor Debounce Utilities to Functional Pattern

## Why

The frontend currently has two nearly identical class-based debounce implementations:
- `frontend/src/utils/debounce.ts` - Takes duration in constructor
- `frontend/src/components/HoForm/debounce.ts` - Takes time as parameter to `run()`

This creates duplication and violates the project's goal of moving towards fully functional TypeScript for all frontend code. The HoForm version is unused and can be removed. The utils version is only used in one location (Collection component).

## What Changes

- Convert the class-based Debounce utility to a functional hook pattern (`useDebounce`)
- Consolidate both implementations into a single functional utility
- Remove the unused HoForm debounce class
- Update the Collection component to use the new functional debounce
- Add comprehensive automated tests using vitest to ensure correct debounce behavior

## Impact

- **Affected specs**: `frontend-components` (extends Utility Module Pattern requirement)
- **Affected code**:
  - `frontend/src/utils/debounce.ts` - Complete rewrite from class to function
  - `frontend/src/components/HoForm/debounce.ts` - Will be removed (unused)
  - `frontend/src/containers/WorkspaceMounted/Collection/index.tsx:239,488,522` - Update to use new API
  - `frontend/test/utils/` - New test file for debounce utility

- **Breaking change**: The API changes from `new Debounce(ms)` → `debounce.run(fn)` to a functional approach
- **Migration**: Only one component (Collection) needs updating
