---
sidebar_position: 3
---

# Field Development Guide

This guide explains how the new SukohForm field system works and provides a step-by-step tutorial for creating new field components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Understanding the TypeScript Types](#understanding-the-typescript-types)
4. [Tutorial: Creating a Rating Field](#tutorial-creating-a-rating-field)
5. [Quick Reference](#quick-reference)

---

## Architecture Overview

The SukohForm system is a schema-driven form builder that uses React's Context API and lazy-loaded components. Here's how data flows through the system:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FormProvider                              │
│  - Holds all form state (document, resources, dirty state)      │
│  - Provides context to all child fields                         │
│  - Processes field schemas into FieldConfig map                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FormContext                                │
│  - React Context that exposes:                                  │
│    • getValueAtPath / setValueAtPath (read/write field values)  │
│    • getFieldConfig (get field schema by compositeKey)          │
│    • meta (form metadata: siteKey, workspaceKey, etc.)          │
│    • renderFields (render nested fields for containers)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FieldRenderer                              │
│  - Looks up field type from FieldRegistry                       │
│  - Lazy-loads the component with React.lazy()                   │
│  - Wraps with ErrorBoundary and Suspense                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FieldRegistry                              │
│  - Maps field type strings to component importers               │
│  - e.g., "slider" → () => import('./fields/SliderField')        │
│  - Enables code-splitting (fields loaded on demand)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Field Component                             │
│  - Receives only `compositeKey` prop                            │
│  - Uses useField(compositeKey) to access value & config         │
│  - Renders UI and handles user input                            │
└─────────────────────────────────────────────────────────────────┘
```

### The compositeKey

Every field instance has a unique `compositeKey` that identifies its position in the form tree. Examples:

- `root.title` - A field named "title" at the root level
- `root.author.name` - A nested field "name" inside "author"
- `root.tags[0]` - First item in an array field "tags"
- `root.sections[2].heading` - "heading" inside the third section

The compositeKey is used to:
1. Look up the field's configuration (schema)
2. Read/write the field's value in the document
3. Provide unique React keys for rendering

---

## Key Components

### 1. FieldRegistry (`FieldRegistry.ts`)

The registry maps field type strings to dynamic import functions:

```typescript
class FieldRegistry {
  private components: Map<string, FieldImporter> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    // Each type maps to a lazy import
    this.components.set('string', () => import('./fields/StringField'));
    this.components.set('slider', () => import('./fields/SliderField'));
    this.components.set('color', () => import('./fields/ColorField'));
    // ... more fields
  }

  // Get the importer for a type (falls back to 'not-found')
  get(type: string): FieldImporter {
    return this.components.get(type) || this.components.get('not-found')!;
  }
}

export const fieldRegistry = new FieldRegistry();
```

**Why lazy imports?** Code-splitting. If a form doesn't use the `eisenhouwer` field, that component's code is never loaded.

### 2. FormContext (`FormContext.tsx`)

Defines the shape of the form context:

```typescript
export interface FormContextValue {
  // The document state (nested object matching YAML structure)
  document: Record<string, unknown>;

  // Path-based value access
  getValueAtPath: <T>(path: string) => T | undefined;
  setValueAtPath: (path: string, value: unknown, debounce?: number) => void;
  clearValueAtPath: (path: string) => void;

  // Field configs indexed by compositeKey
  fieldConfigs: Map<string, FieldConfig>;
  getFieldConfig: (compositeKey: string) => FieldConfig | undefined;

  // Form metadata
  meta: FormMeta;

  // Form state
  isDirty: boolean;
  isSubmitting: boolean;
  saveForm: () => Promise<void>;

  // For rendering nested fields (used by container fields)
  renderFields: (parentPath: string, fields: Field[]) => ReactNode;
}
```

### 3. useField Hook (`useField.ts`)

The primary hook for field components. Returns everything a field needs:

```typescript
export interface UseFieldResult<T = unknown> {
  field: FieldConfig;              // The field's configuration/schema
  value: T | undefined;            // Current value from the document
  setValue: (value: T, debounce?: number) => void;  // Update the value
  clearValue: () => void;          // Remove the value from document
  cache: Record<string, unknown>;  // Per-field cache for expensive computations
  meta: FormMeta;                  // Form metadata (siteKey, etc.)
}

export function useField<T = unknown>(compositeKey: string): UseFieldResult<T> {
  const form = useFormContext();
  const field = form.getFieldConfig(compositeKey);
  // ... implementation
  return { field, value, setValue, clearValue, cache, meta: form.meta };
}
```

### 4. FieldRenderer (`FieldRenderer.tsx`)

Handles lazy loading and error boundaries:

```typescript
export function FieldRenderer({ compositeKey }: { compositeKey: string }) {
  const form = useFormContext();
  const fieldConfig = form.getFieldConfig(compositeKey);
  const fieldType = fieldConfig?.type || 'not-found';

  // Get lazy component from registry
  const FieldComponent = useMemo(() => getLazyComponent(fieldType), [fieldType]);

  return (
    <ErrorBoundary fallbackRender={...}>
      <Suspense fallback={<FieldLoadingFallback />}>
        <FieldComponent compositeKey={compositeKey} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Understanding the TypeScript Types

### The Confusing `meta` Type

In `useField.ts`, you'll see this type:

```typescript
meta: typeof useFormContext extends () => infer R
  ? R extends { meta: infer M }
    ? M
    : never
  : never;
```

This is **conditional type inference**. Let's break it down:

```typescript
// Step 1: typeof useFormContext
// Gets the type of the useFormContext function
// Result: () => FormContextValue

// Step 2: extends () => infer R
// Checks if it's a function and captures return type as R
// R = FormContextValue

// Step 3: R extends { meta: infer M }
// Checks if R has a 'meta' property and captures its type as M
// M = FormMeta

// Step 4: ? M : never
// If all conditions pass, return M (FormMeta), otherwise never
```

**Why use this pattern?** It automatically derives the `meta` type from `useFormContext`'s return type. If `FormContextValue.meta` changes, this type updates automatically without manual synchronization.

**Simpler alternative:** You could just write:
```typescript
meta: FormMeta;
```
But the inference pattern ensures the types stay in sync.

### FieldConfig Type

```typescript
export type FieldConfig = Field & {
  compositeKey: string;
};
```

`Field` is a discriminated union of all field types. The `&` adds `compositeKey` as a runtime property. This means `FieldConfig` can be any field type plus the computed key.

### Generic useField\<T\>

```typescript
const { value, setValue } = useField<string>(compositeKey);
// value: string | undefined
// setValue: (value: string, debounce?: number) => void
```

The generic `T` types the value. This gives you type safety for your field's data type.

---

## Tutorial: Creating a Rating Field

Let's create a **star rating field** that allows users to rate something from 1-5 stars. This demonstrates:

- Using the `useField` hook
- Type-safe configuration access
- Handling user interaction
- Debounced updates
- Tooltip support

### Step 1: Define the Schema in `@quiqr/types`

First, add the schema to `packages/types/src/schemas/fields.ts`:

```typescript
export const ratingFieldSchema = baseFieldSchema.extend({
  type: z.literal('rating'),
  default: z.number().min(0).max(5).optional(),
  maxStars: z.number().min(1).max(10).optional(),  // Default: 5
  allowHalf: z.boolean().optional(),                // Allow half-star ratings
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})
```

Add to `CoreFields` object:
```typescript
export const CoreFields = {
  // ... existing fields
  rating: ratingFieldSchema,
}
```

Add to `coreFieldSchemas` array:
```typescript
export const coreFieldSchemas = [
  // ... existing schemas
  ratingFieldSchema,
]
```

Add type export:
```typescript
export type RatingField = z.infer<typeof ratingFieldSchema>
```

> [!IMPORTANT]
> You need to rebuild the types package with `npm run build -w @quiqr/types`.

### Step 2: Create the Field Component

Create `frontend/src/components/SukohForm/fields/RatingField.tsx`:

```typescript
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import type { RatingField as RatingFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * RatingField - star rating input with configurable max stars.
 * Supports half-star ratings and optional auto-save.
 */
function RatingField({ compositeKey }: Props) {
  // Get field state and utilities from the form context
  const { field, value, setValue } = useField<number>(compositeKey);
  const { saveForm } = useFormState();

  // Type the config for autocompletion and type checking
  const config = field as RatingFieldConfig;

  // Hover state for preview
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Configuration with defaults
  const maxStars = config.maxStars ?? 5;
  const allowHalf = config.allowHalf ?? false;
  const currentValue = value ?? config.default ?? 0;

  // Build icon buttons array (for tip, etc.)
  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // Handle star click
  const handleClick = (starValue: number) => {
    setValue(starValue, 0);  // No debounce for clicks

    if (config.autoSave === true) {
      saveForm();
    }
  };

  // Handle mouse enter on a star
  const handleMouseEnter = (starValue: number) => {
    setHoverValue(starValue);
  };

  // Handle mouse leave from rating area
  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  // Determine which value to display (hover preview or actual)
  const displayValue = hoverValue ?? currentValue;

  // Generate stars
  const stars = useMemo(() => {
    const result: React.ReactNode[] = [];

    for (let i = 1; i <= maxStars; i++) {
      const starValue = i;
      const halfValue = i - 0.5;

      // Determine star appearance
      let icon: React.ReactNode;
      if (displayValue >= starValue) {
        icon = <StarIcon sx={{ color: '#ffc107' }} />;
      } else if (allowHalf && displayValue >= halfValue) {
        icon = <StarHalfIcon sx={{ color: '#ffc107' }} />;
      } else {
        icon = <StarBorderIcon sx={{ color: '#ffc107' }} />;
      }

      result.push(
        <IconButton
          key={i}
          size="small"
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          sx={{ p: 0.5 }}
        >
          {icon}
        </IconButton>
      );

      // Add half-star click target if enabled
      if (allowHalf && i < maxStars) {
        result.push(
          <Box
            key={`half-${i}`}
            component="span"
            onClick={() => handleClick(halfValue)}
            onMouseEnter={() => handleMouseEnter(halfValue)}
            sx={{
              position: 'absolute',
              left: `${(i - 1) * 32 + 16}px`,
              width: '16px',
              height: '32px',
              cursor: 'pointer',
              zIndex: 1,
            }}
          />
        );
      }
    }

    return result;
  }, [maxStars, displayValue, allowHalf]);

  return (
    <FormItemWrapper
      control={
        <DefaultWrapper>
          <Typography
            variant="body2"
            sx={{ mb: 1, color: 'text.secondary' }}
          >
            {config.title ?? config.key}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
            onMouseLeave={handleMouseLeave}
          >
            {stars}

            <Typography
              variant="body2"
              sx={{ ml: 1, color: 'text.secondary' }}
            >
              {displayValue} / {maxStars}
            </Typography>
          </Box>
        </DefaultWrapper>
      }
      iconButtons={iconButtons}
    />
  );
}

export default RatingField;
```

### Step 3: Register the Field

Add to `FieldRegistry.ts`:

```typescript
private registerDefaults(): void {
  // ... existing registrations

  // Rating field
  this.components.set('rating', () => import('./fields/RatingField'));
}
```

### Step 4: Usage Example

In a form schema YAML:

```yaml
fields:
  - key: quality
    type: rating
    title: "Quality Rating"
    default: 3
    maxStars: 5
    tip: "Rate the overall quality from 1-5 stars"

  - key: difficulty
    type: rating
    title: "Difficulty Level"
    maxStars: 10
    allowHalf: true
    autoSave: true
```

---

## Quick Reference

### Field Component Template

```typescript
import { useField, useFormState } from '../useField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import type { YourFieldType as YourFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

function YourField({ compositeKey }: Props) {
  // 1. Get field utilities
  const { field, value, setValue } = useField<ValueType>(compositeKey);
  const { saveForm } = useFormState();  // Only if you need autoSave
  const config = field as YourFieldConfig;

  // 2. Build icon buttons (tip, etc.)
  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // 3. Handle changes
  const handleChange = (newValue: ValueType) => {
    setValue(newValue, 250);  // 250ms debounce (0 for immediate)

    if (config.autoSave === true) {
      saveForm();
    }
  };

  // 4. Render
  return (
    <FormItemWrapper
      control={
        <DefaultWrapper>
          {/* Your field UI */}
        </DefaultWrapper>
      }
      iconButtons={iconButtons}
    />
  );
}

export default YourField;
```

### Useful Hooks

| Hook | Purpose |
|------|---------|
| `useField<T>(compositeKey)` | Get field config, value, setValue |
| `useFormState()` | Get isDirty, isSubmitting, saveForm, document, meta |
| `useRenderFields()` | Get renderFields function for container fields |
| `useResources(compositeKey)` | Manage file resources for bundle fields |

### setValue Debounce Values

| Value | Use Case |
|-------|----------|
| `0` | Immediate update (clicks, selects) |
| `250` | Text input while typing |
| `500` | Expensive operations |

### Common Config Properties (from baseFieldSchema)

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Field identifier |
| `title` | string? | Display label |
| `default` | varies | Default value |
| `tip` | string? | Help tooltip (markdown) |
| `hidden` | boolean? | Hide field |
| `arrayTitle` | boolean? | Use as accordion item title |
| `groupdata` | boolean? | Group data in parent (section/nest) |

---

## Checklist for New Fields

- [ ] Define Zod schema in `packages/types/src/schemas/fields.ts`
- [ ] Add to `CoreFields` object
- [ ] Add to `coreFieldSchemas` array
- [ ] Export type with `z.infer<>`
- [ ] Create component in `frontend/src/components/SukohForm/fields/`
- [ ] Register in `FieldRegistry.ts`
- [ ] Rebuild types package: `cd packages/types && npm run build`
- [ ] Test with a sample form schema
