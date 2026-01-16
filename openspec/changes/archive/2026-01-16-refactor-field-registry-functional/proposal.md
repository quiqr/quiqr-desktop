# Change: Refactor FieldRegistry to Functional Module

## Why

The `FieldRegistry.ts` module currently uses a class-based singleton pattern that is inconsistent with the project's modern functional architecture. Recent refactorings have converted both `main-process-bridge.ts` and `api.ts` from class-based to functional exports, establishing a clear pattern for stateless utility modules.

Current pattern (class-based):
```typescript
class FieldRegistry {
  private components: Map<string, FieldImporter> = new Map();
  register(type: string, importer: FieldImporter): this { ... }
  get(type: string): FieldImporter { ... }
}
export const fieldRegistry = new FieldRegistry();
```

The class-based singleton pattern has several drawbacks:
- Unnecessary OOP ceremony for what is essentially a module-level registry
- Mutable private state makes testing and reasoning about behavior harder
- Instance methods require `this` binding
- Inconsistent with the project's functional utility module pattern

This refactoring will align FieldRegistry with the established pattern from previous refactorings while maintaining complete backward compatibility.

## What Changes

**Convert Class to Functional Module:**
- Replace `class FieldRegistry` with module-level state and exported functions
- Convert instance methods to exported functions (register, get, has, getRegisteredTypes, setLegacyMode, isLegacyMode)
- Use module-level `Map` for component registry instead of private instance property
- Remove singleton export pattern (`export const fieldRegistry = new FieldRegistry()`)
- Maintain all existing functionality and behavior

**Preserve Backward Compatibility:**
- Re-export functions from `form/index.ts` for existing consumers
- Keep `fieldRegistry` namespace object available during transition
- No breaking changes to public API

## Impact

- **Affected specs**: None - this is an internal refactoring that maintains identical behavior and API compatibility. Archive with `--skip-specs` flag.
- **Affected code**:
  - `packages/frontend/src/components/SukohForm/FieldRegistry.ts` - Convert to functional exports
  - `packages/frontend/src/components/SukohForm/FieldRenderer.tsx` - Update import to use functional exports
  - `packages/frontend/src/components/SukohForm/form/index.ts` - Re-export functions
- **Breaking changes**: None - full backward compatibility maintained
- **Migration complexity**: Low - purely internal implementation change
- **Testing**: Unit tests not currently present; manual validation via existing integration tests
