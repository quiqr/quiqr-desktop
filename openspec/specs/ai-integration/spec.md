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

The `callLLM()` function SHALL support both model-based routing and explicit provider selection.

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

