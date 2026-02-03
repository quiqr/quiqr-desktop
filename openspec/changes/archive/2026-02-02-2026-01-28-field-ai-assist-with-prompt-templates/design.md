# Design: Field AI Assist with Prompt Templates

## Context

The current AI Assist implementation has two separate architectures:
- **Page-level AI Assist**: Uses backend LLM service, supports prompt templates from `prompts_templates/` directory, secure (no frontend API keys)
- **Field-level AI Assist**: Uses frontend OpenAI API calls directly, hardcoded dialog, exposes API keys to browser, limited functionality

This creates security vulnerabilities, architectural inconsistency, and limits extensibility. We need to unify both approaches under the same secure, template-driven architecture.

### Constraints
- Must maintain backward compatibility for existing page prompt templates
- All AI calls must go through backend LLM service (security requirement)
- Frontend must never have access to API keys
- Template syntax must be intuitive and self-explanatory
- Type safety throughout (TypeScript/Zod)

### Stakeholders
- **End users**: Content editors who use AI assist for fields and pages
- **Site developers**: Configure prompt templates for their Hugo/Quarto sites
- **Frontend developers**: Work with components and API integration
- **Backend developers**: Maintain LLM service and template processing

## Goals / Non-Goals

### Goals
1. **Security**: Remove all frontend API key exposure, route through backend LLM service
2. **Consistency**: Unified architecture for page and field AI assistance
3. **Extensibility**: Easy to add new field prompt templates
4. **Flexibility**: Field templates can access both field content and parent page context
5. **Semantic naming**: Clear component names that indicate page vs field scope
6. **Type safety**: Proper TypeScript types for all contexts

### Non-Goals
1. Real-time collaborative AI features
2. AI model training or fine-tuning
3. Custom LLM provider configuration in frontend (stays in backend)
4. Visual template builder UI (templates remain YAML files)
5. AI-powered template generation

## Decisions

### Decision 1: Variable Syntax for Field Prompts

**Chosen: Option 2 - Intuitive Field-Centric Syntax**

```yaml
# Field template variables:
self.content          # Current field's content (NOT page content)
self.key              # Field key (e.g., "title")
self.type             # Field type (e.g., "string")
parent_page.content   # Full page content with frontmatter
parent_page.file_path # Page file path
parent_page.fields.title.content  # Access other fields
field.style           # Form input values from template
```

**Why:**
- `self` naturally refers to the field itself in a field template context
- `parent_page` is explicit and unambiguous
- Mirrors object-oriented convention (self = this object)
- Clear separation between field (`self`) and page (`parent_page`) contexts

**Alternatives Considered:**

**Option 1: Consistent with Page Templates**
```yaml
self.content          # Page content
field.content         # Current field content
field.key, field.type
field.parent.content  # Parent page
```
- ❌ Confusing: `self.content` means different things in page vs field templates
- ❌ `field.parent` is ambiguous (parent field in nested structure?)
- ✅ Consistent with existing page template conventions

**Option 3: Fully Qualified Paths**
```yaml
current_field.content
current_field.key
parent_page.content
parent_page.fields.title.content
template_field.style  # Form inputs
```
- ✅ Extremely explicit, no ambiguity
- ❌ Verbose and harder to read
- ❌ Breaks convention of `self` for current context

### Decision 2: Directory Structure

**Chosen: Separate Directories for Page and Field Templates**

```
[site]/quiqr/model/includes/
├── page_prompt_templates/     # Renamed from prompts_templates/
│   ├── improve_page.yaml
│   └── translate_page.yaml
└── field_prompt_templates/    # New directory
    ├── improve_text.yaml
    ├── fix_grammar.yaml
    └── expand_text.yaml
```

**Why:**
- Clear separation of concerns (page vs field)
- Easy to understand template scope at a glance
- Prevents accidental misuse (loading field template for page or vice versa)
- Allows different template schemas if needed in future

**Alternatives Considered:**

