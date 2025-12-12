# Prompt Templates

A Prompt Template is a text field containing the prompt text in which special variables can be replaced with actual values. The variables van point to the page file itself or to the values from the Prompt Template for which is gathered or populated by the user.

variables are enclosed with ``{{ }}``

## Objects with variables

Variables are children of parent objects. The following objects are implemented:

- `self`: refers to current file opened in the Single or CollectionItem form.
- `field`: refers to the object with fields defined in the prompt_template.
- `func`: refers to the object with functions which can be used to modify variable outputs.


## The Self Object and its variables

The following variables are implemented for the self object.

- `self.content`: the complete contents of the current file
- `self.file_path`: the file_path of the current file relative to the site root
- `self.file_name`: the file name component of the current file
- `self.file_base_name`: the file base of the current file

## The Field Object and its variables

The field object has all variables of the current defined prompt_template. E.g. the definition below has the following variables:

- target_lang

```markdown
---
key: pages_translation
title: Translate Page
llm_settings:
  model: eu.anthropic.claude-sonnet-4-5-20250929-v1:0
fields:
  - key: target_lang
    title: Target Language
    type: select
    options:
      - Dutch
      - English
  - key: tone_of_voice
    title: Tone of voice
    type: select
    options:
      - casual
      - formal
  - 
  - key: promptTemplate
    title: Prompt Template
    type: readonly
    default: >

      Translate the text between MARKDOWN_CONTENT_START and
      MARKDOWN_CONTENT_END to {{ field.target_lang }} in this tone of voice: {{
      field.tone_of_voice }}.

      Keep all frontmatter and markdown structure.

      MARKDOWN_CONTENT_START

      ```markdown
      {{ self.content}}
      ```
      MARKDOWN_CONTENT_END
```

## The Func Object and its functions

The func object has the following functions which gets its argument using the Unix pipe method.

- `func.readfile`: receives a file_path relative to the site root as string value. It opens the file returns the contents of this file. If the file can not be read it returns the value `Could not read: path/to/file.md`
- `func.toUpper`: receives a string and return the string in upper case.

```markdown
{{ field.template_page | func.readFile }}
```




