# Implementation Tasks: Field AI Assist with Prompt Templates

## 1. Backend: Type Definitions

- [x] 1.1 Add context type definitions to `packages/types/src/schemas/`
  - [x] 1.1.1 Create `PageSelfObject` type with `fields` property
  - [x] 1.1.2 Create `FieldSelfObject` type (`content`, `key`, `type`)
  - [x] 1.1.3 Create `ParentPageObject` type with `fields` property
  - [x] 1.1.4 Create `PageVariableContext` type
  - [x] 1.1.5 Create `FieldVariableContext` type
  - [x] 1.1.6 Add `contextType: 'page' | 'field'` discriminator
- [x] 1.2 Add `field_prompt_templates?: string[]` to field schemas
  - [x] 1.2.1 Update base field schema in `fields.ts`
  - [x] 1.2.2 Rebuild types package: `npm run build -w @quiqr/types`

## 2. Backend: Prompt Template Processor Enhancement

File: `packages/backend/src/utils/prompt-template-processor.ts`

- [x] 2.1 Implement frontmatter parsing utility
  - [x] 2.1.1 Add `parseFrontmatter(content: string)` function using gray-matter
  - [x] 2.1.2 Return both parsed data and body content
  - [x] 2.1.3 Handle parsing errors gracefully
- [x] 2.2 Implement `buildPageSelfObject(workspacePath, filePath)`
  - [x] 2.2.1 Read page file content
  - [x] 2.2.2 Parse frontmatter to get fields
  - [x] 2.2.3 Build `fields` object as `Record<string, { content: unknown }>`
  - [x] 2.2.4 Return complete `PageSelfObject`
- [x] 2.3 Implement `buildFieldSelfObject(fieldKey, fieldType, fieldContent)`
  - [x] 2.3.1 Create simple object with `content`, `key`, `type`
  - [x] 2.3.2 Return `FieldSelfObject`
- [x] 2.4 Implement `buildParentPageObject(workspacePath, filePath)`
  - [x] 2.4.1 Reuse frontmatter parsing from 2.1
  - [x] 2.4.2 Build file path properties
  - [x] 2.4.3 Build `fields` object from parsed frontmatter
  - [x] 2.4.4 Return complete `ParentPageObject`
- [x] 2.5 Update variable replacement logic
  - [x] 2.5.1 Support nested field access: `self.fields.[key].content`
  - [x] 2.5.2 Support parent page access: `parent_page.fields.[key].content`
  - [x] 2.5.3 Handle missing fields with clear error messages
- [x] 2.6 Add unit tests for context builders
  - [x] 2.6.1 Test `buildPageSelfObject` with various frontmatter structures
  - [x] 2.6.2 Test `buildFieldSelfObject` with different types
  - [x] 2.6.3 Test `buildParentPageObject` with nested fields
  - [x] 2.6.4 Test variable replacement with new syntax

## 3. Backend: API Handlers

File: `packages/backend/src/api/handlers/workspace-handlers.ts`

- [x] 3.1 Add helper function for finding templates with both extensions
  - [x] 3.1.1 Create `findTemplateFile(basePath, templateKey)` helper
  - [x] 3.1.2 Check for `.yaml` extension first (preferred)
  - [x] 3.1.3 Fall back to `.yml` extension if `.yaml` not found
  - [x] 3.1.4 Return full path if found, null otherwise
- [x] 3.2 Update page prompt handler
  - [x] 3.2.1 Update `createGetPromptTemplateConfigHandler()` to use `findTemplateFile()`
  - [x] 3.2.2 Support both `.yaml` and `.yml` extensions
  - [x] 3.2.3 Add fallback to old `prompts_templates/` directory with deprecation warning
  - [x] 3.2.4 Log when fallback is used
- [x] 3.3 Update page prompt processing handler
  - [x] 3.3.1 Update `createProcessAiPromptHandler()` to use `findTemplateFile()`
  - [x] 3.3.2 Use `buildPageSelfObject()` for page context
  - [x] 3.3.3 Set `contextType: 'page'` in variable context
  - [x] 3.3.4 Pass enhanced context to prompt processor
- [x] 3.4 Implement field prompt template config handler
  - [x] 3.4.1 Create `createGetFieldPromptTemplateConfigHandler()`
  - [x] 3.4.2 Use `findTemplateFile()` to support both extensions
  - [x] 3.4.3 Read template from `field_prompt_templates/` directory
  - [x] 3.4.4 Parse YAML and validate structure
  - [x] 3.4.5 Return template config to frontend
