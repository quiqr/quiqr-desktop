# Change: Field AI Assist with Prompt Templates

## Why

The current AI Assist implementation has several limitations:

1. **Field-level AI Assist is limited**: Fields (StringField, MarkdownField) have a hardcoded AI assist dialog with direct OpenAI API calls from the frontend, posing security risks and limiting provider flexibility
2. **No prompt template support for fields**: Only page-level AI Assist supports prompt templates; field-level assistance requires manual prompt entry
3. **Frontend API key exposure**: Field AI Assist uses `openai` npm package directly in the browser with API keys stored in user preferences
4. **Inconsistent architecture**: Page-level uses backend LLM service; field-level bypasses it
5. **Limited field context access**: Page templates cannot access parsed frontmatter fields via `self.fields.[key].content`
6. **No semantic component naming**: Current components (`AiAssist.tsx`, `AIAssistDialog.tsx`) lack clear context about whether they're for pages or fields

## What Changes

### 1. Directory Structure

Rename and create prompt template directories:
- `[site]/quiqr/model/includes/prompts_templates/` → `page_prompt_templates/`
- Create new `[site]/quiqr/model/includes/field_prompt_templates/` for field-specific templates

### 2. Enhanced Prompt Template Syntax

**For Page Templates** (`page_prompt_templates/`):
- Add `self.fields.[key].content` to access parsed frontmatter values
- Example: `{{ self.fields.title.content }}` returns the title from frontmatter

**For Field Templates** (`field_prompt_templates/`):
- `self.content` - Current field's content
- `self.key` - Current field's key (e.g., "title")
- `self.type` - Current field's type (e.g., "string")
- `parent_page.content` - Full page content with frontmatter
- `parent_page.file_path` - Relative path to page file
- `parent_page.file_name` - Page filename
- `parent_page.file_base_name` - Page basename without extension
- `parent_page.fields.[key].content` - Access other field values from parent page
- `field.*` - Form field values from the template (user inputs)

### 3. Backend Changes

**Enhanced `prompt-template-processor.ts`:**
```typescript
// New types
interface PageSelfObject {
  content: string;
  file_path: string;
  file_name: string;
  file_base_name: string;
  fields: Record<string, { content: unknown }>; // NEW
}

interface FieldSelfObject {
  content: string;
  key: string;
  type: string;
}

interface ParentPageObject {
  content: string;
  file_path: string;
  file_name: string;
  file_base_name: string;
  fields: Record<string, { content: unknown }>;
}

type PageVariableContext = {
  self: PageSelfObject | null;
  field: FieldObject;
  workspacePath: string;
  contextType: 'page';
}

type FieldVariableContext = {
  self: FieldSelfObject | null;
  parent_page: ParentPageObject | null;
  field: FieldObject;
  workspacePath: string;
  contextType: 'field';
}

// New functions
buildPageSelfObject(workspacePath, filePath): Promise<PageSelfObject>
buildFieldSelfObject(fieldKey, fieldType, fieldContent): FieldSelfObject
buildParentPageObject(workspacePath, filePath): Promise<ParentPageObject>
```

**New handlers in `workspace-handlers.ts`:**
- `createGetFieldPromptTemplateConfigHandler()` - Load templates from `field_prompt_templates/`
- `createProcessFieldAiPromptHandler()` - Process field prompts with field context
- Update `createGetPromptTemplateConfigHandler()` to read from `page_prompt_templates/`
- Update `createProcessAiPromptHandler()` to use `contextType: 'page'`

**Helper function for file extension support:**
```typescript
findTemplateFile(basePath: string, templateKey: string): string | null
// Checks for both .yaml and .yml extensions
// .yaml takes precedence over .yml
```

**File extension support:**
- All prompt templates support both `.yaml` and `.yml` extensions
- `.yaml` extension takes precedence if both exist
- Applies to page templates, field templates, and legacy templates

### 4. Frontend Changes

