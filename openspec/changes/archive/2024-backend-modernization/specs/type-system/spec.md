## ADDED Requirements

### Requirement: Shared Zod Schema Package

All data validation schemas SHALL be defined as Zod schemas in the `@quiqr/types` package.

#### Scenario: API request validation
- **WHEN** backend receives an API request
- **THEN** it validates request data using Zod schemas from `@quiqr/types`
- **AND** invalid data is rejected with clear error messages
- **AND** valid data conforms to TypeScript types

#### Scenario: Frontend response validation
- **WHEN** frontend receives API response
- **THEN** it validates response data using Zod schemas from `@quiqr/types`
- **AND** catches backend contract violations
- **AND** TypeScript types match runtime data

#### Scenario: Type inference from schemas
- **WHEN** code needs TypeScript types
- **THEN** it uses `z.infer<typeof schema>` to derive types from Zod schemas
- **AND** types automatically stay in sync with schemas
- **AND** no manual type definitions are needed

### Requirement: Frontend-Backend Type Contract

The frontend and backend SHALL maintain a strict type contract enforced at compile-time and runtime.

#### Scenario: API response types match
- **WHEN** backend handler returns data
- **THEN** TypeScript verifies it matches the response schema
- **AND** frontend receives data matching the same schema
- **AND** type mismatches are caught at compile time

#### Scenario: Schema changes break contract
- **WHEN** a schema in `@quiqr/types` changes
- **THEN** TypeScript compilation fails if frontend or backend violates new contract
- **AND** developer must update code to match
- **AND** contract violations cannot reach production

### Requirement: Field Schema Definitions

All form field types SHALL be defined as Zod schemas in `@quiqr/types/schemas/fields.ts`.

#### Scenario: SukohForm field validation
- **WHEN** rendering a form field
- **THEN** field configuration is validated against its Zod schema
- **AND** invalid configurations are caught at load time
- **AND** TypeScript provides autocomplete for field properties

#### Scenario: New field type addition
- **WHEN** adding a new field type
- **THEN** schema is added to `fields.ts`
- **AND** TypeScript types are inferred from schema
- **AND** both frontend and backend can use the new field type

## REMOVED Requirements

None - this establishes new type system requirements.

## MODIFIED Requirements

### Requirement: Type Definitions Location (Changed)

**Before:** Types were scattered across `frontend/types.ts` and backend files with no formal validation.

**After:** All types are centralized in `@quiqr/types` with Zod schemas providing runtime validation.

**Rationale:** Single source of truth eliminates inconsistencies between frontend and backend. Zod provides both TypeScript types (compile-time) and validation (runtime).
