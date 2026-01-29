# Prompt Templates

A Prompt Template is a text field containing the prompt text in which special variables can be replaced with actual values. The variables can point to the page file itself, to parent page context, or to values from the Prompt Template form which are gathered or populated by the user.

Variables are enclosed with `{{ }}`.

## Directory Structure

Quiqr uses two separate directories for prompt templates, each serving a different purpose:

### Page Prompt Templates

**Location:** `quiqr/model/includes/page_prompt_templates/`

Page prompt templates are used for **whole-page AI operations**. They appear in the Page AI Assist dialog (accessible from the top toolbar) and operate on the entire page content.

**Use cases:**
- Translate entire page to another language
- Reformat complete page structure
- Generate full page content from a template
- Apply transformations to all page frontmatter and content

**File naming:** Both `.yaml` and `.yml` extensions are supported. If both exist for the same template key, `.yaml` takes precedence.

**Legacy note:** The old `prompts_templates/` directory is still supported for backward compatibility but will be deprecated in a future version.

### Field Prompt Templates

**Location:** `quiqr/model/includes/field_prompt_templates/`

Field prompt templates are used for **individual field AI operations**. They appear as sparkle (✨) buttons next to specific fields in your forms and operate on that field's content only.

**Use cases:**
- Expand or improve text in a description field
- Translate a single field value
- Fix grammar in a title
- Generate suggestions for a specific field
- Summarize long content

**File naming:** Both `.yaml` and `.yml` extensions are supported. If both exist for the same template key, `.yaml` takes precedence.

**Configuration:** To enable field AI assist on a field, add `field_prompt_templates` to the field definition:

```yaml
fields:
  - key: description
    title: Description
    type: string
    field_prompt_templates:
      - improve_text
      - translate_text
      - fix_grammar
```

**Supported field types:** Currently only `string` and `markdown` fields support field AI assist.

## Objects with variables

Variables are children of parent objects. The following objects are implemented:

- `self`: refers to current context (page or field depending on template type)
- `parent_page`: refers to the parent page (only available in field templates)
- `field`: refers to the object with fields defined in the prompt_template
- `func`: refers to the object with functions which can be used to modify variable outputs


## The Self Object and its Variables

The `self` object refers to the current context - either the whole page (in page templates) or the specific field (in field templates).

### In Page Prompt Templates

When used in page prompt templates (`page_prompt_templates/`), `self` refers to the entire page file:

- `self.content`: The complete contents of the current page file (including frontmatter and body)
- `self.file_path`: The file path of the current file relative to the site root
- `self.file_name`: The file name component of the current file
- `self.file_base_name`: The file base name of the current file (without extension)
- `self.fields.[key].content`: Access to any frontmatter field by key (new)

**Example:**

```yaml
promptTemplate: >
  Translate the following page to {{ field.target_lang }}.
  The page title is: {{ self.fields.title.content }}
  
  Full page content:
  {{ self.content }}
```

### In Field Prompt Templates

When used in field prompt templates (`field_prompt_templates/`), `self` refers to the current field being edited:

- `self.content`: The current value of the field being edited
- `self.key`: The key/name of the field (e.g., "description", "title")
- `self.type`: The field type (e.g., "string", "markdown")

**Example:**

```yaml
promptTemplate: >
  Improve the following {{ self.type }} field called "{{ self.key }}":
  
  {{ self.content }}
```

## The Parent Page Object and its Variables

The `parent_page` object is **only available in field prompt templates** and provides context about the page containing the field being edited.

**Available variables:**

- `parent_page.fields.[key].content`: Access any frontmatter field from the parent page by key
- `parent_page.file_path`: The file path of the parent page relative to the site root
- `parent_page.file_name`: The file name of the parent page
- `parent_page.file_base_name`: The file base name of the parent page (without extension)

**Example use case:** When editing a blog post's description field, you can access the post's title to provide context:

```yaml
promptTemplate: >
  Expand the following text for the article titled "{{ parent_page.fields.title.content }}".
  The article date is {{ parent_page.fields.date.content }}.
  
  Original text:
  {{ self.content }}
```

**Nested field access:** You can access nested frontmatter fields using dot notation:

```yaml
# If frontmatter has: author.name
{{ parent_page.fields.author.name.content }}

# If frontmatter has: tags[0]
{{ parent_page.fields.tags.0.content }}
```

## The Field Object and its Variables

The `field` object provides access to values from the template's dynamic form fields. When a user opens an AI assist dialog, they fill out a form, and those values become available via the `field` object.

**Variable naming:** Each field defined in the template's `fields` array becomes available as `field.[key]`.

**Example template definition:**

