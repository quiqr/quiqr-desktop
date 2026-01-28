# Design: Improve Provider Configuration for LLM Service

## Context

The current LLM service (`packages/backend/src/utils/llm-service.ts`) has provider-specific logic scattered throughout:
- Environment variables are provider-specific (AWS_BEARER_TOKEN_BEDROCK, OPENAI_API_KEY, etc.)
- Provider detection is based on hardcoded model name patterns
- Each provider requires custom initialization code
- No way to configure multiple instances of the same provider

This limits extensibility as each new provider requires code changes and new environment variable patterns.

### Stakeholders
- Developers extending AI features
- Users configuring multiple LLM providers
- Site administrators managing different AI configurations per workspace

### Constraints
- Must use environment variables only (no UI configuration in this change)
- Must support all Vercel AI SDK providers
- Maximum 10 provider configurations (QUIQR_LLM_PROVIDER_0 through QUIQR_LLM_PROVIDER_9)
- No backward compatibility with existing environment variables required

## Goals / Non-Goals

### Goals
- Unified, declarative provider configuration via connection strings
- Support all Vercel AI SDK providers (OpenAI, Anthropic, Google, Azure, Mistral, Cohere, etc.)
- Multiple instances of the same provider (e.g., two different OpenAI accounts)
- Automatic provider discovery and validation at startup
- Clear error messages for misconfigured providers
- Provider registry pattern for clean separation of concerns

### Non-Goals
- UI-based configuration interface (future enhancement)
- Per-site provider configuration (remains global via environment variables)
- Provider capability detection (feature discovery)
- Cost tracking or usage monitoring
- Dynamic provider loading at runtime (configured at startup only)

## Decisions

### Decision 1: Connection String Format

**Chosen:** URI-style connection string with provider-specific parameters

**Format:**
```
provider://[credentials]@[endpoint]?[params]

Components:
- provider: Provider identifier (openai, anthropic, google, azure, mistral, cohere, etc.)
- credentials: API key or token (URL-encoded if contains special chars)
- endpoint: Optional custom endpoint (for self-hosted or regional endpoints)
- params: Query parameters for provider-specific settings (region, deployment, etc.)
```

**Examples:**
```bash
# OpenAI with API key
QUIQR_LLM_PROVIDER_0="openai://sk-abc123"

# Anthropic via AWS Bedrock with region
QUIQR_LLM_PROVIDER_1="anthropic://token@bedrock?region=eu-central-1"

# Google Gemini with location
QUIQR_LLM_PROVIDER_2="google://api-key?location=us-central1"

# Azure OpenAI with deployment
QUIQR_LLM_PROVIDER_3="azure://key@endpoint.openai.azure.com?deployment=gpt4"

# Custom OpenAI endpoint (e.g., proxy or self-hosted)
QUIQR_LLM_PROVIDER_4="openai://key@api.custom.com"

# Mistral
QUIQR_LLM_PROVIDER_5="mistral://api-key"

# Cohere
QUIQR_LLM_PROVIDER_6="cohere://api-key"
```

**Rationale:**
- Familiar URI format that developers already understand
- Encapsulates all provider configuration in a single string
- Extensible via query parameters for provider-specific settings
- URL encoding handles special characters in credentials
- Self-documenting (provider type is explicit)

**Alternatives considered:**
1. JSON string format (e.g., `{"provider":"openai","apiKey":"..."}`)
   - More verbose, harder to read in environment variables
   - Requires JSON escaping in shell environments
   
2. Semicolon-separated key-value pairs (e.g., `provider=openai;apiKey=...`)
   - Less familiar to developers
   - No standard for nesting or complex values
   
3. Separate environment variables per provider instance (e.g., `QUIQR_LLM_0_TYPE`, `QUIQR_LLM_0_KEY`)
   - Too many environment variables (N providers × M params)
   - Harder to validate completeness

### Decision 2: Provider Registry Architecture

**Chosen:** Central ProviderRegistry class with lazy initialization

**Architecture:**
```typescript
// Provider registry singleton
class ProviderRegistry {
  private providers: Map<string, ProviderConfig>;
  
  initialize(): void {
    // Parse QUIQR_LLM_PROVIDER_* environment variables
    // Create provider configurations
    // Validate each configuration
  }
  
  getProvider(modelOrProvider: string): ProviderConfig {
    // Match by exact provider name or by model pattern
  }
  
  listProviders(): ProviderConfig[] {
    // Return all configured providers
  }
}

// Provider configuration
interface ProviderConfig {
  id: string;                    // e.g., "provider-0"
  type: string;                  // e.g., "openai", "anthropic"
  name: string;                  // User-friendly name
  credentials: string;           // API key/token
  endpoint?: string;             // Custom endpoint
  params: Record<string, string>; // Provider-specific params
  modelFactory: (model: string) => LanguageModel; // AI SDK model factory
}
```

**Rationale:**
- Single source of truth for provider configuration
- Decouples configuration parsing from provider usage
- Enables validation at startup before any LLM calls
- Supports both explicit provider selection and model-based routing
- Extensible to add provider metadata (capabilities, pricing, etc.)

**Alternatives considered:**
1. Factory functions per provider
   - Scattered logic across multiple modules
   - Harder to enumerate available providers
   
2. Dynamic import of provider modules
   - Unnecessary complexity for known providers
   - All providers come from single AI SDK package

