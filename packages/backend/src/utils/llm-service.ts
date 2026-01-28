/**
 * LLM Service
 *
 * Handles LLM provider configuration, initialization, and API calls.
 * Supports multiple providers via connection string configuration.
 * 
 * Configuration:
 * Use environment variables QUIQR_LLM_PROVIDER_0 through QUIQR_LLM_PROVIDER_9
 * 
 * Format: provider://credentials@endpoint?params
 * 
 * Examples:
 * - QUIQR_LLM_PROVIDER_0="openai://sk-abc123"
 * - QUIQR_LLM_PROVIDER_1="bedrock://token?region=eu-central-1"
 * - QUIQR_LLM_PROVIDER_2="anthropic://sk-ant-xyz"
 * - QUIQR_LLM_PROVIDER_3="google://api-key?location=us-central1"
 * - QUIQR_LLM_PROVIDER_4="azure://key@endpoint.openai.azure.com?deployment=gpt4"
 */

import { generateText, LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAzure } from '@ai-sdk/azure';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';

/**
 * Supported LLM provider types
 */
export type LLMProviderType = string;

/**
 * LLM request parameters
 */
export interface LLMRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string; // Optional explicit provider ID
}

/**
 * LLM response
 */
export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  provider: string;
  providerId: string;
}

/**
 * Parsed connection string components
 */
export interface ProviderConnectionString {
  type: string;           // Provider type (openai, anthropic, etc.)
  credentials: string;    // API key or token
  endpoint?: string;      // Optional custom endpoint
  params: Record<string, string>; // Query parameters
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  id: string;             // Unique ID (e.g., "provider-0")
  type: string;           // Provider type (openai, anthropic, etc.)
  name: string;           // Display name
  credentials: string;    // API key/token
  endpoint?: string;      // Optional custom endpoint
  params: Record<string, string>; // Provider-specific parameters
  modelPatterns: RegExp[]; // Patterns to match model strings
  createModel: (modelName: string) => LanguageModel; // Factory function
}

/**
 * Model patterns for each provider type
 */
const MODEL_PATTERNS: Record<string, RegExp[]> = {
  openai: [/^gpt-/, /^o1-/, /^text-/],
  anthropic: [/^claude-/],
  bedrock: [/anthropic\.claude/, /^eu\.anthropic\.claude/, /^us\.anthropic\.claude/, /amazon\.titan/, /meta\.llama/, /cohere\.command/, /ai21\./, /mistral\./],
  google: [/^gemini-/, /^models\/gemini/],
  azure: [/^azure\//, /^deployment\//],
  mistral: [/^mistral-/, /^open-mistral/],
  cohere: [/^command-/, /^embed-/],
};

/**
 * Parse a connection string into components
 * 
 * Format: provider://credentials@endpoint?params
 * 
 * @param connectionString - The connection string to parse
 * @returns Parsed components
 */
export function parseConnectionString(connectionString: string): ProviderConnectionString {
  try {
    // For simple format provider://credentials, the credentials come after ://
    // For endpoint format provider://credentials@endpoint, parse normally
    
    let hasEndpoint = connectionString.includes('@');
    
    if (!hasEndpoint) {
      // Format: provider://credentials?params
      // Extract parts manually
      const protocolEnd = connectionString.indexOf('://');
      if (protocolEnd === -1) {
        throw new Error('Invalid URL');
      }
      
      const type = connectionString.substring(0, protocolEnd).toLowerCase();
      const afterProtocol = connectionString.substring(protocolEnd + 3);
      
      // Split by ? to separate credentials from params
      const questionIndex = afterProtocol.indexOf('?');
      let credentials: string;
      let queryString = '';
      
      if (questionIndex !== -1) {
        credentials = afterProtocol.substring(0, questionIndex);
        queryString = afterProtocol.substring(questionIndex + 1);
      } else {
        credentials = afterProtocol;
      }
      
      // Decode credentials
      credentials = decodeURIComponent(credentials);
      
      if (!type) {
        throw new Error('Missing provider type in connection string');
      }
      
      if (!credentials) {
        throw new Error('Missing credentials in connection string');
      }
      
      // Parse query parameters
      const params: Record<string, string> = {};
      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }
      
      return {
        type,
        credentials,
        endpoint: undefined,
        params,
      };
    }
    
    // Format: provider://credentials@endpoint?params
    // Extract manually to handle properly
    const protocolEnd = connectionString.indexOf('://');
    if (protocolEnd === -1) {
      throw new Error('Invalid URL');
    }
    
    const type = connectionString.substring(0, protocolEnd).toLowerCase();
    const afterProtocol = connectionString.substring(protocolEnd + 3);
    
    // Find the @ separator
    const atIndex = afterProtocol.indexOf('@');
    if (atIndex === -1) {
      throw new Error('Expected @ for endpoint format');
    }
    
    // Credentials are before @
    let credentials = afterProtocol.substring(0, atIndex);
    credentials = decodeURIComponent(credentials);
    
    // Everything after @ is endpoint and params
    const afterAt = afterProtocol.substring(atIndex + 1);
    
    // Split by ? to separate endpoint from params
    const questionIndex = afterAt.indexOf('?');
    let endpoint: string;
    let queryString = '';
    
    if (questionIndex !== -1) {
      endpoint = afterAt.substring(0, questionIndex);
      queryString = afterAt.substring(questionIndex + 1);
    } else {
      endpoint = afterAt;
    }
    
    // Parse query parameters
    const params: Record<string, string> = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    if (!type) {
      throw new Error('Missing provider type in connection string');
    }
    
    if (!credentials) {
      throw new Error('Missing credentials in connection string');
    }
    
    return {
      type,
      credentials,
      endpoint: endpoint || undefined,
      params,
    };
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Invalid URL') || error.message.includes('Expected @'))) {
      throw new Error(
        `Invalid connection string format: "${connectionString}". ` +
        `Expected format: provider://credentials@endpoint?params ` +
        `Example: openai://sk-abc123 or bedrock://token?region=eu-central-1`
      );
    }
    throw error;
  }
}