**Component Renaming (for semantic clarity):**
- `AiAssist.tsx` → `PageAIAssistButton.tsx` (icon button for page-level)
- `AIAssistDialog.tsx` → `PageAIAssistDialog.tsx` (dialog for page prompts)
- Create new `FieldAIAssistButton.tsx` (icon button for field-level)
- Create new `FieldAIAssistDialog.tsx` (dialog for field prompts)

**New `FieldAIAssistButton.tsx`:**
- Props: `compositeKey`, `fieldKey`, `fieldType`, `fieldContent`, `onSetContent`
- Replaces current hardcoded dialog in `AiAssist.tsx`
- Opens `FieldAIAssistDialog` on click

**New `FieldAIAssistDialog.tsx`:**
- Similar to `PageAIAssistDialog` but loads from `field_prompt_templates/`
- Passes field context to backend: `{ fieldKey, fieldType, fieldContent, collectionKey, collectionItemKey, singleKey }`
- Backend builds both `self` (field) and `parent_page` objects
- Shows "Replace" and "Append" buttons instead of "Update Page"
- Directly updates field value via callback

**Remove from frontend:**
- OpenAI npm package dependency
- Direct API key usage in `AiAssist.tsx`
- Hardcoded prompt input dialog

**API additions in `packages/frontend/src/api.ts`:**
```typescript
getFieldPromptTemplateConfig(siteKey, workspaceKey, templateKey)
processFieldAiPrompt(siteKey, workspaceKey, templateKey, formValues, context)
```

### 5. Example Field Prompt Templates

**`field_prompt_templates/improve_text.yaml`:**
```yaml
---
key: improve_text
title: Improve Text Quality
description: Enhance clarity and readability while preserving meaning
llm_settings:
  model: gpt-4
  temperature: 0.7
fields:
  - key: style
    title: Writing Style
    type: select
    options:
      - professional
      - casual
      - academic
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Improve the following text to make it more {{ field.style }}.
      Keep the same general meaning but enhance clarity and readability.
      
      Field: {{ self.key }}
      Page context: {{ parent_page.fields.title.content }}
      
      Text:
      {{ self.content }}
```

**`field_prompt_templates/fix_grammar.yaml`:**
```yaml
---
key: fix_grammar
title: Fix Grammar & Spelling
llm_settings:
  model: gpt-4
  temperature: 0.3
fields:
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Fix any grammar and spelling errors in the following text.
      Preserve the original meaning and style.
      
      {{ self.content }}
```

**`field_prompt_templates/expand_text.yaml`:**
```yaml
---
key: expand_text
title: Expand Text
llm_settings:
  model: gpt-4
  temperature: 0.7
fields:
  - key: target_length
    title: Target Length
    type: select
    options:
      - short paragraph (50-100 words)
      - medium (100-200 words)
      - long (200-400 words)
  - key: tone
    title: Tone
    type: select
    options:
      - informative
      - persuasive
      - narrative
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Expand the following brief text into {{ field.target_length }} with a {{ field.tone }} tone.
      Keep the core message but add relevant details, examples, or context.
      
      Page: {{ parent_page.fields.title.content }}
      Original: {{ self.content }}
```

### 6. Configuration Updates

**Field configuration** (add `field_prompt_templates` array):
```yaml
# In collection or single config
fields:
  - key: title
    type: string
    title: Title
    field_prompt_templates:
      - improve_text
      - fix_grammar
  - key: content
    type: markdown
    title: Content
    field_prompt_templates:
      - expand_text
      - improve_text
      - fix_grammar
```

## Impact

### Affected Specs
- `ai-integration` - Extended with field-level prompt templates
- `frontend-components` - New dialog components, renamed existing ones

### Affected Code

**Backend:**
- `/packages/backend/src/utils/prompt-template-processor.ts` - Enhanced with field context support and `self.fields.*` parsing
- `/packages/backend/src/api/handlers/workspace-handlers.ts` - New field prompt handlers, directory rename
- `/packages/types/src/schemas/fields.ts` - Add `field_prompt_templates?: string[]` to field schemas