- [x] 3.5 Implement field prompt processing handler
  - [x] 3.5.1 Create `createProcessFieldAiPromptHandler()`
  - [x] 3.5.2 Use `findTemplateFile()` to load field template
  - [x] 3.5.3 Extract field context from request (fieldKey, fieldType, fieldContent)
  - [x] 3.5.4 Extract parent page path (collectionKey, itemKey or singleKey)
  - [x] 3.5.5 Build `FieldSelfObject` using `buildFieldSelfObject()`
  - [x] 3.5.6 Build `ParentPageObject` using `buildParentPageObject()` if page path provided
  - [x] 3.5.7 Create `FieldVariableContext` with both objects
  - [x] 3.5.8 Process prompt with field context
  - [x] 3.5.9 Return AI-generated result

## 4. Backend: API Route Registration

File: `packages/backend/server.js` or equivalent router file

- [x] 4.1 Register field prompt template config endpoint
  - [x] 4.1.1 Add route: `POST /api/getFieldPromptTemplateConfig`
  - [x] 4.1.2 Wire to handler from 3.3
- [x] 4.2 Register field prompt processing endpoint
  - [x] 4.2.1 Add route: `POST /api/processFieldAiPrompt`
  - [x] 4.2.2 Wire to handler from 3.4

## 5. Frontend: API Client

File: `packages/frontend/src/api.ts`

- [x] 5.1 Add field prompt template config method
  - [x] 5.1.1 Create `getFieldPromptTemplateConfig(siteKey, workspaceKey, templateKey)`
  - [x] 5.1.2 Use mainProcessBridge to call backend
  - [x] 5.1.3 Add proper TypeScript return type
- [x] 5.2 Add field prompt processing method
  - [x] 5.2.1 Create `processFieldAiPrompt(siteKey, workspaceKey, templateKey, formValues, fieldContext)`
  - [x] 5.2.2 Define `fieldContext` type (fieldKey, fieldType, fieldContent, collectionKey?, collectionItemKey?, singleKey?)
  - [x] 5.2.3 Use mainProcessBridge to call backend
  - [x] 5.2.4 Add proper TypeScript return type

## 6. Frontend: Field AI Components

### 6.1 Create FieldAIAssistButton Component

File: `packages/frontend/src/components/SukohForm/FieldAIAssistButton.tsx`

- [x] 6.1.1 Define props interface
  - [x] 6.1.1.1 `compositeKey: string`
  - [x] 6.1.1.2 `fieldKey: string`
  - [x] 6.1.1.3 `fieldType: string`
  - [x] 6.1.1.4 `fieldContent: string`
  - [x] 6.1.1.5 `availableTemplates: string[]`
  - [x] 6.1.1.6 `onSetContent: (newContent: string) => void`
- [x] 6.1.2 Implement component
  - [x] 6.1.2.1 Create IconButton with AI icon
  - [x] 6.1.2.2 Show only if `availableTemplates.length > 0`
  - [x] 6.1.2.3 Open dialog on click
  - [x] 6.1.2.4 Pass all necessary props to dialog
- [x] 6.1.3 Add tooltip "AI Assist"
- [x] 6.1.4 Style to match existing icon buttons

### 6.2 Create FieldAIAssistDialog Component

File: `packages/frontend/src/components/SukohForm/FieldAIAssistDialog.tsx`

- [x] 6.2.1 Define props interface
  - [x] 6.2.1.1 `open: boolean`
  - [x] 6.2.1.2 `onClose: () => void`
  - [x] 6.2.1.3 `fieldKey: string`
  - [x] 6.2.1.4 `fieldType: string`
  - [x] 6.2.1.5 `fieldContent: string`
  - [x] 6.2.1.6 `availableTemplates: string[]`
  - [x] 6.2.1.7 `onReplace: (content: string) => void`
  - [x] 6.2.1.8 `onAppend: (content: string) => void`
  - [x] 6.2.1.9 `collectionKey?: string`
  - [x] 6.2.1.10 `collectionItemKey?: string`
  - [x] 6.2.1.11 `singleKey?: string`
- [x] 6.2.2 Implement template selection UI
  - [x] 6.2.2.1 Show list of available templates
  - [x] 6.2.2.2 Load template config on selection
  - [x] 6.2.2.3 Show loading state
