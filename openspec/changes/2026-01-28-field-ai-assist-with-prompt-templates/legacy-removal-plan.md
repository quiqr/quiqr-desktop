# Legacy Field AI Assist - Removal Plan

## Overview

The legacy field AI assist functionality used **direct OpenAI API calls from the frontend**, which has been superseded by the new **template-based system that routes through the backend** with multi-provider support.

## Why Remove It?

1. **Security**: Frontend had direct access to OpenAI API keys
2. **Flexibility**: Hardcoded to OpenAI only, new system supports multiple LLM providers
3. **Maintainability**: Duplicated functionality with template system
4. **Architecture**: Violates principle of centralized backend LLM management
5. **User Experience**: Less flexible than template-based prompts

## What Will Be Removed

### Components (203 lines)
- `PageAIAssistButton.tsx` - Legacy button component with hardcoded prompts
  - Uses `import OpenAI from "openai"` directly in frontend
  - Creates OpenAI client with API key from frontend
  - No template system, just hardcoded prompt logic

### Field Integration
- **StringField.tsx** (lines 84-97)
  - Check for `meta.enableAiAssist` flag
  - Renders legacy `PageAIAssistButton`
  
- **MarkdownField.tsx** (lines 90-103)
  - Check for `meta.enableAiAssist` flag
  - Renders legacy `PageAIAssistButton`

### Metadata System
- **FormContext.tsx**
  - `enableAiAssist: boolean` in FormMeta interface
  
- **SukohForm/index.tsx**
  - `enableAiAssist: true` passed to form meta
  - TODO comment about user prefs
  
- **Dialog components** (PageAIAssistDialog, FieldAIAssistDialog)
  - `enableAiAssist: false` to disable nested dialogs

### Type Guards & Config
- **type-guards.ts**
  - `hasOpenAiApiKey()` function
  
- **config.ts** (in @quiqr/types)
  - `openAiApiKey: z.string().optional()` in schema

### NPM Dependencies
- **package.json**
  - `"openai": "^6.9.0"` package (~500KB+ uncompressed)

## Replacement Feature

Users should use the new **Field AI Assist with Prompt Templates** system:

1. Create template in `field_prompt_templates/`
2. Add `field_prompt_templates: [template_name]` to field config
3. Uses backend LLM router with multi-provider support
4. More flexible with custom prompts and form inputs

## Migration Path for Users

**If users configured `openAiApiKey`:**
- Remove from config
- Configure LLM provider using `QUIQR_LLM_PROVIDER_*` environment variables
- Create field prompt templates
- Add `field_prompt_templates` to field configs

**If users relied on `meta.enableAiAssist`:**
- This was a global flag, not per-field
- New system is per-field via `field_prompt_templates` array
- Provides better control over which fields get AI assist

## Timeline Recommendation

1. **Now**: Deploy new template-based field AI assist
2. **Release N**: Keep legacy code, add deprecation warnings
3. **Release N+1**: Monitor usage, communicate deprecation
4. **Release N+2**: Remove legacy code (execute Section 9a tasks)

## Files to Delete/Modify

### Delete Completely
- `packages/frontend/src/components/PageAIAssistButton.tsx` (203 lines)

### Modify (Remove sections)
- `packages/frontend/src/components/SukohForm/fields/StringField.tsx`
- `packages/frontend/src/components/SukohForm/fields/MarkdownField.tsx`
- `packages/frontend/src/components/SukohForm/FormContext.tsx`
- `packages/frontend/src/components/SukohForm/index.tsx`
- `packages/frontend/src/components/SukohForm/PageAIAssistDialog.tsx`
- `packages/frontend/src/components/SukohForm/FieldAIAssistDialog.tsx`
- `packages/frontend/src/utils/type-guards.ts`
- `packages/types/src/schemas/config.ts`
- `packages/frontend/package.json`

## Estimated Impact

- **Lines removed**: ~250-300 lines of code
- **Bundle size reduction**: ~500KB (openai package)
- **Dependencies removed**: 1 npm package + transitive dependencies
- **Breaking change**: Yes - users with `openAiApiKey` config will need to migrate
- **Risk**: Low - new system already functional and tested

## Verification Checklist

After removal:
- [ ] TypeScript compilation clean
- [ ] No imports from 'openai' package
- [ ] StringField works with FieldAIAssistButton
- [ ] MarkdownField works with FieldAIAssistButton
- [ ] No console errors
- [ ] Bundle size reduced
- [ ] Documentation updated
- [ ] CHANGELOG updated with breaking change

## Detailed Task List

See **Section 9a** in `tasks.md` for the complete step-by-step removal checklist.