**Option 1: Single Directory with Metadata**
```yaml
# In template YAML
scope: field  # or 'page'
```
- ✅ Single location for all templates
- ❌ Requires parsing files to determine scope
- ❌ Easier to make mistakes (wrong scope value)

**Option 2: Subdirectories in Single Location**
```
prompts_templates/
├── page/
└── field/
```
- ✅ Single top-level directory
- ❌ Extra nesting level
- ❌ Doesn't follow existing flat structure convention

### Decision 2.1: File Extension Support

**Chosen: Support Both `.yaml` and `.yml` Extensions**

The system supports both `.yaml` and `.yml` file extensions for all prompt template files, with `.yaml` taking precedence when both exist.

**Why:**
- Accommodates user preference (both extensions are common in YAML ecosystem)
- `.yml` is shorter and preferred by some users
- `.yaml` is more explicit and recommended by YAML specification
- No technical reason to restrict to one extension
- Minimal implementation complexity (just check both extensions)

**Implementation:**
```typescript
function findTemplateFile(basePath: string, templateKey: string): string | null {
  const yamlPath = path.join(basePath, `${templateKey}.yaml`);
  const ymlPath = path.join(basePath, `${templateKey}.yml`);
  
  if (fs.existsSync(yamlPath)) return yamlPath;  // .yaml takes precedence
  if (fs.existsSync(ymlPath)) return ymlPath;
  return null;
}
```

**Precedence Rules:**
1. Check `.yaml` first (recommended extension)
2. Fall back to `.yml` if `.yaml` not found
3. Return null if neither exists

**Applies to:**
- Page prompt templates (`page_prompt_templates/*.{yaml,yml}`)
- Field prompt templates (`field_prompt_templates/*.{yaml,yml}`)
- Legacy templates (`prompts_templates/*.{yaml,yml}`)

**Alternatives Considered:**

**Option 1: Require `.yaml` Only**
- ✅ Consistency - everyone uses same extension
- ❌ Breaks existing sites using `.yml`
- ❌ Forces users to rename files
- ❌ Unnecessarily restrictive

**Option 2: Require `.yml` Only**
- ✅ Shorter file names
- ❌ Less common in YAML specification
- ❌ Breaks existing sites using `.yaml`
- ❌ Goes against YAML official recommendation

**Option 3: Support Both with `.yml` Precedence**
- ✅ Flexible like chosen option
- ❌ Contradicts YAML specification preference for `.yaml`
- ❌ Could surprise users expecting `.yaml` to take precedence

### Decision 3: Component Naming Strategy

**Chosen: Semantic Scope-Based Names**

```typescript
// Page-level components
PageAIAssistButton.tsx      // Icon button that opens page AI dialog
PageAIAssistDialog.tsx      // Dialog for page-level prompts

// Field-level components
FieldAIAssistButton.tsx     // Icon button that opens field AI dialog
FieldAIAssistDialog.tsx     // Dialog for field-level prompts
```

**Why:**
- Immediately clear what level each component operates at
- Prevents accidental misuse (using page component in field)
- Follows standard React component naming (noun-based, descriptive)
- Easy to search and find related components

**Alternatives Considered:**

**Option 1: Keep Generic Names**
```typescript
AiAssist.tsx
AIAssistDialog.tsx
```
- ❌ Ambiguous scope (page or field?)
- ❌ Hard to distinguish in imports
- ✅ Shorter names

**Option 2: Prefix-Based**
```typescript
PgAiAssist.tsx, PgAIAssistDialog.tsx
FldAiAssist.tsx, FldAIAssistDialog.tsx
```
- ❌ Abbreviations are less readable
- ❌ Not standard React naming convention
- ✅ Very short names

### Decision 4: Enhanced Page Template Variables

**Chosen: Add `self.fields.[key].content` to Page Templates**

```yaml
# Page template variables (enhanced):
self.content                        # Full page content (unchanged)
self.file_path                      # Page path (unchanged)
self.fields.title.content          # NEW: Access parsed frontmatter
self.fields.author.content         # NEW: Access parsed frontmatter
field.target_lang                   # Form inputs (unchanged)
```