/**
 * Create an OpenAI provider instance
 */
function createOpenAIProvider(config: ProviderConnectionString) {
  const options: any = {
    apiKey: config.credentials,
  };
  
  if (config.endpoint) {
    options.baseURL = `https://${config.endpoint}`;
  }
  
  return createOpenAI(options);
}

/**
 * Create an AWS Bedrock provider instance
 * Bedrock provides access to multiple foundation models from various providers
 * 
 * Supports two authentication methods:
 * 1. API Key authentication (recommended) - pass API key as credentials
 * 2. AWS SigV4 authentication (fallback) - uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 */
function createBedrockProvider(config: ProviderConnectionString) {
  const region = config.params.region;
  if (!region) {
    throw new Error(
      'AWS Bedrock configuration requires "region" parameter. ' +
      'Example: bedrock://api-key?region=eu-central-1'
    );
  }
  
  return createAmazonBedrock({
    region,
    // API key authentication (uses AWS_BEARER_TOKEN_BEDROCK internally)
    apiKey: config.credentials,
  });
}

/**
 * Create a direct Anthropic provider instance
 */
function createAnthropicProvider(config: ProviderConnectionString) {
  return createAnthropic({
    apiKey: config.credentials,
  });
}

/**
 * Create a Google Gemini provider instance
 */
function createGoogleProvider(config: ProviderConnectionString) {
  const options: any = {
    apiKey: config.credentials,
  };
  
  // Optional location parameter
  if (config.params.location) {
    options.location = config.params.location;
  }
  
  return createGoogleGenerativeAI(options);
}

/**
 * Create an Azure OpenAI provider instance
 */
function createAzureProvider(config: ProviderConnectionString) {
  if (!config.endpoint) {
    throw new Error(
      'Azure OpenAI configuration requires endpoint. ' +
      'Example: azure://key@endpoint.openai.azure.com?deployment=gpt4'
    );
  }
  
  const deployment = config.params.deployment;
  if (!deployment) {
    throw new Error(
      'Azure OpenAI configuration requires "deployment" parameter. ' +
      'Example: azure://key@endpoint.openai.azure.com?deployment=gpt4'
    );
  }
  
  return createAzure({
    apiKey: config.credentials,
    resourceName: config.endpoint.split('.')[0], // Extract resource name from endpoint
  });
}

/**
 * Create a Mistral provider instance
 */
function createMistralProvider(config: ProviderConnectionString) {
  return createMistral({
    apiKey: config.credentials,
  });
}

/**
 * Create a Cohere provider instance
 */
function createCohereProvider(config: ProviderConnectionString) {
  return createCohere({
    apiKey: config.credentials,
  });
}

/**
 * Provider factory registry
 */
const PROVIDER_FACTORIES: Record<string, (config: ProviderConnectionString) => any> = {
  openai: createOpenAIProvider,
  anthropic: createAnthropicProvider,
  bedrock: createBedrockProvider,
  google: createGoogleProvider,
  azure: createAzureProvider,
  mistral: createMistralProvider,
  cohere: createCohereProvider,
};