```yaml
---
key: translate_page
title: Translate Page
llm_settings:
  model: gpt-4
  temperature: 0.7
fields:
  - key: target_lang
    title: Target Language
    type: select
    options:
      - Dutch
      - English
      - Spanish
  - key: tone_of_voice
    title: Tone of Voice
    type: select
    options:
      - casual
      - formal
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Translate the text to {{ field.target_lang }} using a {{ field.tone_of_voice }} tone.
      
      {{ self.content }}
```

**In this example:**
- `{{ field.target_lang }}` will be replaced with the user's selection (e.g., "Dutch")
- `{{ field.tone_of_voice }}` will be replaced with the user's selection (e.g., "casual")

**Supported field types in templates:**
- `string`: Text input field
- `select`: Dropdown selection
- `boolean`: Checkbox (true/false)
- `readonly`: Display-only field (usually used for `promptTemplate`)

**Conditional logic:** You can use Jinja2-style conditions:

```yaml
{% if field.preserve_formatting %}Preserve the original formatting.{% endif %}
```

## The Func Object and its functions

The func object has the following functions which gets its argument using the Unix pipe method.

- `func.readfile`: receives a file_path relative to the site root as string value. It opens the file and returns the contents of this file. If the file can not be read it returns the value `Could not read: path/to/file.md`
- `func.toUpper`: receives a string and returns the string in upper case.

**Example:**

```yaml
{{ field.template_page | func.readFile }}
```

## Complete Examples

### Example 1: Page Template Accessing Frontmatter

This page template translates an entire page and uses frontmatter fields to provide context:

```yaml
---
key: translate_page_advanced
title: Translate Page with Context
llm_settings:
  model: gpt-4
  temperature: 0.7
fields:
  - key: target_lang
    title: Target Language
    type: select
    options:
      - Spanish
      - French
      - German
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Translate the following page to {{ field.target_lang }}.
      
      Original title: {{ self.fields.title.content }}
      Original date: {{ self.fields.date.content }}
      
      Maintain the same tone and style. Keep all markdown formatting and frontmatter structure.
      
      PAGE_CONTENT_START
      {{ self.content }}
      PAGE_CONTENT_END
```

### Example 2: Field Template Using Parent Context

This field template expands text while considering the parent page's context:

**File:** `field_prompt_templates/expand_text.yaml`

```yaml
---
key: expand_text
title: Expand Text
description: Expand brief text into a longer, more detailed version
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
      Make it engaging and well-structured.
      
      Context: This is the "{{ self.key }}" field from the page "{{ parent_page.fields.title.content }}".
      
      Original text:
      {{ self.content }}
```

**Model configuration to enable this template:**

```yaml
# In collections/blog.yaml
fields:
  - key: description
    title: Description
    type: string
    field_prompt_templates:
      - expand_text
```

### Example 3: Field Template Accessing Nested Frontmatter

This field template translates a field while preserving context from nested frontmatter:

**File:** `field_prompt_templates/translate_with_context.yaml`

```yaml
---
key: translate_with_context
title: Translate with Context
description: Translate field content with awareness of page context
llm_settings:
  model: gpt-4
  temperature: 0.5
fields:
  - key: target_language
    title: Target Language
    type: select
    options:
      - Spanish
      - French
      - German
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Translate the following text to {{ field.target_language }}.
      
      Context information:
      - Page title: {{ parent_page.fields.title.content }}
      - Author: {{ parent_page.fields.author.name.content }}
      - Category: {{ parent_page.fields.category.content }}
      - Primary tag: {{ parent_page.fields.tags.0.content }}
      
      Keep the same tone and style appropriate for this context.
      
      Text to translate:
      {{ self.content }}
```

### Example 4: Complex Page Template with File Reading

This advanced page template uses the `func.readFile` function to load external templates:

```yaml
---
key: apply_style_guide
title: Apply Style Guide
description: Rewrite content according to an external style guide
llm_settings:
  model: gpt-4
  temperature: 0.7
fields:
  - key: style_guide_path
    title: Style Guide File
    type: select
    options:
      - docs/style-guides/technical.md
      - docs/style-guides/marketing.md
      - docs/style-guides/blog.md
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Rewrite the following content according to this style guide:
      
      STYLE_GUIDE_START
      {{ field.style_guide_path | func.readFile }}
      STYLE_GUIDE_END
      
      Current page title: {{ self.fields.title.content }}
      
      Content to rewrite:
      {{ self.content }}
```

## Best Practices

### When to Use Page vs Field Templates

**Use Page Templates when:**
- You need to transform the entire page content
- You're working with page structure (frontmatter + body)
- The operation applies to multiple fields at once
- You need to maintain relationships between different parts of the page