**Why:**
- Page templates can now read specific frontmatter fields
- Enables more sophisticated prompts (e.g., "translate title to {{ field.target_lang }}")
- Consistent with field template's `parent_page.fields.[key].content` syntax
- Backward compatible (all existing variables still work)

**Alternatives Considered:**

**Option 1: No Enhancement (Keep Existing Only)**
- ❌ Page templates cannot access parsed frontmatter
- ❌ Limits prompt sophistication
- ✅ No additional complexity

**Option 2: Separate Object for Frontmatter**
```yaml
frontmatter.title
frontmatter.author
```
- ✅ Clear separation
- ❌ Inconsistent with field template syntax
- ❌ More complex mental model

### Decision 5: Field Template Configuration

**Chosen: Array Property on Field Config**

```yaml
# In collection or single config:
fields:
  - key: title
    type: string
    field_prompt_templates:
      - improve_text
      - fix_grammar
  - key: content
    type: markdown
    field_prompt_templates:
      - expand_text
      - improve_text
```

**Why:**
- Simple array of template keys
- Easy to configure and understand
- Follows existing pattern for other field properties
- Frontend can easily check if field has templates

**Alternatives Considered:**

**Option 1: Boolean Flag Only**
```yaml
enable_ai_assist: true
```
- ❌ Cannot specify which templates to show
- ❌ Shows all templates to all fields
- ✅ Simpler for "enable all" case

**Option 2: Object with Options**
```yaml
ai_assist:
  enabled: true
  templates: [improve_text, fix_grammar]
  default: improve_text
```
- ✅ More options (default template, etc.)
- ❌ Overly complex for initial implementation
- ❌ Can add later if needed

### Decision 6: Backend Context Building

**Chosen: Separate Context Builders for Page and Field**

```typescript
// Page context
buildPageSelfObject(workspacePath, filePath): Promise<PageSelfObject>

// Field context
buildFieldSelfObject(fieldKey, fieldType, fieldContent): FieldSelfObject
buildParentPageObject(workspacePath, filePath): Promise<ParentPageObject>
```

**Why:**
- Clear separation of responsibilities
- `buildParentPageObject` can reuse frontmatter parsing logic
- Type-safe return values
- Testable in isolation

**Alternatives Considered:**

**Option 1: Single Universal Context Builder**
```typescript
buildVariableContext(type: 'page' | 'field', params): VariableContext
```
- ❌ Complex conditional logic
- ❌ Harder to type correctly
- ✅ Single function to maintain

**Option 2: Class-Based Approach**
```typescript
class ContextBuilder {
  buildPageContext(): PageVariableContext
  buildFieldContext(): FieldVariableContext
}
```
- ✅ Organized with class methods
- ❌ Adds OOP complexity where simple functions suffice
- ❌ Backend uses functional style elsewhere

## Risks / Trade-offs

### Risk 1: Directory Rename Breaks Existing Sites

**Risk:** Users with existing `prompts_templates/` will see errors after upgrade

**Mitigation:**
1. Detection: Check if old directory exists on workspace load
2. Warning: Show clear migration message with instructions
3. Fallback: Optionally support reading from old directory with deprecation warning
4. Documentation: Migration guide in release notes

**Trade-off:**
- Could keep old name for backward compatibility
- But `prompts_templates/` is ambiguous (page? field? both?)
- Clean break with clear naming is better long-term

### Risk 2: Performance Impact of Frontmatter Parsing

**Risk:** Parsing frontmatter for every field prompt request could be slow

**Mitigation:**
1. Frontmatter is already parsed when loading pages in the editor
2. Can cache parsed frontmatter in memory during edit session
3. Parsing is fast (gray-matter library is optimized)
4. Only parse parent page once per field prompt request

**Trade-off:**
- Could skip `parent_page.fields.*` to avoid parsing
- But this severely limits field template capabilities
- Benefit of rich context outweighs minimal performance cost

