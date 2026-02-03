# ai-integration Specification

## Purpose
TBD - created by archiving change improve-provider-configuration-llm-service. Update Purpose after archive.
## Requirements
### Requirement: Provider Configuration via Connection Strings

The system SHALL support LLM provider configuration using connection string format via environment variables `QUIQR_LLM_PROVIDER_0` through `QUIQR_LLM_PROVIDER_9`.

#### Scenario: OpenAI provider configuration

- **WHEN** environment variable `QUIQR_LLM_PROVIDER_0="openai://sk-abc123"` is set
- **THEN** the system SHALL initialize an OpenAI provider with API key `sk-abc123`
- **AND** the provider SHALL be available for models matching pattern `/^gpt-/`

#### Scenario: Anthropic via Bedrock configuration

- **WHEN** environment variable `QUIQR_LLM_PROVIDER_1="anthropic://token@bedrock?region=eu-central-1"` is set
- **THEN** the system SHALL initialize an Anthropic provider via AWS Bedrock
- **AND** the provider SHALL use region `eu-central-1`
- **AND** the provider SHALL be available for models matching pattern `/^claude-/` or `/anthropic\.claude/`

#### Scenario: Google Gemini provider configuration

- **WHEN** environment variable `QUIQR_LLM_PROVIDER_2="google://api-key?location=us-central1"` is set
- **THEN** the system SHALL initialize a Google provider with location `us-central1`
- **AND** the provider SHALL be available for models matching pattern `/^gemini-/`

#### Scenario: Azure OpenAI provider configuration

- **WHEN** environment variable `QUIQR_LLM_PROVIDER_3="azure://key@endpoint.openai.azure.com?deployment=gpt4"` is set
- **THEN** the system SHALL initialize an Azure OpenAI provider
- **AND** the provider SHALL use endpoint `endpoint.openai.azure.com`
- **AND** the provider SHALL use deployment `gpt4`

#### Scenario: Malformed connection string

- **WHEN** environment variable `QUIQR_LLM_PROVIDER_0="invalid-format"` is set
- **THEN** the system SHALL log a clear error message explaining the connection string format
- **AND** the system SHALL skip the invalid provider configuration
- **AND** the system SHALL continue initializing remaining providers

#### Scenario: Multiple provider instances

- **WHEN** environment variables `QUIQR_LLM_PROVIDER_0="openai://key-1"` and `QUIQR_LLM_PROVIDER_1="openai://key-2"` are set
- **THEN** the system SHALL initialize two separate OpenAI provider instances
- **AND** both providers SHALL be available for model matching
- **AND** the first provider (PROVIDER_0) SHALL take precedence for model routing

### Requirement: Provider Registry

The system SHALL maintain a central provider registry that manages all configured LLM providers.

#### Scenario: Provider initialization at startup

- **WHEN** the application starts
- **THEN** the system SHALL read all `QUIQR_LLM_PROVIDER_*` environment variables
- **AND** the system SHALL parse each connection string
- **AND** the system SHALL initialize and register each valid provider
- **AND** the system SHALL log the total number of configured providers

#### Scenario: Provider lookup by model string

- **WHEN** `callLLM()` is called with model `gpt-4`
- **AND** an OpenAI provider is registered
- **THEN** the system SHALL match the model to the OpenAI provider using pattern `/^gpt-/`
- **AND** the system SHALL use that provider to process the request

#### Scenario: Explicit provider selection

- **WHEN** `callLLM()` is called with explicit `provider` parameter set to `provider-1`
- **THEN** the system SHALL use the provider registered as `provider-1`
- **AND** the system SHALL ignore model pattern matching

#### Scenario: No matching provider found

- **WHEN** `callLLM()` is called with model `unknown-model-xyz`
- **AND** no registered provider matches the model pattern
- **THEN** the system SHALL throw an error
- **AND** the error message SHALL list all available providers
- **AND** the error message SHALL show example model patterns for each provider

#### Scenario: Provider enumeration

- **WHEN** `ProviderRegistry.listProviders()` is called
- **THEN** the system SHALL return all registered provider configurations
- **AND** each configuration SHALL include provider ID, type, and supported model patterns

### Requirement: Multi-Provider Support

The system SHALL support all LLM providers available in Vercel AI SDK, including OpenAI, Anthropic, Google, Azure, Mistral, Cohere, and others.

