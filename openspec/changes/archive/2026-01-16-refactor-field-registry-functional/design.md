# Design: FieldRegistry Functional Refactoring

## Overview

Convert `FieldRegistry` from a class-based singleton to a functional module with exported functions, following the Utility Module Pattern established in previous refactorings.

## Current Architecture

**Class-based singleton pattern:**
```typescript
class FieldRegistry {
  private components: Map<string, FieldImporter> = new Map();
  private legacyMode = true;

  constructor() {
    this.registerDefaults();
  }

  register(type: string, importer: FieldImporter): this { ... }
  get(type: string): FieldImporter { ... }
  has(type: string): boolean { ... }
  getRegisteredTypes(): string[] { ... }
  setLegacyMode(enabled: boolean): void { ... }
  isLegacyMode(): boolean { ... }
}

export const fieldRegistry = new FieldRegistry();
export default fieldRegistry;
```

**Current usage:**
```typescript
import { fieldRegistry } from './FieldRegistry';
const importer = fieldRegistry.get(fieldType);
```

## Target Architecture

**Functional module with module-level closure:**
```typescript
// Module-level state (closure)
const components: Map<string, FieldImporter> = new Map();
let legacyMode = true;

// Initialization at module load
function registerDefaults(): void { ... }
registerDefaults();

// Exported functions
export function register(type: string, importer: FieldImporter): void { ... }
export function getFieldComponent(type: string): FieldImporter { ... }
export function hasFieldComponent(type: string): boolean { ... }
export function getRegisteredTypes(): string[] { ... }
export function setLegacyMode(enabled: boolean): void { ... }
export function isLegacyMode(): boolean { ... }

// Interface for type inference
export interface FieldRegistry {
  register: typeof register;
  getFieldComponent: typeof getFieldComponent;
  hasFieldComponent: typeof hasFieldComponent;
  getRegisteredTypes: typeof getRegisteredTypes;
  setLegacyMode: typeof setLegacyMode;
  isLegacyMode: typeof isLegacyMode;
}
```

**New usage:**
```typescript
// Direct import (preferred)
import { getFieldComponent } from './FieldRegistry';
const importer = getFieldComponent(fieldType);

// Or backward-compatible namespace (transition period)
import { fieldRegistry } from './form';
const importer = fieldRegistry.getFieldComponent(fieldType);
```

## Key Design Decisions

### 1. Module-Level State

**Decision:** Use module-level `Map` and `boolean` variables instead of class instance properties.

**Rationale:**
- Provides the same singleton behavior without OOP ceremony
- Module scope naturally provides singleton semantics
- Simplifies testing by removing `this` context
- Matches pattern from `main-process-bridge.ts` refactoring

### 2. Function Naming

**Decision:** Rename methods to be more descriptive as standalone functions:
- `get()` → `getFieldComponent()` (more explicit as a standalone function)
- `has()` → `hasFieldComponent()` (clearer intent)

**Rationale:**
- Method names like `get()` are ambiguous when not attached to an object
- Functional exports benefit from descriptive names
- Aligns with functional programming conventions

### 3. Chainable API

**Decision:** Remove method chaining (`return this`) from `register()`.

**Rationale:**
- Method chaining is an OOP pattern that doesn't apply to standalone functions
- Current usage doesn't utilize chaining
- Simplifies function signature to `void` return

### 4. Module Initialization

**Decision:** Call `registerDefaults()` at module load time (top level).

**Rationale:**
- Constructor pattern (`constructor() { this.registerDefaults(); }`) is replaced with module-level execution
- Ensures registry is initialized before any imports use it
- No lazy initialization needed - all field types are known at build time

### 5. Backward Compatibility

**Decision:** Maintain `fieldRegistry` namespace object in `form/index.ts` during transition.

**Rationale:**
- No breaking changes to existing code
- Allows gradual migration to direct imports
- Matches approach from `api.ts` refactoring

## Migration Strategy

1. **Phase 1:** Convert `FieldRegistry.ts` to functional exports
2. **Phase 2:** Update direct consumers (`FieldRenderer.tsx`)
3. **Phase 3:** Update re-exports in `form/index.ts` for backward compatibility
4. **Phase 4:** Validate with tests and manual testing

## Testing Approach

**Unit Testing:**
- No existing unit tests for FieldRegistry
- Manual validation sufficient for this refactoring
- Integration tests will catch any regressions

**Manual Validation:**
- Verify all field types render correctly in development
- Test field lazy loading behavior
- Confirm no console errors or warnings

## Risk Assessment

**Low Risk:**
- FieldRegistry has a simple, well-defined API
- Only 3 direct usages in codebase
- Lazy loading behavior is preserved
- Full backward compatibility maintained

**Potential Issues:**
- Module initialization order (mitigated by calling `registerDefaults()` at top level)
- Race conditions in module loading (not applicable - synchronous initialization)

## Alternative Approaches Considered

### Alternative 1: Keep Class, Remove Singleton
Convert to a factory function that returns a new instance.

**Rejected because:**
- Over-engineered for a simple registry
- Adds complexity without benefits
- Doesn't align with project patterns

### Alternative 2: Plain Object with Methods
Create a single object with method properties.

**Rejected because:**
- Still uses OOP-style API
- Doesn't provide benefits of functional exports (tree-shaking, direct imports)
- Doesn't match established patterns

## Alignment with Project Patterns

This refactoring follows the **Utility Module Pattern** established in:
1. `refactor-main-process-bridge-functional` - Module-level closure for request logic
2. `refactor-api-to-functional` - Converting 94 methods from class to functional exports

Pattern characteristics:
- Module-level state for singleton behavior
- Exported functions instead of methods
- Interface type for type inference
- Backward-compatible re-exports
