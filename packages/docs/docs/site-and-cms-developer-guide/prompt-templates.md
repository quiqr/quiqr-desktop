---
sidebar_position: 5
---

# Prompt Templates

Prompt templates enable AI-powered content assistance in Quiqr Desktop. They are text prompts with special variables that get replaced with actual values from your content, allowing you to create customized AI workflows for both entire pages and individual fields.

## Overview

A prompt template consists of:
- **Prompt text** with variables enclosed in `{{ }}`
- **Form fields** for user input (optional)
- **LLM settings** (model, temperature)

Variables can reference:
- The current page or field (`self`)
- Parent page context (`parent_page`, field templates only)
- User form inputs (`field`)
- Utility functions (`func`)

## Directory Structure

Quiqr uses two separate directories for prompt templates:

### Page Prompt Templates

**Location:** `quiqr/model/includes/page_prompt_templates/`

Page prompt templates are used for **whole-page AI operations**. They appear in the Page AI Assist dialog (accessible from the top toolbar) and operate on the entire page content.

**Use cases:**
- Translate entire page to another language
- Reformat complete page structure
- Generate full page content from a template
- Apply transformations to all page frontmatter and content

**File naming:** Both `.yaml` and `.yml` extensions are supported. If both exist for the same template key, `.yaml` takes precedence.

**Legacy note:** The old `prompts_templates/` directory is still supported for backward compatibility but is deprecated.

### Field Prompt Templates

**Location:** `quiqr/model/includes/field_prompt_templates/`

Field prompt templates are used for **individual field AI operations**. They appear as sparkle (✨) buttons next to specific fields in your forms and operate on that field's content only.

**Use cases:**
- Expand or improve text in a description field
- Translate a single field value
- Fix grammar in a title
- Generate suggestions for a specific field
- Summarize long content

**File naming:** Both `.yaml` and `.yml` extensions are supported.

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

## Template Variables

Variables are organized into parent objects. All variables use the `{{ variable }}` syntax.

### The Self Object

The `self` object refers to the current context - either the whole page (in page templates) or the specific field (in field templates).

#### In Page Prompt Templates

When used in page prompt templates (`page_prompt_templates/`), `self` refers to the entire page file:

| Variable | Description |
|----------|-------------|
| `self.content` | The complete contents of the current page file (including frontmatter and body) |
| `self.file_path` | The file path of the current file relative to the site root |
| `self.file_name` | The file name component of the current file |
| `self.file_base_name` | The file base name of the current file (without extension) |
| `self.fields.[key].content` | Access to any frontmatter field by key |

**Example:**

```yaml
promptTemplate: >
  Translate the following page to {{ field.target_lang }}.
  The page title is: {{ self.fields.title.content }}
  
  Full page content:
  {{ self.content }}
```

#### In Field Prompt Templates

When used in field prompt templates (`field_prompt_templates/`), `self` refers to the current field being edited:

| Variable | Description |
|----------|-------------|
| `self.content` | The current value of the field being edited |
| `self.key` | The key/name of the field (e.g., "description", "title") |
| `self.type` | The field type (e.g., "string", "markdown") |

**Example:**

```yaml
promptTemplate: >
  Improve the following {{ self.type }} field called "{{ self.key }}":
  
  {{ self.content }}
```

### The Parent Page Object

The `parent_page` object is **only available in field prompt templates** and provides context about the page containing the field being edited.

**Available variables:**

| Variable | Description |
|----------|-------------|
| `parent_page.content` | Full page content including frontmatter |
| `parent_page.file_path` | The file path relative to the site root |
| `parent_page.file_name` | The file name of the parent page |
| `parent_page.file_base_name` | The file base name (without extension) |
| `parent_page.fields.[key].content` | Access any frontmatter field from the parent page by key |

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

### The Field Object

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

### The Func Object

The `func` object provides utility functions that can process variable values using Unix pipe syntax.