**Use Field Templates when:**
- You're editing a specific field value
- The operation is focused on one piece of content
- You want inline, contextual AI assistance
- Users need quick access during content editing

### Variable Naming Conventions

- Use descriptive field keys in your frontmatter (e.g., `title`, `author_name`, not `t`, `an`)
- Keep frontmatter structure flat when possible for easier variable access
- Document any nested structures in your model configuration

### Template Organization

- Use clear, descriptive template keys (e.g., `translate_text`, not `t1`)
- Group related templates by function (translation, improvement, generation)
- Keep templates focused on a single task
- Provide helpful descriptions for each template

### Error Handling

If a variable cannot be resolved, the system will:
- Show an error message indicating which variable failed
- Preserve the template variable in the output (e.g., `{{ parent_page.fields.missing.content }}`)
- Log the error to the console for debugging

To avoid errors:
- Verify frontmatter field names match your template variables
- Use optional checks for fields that might not exist
- Test templates with different content structures

## Troubleshooting

### Template Not Appearing

**For page templates:**
- Check file is in `quiqr/model/includes/page_prompt_templates/`
- Verify file extension is `.yaml` or `.yml`
- Check template `key` matches what you expect

**For field templates:**
- Check file is in `quiqr/model/includes/field_prompt_templates/`
- Verify field has `field_prompt_templates` array in model configuration
- Verify template key is listed in the array
- Confirm field type is `string` or `markdown`

### Variables Not Resolving

- Check frontmatter field names match exactly (case-sensitive)
- For nested fields, verify the path is correct
- Look at console logs for specific error messages
- Test with simple, flat frontmatter first

### Sparkle Button Not Showing

- Verify field type is `string` or `markdown`
- Check `field_prompt_templates` is defined in field config
- Ensure at least one template file exists
- Restart Quiqr Desktop after model changes

## Migration from Legacy `prompts_templates/`

If you have templates in the old `prompts_templates/` directory:

1. Create new directory: `quiqr/model/includes/page_prompt_templates/`
2. Move your page template files there
3. Update any references in your model configuration
4. Test templates still work
5. Delete old `prompts_templates/` directory when ready

The old directory still works but will be removed in a future version.

## Migration from Legacy Direct OpenAI Field AI Assist

**BREAKING CHANGE (Current Version):** The legacy field AI assist functionality that used direct OpenAI API calls from the frontend has been removed.

### What Changed

Previous versions allowed configuring `openAiApiKey` in Advanced Preferences, which enabled a hardcoded AI assist button on fields. This feature has been replaced with the more flexible and secure template-based system.

**Removed:**
- `openAiApiKey` configuration field in Advanced Preferences
- Direct OpenAI API calls from frontend
- `meta.enableAiAssist` flag
- Hardcoded AI prompts in field components

**Replacement:**
- Template-based field AI assist (documented above)
- Backend-managed LLM providers (supports multiple providers)
- Configurable prompts via `field_prompt_templates/`
- Per-field control via `field_prompt_templates` array

### How to Migrate

If you previously used `openAiApiKey` configuration:

1. **Remove old configuration:**
   - The `openAiApiKey` field no longer appears in Advanced Preferences
   - Your old API key is ignored

2. **Configure LLM provider:**
   - Set environment variable: `QUIQR_LLM_PROVIDER_0="openai://your-api-key"`
   - See AGENTS.md "LLM Provider Configuration" section for details
   - Supports multiple providers (OpenAI, Anthropic, AWS Bedrock, Google Gemini, etc.)

3. **Create field prompt templates:**
   - Create directory: `quiqr/model/includes/field_prompt_templates/`
   - Add template files (see examples in this documentation)
   - Configure fields with `field_prompt_templates: [template_name]`

4. **Benefits of migration:**
   - More secure (no API keys in frontend)
   - More flexible (custom prompts per use case)
   - Multi-provider support (not locked to OpenAI)
   - Better UX (dynamic forms for template inputs)

### Example Migration

**Before (removed):**
```yaml
# Advanced Preferences
openAiApiKey: sk-abc123...

# Field configuration
fields:
  - key: description
    title: Description
    type: string
    # AI button appeared automatically when openAiApiKey was set
```

**After (current):**
```bash
# Environment variable
export QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
```

```yaml
# Create: field_prompt_templates/improve_text.yaml
---
key: improve_text
title: Improve Text
llm_settings:
  model: gpt-4
fields:
  - key: style
    type: select
    options: [professional, casual, academic]
  - key: promptTemplate
    type: readonly
    default: >
      Improve the following text using {{ field.style }} style:
      {{ self.content }}
```

```yaml
# Field configuration
fields:
  - key: description
    title: Description
    type: string
    field_prompt_templates:
      - improve_text
```