### Decision 3: Model-to-Provider Routing

**Chosen:** Pattern matching with provider precedence

**Logic:**
1. Check for explicit provider selection (if user specifies provider in request)
2. Match model string against each provider's supported patterns
3. Use first matching provider in registration order (PROVIDER_0 before PROVIDER_1)
4. Fail with clear error if no provider matches

**Model Pattern Examples:**
```typescript
const MODEL_PATTERNS = {
  openai: [/^gpt-/, /^o1-/, /^text-/],
  anthropic: [/^claude-/, /anthropic\.claude/],
  google: [/^gemini-/, /^models\/gemini/],
  azure: [/^azure\//, /^deployment\//],
  mistral: [/^mistral-/, /^open-mistral/],
  cohere: [/^command-/, /^embed-/],
};
```

**Rationale:**
- Preserves existing behavior (model string determines provider)
- Allows explicit override when multiple providers support same models
- Order matters for tie-breaking (predictable behavior)
- Clear error when model doesn't match any provider

**Alternatives considered:**
1. Always require explicit provider parameter
   - Breaking change for existing code
   - More verbose API calls
   
2. First provider that claims to support model
   - Unpredictable when multiple providers match
   - Harder to debug configuration issues

### Decision 4: Backward Compatibility Strategy

**Chosen:** NO fallback to legacy environment variables if no QUIQR_LLM_PROVIDER_* found

**Implementation:**
- not relavant

**Rationale:**
- AI is still very beta so acceptable breaking changes for existing installations
- not many migrations

## Risks / Trade-offs

### Risk: Credentials in Environment Variables
**Description:** Sensitive API keys stored in plain text environment variables

**Mitigation:**
- Document security best practices (use .env files with proper permissions, never commit)
- Foundation for future secure credential storage (keyring integration)
- Consider encrypted environment variables in future release

**Trade-off:** Simplicity vs security. For now, prioritizing ease of configuration. Future enhancement can add secure credential management.

### Risk: Connection String Parsing Complexity
**Description:** URI parsing can be error-prone with special characters in credentials

**Mitigation:**
- Use standard URL parsing library (Node.js `URL` class)
- URL-encode credentials if they contain special characters
- Provide clear error messages for malformed connection strings
- Document encoding requirements with examples

**Trade-off:** Slightly more complex for users with special characters in keys, but provides standardized format.

### Risk: Provider Pattern Conflicts
**Description:** Multiple providers might match the same model string

**Mitigation:**
- Use registration order for tie-breaking (first match wins)
- Log warnings when multiple providers match
- Allow explicit provider selection in LLM request
- Document model patterns for each provider

**Trade-off:** Predictable but requires careful provider ordering. Alternative would be explicit provider selection always (more verbose).

### Risk: Limited to 10 Providers
**Description:** Maximum 10 provider configurations might not be sufficient for all use cases

**Mitigation:**
- 10 providers should cover most real-world scenarios (typically 1-3 used)
- Can increase limit in future if needed (QUIQR_LLM_PROVIDER_10, etc.)
- Consider alternate configuration file format if limit becomes problematic

**Trade-off:** Simplicity (sequential numbering) vs unlimited flexibility. Starting conservative, can expand later.

## Migration Plan

### Phase 1: Implementation (This Change)
1. Implement connection string parser with validation
2. Create ProviderRegistry class with provider initialization
3. Add support for all Vercel AI SDK providers
4. Update callLLM() to use provider registry
5. Remove legacy environment variable support
6. Clean up backward compatibility code
7. Update startup logging to show detected providers
8. Add comprehensive error messages for configuration issues

### Phase 2: Documentation
1. Update AGENTS.md with new configuration format
2. Add examples for each supported provider
3. Document migration from legacy environment variables
4. Create troubleshooting guide for common configuration issues

### Phase 3: Testing
1. Unit tests for connection string parsing
2. Unit tests for provider registry
3. Integration tests with multiple providers
4. Test backward compatibility with legacy variables
5. Test error handling for malformed configurations

### Phase 4: Deprecation (Future Release)
1. Log warnings for legacy environment variable usage
2. Update documentation to recommend new format
3. Provide migration scripts to convert configurations

### Rollback Strategy
If issues arise:
1. Provider initialization failures: Skip failed providers, log errors, continue with working providers

## Open Questions

1. **Should we support provider aliases?** (e.g., "gpt" → "openai", "claude" → "anthropic")
   - **Decision**: Not in initial implementation. Keep provider names matching AI SDK exactly. Can add aliases if user feedback indicates need.

2. **Should we expose provider enumeration via API?** (frontend could show available providers)
   - **Decision**: Not in this change. Focus on backend improvements first. Future enhancement for UI configuration.

3. **Should we support provider priorities/fallbacks?** (try provider A, fall back to B if error)
   - **Decision**: Not in initial implementation. Single provider per model string. Can add fallback logic if use case emerges.

4. **Should we validate API keys at startup?** (test connection to each provider)
   - **Decision**: No. Validation adds startup latency and may fail due to network issues. Fail fast on first actual usage with clear error message.

5. **How to handle model string normalization?** (e.g., "gpt-4" vs "gpt-4-turbo" vs "openai/gpt-4")
   - **Decision**: Pass model string to provider as-is. Let AI SDK handle normalization. Provider patterns match flexible regex.