**Frontend:**
- `/packages/frontend/src/components/AiAssist.tsx` → `/packages/frontend/src/components/PageAIAssistButton.tsx`
- `/packages/frontend/src/components/SukohForm/AIAssistDialog.tsx` → `/packages/frontend/src/components/SukohForm/PageAIAssistDialog.tsx`
- Create `/packages/frontend/src/components/SukohForm/FieldAIAssistButton.tsx`
- Create `/packages/frontend/src/components/SukohForm/FieldAIAssistDialog.tsx`
- `/packages/frontend/src/api.ts` - Add field prompt API methods
- `/packages/frontend/src/components/SukohForm/fields/StringField.tsx` - Use `FieldAIAssistButton`
- `/packages/frontend/src/components/SukohForm/fields/MarkdownField.tsx` - Use `FieldAIAssistButton`
- `/packages/frontend/package.json` - Remove `openai` dependency

### Breaking Changes

**Directory rename:**
- `[site]/quiqr/model/includes/prompts_templates/` → `page_prompt_templates/`
- Users will need to rename this directory in their sites (can be automated with a simple find/move script if needed)

**Component renames:**
- Internal only, no user-facing breaking changes

### Migration Path

1. Users rename `prompts_templates/` → `page_prompt_templates/` in their sites
2. Optionally create `field_prompt_templates/` directory for field-level AI assistance
3. Add `field_prompt_templates` arrays to field configurations where desired

### Benefits

- ✅ **Security**: No frontend API keys, all LLM calls through backend
- ✅ **Consistency**: Both page and field AI use same architecture (LLM service, prompt templates)
- ✅ **Flexibility**: Field templates can access parent page context
- ✅ **Extensibility**: Easy to add new field prompt templates
- ✅ **Reusability**: Templates can be shared across fields and pages
- ✅ **Type safety**: All context types properly defined with TypeScript
- ✅ **Better UX**: Dynamic forms for field prompts, semantic component names

## Risks & Mitigations

**Risk:** Users forget to rename `prompts_templates/` directory
**Mitigation:** Clear error message when loading templates from old path, with migration instructions

**Risk:** Performance impact of parsing frontmatter for every prompt
**Mitigation:** Frontmatter is already parsed for page loading; this adds minimal overhead

**Risk:** Complex nested field access syntax (`parent_page.fields.author.content`)
**Mitigation:** Documentation with clear examples, error messages for invalid paths

## Implementation Order

1. ✅ Backend: Enhance `prompt-template-processor.ts` with field context and `self.fields.*`
2. ✅ Backend: Add field prompt template handlers
3. ✅ Backend: Update page prompt handlers to use new directory
4. ✅ Frontend: Create `FieldAIAssistButton` and `FieldAIAssistDialog` components
5. ✅ Frontend: Rename existing components for semantic clarity
6. ✅ Frontend: Update field components to use new button
7. ✅ Frontend: Remove OpenAI dependency
8. ✅ Types: Add field prompt template support to schemas
9. ✅ Documentation: Update prompt template documentation with new syntax

## Documentation Updates Required

- Update `docs/raw-ng-quiqr-documentation/prompts_templates.md` with:
  - New directory names
  - `self.fields.[key].content` syntax for page templates
  - Complete field template syntax reference (`self.*`, `parent_page.*`)
  - Examples for both page and field templates
  - Migration guide from old directory structure

## Future Work: Legacy Code Removal

**Status:** Deferred to post-deployment

After the new field AI assist system is deployed and stable, the legacy direct-OpenAI field AI implementation should be removed:

**Legacy Components to Remove:**
- `PageAIAssistButton.tsx` (203 lines) - Uses direct OpenAI API from frontend
- `meta.enableAiAssist` flag throughout form system
- `openAiApiKey` configuration schema
- `hasOpenAiApiKey()` type guard
- `openai` npm package dependency (~500KB)

**See:** `legacy-removal-plan.md` for complete details and `tasks.md` Section 9a for step-by-step removal checklist.

**Rationale for deferring:**
1. Minimize risk in initial deployment
2. Allow users time to migrate to template system
3. Monitor usage patterns before breaking change
4. Separate concerns (new feature vs. cleanup)

**Timeline:** Remove in Release N+2 after new system is proven stable.