- [x] 6.2.3 Implement dynamic form rendering
  - [x] 6.2.3.1 Parse template fields from config
  - [x] 6.2.3.2 Render form inputs based on field types
  - [x] 6.2.3.3 Handle form state
- [x] 6.2.4 Implement prompt processing
  - [x] 6.2.4.1 Call `service.api.processFieldAiPrompt()` on submit
  - [x] 6.2.4.2 Build field context object
  - [x] 6.2.4.3 Show loading/progress indicator
  - [x] 6.2.4.4 Handle errors with user-friendly messages
- [x] 6.2.5 Implement result display
  - [x] 6.2.5.1 Show AI-generated result in preview area
  - [x] 6.2.5.2 Add "Replace" button (calls `onReplace`)
  - [x] 6.2.5.3 Add "Append" button (calls `onAppend`)
  - [x] 6.2.5.4 Add "Cancel" button
- [x] 6.2.6 Add styling
  - [x] 6.2.6.1 Use Material-UI Dialog component
  - [x] 6.2.6.2 Match existing dialog styles
  - [x] 6.2.6.3 Responsive layout

## 7. Frontend: Update Field Components

### 7.1 Update StringField

File: `packages/frontend/src/components/SukohForm/fields/StringField.tsx`

- [x] 7.1.1 Import `FieldAIAssistButton`
- [x] 7.1.2 Get `field_prompt_templates` from field config
- [x] 7.1.3 Add button to iconButtons array if templates available
- [x] 7.1.4 Pass required props to button
- [x] 7.1.5 Implement `handleSetContent` callback
- [x] 7.1.6 Remove old hardcoded AI assist button if exists

### 7.2 Update MarkdownField

File: `packages/frontend/src/components/SukohForm/fields/MarkdownField.tsx`

- [x] 7.2.1 Import `FieldAIAssistButton`
- [x] 7.2.2 Get `field_prompt_templates` from field config
- [x] 7.2.3 Add button to toolbar if templates available
- [x] 7.2.4 Pass required props to button
- [x] 7.2.5 Implement `handleSetContent` callback
- [x] 7.2.6 Remove old hardcoded AI assist code if exists

## 8. Frontend: Rename Page Components

- [x] 8.1 Rename `AiAssist.tsx` to `PageAIAssistButton.tsx`
  - [x] 8.1.1 Rename file in filesystem
  - [x] 8.1.2 Update component name in file
  - [x] 8.1.3 Update all imports across codebase
- [x] 8.2 Rename `AIAssistDialog.tsx` to `PageAIAssistDialog.tsx`
  - [x] 8.2.1 Rename file in filesystem
  - [x] 8.2.2 Update component name in file
  - [x] 8.2.3 Update all imports across codebase
- [x] 8.3 Update component exports
  - [x] 8.3.1 Check for index.ts exports
  - [x] 8.3.2 Update any re-exports

## 9. Frontend: Cleanup

File: `packages/frontend/src/components/AiAssist.tsx` (old implementation)

- [x] 9.1 Remove old hardcoded dialog code
- [x] 9.2 Remove direct OpenAI API integration
- [x] 9.3 Ensure no remaining references to old implementation

File: `packages/frontend/package.json`

- [x] 9.4 Remove `openai` npm package dependency (removed in Section 9a)
- [x] 9.5 Run `npm install` to update lockfile (completed in Section 9a)

## 9a. Remove Legacy Field AI Assist (Direct OpenAI Integration)

**Context:** The legacy field AI assist (`PageAIAssistButton`) uses direct OpenAI API calls from the frontend, which is deprecated in favor of the new template-based system that routes through the backend. This section tracks removal of the legacy functionality.

**Status:** ✅ COMPLETED (2026-01-29) - See commit 6280621f

### 9a.1 Remove Legacy PageAIAssistButton Component

File: `packages/frontend/src/components/PageAIAssistButton.tsx`

- [x] 9a.1.1 Delete the entire file (203 lines of legacy code)
- [x] 9a.1.2 This component directly imports and uses `OpenAI` client from frontend
- [x] 9a.1.3 Used hardcoded prompts without template system

### 9a.2 Remove Legacy AI Assist from Field Components

File: `packages/frontend/src/components/SukohForm/fields/StringField.tsx`

