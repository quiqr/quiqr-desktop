# ai-integration Delta Specification

## ADDED Requirements

### Requirement: Field-Level Prompt Templates

The system SHALL support field-level AI assistance using prompt templates stored in `field_prompt_templates/` directory, analogous to page-level templates.

#### Scenario: Field prompt template loading

- **WHEN** the backend receives a request to load field prompt template `improve_text`
- **AND** template file exists at `[site]/quiqr/model/includes/field_prompt_templates/improve_text.yaml`
- **THEN** the system SHALL read and parse the YAML template
- **AND** the system SHALL return the template configuration with fields and LLM settings
- **AND** the system SHALL validate the template structure

#### Scenario: Field prompt template not found

- **WHEN** the backend receives a request to load field prompt template `nonexistent`
- **AND** template file does not exist at `[site]/quiqr/model/includes/field_prompt_templates/nonexistent.yaml`
- **THEN** the system SHALL return an error
- **AND** the error message SHALL indicate the template was not found
- **AND** the error message SHALL include the expected file path

#### Scenario: Field prompt processing with field context

- **WHEN** the backend processes a field prompt request
- **AND** request includes field context: `fieldKey`, `fieldType`, `fieldContent`
- **AND** request includes parent page path (via `collectionKey` + `collectionItemKey` OR `singleKey`)
- **THEN** the system SHALL build a `FieldSelfObject` with field properties
- **AND** the system SHALL build a `ParentPageObject` with page content and parsed frontmatter
- **AND** the system SHALL replace template variables with field and parent page values
- **AND** the system SHALL call the LLM service with the processed prompt
- **AND** the system SHALL return the AI-generated content

#### Scenario: Field prompt without parent page context

- **WHEN** the backend processes a field prompt request
- **AND** request does not include parent page path
- **THEN** the system SHALL build a `FieldSelfObject` with field properties
- **AND** `ParentPageObject` SHALL be null
- **AND** template variables using `parent_page.*` SHALL be replaced with empty string or show clear error
- **AND** the system SHALL still process the prompt with available field context

### Requirement: Field Template Variable Context

The system SHALL provide field-specific template variables that give access to current field content and parent page context.

#### Scenario: Field self variables

- **GIVEN** a field prompt template contains `{{ self.content }}`, `{{ self.key }}`, `{{ self.type }}`
- **WHEN** processing the prompt for a string field with key `title` and content `Hello World`
- **THEN** `{{ self.content }}` SHALL be replaced with `Hello World`
- **AND** `{{ self.key }}` SHALL be replaced with `title`
- **AND** `{{ self.type }}` SHALL be replaced with `string`

#### Scenario: Parent page content variables

- **GIVEN** a field prompt template contains `{{ parent_page.content }}`, `{{ parent_page.file_path }}`
- **WHEN** processing the prompt for a field in a page at `content/posts/my-post.md`
- **THEN** `{{ parent_page.content }}` SHALL be replaced with full page content including frontmatter
- **AND** `{{ parent_page.file_path }}` SHALL be replaced with `content/posts/my-post.md`
- **AND** `{{ parent_page.file_name }}` SHALL be replaced with `my-post.md`
- **AND** `{{ parent_page.file_base_name }}` SHALL be replaced with `my-post`

#### Scenario: Parent page field access

- **GIVEN** a field prompt template contains `{{ parent_page.fields.title.content }}`
- **WHEN** processing the prompt for a field in a page with frontmatter `title: "My Post"`
- **THEN** `{{ parent_page.fields.title.content }}` SHALL be replaced with `My Post`

#### Scenario: Nested parent page field access

- **GIVEN** a field prompt template contains `{{ parent_page.fields.author.name.content }}`
- **WHEN** processing the prompt for a page with nested frontmatter structure:
  ```yaml
  author:
    name: John Doe
    email: john@example.com
  ```
- **THEN** `{{ parent_page.fields.author.name.content }}` SHALL be replaced with `John Doe`

#### Scenario: Missing parent page field

