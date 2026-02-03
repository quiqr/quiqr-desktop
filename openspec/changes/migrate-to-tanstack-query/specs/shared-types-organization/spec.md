# Shared Types Organization Specification Delta

## Purpose

Define requirements for organizing and managing shared types between frontend and backend packages to support TanStack Query migration and maintain type safety.

## MODIFIED Requirements

### Requirement: Shared Zod Schema Package (MODIFIED)

All data validation schemas SHALL be defined as Zod schemas in the `@quiqr/types` package.

**No changes to existing requirement text.**

**ADDED scenarios:**

#### Scenario: API request/response types
- **WHEN** defining types for API request parameters or response data
- **THEN** types are defined in `packages/types/src/types/api.ts`
- **AND** types are exported from `packages/types/src/index.ts`
- **AND** both frontend and backend import from `@quiqr/types`
- **AND** no duplicate type definitions exist in frontend or backend

#### Scenario: Query option parameter types
- **WHEN** query options factory needs parameter types
- **THEN** it imports types from `@quiqr/types`
- **AND** does not define inline parameter types
- **AND** TypeScript validates parameters at compile time
- **AND** types match backend expectations

#### Scenario: Type package rebuild
- **WHEN** types are added or modified in `packages/types/`
- **THEN** developer runs `npm run build -w @quiqr/types`
- **AND** types are compiled to `packages/types/dist/`
- **AND** frontend and backend can import updated types
- **AND** TypeScript compilation catches type mismatches

## ADDED Requirements

### Requirement: API Types Package Structure

API-related types SHALL be organized in `packages/types/src/types/api.ts` separate from core domain types.

#### Scenario: Organizing API types
- **WHEN** creating type definitions for API operations
- **THEN** types are added to `packages/types/src/types/api.ts`
- **AND** file exports request parameter types
- **AND** file exports response data types
- **AND** file exports query options types
- **AND** file is imported via `import { TypeName } from '@quiqr/types'`

#### Scenario: Separating concerns
- **WHEN** deciding where to place a type definition
- **THEN** API-specific types go in `api.ts`
- **AND** domain types go in `index.ts`
- **AND** field schemas stay in `schemas/fields.ts`
- **AND** service schemas stay in `schemas/service.ts`

#### Scenario: Type dependencies
- **WHEN** API types depend on domain types
- **THEN** `api.ts` imports from `./index`
- **AND** maintains single direction of dependencies: domain → API
- **AND** no circular dependencies are created

### Requirement: Import Hierarchy

Type imports SHALL follow a strict hierarchy to prevent circular dependencies.

#### Scenario: Frontend imports types
- **WHEN** frontend code needs type definitions
- **THEN** it imports from `@quiqr/types` package
- **AND** NEVER imports from `@quiqr/backend` package
- **AND** NEVER defines duplicate types locally
- **AND** TypeScript compilation succeeds

#### Scenario: Backend imports types
- **WHEN** backend code needs type definitions
- **THEN** it imports from `@quiqr/types` package
- **AND** MAY define backend-specific types locally
- **AND** NEVER exports types for frontend consumption
- **AND** backend-specific types stay in backend package

#### Scenario: Query options import types
- **WHEN** `queries/options.ts` needs parameter types
- **THEN** it imports from `@quiqr/types`
- **AND** imports are organized: types first, then api
- **AND** no relative imports to backend or other packages

### Requirement: Type Migration from Backend

Backend types used by frontend SHALL be moved to `@quiqr/types` package.

#### Scenario: Identifying shared types
- **WHEN** a type in backend is used by frontend
- **THEN** type is identified as shared
- **AND** type is moved to `packages/types/src/types/api.ts`
- **AND** backend imports from `@quiqr/types`
- **AND** frontend imports from `@quiqr/types`
- **AND** original backend definition is deleted

#### Scenario: Moving LogQueryOptions
- **WHEN** migrating `LogQueryOptions` from backend to types package
- **THEN** type is added to `packages/types/src/types/api.ts`
- **AND** type is exported from `packages/types/src/index.ts`
- **AND** backend imports: `import { LogQueryOptions } from '@quiqr/types'`
- **AND** frontend imports: `import { LogQueryOptions } from '@quiqr/types'`
- **AND** `packages/backend/src/logging/types.ts` deletes the type
- **AND** types package is rebuilt: `npm run build -w @quiqr/types`