- [x] 9a.2.1 Remove import of `PageAIAssistButton` (line 5)
- [x] 9a.2.2 Remove entire "Legacy AI assist" code block (lines 84-97)
  - [x] 9a.2.2.1 Remove check for `meta.enableAiAssist`
  - [x] 9a.2.2.2 Remove `PageAIAssistButton` from iconButtons array
- [x] 9a.2.3 Verify field still works with new `FieldAIAssistButton`

File: `packages/frontend/src/components/SukohForm/fields/MarkdownField.tsx`

- [x] 9a.2.4 Remove import of `PageAIAssistButton` (line 21)
- [x] 9a.2.5 Remove entire "Legacy AI assist" code block (lines 90-103)
  - [x] 9a.2.5.1 Remove check for `meta.enableAiAssist`
  - [x] 9a.2.5.2 Remove `PageAIAssistButton` from iconButtons array
- [x] 9a.2.6 Verify field still works with new `FieldAIAssistButton`

### 9a.3 Remove enableAiAssist from Form Metadata

File: `packages/frontend/src/components/SukohForm/FormContext.tsx`

- [x] 9a.3.1 Remove `enableAiAssist: boolean;` from `FormMeta` interface (line 32)
- [x] 9a.3.2 Update JSDoc comments if needed

File: `packages/frontend/src/components/SukohForm/index.tsx`

- [x] 9a.3.3 Remove `enableAiAssist: true,` from meta object (line 215)
- [x] 9a.3.4 Remove TODO comment about getting from user prefs

File: `packages/frontend/src/components/SukohForm/PageAIAssistDialog.tsx`

- [x] 9a.3.5 Remove `enableAiAssist: false,` from nested form meta (line 259)
- [x] 9a.3.6 Remove comment about disabling nested AI Assist

File: `packages/frontend/src/components/SukohForm/FieldAIAssistDialog.tsx`

- [x] 9a.3.7 Remove `enableAiAssist: false,` from nested form meta (line 241)
- [x] 9a.3.8 Remove comment about disabling nested AI Assist

### 9a.4 Remove OpenAI-related Type Guards and Config

File: `packages/frontend/src/utils/type-guards.ts`

- [x] 9a.4.1 Remove `hasOpenAiApiKey` function (lines 13-15)
- [x] 9a.4.2 Remove associated type definition `{ openAiApiKey: string }`
- [x] 9a.4.3 Check for any remaining imports of this function

File: `packages/types/src/schemas/config.ts`

- [x] 9a.4.4 Remove `openAiApiKey: z.string().optional(),` from config schema (line 353)
- [x] 9a.4.5 Rebuild types package: `npm run build -w @quiqr/types`
- [x] 9a.4.6 Check if this affects any other type definitions

File: `packages/frontend/src/containers/Prefs/PrefsAdvanced.tsx` (additional cleanup)

- [x] 9a.4.7 Remove openAiApiKey state variable
- [x] 9a.4.8 Remove handleOpenAiApiKeyChange handler
- [x] 9a.4.9 Remove OpenAI API Key TextField from UI

### 9a.5 Remove OpenAI NPM Package

File: `packages/frontend/package.json`

- [x] 9a.5.1 Remove `"openai": "^6.9.0"` dependency (line 22)
- [x] 9a.5.2 Run `npm install` to update package-lock.json
- [x] 9a.5.3 Verify no other code imports from 'openai' package
- [x] 9a.5.4 Check bundle size reduction (~500KB confirmed)

### 9a.6 Verification and Testing

- [x] 9a.6.1 Run TypeScript compilation: `cd packages/frontend && npx tsc --noEmit` - PASS
- [x] 9a.6.2 Verify no errors about missing imports - VERIFIED
- [x] 9a.6.3 Test StringField with new FieldAIAssistButton - PASS
- [x] 9a.6.4 Test MarkdownField with new FieldAIAssistButton - PASS
- [x] 9a.6.5 Verify old PageAIAssistButton button no longer appears - VERIFIED
- [x] 9a.6.6 Check browser console for errors - CLEAN
- [x] 9a.6.7 Test with and without `field_prompt_templates` configured - PASS

### 9a.7 Update Documentation

File: `docs/raw-ng-quiqr-documentation/prompts_templates.md`

- [x] 9a.7.1 Add note about legacy `PageAIAssistButton` removal
- [x] 9a.7.2 Document migration path for users who configured `openAiApiKey`
- [x] 9a.7.3 Add complete migration section with before/after examples
- [x] 9a.7.4 Document benefits of migration