- **GIVEN** a field prompt template contains `{{ parent_page.fields.nonexistent.content }}`
- **WHEN** processing the prompt for a page without `nonexistent` field
- **THEN** the system SHALL replace with empty string OR throw clear error
- **AND** error message (if thrown) SHALL indicate which field is missing
- **AND** error message SHALL list available fields in parent page

#### Scenario: Template form field variables

- **GIVEN** a field prompt template with form input field `style`
- **AND** template contains `{{ field.style }}`
- **WHEN** user submits the form with `style: "professional"`
- **THEN** `{{ field.style }}` SHALL be replaced with `professional`

### Requirement: Page Template Variable Enhancement

The system SHALL enhance page-level prompt templates to support access to parsed frontmatter fields via `self.fields.[key].content` syntax.

#### Scenario: Page template accesses own frontmatter

- **GIVEN** a page prompt template contains `{{ self.fields.title.content }}`
- **WHEN** processing the prompt for a page with frontmatter `title: "My Article"`
- **THEN** `{{ self.fields.title.content }}` SHALL be replaced with `My Article`

#### Scenario: Page template accesses nested frontmatter

- **GIVEN** a page prompt template contains `{{ self.fields.author.name.content }}`
- **WHEN** processing the prompt for a page with nested frontmatter:
  ```yaml
  author:
    name: Jane Smith
  ```
- **THEN** `{{ self.fields.author.name.content }}` SHALL be replaced with `Jane Smith`

#### Scenario: Page template accesses array frontmatter

- **GIVEN** a page prompt template contains `{{ self.fields.tags[0].content }}`
- **WHEN** processing the prompt for a page with frontmatter:
  ```yaml
  tags:
    - tech
    - ai
  ```
- **THEN** `{{ self.fields.tags[0].content }}` SHALL be replaced with `tech`

#### Scenario: Backward compatibility with existing page variables

- **GIVEN** a page prompt template contains `{{ self.content }}`, `{{ self.file_path }}`
- **WHEN** processing the prompt
- **THEN** all existing page template variables SHALL work exactly as before
- **AND** `{{ self.content }}` SHALL return full page content with frontmatter
- **AND** `{{ self.file_path }}` SHALL return the page file path
- **AND** no existing functionality SHALL be broken

### Requirement: Prompt Template Directory Structure

The system SHALL support separate directories for page-level and field-level prompt templates, with backward compatibility for legacy directory names.

#### Scenario: Page templates from new directory

- **WHEN** loading a page prompt template
- **THEN** the system SHALL first check `[site]/quiqr/model/includes/page_prompt_templates/`
- **AND** the system SHALL load the template from that directory if found

#### Scenario: Page templates fallback to legacy directory

- **WHEN** loading a page prompt template
- **AND** template does not exist in `page_prompt_templates/`
- **AND** template exists in legacy `prompts_templates/` directory
- **THEN** the system SHALL load the template from legacy directory
- **AND** the system SHALL log a deprecation warning
- **AND** the warning SHALL recommend renaming the directory

#### Scenario: Field templates from dedicated directory

- **WHEN** loading a field prompt template
- **THEN** the system SHALL check `[site]/quiqr/model/includes/field_prompt_templates/` only
- **AND** the system SHALL NOT check any other directories
- **AND** the system SHALL return error if template not found

#### Scenario: New directory takes precedence

- **WHEN** loading a page prompt template named `improve`
- **AND** template exists in both `page_prompt_templates/improve.yaml` AND `prompts_templates/improve.yaml`
- **THEN** the system SHALL load from `page_prompt_templates/improve.yaml`
- **AND** the system SHALL ignore the legacy directory version
- **AND** the system SHALL NOT log any deprecation warning

#### Scenario: Template file with .yml extension

- **WHEN** loading a page or field prompt template named `improve_text`
- **AND** template file exists as `improve_text.yml` (not `.yaml`)
- **THEN** the system SHALL successfully load and parse the template
- **AND** the system SHALL treat `.yml` files identically to `.yaml` files

#### Scenario: Template file extension preference