#### Scenario: OpenAI provider initialization

- **WHEN** connection string type is `openai`
- **THEN** the system SHALL use `createOpenAI()` from `@ai-sdk/openai` package
- **AND** the system SHALL pass credentials as `apiKey` parameter
- **AND** the system SHALL support optional custom endpoint via `baseURL` parameter

#### Scenario: Anthropic direct provider initialization

- **WHEN** connection string type is `anthropic` without `@bedrock` endpoint
- **THEN** the system SHALL use `createAnthropic()` from `@ai-sdk/anthropic` package
- **AND** the system SHALL pass credentials as `apiKey` parameter

#### Scenario: Anthropic Bedrock provider initialization

- **WHEN** connection string type is `anthropic` with `@bedrock` endpoint
- **THEN** the system SHALL use `createAmazonBedrock()` from `@ai-sdk/amazon-bedrock` package
- **AND** the system SHALL use `region` parameter from query string
- **AND** the system SHALL configure Bedrock authentication with provided credentials

#### Scenario: Google provider initialization

- **WHEN** connection string type is `google`
- **THEN** the system SHALL use `createGoogleGenerativeAI()` from `@ai-sdk/google` package
- **AND** the system SHALL pass credentials as `apiKey` parameter
- **AND** the system SHALL use optional `location` parameter from query string

#### Scenario: Azure OpenAI provider initialization

- **WHEN** connection string type is `azure`
- **THEN** the system SHALL use `createAzure()` from `@ai-sdk/azure` package
- **AND** the system SHALL extract endpoint from `@endpoint` component
- **AND** the system SHALL use `deployment` parameter from query string

#### Scenario: Mistral provider initialization

- **WHEN** connection string type is `mistral`
- **THEN** the system SHALL use `createMistral()` from `@ai-sdk/mistral` package
- **AND** the system SHALL pass credentials as `apiKey` parameter

#### Scenario: Cohere provider initialization

- **WHEN** connection string type is `cohere`
- **THEN** the system SHALL use `createCohere()` from `@ai-sdk/cohere` package
- **AND** the system SHALL pass credentials as `apiKey` parameter

### Requirement: Backward Compatibility with Legacy Environment Variables

The system SHALL maintain backward compatibility with existing environment variable configuration (`OPENAI_API_KEY`, `AWS_BEARER_TOKEN_BEDROCK`, `AWS_REGION`).

#### Scenario: Legacy OpenAI configuration

- **WHEN** no `QUIQR_LLM_PROVIDER_*` variables are set
- **AND** environment variable `OPENAI_API_KEY` is set
- **THEN** the system SHALL create an OpenAI provider using the legacy API key
- **AND** the system SHALL log an info message indicating legacy configuration is active

#### Scenario: Legacy Bedrock configuration

- **WHEN** no `QUIQR_LLM_PROVIDER_*` variables are set
- **AND** environment variables `AWS_BEARER_TOKEN_BEDROCK` and `AWS_REGION` are set
- **THEN** the system SHALL create an Anthropic Bedrock provider using the legacy credentials
- **AND** the system SHALL log an info message indicating legacy configuration is active

#### Scenario: New configuration takes precedence

- **WHEN** both `QUIQR_LLM_PROVIDER_*` variables and legacy variables are set
- **THEN** the system SHALL use only the new connection string configuration
- **AND** the system SHALL ignore legacy environment variables
- **AND** the system SHALL NOT log legacy configuration messages

#### Scenario: Mixed legacy providers

- **WHEN** no `QUIQR_LLM_PROVIDER_*` variables are set
- **AND** both `OPENAI_API_KEY` and `AWS_BEARER_TOKEN_BEDROCK` with `AWS_REGION` are set
- **THEN** the system SHALL create providers for both OpenAI and Anthropic Bedrock
- **AND** both providers SHALL be available for model routing

### Requirement: Configuration Validation and Error Handling

The system SHALL validate provider configurations at startup and provide clear error messages for configuration issues.

#### Scenario: Missing required credentials

- **WHEN** connection string is `openai://` without credentials
- **THEN** the system SHALL log an error indicating missing API key
- **AND** the system SHALL skip the invalid provider
- **AND** the system SHALL continue with remaining providers

#### Scenario: Missing required parameters