### Risk 3: Complex Nested Field Access Syntax

**Risk:** `parent_page.fields.author.name.content` becomes hard to understand

**Mitigation:**
1. Documentation with clear examples
2. Error messages show available fields when path is invalid
3. Most common case is simple: `parent_page.fields.title.content`
4. Power users can handle nested paths if needed

**Trade-off:**
- Could limit to one level of nesting
- But this prevents accessing nested frontmatter structures
- Keep flexible syntax, provide good error messages

### Risk 4: Component Renaming Breaks In-Flight PRs

**Risk:** Renaming `AiAssist.tsx` → `PageAIAssistButton.tsx` conflicts with other work

**Mitigation:**
1. Coordinate with team before renaming
2. Use git grep to find all imports
3. Update all references in single commit
4. Consider doing renames in separate PR if needed

**Trade-off:**
- Could keep old names to avoid disruption
- But ambiguous names cause long-term confusion
- Better to do rename now during refactoring

### Risk 5: Template Key Conflicts Between Page and Field

**Risk:** Same template key (e.g., `improve_text`) exists in both directories

**Mitigation:**
1. Different directories prevent file conflicts
2. Backend handlers load from correct directory based on context
3. Template keys are scoped to their type (page vs field)
4. Can have `page_prompt_templates/improve_text.yaml` and `field_prompt_templates/improve_text.yaml` with different content

**Trade-off:**
- Could enforce globally unique keys across both types
- But this limits flexibility (can't reuse good names)
- Scoped keys are more flexible

## Migration Plan

### Phase 1: Backend Infrastructure (No Breaking Changes)
1. Enhance `prompt-template-processor.ts`:
   - Add `PageSelfObject.fields` property
   - Add `FieldSelfObject` type
   - Add `ParentPageObject` type
   - Add `contextType: 'page' | 'field'` to contexts
   - Implement `buildFieldSelfObject()`, `buildParentPageObject()`

2. Add field prompt handlers to `workspace-handlers.ts`:
   - `createGetFieldPromptTemplateConfigHandler()`
   - `createProcessFieldAiPromptHandler()`

3. Update `@quiqr/types`:
   - Add `field_prompt_templates?: string[]` to field schemas
   - Add new context type definitions

**Deployment:** Can deploy at this point without breaking changes (new APIs unused)

### Phase 2: Frontend Field Components (New Features)
1. Create `FieldAIAssistButton.tsx` and `FieldAIAssistDialog.tsx`
2. Add API methods to `api.ts`:
   - `getFieldPromptTemplateConfig()`
   - `processFieldAiPrompt()`
3. Update field components to use new button:
   - `StringField.tsx`
   - `MarkdownField.tsx`

**Deployment:** Can deploy incrementally (page templates still work)

### Phase 3: Page Component Rename + Directory Migration (Breaking Changes)
1. Update backend handlers to read from `page_prompt_templates/` (with fallback)
2. Rename frontend components:
   - `AiAssist.tsx` → `PageAIAssistButton.tsx`
   - `AIAssistDialog.tsx` → `PageAIAssistDialog.tsx`
3. Update all imports

**Deployment:** Requires migration instructions for users

### Phase 4: Cleanup
1. Remove OpenAI npm package from frontend
2. Remove fallback for old `prompts_templates/` directory
3. Remove old hardcoded AI assist code

### Rollback Strategy

**If issues found after Phase 3:**
1. Revert backend to read from `prompts_templates/` (simple config change)
2. Revert component renames (git revert)
3. Keep Phase 1 & 2 changes (no harm, just unused features)

**Data Loss Prevention:**
- Users keep original `prompts_templates/` directory (no auto-deletion)
- Rename is user-driven, not automatic
- Templates are just YAML files (easy to backup/restore)

## Open Questions

### Q1: Should we auto-migrate `prompts_templates/` → `page_prompt_templates/`?

**Options:**
- A) Auto-rename directory on first workspace load
- B) Show warning, require manual rename
- C) Support both directories with deprecation warning