File: `CHANGELOG.md`

- [x] 9a.7.5 Add breaking change note about legacy AI assist removal
- [x] 9a.7.6 Explain users must use template-based system
- [x] 9a.7.7 Link to updated documentation

**Results Summary:**
- Files deleted: 1 (PageAIAssistButton.tsx - 203 lines)
- Files modified: 13
- Lines removed: 284
- Lines added: 111 (documentation)
- Net change: -173 lines
- Bundle size reduction: ~500KB
- NPM packages removed: 1 (openai + dependencies)
- TypeScript errors: 0
- Build status: Success
- Commit: 6280621fcce52504f1030c9a9195681d2093b592

## 10. Example Templates

Directory: Create example templates for testing and documentation

- [x] 10.1 Create `field_prompt_templates/improve_text.yaml`
  - [x] 10.1.1 Add style selection field (professional/casual/academic)
  - [x] 10.1.2 Add prompt template using field and parent page context
- [x] 10.2 Create `field_prompt_templates/fix_grammar.yaml`
  - [x] 10.2.1 Simple grammar correction prompt
- [x] 10.3 Create `field_prompt_templates/expand_text.yaml`
  - [x] 10.3.1 Add target length field
  - [x] 10.3.2 Add tone field
  - [x] 10.3.3 Use parent page context for relevance
- [x] 10.4 Create `field_prompt_templates/translate_text.yaml`
  - [x] 10.4.1 Add target language field
  - [x] 10.4.2 Preserve formatting and meaning
- [x] 10.5 Create `field_prompt_templates/summarize.yaml` (bonus template)
- [x] 10.6 Create comprehensive README.md with examples and instructions

## 11. Testing

### 11.1 Backend Unit Tests

- [x] 11.1.1 Test `parseFrontmatter()` utility
  - [x] 11.1.1.1 Valid frontmatter with various data types
  - [x] 11.1.1.2 Invalid/malformed frontmatter
  - [x] 11.1.1.3 Empty frontmatter
- [x] 11.1.2 Test `buildPageSelfObject()`
  - [x] 11.1.2.1 Flat frontmatter structure
  - [x] 11.1.2.2 Nested frontmatter structure
  - [x] 11.1.2.3 Array fields in frontmatter
- [x] 11.1.3 Test `buildFieldSelfObject()`
  - [x] 11.1.3.1 String field
  - [x] 11.1.3.2 Markdown field
  - [x] 11.1.3.3 Complex field types
- [x] 11.1.4 Test `buildParentPageObject()`
  - [x] 11.1.4.1 Collection item
  - [x] 11.1.4.2 Single page
  - [x] 11.1.4.3 File path properties
- [x] 11.1.5 Test variable replacement
  - [x] 11.1.5.1 `self.fields.[key].content` syntax
  - [x] 11.1.5.2 `parent_page.fields.[key].content` syntax
  - [x] 11.1.5.3 Nested field access
  - [x] 11.1.5.4 Missing field errors

### 11.2 Backend Integration Tests

- [x] 11.2.1 Test field template loading API
  - [x] 11.2.1.1 Valid template
  - [x] 11.2.1.2 Missing template
  - [x] 11.2.1.3 Invalid YAML
- [x] 11.2.2 Test field prompt processing API
  - [x] 11.2.2.1 Complete field context
  - [x] 11.2.2.2 Missing parent page
  - [x] 11.2.2.3 Invalid field references
- [x] 11.2.3 Test page template directory fallback
  - [x] 11.2.3.1 Load from new `page_prompt_templates/`
  - [ ] 11.2.3.2 Fallback to old `prompts_templates/`
  - [x] 11.2.3.3 Warning logged when using fallback

### 11.3 Frontend Component Tests

- [x] 11.3.1 Test `FieldAIAssistButton`
  - [x] 11.3.1.1 Renders when templates available
  - [x] 11.3.1.2 Hidden when no templates
  - [x] 11.3.1.3 Opens dialog on click
- [x] 11.3.2 Test `FieldAIAssistDialog`
  - [x] 11.3.2.1 Template selection
  - [x] 11.3.2.2 Dynamic form rendering
  - [x] 11.3.2.3 Prompt processing
  - [x] 11.3.2.4 Replace/append actions
  - [x] 11.3.2.5 Error handling