- **WHEN** loading a prompt template named `improve_text`
- **AND** both `improve_text.yaml` AND `improve_text.yml` exist in the same directory
- **THEN** the system SHALL load `improve_text.yaml` (`.yaml` takes precedence)
- **AND** the system SHALL NOT load or process the `.yml` file

#### Scenario: Template search order with mixed extensions

- **WHEN** loading a page prompt template named `translate`
- **AND** `page_prompt_templates/translate.yml` exists
- **AND** `prompts_templates/translate.yaml` exists (legacy directory)
- **THEN** the system SHALL load from `page_prompt_templates/translate.yml`
- **AND** the system SHALL NOT fall back to the legacy directory
- **AND** the system SHALL log a deprecation warning only if loading from `prompts_templates/`

### Requirement: Field Configuration Support for Templates

Field schemas SHALL support an optional `field_prompt_templates` property that specifies available AI assist templates for that field.

#### Scenario: Field with prompt templates configured

- **GIVEN** a field configuration:
  ```yaml
  - key: title
    type: string
    field_prompt_templates:
      - improve_text
      - fix_grammar
  ```
- **WHEN** the frontend renders the field
- **THEN** the field SHALL display an AI assist button
- **AND** clicking the button SHALL show templates: `improve_text` and `fix_grammar`

#### Scenario: Field without prompt templates

- **GIVEN** a field configuration without `field_prompt_templates` property:
  ```yaml
  - key: title
    type: string
  ```
- **WHEN** the frontend renders the field
- **THEN** the field SHALL NOT display an AI assist button

#### Scenario: Field with empty prompt templates array

- **GIVEN** a field configuration:
  ```yaml
  - key: title
    type: string
    field_prompt_templates: []
  ```
- **WHEN** the frontend renders the field
- **THEN** the field SHALL NOT display an AI assist button

#### Scenario: Multiple field types with templates

- **GIVEN** both string and markdown fields have `field_prompt_templates` configured
- **WHEN** the frontend renders both field types
- **THEN** both fields SHALL display AI assist buttons
- **AND** each field SHALL load its own configured templates

## MODIFIED Requirements

### Requirement: LLM Service API Enhancement

The `callLLM()` function SHALL support both model-based routing and explicit provider selection, with enhanced context types for field and page prompts.

#### Scenario: Model-based routing

- **WHEN** `callLLM({ model: "gpt-4", prompt: "..." })` is called
- **AND** provider parameter is not specified
- **THEN** the system SHALL automatically select provider based on model pattern
- **AND** the system SHALL use the matched provider to process the request

#### Scenario: Explicit provider selection

- **WHEN** `callLLM({ model: "...", prompt: "...", provider: "provider-1" })` is called
- **THEN** the system SHALL use the provider with ID `provider-1`
- **AND** the system SHALL ignore model pattern matching

#### Scenario: Invalid explicit provider

- **WHEN** `callLLM({ model: "...", prompt: "...", provider: "nonexistent" })` is called
- **THEN** the system SHALL throw an error
- **AND** the error message SHALL list available provider IDs

#### Scenario: Provider information in response

- **WHEN** `callLLM()` completes successfully
- **THEN** the response SHALL include the provider type used
- **AND** the response SHALL include the provider ID
- **AND** the response SHALL include usage statistics if available

#### Scenario: Field context in LLM call

- **WHEN** `callLLM()` is called from field prompt processing
- **AND** context includes `FieldSelfObject` and `ParentPageObject`
- **THEN** the system SHALL use field context for variable replacement
- **AND** the system SHALL support `self.*` variables for field properties
- **AND** the system SHALL support `parent_page.*` variables for page context

#### Scenario: Page context in LLM call

- **WHEN** `callLLM()` is called from page prompt processing
- **AND** context includes `PageSelfObject` with `fields` property
- **THEN** the system SHALL use page context for variable replacement
- **AND** the system SHALL support `self.content`, `self.file_path` (unchanged)
- **AND** the system SHALL support `self.fields.[key].content` (new)

## REMOVED Requirements

None - All existing requirements remain in place.

## RENAMED Requirements

None - No requirements are being renamed.