| Function | Description |
|----------|-------------|
| `func.readFile` | Receives a file path relative to the site root, opens the file, and returns its contents. Returns error message if file cannot be read. |
| `func.toUpper` | Receives a string and returns it in uppercase. |

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

## LLM Configuration

Before using prompt templates, you need to configure at least one LLM provider via environment variables.

**Quick setup:**

```bash
# OpenAI
export QUIQR_LLM_PROVIDER_0="openai://sk-your-api-key"

# AWS Bedrock (supports Claude, Llama, Titan, Cohere, Mistral)
export QUIQR_LLM_PROVIDER_1="bedrock://your-api-key?region=us-east-1"

# Direct Anthropic
export QUIQR_LLM_PROVIDER_2="anthropic://sk-ant-your-key"
```

For detailed LLM configuration including all supported providers (Google Gemini, Azure OpenAI, Mistral AI, Cohere), see the [LLM Provider Configuration](../configuration/llm-providers.md) guide.

## Migration Notes

### From Legacy `prompts_templates/` Directory

If you have templates in the old `prompts_templates/` directory:

1. Create new directory: `quiqr/model/includes/page_prompt_templates/`
2. Move your page template files there
3. Update any references in your model configuration
4. Test templates still work
5. Delete old `prompts_templates/` directory when ready

The old directory still works but is deprecated and will be removed in a future version.

### From Legacy Direct OpenAI Field AI Assist

**BREAKING CHANGE:** The legacy field AI assist functionality that used direct OpenAI API calls from the frontend has been removed.

**What was removed:**
- `openAiApiKey` configuration field in Advanced Preferences
- Direct OpenAI API calls from frontend
- `meta.enableAiAssist` flag
- Hardcoded AI prompts in field components

**Replacement:**
- Template-based field AI assist (documented above)
- Backend-managed LLM providers (supports multiple providers)
- Configurable prompts via `field_prompt_templates/`
- Per-field control via `field_prompt_templates` array

**How to migrate:**

If you previously used `openAiApiKey` configuration:

1. **Configure LLM provider:**
   ```bash
   export QUIQR_LLM_PROVIDER_0="openai://your-api-key"
   ```

2. **Create field prompt templates:**
   - Create directory: `quiqr/model/includes/field_prompt_templates/`
   - Add template files (see examples above)
   - Configure fields with `field_prompt_templates: [template_name]`

3. **Benefits:**
   - More secure (no API keys in frontend)
   - More flexible (custom prompts per use case)
   - Multi-provider support (not locked to OpenAI)
   - Better UX (dynamic forms for template inputs)

## Example Template Files

### improve_text.yaml

```yaml
---
key: improve_text
title: Improve Text
description: Enhances text quality with clarity and readability improvements
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
      Improve the following text using {{ field.style }} style.
      Enhance clarity and readability while preserving the core message:
      
      {{ self.content }}
```

### fix_grammar.yaml

```yaml
---
key: fix_grammar
title: Fix Grammar
description: Corrects grammar and spelling errors
llm_settings:
  model: gpt-4
  temperature: 0.3
fields:
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Fix any grammar and spelling errors in the following text.
      Preserve the original style and meaning:
      
      {{ self.content }}
```

### summarize.yaml

```yaml
---
key: summarize
title: Summarize
description: Creates concise summaries of longer text
llm_settings:
  model: gpt-4
  temperature: 0.5
fields:
  - key: length
    title: Summary Length
    type: select
    options:
      - very brief (1 sentence)
      - brief (2-3 sentences)
      - medium (1 paragraph)
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Create a {{ field.length }} summary of the following text.
      Capture the main points and key information:
      
      {{ self.content }}
```

## Next Steps

- [Field Reference](./field-reference/index.md) - Learn about string and markdown fields that support AI assist
- [Content Model](./content-model/index.md) - Understand how to structure your content
- [LLM Provider Configuration](../configuration/llm-providers.md) - Set up AI providers
