/**
 * LLM Service
 *
 * Handles LLM provider detection, initialization, and API calls.
 * Supports AWS Bedrock (Claude) and OpenAI using Vercel AI SDK.
 */

import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Supported LLM providers
 */
export type LLMProviderType = 'bedrock' | 'openai';

/**
 * LLM request parameters
 */
export interface LLMRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
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
  provider: LLMProviderType;
}

/**
 * Detect LLM provider from model string
 */
export function detectProvider(modelString: string): LLMProviderType {
  // AWS Bedrock Claude models
  // Examples:
  // - eu.anthropic.claude-sonnet-4-5-20250929-v1:0
  // - anthropic.claude-3-5-sonnet-20241022-v2:0
  if (
    modelString.includes('anthropic.claude') ||
    modelString.startsWith('eu.anthropic.claude')
  ) {
    return 'bedrock';
  }

  // OpenAI models
  // Examples: gpt-4o, gpt-3.5-turbo, gpt-4-turbo
  if (modelString.startsWith('gpt-')) {
    return 'openai';
  }

  throw new Error(
    `Unsupported model: ${modelString}. ` +
    `Supported models: AWS Bedrock Claude (anthropic.claude-*) or OpenAI (gpt-*)`
  );
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: LLMProviderType): string {
  switch (provider) {
    case 'bedrock':
      return 'AWS Bedrock - Anthropic Claude';
    case 'openai':
      return 'OpenAI';
    default:
      return 'Unknown';
  }
}

/**
 * Check if required environment variables are set
 */
function checkEnvironmentVariables(provider: LLMProviderType): void {
  if (provider === 'bedrock') {
    if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
      throw new Error(
        'AWS_BEARER_TOKEN_BEDROCK environment variable is not set. ' +
        'Please set it to use AWS Bedrock models.'
      );
    }
    if (!process.env.AWS_REGION) {
      throw new Error(
        'AWS_REGION environment variable is not set. ' +
        'Please set it to use AWS Bedrock models (e.g., eu-central-1).'
      );
    }
  } else if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. ' +
        'Please set it to use OpenAI models.'
      );
    }
  }
}

/**
 * Create Bedrock provider instance
 */
function createBedrockProvider() {
  const region = process.env.AWS_REGION!;
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK!;
  console.log(token)

  return createAnthropic({
    baseURL: `https://bedrock-runtime.${region}.amazonaws.com`,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * Create OpenAI provider instance
 */
function createOpenAIProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

/**
 * Call LLM with the given request
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const provider = detectProvider(request.model);

  // Check environment variables
  checkEnvironmentVariables(provider);

  console.log(`\nProvider detected: ${provider} (${getProviderDisplayName(provider)})`);
  if (provider === 'bedrock') {
    console.log(`Region: ${process.env.AWS_REGION}`);
  }

  // Initialize the appropriate provider and get model
  let model: any;
  if (provider === 'bedrock') {
    const bedrockProvider = createBedrockProvider();
    model = bedrockProvider(request.model);
  } else if (provider === 'openai') {
    const openaiProvider = createOpenAIProvider();
    model = openaiProvider(request.model);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  // Set default values
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens ?? 4096;

  console.log(`Calling LLM with model: ${request.model}`);
  console.log(`Temperature: ${temperature}, Max tokens: ${maxTokens}`);

  try {
    // Call the LLM using generateText (non-streaming)
    // For OpenAI models, use maxCompletionTokens (newer parameter name)
    // For Bedrock/Anthropic models, use maxTokens
    const generateOptions: any = {
      model,
      prompt: request.prompt,
      temperature,
    };

    if (provider === 'openai') {
      // OpenAI newer models (GPT-4o, GPT-5, etc.) use maxCompletionTokens
      generateOptions.maxCompletionTokens = maxTokens;
    } else {
      // Bedrock and other providers use maxTokens
      generateOptions.maxTokens = maxTokens;
    }

    const result = await generateText(generateOptions);

    // Extract response data
    const response: LLMResponse = {
      text: result.text,
      model: request.model,
      provider,
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
  } catch (error: any) {
    console.error('LLM call failed:', error);

    // Provide more helpful error messages
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      throw new Error(
        `Authentication failed for ${getProviderDisplayName(provider)}. ` +
        `Please check your API credentials.`
      );
    } else if (error.message?.includes('rate limit')) {
      throw new Error(
        `Rate limit exceeded for ${getProviderDisplayName(provider)}. ` +
        `Please try again later.`
      );
    } else if (error.message?.includes('timeout')) {
      throw new Error(
        `Request timed out while calling ${getProviderDisplayName(provider)}. ` +
        `Please try again.`
      );
    }

    // Re-throw with provider context
    throw new Error(
      `Failed to call ${getProviderDisplayName(provider)}: ${error.message}`
    );
  }
}

/**
 * Validate LLM configuration at startup
 */
export function validateLLMConfiguration(): {
  bedrock: boolean;
  openai: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let bedrockAvailable = false;
  let openaiAvailable = false;

  // Check Bedrock
  if (process.env.AWS_BEARER_TOKEN_BEDROCK && process.env.AWS_REGION) {
    bedrockAvailable = true;
    console.log('✓ AWS Bedrock configuration detected');
  } else {
    if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
      warnings.push('AWS_BEARER_TOKEN_BEDROCK not set - Bedrock models unavailable');
    }
    if (!process.env.AWS_REGION) {
      warnings.push('AWS_REGION not set - Bedrock models unavailable');
    }
  }

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    openaiAvailable = true;
    console.log('✓ OpenAI configuration detected');
  } else {
    warnings.push('OPENAI_API_KEY not set - OpenAI models unavailable');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\nLLM Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  ⚠ ${warning}`));
    console.warn('');
  }

  return {
    bedrock: bedrockAvailable,
    openai: openaiAvailable,
    warnings,
  };
}