/**
 * Provider Registry - Singleton class managing all configured providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry | null = null;
  private providers: Map<string, ProviderConfig> = new Map();
  private initialized = false;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Initialize providers from environment variables
   * Reads QUIQR_LLM_PROVIDER_0 through QUIQR_LLM_PROVIDER_9
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.providers.clear();

    // Read up to 10 provider configurations
    for (let i = 0; i < 10; i++) {
      const envVar = `QUIQR_LLM_PROVIDER_${i}`;
      const connectionString = process.env[envVar];

      if (!connectionString) {
        continue;
      }

      try {
        const parsed = parseConnectionString(connectionString);
        const factory = PROVIDER_FACTORIES[parsed.type];

        if (!factory) {
          console.warn(
            `⚠ Unknown provider type "${parsed.type}" in ${envVar}. ` +
            `Supported types: ${Object.keys(PROVIDER_FACTORIES).join(', ')}`
          );
          continue;
        }

        // Create the provider instance
        const providerInstance = factory(parsed);

        // Create model factory function
        const createModel = (modelName: string): LanguageModel => {
          return providerInstance(modelName);
        };

        // Get model patterns for this provider type
        const modelPatterns = MODEL_PATTERNS[parsed.type] || [];

        // Create display name
        let name = parsed.type.charAt(0).toUpperCase() + parsed.type.slice(1);
        if (parsed.endpoint) {
          name += ` (${parsed.endpoint})`;
        }
        if (parsed.params.region) {
          name += ` [${parsed.params.region}]`;
        }

        const config: ProviderConfig = {
          id: `provider-${i}`,
          type: parsed.type,
          name,
          credentials: parsed.credentials,
          endpoint: parsed.endpoint,
          params: parsed.params,
          modelPatterns,
          createModel,
        };

        this.providers.set(config.id, config);
        console.log(`✓ Registered ${config.id}: ${config.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to configure ${envVar}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    this.initialized = true;
  }

  /**
   * Get a provider by ID or by matching model string
   * 
   * @param modelOrProviderId - Provider ID (e.g., "provider-0") or model string (e.g., "gpt-4")
   * @returns Provider configuration
   */
  getProvider(modelOrProviderId: string): ProviderConfig {
    if (!this.initialized) {
      this.initialize();
    }

    // Check if it's a direct provider ID
    if (this.providers.has(modelOrProviderId)) {
      return this.providers.get(modelOrProviderId)!;
    }

    // Try to match by model pattern
    const matched = this.matchByModel(modelOrProviderId);
    if (matched) {
      return matched;
    }

    // No match found - provide helpful error
    const availableProviders = Array.from(this.providers.values())
      .map(p => `${p.id} (${p.type})`)
      .join(', ');

    throw new Error(
      `No provider found for model "${modelOrProviderId}". ` +
      `Available providers: ${availableProviders || 'none configured'}. ` +
      `Configure providers using QUIQR_LLM_PROVIDER_0, QUIQR_LLM_PROVIDER_1, etc.`
    );
  }

  /**
   * Match a model string against provider patterns
   * Returns the first matching provider (registration order)
   */
  private matchByModel(model: string): ProviderConfig | null {
    for (const provider of this.providers.values()) {
      for (const pattern of provider.modelPatterns) {
        if (pattern.test(model)) {
          return provider;
        }
      }
    }
    return null;
  }

  /**
   * List all configured providers
   */
  listProviders(): ProviderConfig[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.providers.values());
  }

  /**
   * Check if a provider exists
   */
  hasProvider(providerId: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.providers.has(providerId);
  }

  /**
   * Get provider count
   */
  getProviderCount(): number {
    if (!this.initialized) {
      this.initialize();
    }
    return this.providers.size;
  }
}

/**
 * Call LLM with the given request
 * 
 * @param request - LLM request parameters
 * @returns LLM response with text and metadata
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const registry = ProviderRegistry.getInstance();

  // Get provider (either explicit or by model matching)
  const providerConfig = registry.getProvider(request.provider || request.model);

  console.log(`\nUsing provider: ${providerConfig.id} (${providerConfig.name})`);
  console.log(`Model: ${request.model}`);

  // Get the model instance
  const model = providerConfig.createModel(request.model);

  // Set default values
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens ?? 4096;

  console.log(`Temperature: ${temperature}, Max tokens: ${maxTokens}`);

  try {
    // Call the LLM using generateText (non-streaming)
    // For OpenAI models, use maxCompletionTokens (newer parameter name)
    // For other providers, use maxTokens
    const generateOptions: Parameters<typeof generateText>[0] = {
      model,
      prompt: request.prompt,
      temperature,
      ...(providerConfig.type === 'openai'
        ? { maxCompletionTokens: maxTokens }
        : { maxTokens }
      ),
    };

    const result = await generateText(generateOptions);

    // Extract response data
    const response: LLMResponse = {
      text: result.text,
      model: request.model,
      provider: providerConfig.type,
      providerId: providerConfig.id,
      finishReason: result.finishReason,
    };

    // Add usage stats if available
    if (result.usage) {
      response.usage = {
        promptTokens: result.usage.inputTokens || 0,
        completionTokens: result.usage.outputTokens || 0,
        totalTokens: result.usage.totalTokens || 0,
      };
    }

    return response;
  } catch (error: unknown) {
    console.error('LLM call failed:', error);

    if (!(error instanceof Error)) {
      throw new Error(
        `Failed to call ${providerConfig.name}: ${error}`
      );
    }

    // Provide more helpful error messages
    if (error.message.includes('401') || error.message?.includes('authentication')) {
      throw new Error(
        `Authentication failed for ${providerConfig.name}. ` +
        `Please check your API credentials in ${providerConfig.id}.`
      );
    } else if (error.message.includes('rate limit')) {
      throw new Error(
        `Rate limit exceeded for ${providerConfig.name}. ` +
        `Please try again later.`
      );
    } else if (error.message.includes('timeout')) {
      throw new Error(
        `Request timed out while calling ${providerConfig.name}. ` +
        `Please try again.`
      );
    }

    // Re-throw with provider context
    throw new Error(
      `Failed to call ${providerConfig.name}: ${error.message}`
    );
  }
}

/**
 * Initialize and validate LLM provider configuration at startup
 * 
 * @returns Summary of configured providers
 */