#### Scenario: Validating type migration
- **WHEN** a type has been migrated
- **THEN** `npx tsc --noEmit` succeeds in frontend
- **THEN** backend compilation succeeds (if TypeScript)
- **AND** no duplicate type errors occur
- **AND** type inference works correctly in query options

### Requirement: Type Export Organization

The `@quiqr/types` package SHALL use barrel exports for clean imports.

#### Scenario: Exporting from api.ts
- **WHEN** API types are defined in `api.ts`
- **THEN** they are exported with `export type` or `export interface`
- **AND** `src/index.ts` re-exports them: `export * from './types/api'`
- **AND** consumers import via: `import { TypeName } from '@quiqr/types'`
- **AND** no need to import from subpaths

#### Scenario: Named exports preferred
- **WHEN** exporting types
- **THEN** use named exports: `export interface TypeName { ... }`
- **AND** avoid default exports
- **AND** makes imports explicit and easier to refactor

#### Scenario: Type-only exports
- **WHEN** exporting types (not values)
- **THEN** use `export type { TypeName }` for re-exports
- **AND** prevents runtime imports
- **AND** improves tree-shaking

## REMOVED Requirements

None. This modifies and extends existing type system requirements.

## Examples

### Good: Shared Type in api.ts
```typescript
// packages/types/src/types/api.ts
export interface LogQueryOptions {
  date?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// packages/types/src/index.ts
export * from './types/api';

// packages/frontend/src/queries/options.ts
import { LogQueryOptions } from '@quiqr/types';

export const logQueryOptions = {
  application: (options: LogQueryOptions) => ({ ... }),
};
```

### Bad: Inline Type Definition
```typescript
// ❌ BAD: Inline type in query options
export const logQueryOptions = {
  application: (options: {
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    // ...
  }) => ({ ... }),
};
```

### Good: Import Hierarchy
```typescript
// ✅ Frontend imports from @quiqr/types
import { LogQueryOptions, WorkspaceDetails } from '@quiqr/types';

// ✅ Backend imports from @quiqr/types
import { LogQueryOptions } from '@quiqr/types';
```

### Bad: Cross-Package Imports
```typescript
// ❌ Frontend importing from backend
import { LogQueryOptions } from '@quiqr/backend/src/logging/types';

// ❌ Duplicate type definition
interface LogQueryOptions {  // Already defined in @quiqr/types
  // ...
}
```

## Migration Checklist

For each type being migrated:

- [ ] Identify type currently in backend used by frontend
- [ ] Add type to `packages/types/src/types/api.ts`
- [ ] Export type from `packages/types/src/index.ts`
- [ ] Rebuild types package: `npm run build -w @quiqr/types`
- [ ] Update backend imports to use `@quiqr/types`
- [ ] Update frontend imports to use `@quiqr/types`
- [ ] Delete original type definition from backend
- [ ] Verify TypeScript compilation succeeds
- [ ] Verify no duplicate type errors
- [ ] Test affected components

## Validation

### Type Safety Validation
```bash
# Frontend type checking (from project root)
cd packages/frontend && npx tsc --noEmit

# Verify no duplicate types (from project root)
grep -r "interface LogQueryOptions" packages/*/src/ --include="*.ts"

# Verify imports (from project root)
grep -r "from '@quiqr/types'" packages/frontend/src/ --include="*.ts"
grep -r "from '@quiqr/types'" packages/backend/src/ --include="*.ts"
```

### Build Validation
```bash
# Rebuild types package
npm run build -w @quiqr/types

# Verify build output
ls packages/types/dist/

# Test import in frontend
node -e "require('@quiqr/types')"
```

## References

- Existing specification: `openspec/specs/type-system/spec.md`
- Types package: `packages/types/`
- Design document: `openspec/changes/migrate-to-tanstack-query/design.md`