**Recommendation:** Option C for initial release, move to B after grace period

**Rationale:**
- Safest approach (no data loss)
- Gives users time to migrate
- Can remove fallback in future version

**Decision:** TBD (need input from team)

### Q2: Should field templates have access to full model config?

**Use case:** Template wants to know available fields, field types, collection structure

**Options:**
- A) Add `model` object to field context
- B) Only provide current field and parent page
- C) Add specific helpers like `model.getFieldType(key)`

**Recommendation:** Option B for now (YAGNI - You Aren't Gonna Need It)

**Rationale:**
- No concrete use case yet
- Can add later if needed
- Simpler implementation

**Decision:** TBD (can revisit based on user feedback)

### Q3: Should we support template inheritance/composition?

**Use case:** Base template with common settings, specific templates extend it

**Options:**
- A) YAML anchors/aliases (native YAML feature)
- B) `extends: base_template` key
- C) No inheritance (keep simple)

**Recommendation:** Option C for MVP, consider A or B if users request it

**Rationale:**
- YAGNI principle
- Adds complexity to template loading
- Users can copy/paste for now

**Decision:** TBD (implement if requested)

### Q4: Should field templates support multiple prompts in one template?

**Use case:** "Improve text" with optional "also translate" checkbox

**Options:**
- A) Support array of prompts with conditional execution
- B) Create separate templates (improve_text, improve_and_translate)
- C) Single prompt per template, users can chain manually

**Recommendation:** Option C for MVP

**Rationale:**
- Simpler implementation
- Unclear if users need this
- Can add orchestration later

**Decision:** TBD (wait for user feedback)

## Implementation Notes

### Testing Strategy

**Unit Tests:**
- Context builders (`buildFieldSelfObject`, `buildParentPageObject`)
- Variable replacement in prompt processor
- Template loading from both directories

**Integration Tests:**
- Full API flow: load template → process prompt → return result
- Frontmatter parsing and field access
- Error handling for missing fields

**Manual Testing:**
- Create example site with both page and field templates
- Test with various field types (string, markdown, array)
- Verify AI assist works in nested fields

### Performance Considerations

**Caching Opportunities:**
- Parsed frontmatter during edit session (in-memory)
- Loaded template configs (file read is expensive)
- LLM provider connections (already implemented)

**Not Caching:**
- Field content (changes frequently)
- Form input values (user-driven)

### Error Handling

**User-Facing Errors:**
- Template not found: "Template 'improve_text' not found in field_prompt_templates/"
- Invalid variable: "Field 'title' not found in parent page"
- LLM error: "AI service unavailable: [provider error]"

**Developer Errors:**
- Missing required context: Throw early with clear message
- Invalid template syntax: YAML parse error with line number
- Type mismatches: TypeScript compile errors

### Monitoring & Logging

**Log on backend:**
- Template loads (file path, success/failure)
- LLM requests (model, token count, duration)
- Context building (which fields accessed)
- Errors (with context for debugging)

**Metrics to track:**
- Template usage frequency (which templates used most)
- Field vs page prompt ratio
- LLM token usage by template
- Error rates by template

## Documentation Requirements

### User Documentation

1. **Migration Guide** (`MIGRATING.md`):
   - How to rename `prompts_templates/` → `page_prompt_templates/`
   - How to create field templates
   - Variable syntax differences

2. **Prompt Templates Guide** (update `prompts_templates.md`):
   - Complete variable reference for page templates
   - Complete variable reference for field templates
   - Examples for common use cases
   - Troubleshooting section

3. **Field Configuration Guide**:
   - How to add `field_prompt_templates` to field config
   - Example configurations
   - Best practices

### Developer Documentation

1. **Architecture Doc**:
   - Context building flow
   - Component hierarchy
   - API contract between frontend/backend

2. **Contributing Guide**:
   - How to add new context variables
   - How to add new template features
   - Testing requirements

3. **API Reference**:
   - New API endpoints
   - Request/response schemas
   - Error codes