export function initializeLLMProviders(): {
  count: number;
  providers: Array<{
    id: string;
    type: string;
    name: string;
    modelExamples: string[];
  }>;
  warnings: string[];
} {
  const warnings: string[] = [];
  const registry = ProviderRegistry.getInstance();

  console.log('\n' + '='.repeat(60));
  console.log('Initializing LLM Providers');
  console.log('='.repeat(60));

  // Initialize registry (reads environment variables)
  registry.initialize();

  const configuredProviders = registry.listProviders();

  if (configuredProviders.length === 0) {
    warnings.push(
      'No LLM providers configured. Set QUIQR_LLM_PROVIDER_0, QUIQR_LLM_PROVIDER_1, etc.'
    );
    console.warn('⚠ No LLM providers configured');
    console.warn('   Set environment variables QUIQR_LLM_PROVIDER_0 through QUIQR_LLM_PROVIDER_9');
    console.warn('   Format: provider://credentials@endpoint?params');
    console.warn('   Example: QUIQR_LLM_PROVIDER_0="openai://sk-abc123"');
  } else {
    console.log(`\n✓ ${configuredProviders.length} provider(s) configured:\n`);

    configuredProviders.forEach((provider) => {
      // Generate example models based on patterns
      const modelExamples: string[] = [];
      if (provider.type === 'openai') {
        modelExamples.push('gpt-4', 'gpt-3.5-turbo');
      } else if (provider.type === 'anthropic') {
        modelExamples.push('claude-3-5-sonnet', 'claude-3-opus');
      } else if (provider.type === 'bedrock') {
        modelExamples.push('anthropic.claude-3-5-sonnet', 'meta.llama3', 'amazon.titan-text');
      } else if (provider.type === 'google') {
        modelExamples.push('gemini-pro', 'gemini-1.5-pro');
      } else if (provider.type === 'azure') {
        modelExamples.push('azure/gpt-4');
      } else if (provider.type === 'mistral') {
        modelExamples.push('mistral-large', 'mistral-medium');
      } else if (provider.type === 'cohere') {
        modelExamples.push('command-r-plus', 'command-r');
      }

      console.log(`  ${provider.id}: ${provider.name}`);
      console.log(`    Type: ${provider.type}`);
      console.log(`    Example models: ${modelExamples.join(', ')}`);
      console.log('');
    });
  }

  console.log('='.repeat(60) + '\n');

  return {
    count: configuredProviders.length,
    providers: configuredProviders.map((p) => {
      const modelExamples: string[] = [];
      if (p.type === 'openai') {
        modelExamples.push('gpt-4', 'gpt-3.5-turbo');
      } else if (p.type === 'anthropic') {
        modelExamples.push('claude-3-5-sonnet');
      } else if (p.type === 'bedrock') {
        modelExamples.push('anthropic.claude-3-5-sonnet');
      } else if (p.type === 'google') {
        modelExamples.push('gemini-pro');
      } else if (p.type === 'azure') {
        modelExamples.push('azure/gpt-4');
      } else if (p.type === 'mistral') {
        modelExamples.push('mistral-large');
      } else if (p.type === 'cohere') {
        modelExamples.push('command-r-plus');
      }

      return {
        id: p.id,
        type: p.type,
        name: p.name,
        modelExamples,
      };
    }),
    warnings,
  };
}

/**
 * Get provider display name (for backward compatibility)
 * @deprecated Use ProviderRegistry instead
 */
export function getProviderDisplayName(providerType: string): string {
  const registry = ProviderRegistry.getInstance();
  const providers = registry.listProviders();
  const provider = providers.find(p => p.type === providerType);
  return provider ? provider.name : providerType;
}
