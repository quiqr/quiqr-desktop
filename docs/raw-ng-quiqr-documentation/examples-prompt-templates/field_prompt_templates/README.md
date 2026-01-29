# Field Prompt Templates Examples

This directory contains example field prompt templates that can be used with the Field AI Assist feature in Quiqr Desktop.

## Installation

Copy the template files you want to use into your Hugo/Quarto site's prompt templates directory:

```bash
mkdir -p your-site/quiqr/model/includes/field_prompt_templates
cp examples/field_prompt_templates/*.yaml your-site/quiqr/model/includes/field_prompt_templates/
```

**Note:** Templates can use either `.yaml` or `.yml` file extensions. Both are supported, with `.yaml` taking precedence if both exist for the same template name.

## Configuration

To enable AI Assist for a field, add the `field_prompt_templates` property to your field configuration:

```yaml
# In your collection or single configuration
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
      - summarize
      - translate_text
```

## Available Templates

### improve_text.yaml
Improves text quality by enhancing clarity and readability. Allows selection of writing style (professional, casual, academic).

**Best for:** Polishing draft content, adjusting tone

### fix_grammar.yaml
Corrects grammar and spelling errors while preserving the original style and meaning.

**Best for:** Quick proofreading, error correction

### expand_text.yaml
Expands brief text into longer, more detailed content with configurable length and tone.

**Best for:** Developing outlines into full content, adding detail

### translate_text.yaml
Translates text to another language with optional formatting preservation.

**Best for:** Creating multilingual content

### summarize.yaml
Creates concise summaries of longer text with configurable length.

**Best for:** Creating excerpts, meta descriptions, social media posts

## Template Variables

Field prompt templates have access to special variables:

### Field Context (self)
- `self.content` - Current field's content
- `self.key` - Field key (e.g., "title")
- `self.type` - Field type (e.g., "string", "markdown")

### Parent Page Context (parent_page)
- `parent_page.content` - Full page content with frontmatter
- `parent_page.file_path` - Relative path to page file
- `parent_page.file_name` - Page filename
- `parent_page.file_base_name` - Page basename without extension
- `parent_page.fields.[key].content` - Access other field values

### Form Inputs (field)
- `field.[key]` - Values from the template's form fields

## Creating Custom Templates

Create a new file in the `field_prompt_templates` directory with either `.yaml` or `.yml` extension:

**File name:** `my_template.yaml` (or `my_template.yml`)

```yaml
---
key: my_template
title: My Template Name
description: What this template does
llm_settings:
  model: gpt-4  # or gpt-3.5-turbo, claude-3-sonnet, etc.
  temperature: 0.7  # 0.0-1.0, lower = more focused, higher = more creative
fields:
  # Optional: Form fields for user input
  - key: my_option
    title: Option Name
    type: select
    options:
      - option1
      - option2
  
  # Required: The prompt template
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >
      Your prompt here with {{ field.my_option }} and {{ self.content }}
```

## LLM Configuration

Make sure you have configured your LLM provider in the environment variables. See the main project documentation for details on configuring:
- OpenAI
- AWS Bedrock (Claude, Llama, Titan, Cohere, Mistral)
- Direct Anthropic
- Google Gemini
- Azure OpenAI
- Mistral AI
- Cohere

## Tips

1. **Be specific**: Clear, specific prompts produce better results
2. **Use context**: Leverage `parent_page.fields.*` to provide relevant context
3. **Test iterations**: Adjust temperature and wording to get desired output
4. **Model selection**: Use GPT-4 for complex tasks, GPT-3.5 for simpler/faster operations
5. **Temperature guide**:
   - 0.0-0.3: Factual, consistent (good for grammar, translation)
   - 0.4-0.7: Balanced (good for general writing)
   - 0.8-1.0: Creative, varied (good for brainstorming, creative writing)
