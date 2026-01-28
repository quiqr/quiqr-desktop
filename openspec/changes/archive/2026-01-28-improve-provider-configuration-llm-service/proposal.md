# Change: Improve Provider Configuration for LLM Service

## Why

The current LLM service configuration relies on scattered environment variables (AWS_BEARER_TOKEN_BEDROCK, AWS_REGION, OPENAI_API_KEY) that are provider-specific and lack standardization. This approach:

- Makes it difficult to configure multiple providers or multiple instances of the same provider
- Requires hardcoded logic for each provider's specific environment variables
- Provides no clear way to extend support to additional AI SDK providers (Google, Azure, etc.)
- Forces users to understand provider-specific credential requirements

A standardized, declarative configuration using human-readable connection strings will make the LLM service more maintainable and extensible.

## What Changes

- Replace scattered provider-specific environment variables with a unified configuration system using `QUIQR_LLM_PROVIDER_0` through `QUIQR_LLM_PROVIDER_9` (max 10 providers)
- Implement a connection string parser that supports human-readable format for provider configuration
- Extend support to all providers available in Vercel AI SDK (Anthropic, OpenAI, Google Gemini, Azure OpenAI, Mistral, Cohere, etc.)
- Improve provider detection logic to match against configured providers rather than hardcoded model patterns
- Add provider registry that maps connection strings to initialized provider instances
- Update LLM service API to select providers based on model string or explicit provider parameter
- Maintain backward compatibility with existing environment variables during transition period

**Connection String Format:**
```
provider://[credentials]@[endpoint]?[params]

Examples:
QUIQR_LLM_PROVIDER_0="openai://sk-abc123"
QUIQR_LLM_PROVIDER_1="anthropic://sk-ant-xyz@bedrock?region=eu-central-1"
QUIQR_LLM_PROVIDER_2="google://api-key-456?location=us-central1"
QUIQR_LLM_PROVIDER_3="azure://key@endpoint.openai.azure.com?deployment=gpt4"
```

## Impact

- **Affected specs:** `ai-integration` (new capability)
- **Affected code:**
  - `/packages/backend/src/utils/llm-service.ts` - Complete refactor of provider initialization and configuration
  - `/packages/backend/src/api/handlers/workspace-handlers.ts` - Update AI prompt handlers to use new provider registry
  - `/packages/types/src/schemas/config.ts` - Update LlmSettings schema to support provider selection
  
- **Breaking changes:** None (backward compatibility maintained through environment variable fallback)
- **Migration path:** Users can continue using existing environment variables; new connection string format is opt-in
- **Benefits:**
  - Simpler configuration for end users
  - Easier to add new provider instances
  - Clear provider discovery and enumeration
  - Better error messages with configuration validation
  - Foundation for future UI-based configuration