- **WHEN** connection string is `anthropic://key@bedrock` without `region` parameter
- **THEN** the system SHALL log an error indicating missing region parameter
- **AND** the system SHALL provide example of correct format

#### Scenario: Provider initialization failure

- **WHEN** provider factory function throws an error during initialization
- **THEN** the system SHALL log the error with provider context
- **AND** the system SHALL skip the failed provider
- **AND** the system SHALL continue initializing remaining providers

#### Scenario: No providers configured

- **WHEN** no `QUIQR_LLM_PROVIDER_*` variables are set
- **AND** no legacy environment variables are set
- **THEN** the system SHALL log a warning indicating no LLM providers are configured
- **AND** any `callLLM()` request SHALL fail with a clear error message

#### Scenario: Configuration summary logging

- **WHEN** provider registry completes initialization
- **THEN** the system SHALL log a summary of configured providers
- **AND** the summary SHALL include provider count and types
- **AND** the summary SHALL show example models for each provider

### Requirement: Connection String Format Specification

Connection strings SHALL follow the URI format: `provider://[credentials]@[endpoint]?[params]`

#### Scenario: Minimal connection string

- **WHEN** connection string is `openai://sk-abc123`
- **THEN** provider type SHALL be `openai`
- **AND** credentials SHALL be `sk-abc123`
- **AND** endpoint SHALL be undefined (use default)
- **AND** parameters SHALL be empty

#### Scenario: Connection string with endpoint

- **WHEN** connection string is `openai://sk-abc123@api.custom.com`
- **THEN** provider type SHALL be `openai`
- **AND** credentials SHALL be `sk-abc123`
- **AND** endpoint SHALL be `api.custom.com`

#### Scenario: Connection string with query parameters

- **WHEN** connection string is `anthropic://token@bedrock?region=eu-central-1&timeout=30`
- **THEN** provider type SHALL be `anthropic`
- **AND** credentials SHALL be `token`
- **AND** endpoint SHALL be `bedrock`
- **AND** parameter `region` SHALL be `eu-central-1`
- **AND** parameter `timeout` SHALL be `30`

#### Scenario: URL-encoded credentials

- **WHEN** connection string contains special characters in credentials
- **AND** credentials are URL-encoded (e.g., `%3D` for `=`)
- **THEN** the system SHALL decode credentials correctly
- **AND** the decoded credentials SHALL be passed to the provider

#### Scenario: Provider type case insensitivity

- **WHEN** connection string is `OpenAI://key` or `OPENAI://key`
- **THEN** provider type SHALL be normalized to lowercase `openai`
- **AND** provider factory SHALL be matched correctly

### Requirement: Model Pattern Matching

The system SHALL use pattern matching to route model requests to appropriate providers based on model string conventions.

#### Scenario: OpenAI model patterns

- **GIVEN** an OpenAI provider is configured
- **WHEN** model string starts with `gpt-` or `o1-` or `text-`
- **THEN** the system SHALL route to the OpenAI provider

#### Scenario: Anthropic model patterns

- **GIVEN** an Anthropic provider is configured
- **WHEN** model string starts with `claude-` or contains `anthropic.claude`
- **THEN** the system SHALL route to the Anthropic provider

#### Scenario: Google model patterns

- **GIVEN** a Google provider is configured
- **WHEN** model string starts with `gemini-` or `models/gemini`
- **THEN** the system SHALL route to the Google provider

#### Scenario: Azure model patterns

- **GIVEN** an Azure provider is configured
- **WHEN** model string starts with `azure/` or `deployment/`
- **THEN** the system SHALL route to the Azure provider

#### Scenario: Mistral model patterns

- **GIVEN** a Mistral provider is configured
- **WHEN** model string starts with `mistral-` or `open-mistral`
- **THEN** the system SHALL route to the Mistral provider

#### Scenario: Cohere model patterns

- **GIVEN** a Cohere provider is configured
- **WHEN** model string starts with `command-` or `embed-`
- **THEN** the system SHALL route to the Cohere provider

#### Scenario: Multiple matching providers

- **GIVEN** two OpenAI providers are configured (`PROVIDER_0` and `PROVIDER_1`)
- **WHEN** model string is `gpt-4`
- **THEN** the system SHALL route to the first matching provider (`PROVIDER_0`)
- **AND** the system SHALL use registration order for tie-breaking

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

