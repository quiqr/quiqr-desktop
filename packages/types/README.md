# @quiqr/types

Shared TypeScript types and Zod schemas for Quiqr Desktop.

## Overview

This package provides a single source of truth for all data structures used across the Quiqr Desktop application, including:

- **Field Schemas**: 25+ field types for the dynamic form system (string, markdown, accordion, bundle-manager, etc.)
- **Config Schemas**: Site, workspace, menu, and publish configurations
- **API Schemas**: Request/response schemas for all backend API endpoints
- **Service Schemas**: Higher-level service operation schemas

## Installation

This package is part of the Quiqr Desktop monorepo and uses npm workspaces. It's automatically linked when you run `npm install` in the root directory.

## Usage

### Importing Schemas

```typescript
import {
  userPreferencesSchema,
  siteConfigSchema,
  fieldSchema
} from '@quiqr/types'

// Validate data at runtime
const prefs = userPreferencesSchema.parse(rawData)
```

### Importing Types

```typescript
import type {
  UserPreferences,
  SiteConfig,
  Field
} from '@quiqr/types'

// Use for TypeScript type checking
const handlePrefs = (prefs: UserPreferences) => {
  // ...
}
```

### API Response Typing

```typescript
import { apiSchemas, type ApiResponse } from '@quiqr/types'

// Automatically typed based on method name
async function callApi<M extends keyof typeof apiSchemas>(
  method: M,
  data: unknown
): Promise<ApiResponse<M>> {
  const response = await fetch(`/api/${method}`, {
    method: 'POST',
    body: JSON.stringify({ data })
  })
  const result = await response.json()

  // Validate response against schema
  return apiSchemas[method].parse(result)
}
```

## Package Structure

```
src/
├── schemas/          # Zod schemas for runtime validation
│   ├── fields.ts     # Form field schemas (25+ types)
│   ├── config.ts     # Configuration schemas
│   ├── api.ts        # API request/response schemas
│   ├── service.ts    # Service operation schemas
│   └── index.ts
├── types/            # Pure TypeScript types
│   └── index.ts
└── index.ts          # Main entry point
```

## Benefits

1. **Type Safety**: Compile-time type checking across frontend and backend
2. **Runtime Validation**: Zod schemas validate data at runtime
3. **Single Source of Truth**: Types defined once, used everywhere
4. **DX**: Full autocomplete and IntelliSense support
5. **Maintainability**: Easy to update types across the entire application

## Development

Build the package:

```bash
npm run build
```

Watch mode for development:

```bash
npm run dev
```

## Used By

- `@quiqr/frontend` - React application
- `@quiqr/backend` - API server
- `@quiqr/adapter-electron` - Electron adapter
- `@quiqr/adapter-standalone` - Standalone server adapter