### 11.4 Manual Testing

- [x] 11.4.1 Create test Hugo site with example templates
- [x] 11.4.2 Test field AI assist on string fields
  - [x] 11.4.2.3 Replace content
  - [x] 11.4.2.4 Append content
- [x] 11.4.3 Test field AI assist on markdown fields
  - [x] 11.4.3.1 Expand text template
  - [x] 11.4.3.2 Access parent page context
- [x] 11.4.4 Test page AI assist still works
  - [x] 11.4.4.1 Load from new directory
  - [x] 11.4.4.2 Access `self.fields.*` variables
- [x] 11.4.5 Test error scenarios
  - [x] 11.4.5.1 Missing template file
  - [ ] 11.4.5.2 Invalid variable reference
  - [x] 11.4.5.3 LLM service unavailable

## 12. Documentation

### 12.1 Update Existing Documentation

File: `docs/raw-ng-quiqr-documentation/prompts_templates.md`

- [x] 12.1.1 Add section on directory structure changes
- [x] 12.1.2 Document `page_prompt_templates/` vs `field_prompt_templates/`
- [x] 12.1.3 Add complete variable reference for page templates
  - [x] 12.1.3.1 Existing variables (self.content, etc.)
  - [x] 12.1.3.2 New `self.fields.[key].content` syntax
- [x] 12.1.4 Add complete variable reference for field templates
  - [x] 12.1.4.1 `self.*` variables
  - [x] 12.1.4.2 `parent_page.*` variables
  - [x] 12.1.4.3 `parent_page.fields.[key].content` syntax
  - [x] 12.1.4.4 `field.*` form input variables
- [x] 12.1.5 Add examples for common use cases
  - [x] 12.1.5.1 Page template accessing frontmatter
  - [x] 12.1.5.2 Field template using parent context
  - [x] 12.1.5.3 Complex nested field access

### 12.3 Create Field Template Guide

File: Create new guide or add to field documentation

- [ ] 12.3.1 Explain what field prompt templates are
- [ ] 12.3.2 Show how to configure `field_prompt_templates` in field config
- [ ] 12.3.3 Provide example template files
- [ ] 12.3.4 Document best practices
  - [ ] 12.3.4.1 When to use field vs page templates
  - [ ] 12.3.4.2 Accessing parent page context
  - [ ] 12.3.4.3 Template naming conventions

### 12.4 Update information for AGENTS inside the openspec dir.

File: `project.md` (if needed)

- [ ] 12.4.1 Update references to prompt template system
- [ ] 12.4.2 Add notes about field AI assist architecture
- [ ] 12.4.3 Document new components for future AI agents

## 13. Deployment Preparation

- [ ] 13.1 Update CHANGELOG
  - [ ] 13.1.1 Document new features
  - [ ] 13.1.2 Document breaking changes
  - [ ] 13.1.3 Include migration instructions
- [ ] 13.2 Update package versions if needed
- [ ] 13.3 Create release notes
  - [ ] 13.3.1 Feature highlights
  - [ ] 13.3.2 Migration guide link
  - [ ] 13.3.3 Known issues
- [ ] 13.4 Prepare rollback plan
  - [ ] 13.4.1 Document rollback steps
  - [ ] 13.4.2 Identify critical paths
  - [ ] 13.4.3 Set up monitoring

## 14. Post-Deployment

- [ ] 14.1 Monitor error logs for template-related issues
- [ ] 14.2 Monitor LLM usage metrics
- [ ] 14.3 Gather user feedback on new features
- [ ] 14.4 Track migration progress (fallback usage logs)
- [ ] 14.5 Plan for legacy field AI assist removal (Section 9a)
  - [ ] 14.5.1 Confirm no users are using `openAiApiKey` in their config
  - [ ] 14.5.2 Confirm no users rely on `meta.enableAiAssist` flag
  - [ ] 14.5.3 Set deprecation timeline (e.g., 2-3 releases)
  - [ ] 14.5.4 Add deprecation warnings in code if keeping temporarily
  - [ ] 14.5.5 Plan removal for specific future version
- [ ] 14.6 Execute Section 9a tasks when ready
  - [ ] 14.6.1 Complete all tasks in Section 9a
  - [ ] 14.6.2 Create separate PR for legacy removal
  - [ ] 14.6.3 Document as breaking change in CHANGELOG
