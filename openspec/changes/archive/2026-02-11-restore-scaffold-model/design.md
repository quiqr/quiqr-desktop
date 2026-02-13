# Design: restore-scaffold-model

## Architecture Overview

The scaffold-model service fits into the existing backend architecture as a new service module that:
1. Uses the container's dialog adapter for file selection
2. Uses FormatProviderResolver for parsing files
3. Outputs model configuration YAML files

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  menu action → api.scaffoldSingleFromFile()                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Handlers                              │
│  scaffold-handlers.ts                                        │
│  - scaffoldSingleFromFile                                    │
│  - scaffoldCollectionFromFile                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ScaffoldModelService                         │
│  packages/backend/src/services/scaffold-model/               │
│                                                              │
│  Dependencies:                                               │
│  - DialogAdapter (file selection)                            │
│  - FormatProviderResolver (parsing)                          │
│  - WorkspaceConfigProvider (menu updates)                    │
│  - fs-extra (file operations)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Output: Model Configuration                     │
│  quiqr/model/includes/singles/<key>.yaml                    │
│  quiqr/model/includes/collections/<key>.yaml                │
└─────────────────────────────────────────────────────────────┘
```

## Field Type Inference Algorithm

The service infers field types from JavaScript values:

| JS Type | Field Type | Notes |
|---------|------------|-------|
| `string` | `string` | `markdown` if key is `mainContent` |
| `number` | `number` | |
| `boolean` | `boolean` | |
| `Array<primitive>` | `leaf-array` | Array of strings/numbers |
| `Array<object>` | `accordion` | Recursive field parsing |
| `object` | `nest` | With `groupdata: true`, recursive |

## Service Interface

```typescript
interface ScaffoldModelService {
  // Scaffold a single from an existing data file
  scaffoldSingleFromFile(
    sitePath: string,
    dataType: 'data' | 'content'
  ): Promise<ScaffoldResult>;

  // Scaffold a collection from an existing data file
  scaffoldCollectionFromFile(
    sitePath: string,
    dataType: 'data' | 'content'
  ): Promise<ScaffoldResult>;

  // Internal: infer fields from parsed object
  inferFieldsFromObject(
    obj: Record<string, unknown>,
    level?: number
  ): FieldDefinition[];
}

interface ScaffoldResult {
  success: boolean;
  modelKey?: string;
  modelPath?: string;
  error?: string;
}
```

## File Structure

```
packages/backend/src/services/scaffold-model/
├── index.ts                    # Re-exports
├── scaffold-model-service.ts   # Main service class
├── field-inferrer.ts           # Field type inference logic
└── types.ts                    # TypeScript interfaces
```

## Integration Points

### 1. Container Registration

The service will be instantiated on-demand like other services:

```typescript
// In container.ts or via factory
getScaffoldModelService(): ScaffoldModelService {
  return new ScaffoldModelService(
    this.adapters.dialog,
    this.formatProviderResolver
  );
}
```

### 2. API Handler Registration

```typescript
// In router.ts
import { createScaffoldHandlers } from './handlers/scaffold-handlers.js';

// Add to createApiHandlers:
const scaffoldHandlers = createScaffoldHandlers(container);
return {
  ...existingHandlers,
  ...scaffoldHandlers,
};
```

### 3. Frontend API

```typescript
// In api.ts
scaffoldSingleFromFile: (siteKey: string, workspaceKey: string) => 
  mainProcessBridge.request('scaffoldSingleFromFile', { siteKey, workspaceKey }),
```

## Supported File Extensions

| Extension | Format Provider |
|-----------|-----------------|
| `.yaml`, `.yml` | YamlFormatProvider |
| `.toml` | TomlFormatProvider |
| `.json` | JsonFormatProvider |
| `.md`, `.markdown`, `.qmd` | Frontmatter extraction + format detection |

## Menu Integration

### Model Menu Integration
The scaffolded model is automatically added to `quiqr/model/base/menu.yaml` under the appropriate section (data singles, data collections, content singles, content collections).

### Application Menu Integration

The scaffold actions are exposed in both Electron and standalone (browser) modes:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  File Menu → "Scaffold Single..." / "Scaffold Collection..."│
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌───────────────────┐                    ┌───────────────────┐
│   Electron Mode   │                    │  Standalone Mode  │
│   menu-manager.ts │                    │  menu-adapter.ts  │
│   Direct service  │                    │  action: string   │
│   call via click  │                    │  → API endpoint   │
└───────────────────┘                    └───────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ScaffoldModelService                         │
│  scaffoldSingleFromFile() / scaffoldCollectionFromFile()    │
└─────────────────────────────────────────────────────────────┘
```

#### Electron Mode (menu-manager.ts)
```typescript
{
  id: 'scaffold-single',
  label: 'Scaffold Single from File...',
  enabled: this.options.siteSelected,
  click: async () => {
    const service = await this.container.getScaffoldModelService(siteKey, workspaceKey);
    const result = await service.scaffoldSingleFromFile('content');
    // Handle result...
  }
}
```

#### Standalone Mode (menu-adapter.ts + menu-handlers.ts)
```typescript
// menu-adapter.ts - Menu item definition
{
  id: 'scaffold-single',
  type: 'normal',
  label: 'Scaffold Single from File...',
  enabled: siteSelected,
  action: 'scaffoldSingle',
}

// menu-handlers.ts - Action handler
case 'scaffoldSingle':
  const service = await container.getScaffoldModelService(siteKey, workspaceKey);
  const result = await service.scaffoldSingleFromFile('content');
  return result.success 
    ? { type: 'success', message: `Created model: ${result.modelKey}`, refresh: true }
    : { type: 'error', message: result.error || 'Failed to scaffold' };
```

## Error Handling

- Invalid file format: Show dialog with error message
- Parse errors: Show dialog with specific parse error
- Write failures: Return error in ScaffoldResult
- User cancellation: Return success=false, no error

## Testing Strategy

1. Unit tests for field inference logic
2. Integration tests for full scaffold workflow (mock dialogs)
3. Test with sample files in various formats
