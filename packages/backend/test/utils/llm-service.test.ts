/**
 * Unit tests for LLM Service
 * Tests connection string parsing, provider registry, and provider factories
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseConnectionString,
  ProviderRegistry,
  initializeLLMProviders,
  callLLM,
  type ProviderConnectionString,
  type LLMRequest,
} from '../../src/utils/llm-service.js';

describe('parseConnectionString', () => {
  it('should parse simple OpenAI connection string', () => {
    const result = parseConnectionString('openai://sk-abc123');
    
    expect(result).toEqual({
      type: 'openai',
      credentials: 'sk-abc123',
      endpoint: undefined,
      params: {},
    });
  });

  it('should parse AWS Bedrock with region', () => {
    const result = parseConnectionString('bedrock://token?region=eu-central-1');
    
    expect(result).toEqual({
      type: 'bedrock',
      credentials: 'token',
      endpoint: undefined,
      params: { region: 'eu-central-1' },
    });
  });

  it('should parse direct Anthropic', () => {
    const result = parseConnectionString('anthropic://sk-ant-abc123');
    
    expect(result).toEqual({
      type: 'anthropic',
      credentials: 'sk-ant-abc123',
      endpoint: undefined,
      params: {},
    });
  });

  it('should parse Google with location parameter', () => {
    const result = parseConnectionString('google://api-key?location=us-central1');
    
    expect(result).toEqual({
      type: 'google',
      credentials: 'api-key',
      endpoint: undefined,
      params: { location: 'us-central1' },
    });
  });

  it('should parse Azure with endpoint and deployment', () => {
    const result = parseConnectionString('azure://key@endpoint.openai.azure.com?deployment=gpt4');
    
    expect(result).toEqual({
      type: 'azure',
      credentials: 'key',
      endpoint: 'endpoint.openai.azure.com',
      params: { deployment: 'gpt4' },
    });
  });

  it('should parse custom OpenAI endpoint', () => {
    const result = parseConnectionString('openai://key@api.custom.com');
    
    expect(result).toEqual({
      type: 'openai',
      credentials: 'key',
      endpoint: 'api.custom.com',
      params: {},
    });
  });

  it('should handle URL-encoded credentials', () => {
    const result = parseConnectionString('openai://sk-abc%2B123%3D%3D');
    
    expect(result.credentials).toBe('sk-abc+123==');
  });

  it('should handle multiple query parameters', () => {
    const result = parseConnectionString('bedrock://token?region=eu-central-1&timeout=30');
    
    expect(result.params).toEqual({
      region: 'eu-central-1',
      timeout: '30',
    });
  });

  it('should handle Mistral provider', () => {
    const result = parseConnectionString('mistral://api-key-xyz');
    
    expect(result).toEqual({
      type: 'mistral',
      credentials: 'api-key-xyz',
      endpoint: undefined,
      params: {},
    });
  });

  it('should handle Cohere provider', () => {
    const result = parseConnectionString('cohere://api-key-123');
    
    expect(result).toEqual({
      type: 'cohere',
      credentials: 'api-key-123',
      endpoint: undefined,
      params: {},
    });
  });

  it('should throw error for malformed connection string', () => {
    expect(() => {
      parseConnectionString('invalid-format');
    }).toThrow('Invalid connection string format');
  });

  it('should throw error for missing credentials', () => {
    expect(() => {
      parseConnectionString('openai://');
    }).toThrow('Missing credentials');
  });

  it('should throw error for missing provider type', () => {
    expect(() => {
      parseConnectionString('://sk-abc123');
    }).toThrow('Missing provider type');
  });

  it('should normalize provider type to lowercase', () => {
    const result = parseConnectionString('OpenAI://sk-abc123');
    expect(result.type).toBe('openai');
  });
});

describe('ProviderRegistry', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear all LLM provider env vars
    for (let i = 0; i < 10; i++) {
      delete process.env[`QUIQR_LLM_PROVIDER_${i}`];
    }

    // Reset the singleton for testing
    // @ts-expect-error - Accessing private static property for testing
    ProviderRegistry.instance = null;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Reset singleton
    // @ts-expect-error - Accessing private static property for testing
    ProviderRegistry.instance = null;
  });

  it('should initialize with no providers when env vars not set', () => {
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    expect(registry.getProviderCount()).toBe(0);
    expect(registry.listProviders()).toEqual([]);
  });

  it('should register single provider from environment', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    expect(registry.getProviderCount()).toBe(1);
    expect(registry.hasProvider('provider-0')).toBe(true);
    
    const providers = registry.listProviders();
    expect(providers[0]).toMatchObject({
      id: 'provider-0',
      type: 'openai',
    });
  });

  it('should register multiple providers in order', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test1';
    process.env.QUIQR_LLM_PROVIDER_1 = 'bedrock://token?region=us-east-1';
    process.env.QUIQR_LLM_PROVIDER_3 = 'google://key123'; // Skip 2 to test sparse indices
    
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    expect(registry.getProviderCount()).toBe(3);
    expect(registry.hasProvider('provider-0')).toBe(true);
    expect(registry.hasProvider('provider-1')).toBe(true);
    expect(registry.hasProvider('provider-2')).toBe(false);
    expect(registry.hasProvider('provider-3')).toBe(true);
  });

  it('should get provider by ID', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('provider-0');
    
    expect(provider.id).toBe('provider-0');
    expect(provider.type).toBe('openai');
  });

  it('should match provider by model pattern - OpenAI', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('gpt-4');
    
    expect(provider.type).toBe('openai');
  });

  it('should match provider by model pattern - Anthropic', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'anthropic://sk-ant-test';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('claude-3-5-sonnet');
    
    expect(provider.type).toBe('anthropic');
  });

  it('should match provider by model pattern - Bedrock', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'bedrock://token?region=us-east-1';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('anthropic.claude-v2');
    
    expect(provider.type).toBe('bedrock');
  });

  it('should match provider by model pattern - Google', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'google://key123';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('gemini-pro');
    
    expect(provider.type).toBe('google');
  });

  it('should use first matching provider (precedence)', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://key1';
    process.env.QUIQR_LLM_PROVIDER_1 = 'openai://key2';
    
    const registry = ProviderRegistry.getInstance();
    const provider = registry.getProvider('gpt-4');
    
    expect(provider.id).toBe('provider-0'); // First one wins
  });

  it('should throw error when no provider matches model', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    
    expect(() => {
      registry.getProvider('unknown-model-xyz');
    }).toThrow('No provider found for model "unknown-model-xyz"');
  });

  it('should throw error when provider ID not found', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    
    expect(() => {
      registry.getProvider('provider-5');
    }).toThrow('No provider found');
  });

  it('should skip invalid provider configurations', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-valid';
    process.env.QUIQR_LLM_PROVIDER_1 = 'invalid-format';
    process.env.QUIQR_LLM_PROVIDER_2 = 'anthropic://sk-also-valid';
    
    // Mock console.error to suppress error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    expect(registry.getProviderCount()).toBe(2);
    expect(registry.hasProvider('provider-0')).toBe(true);
    expect(registry.hasProvider('provider-1')).toBe(false);
    expect(registry.hasProvider('provider-2')).toBe(true);
    
    consoleErrorSpy.mockRestore();
  });

  it('should warn about unknown provider types', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'unknown-provider://key123';
    
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown provider type "unknown-provider"')
    );
    expect(registry.getProviderCount()).toBe(0);
    
    consoleWarnSpy.mockRestore();
  });

  it('should only initialize once', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    
    const registry = ProviderRegistry.getInstance();
    registry.initialize();
    
    const count1 = registry.getProviderCount();
    
    // Change env var and initialize again
    process.env.QUIQR_LLM_PROVIDER_1 = 'anthropic://token';
    registry.initialize();
    
    const count2 = registry.getProviderCount();
    
    // Should not re-initialize
    expect(count1).toBe(count2);
    expect(count2).toBe(1);
  });
});

describe('initializeLLMProviders', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    for (let i = 0; i < 10; i++) {
      delete process.env[`QUIQR_LLM_PROVIDER_${i}`];
    }
    // @ts-expect-error - Reset singleton
    ProviderRegistry.instance = null;
  });

  afterEach(() => {
    process.env = originalEnv;
    // @ts-expect-error - Reset singleton
    ProviderRegistry.instance = null;
  });

  it('should return summary with no providers', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = initializeLLMProviders();
    
    expect(result.count).toBe(0);
    expect(result.providers).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('No LLM providers configured');
    
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should return summary with configured providers', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://sk-test123';
    process.env.QUIQR_LLM_PROVIDER_1 = 'bedrock://token?region=us-east-1';
    
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = initializeLLMProviders();
    
    expect(result.count).toBe(2);
    expect(result.providers).toHaveLength(2);
    expect(result.providers[0]).toMatchObject({
      id: 'provider-0',
      type: 'openai',
      modelExamples: expect.arrayContaining(['gpt-4']),
    });
    expect(result.providers[1]).toMatchObject({
      id: 'provider-1',
      type: 'bedrock',
      modelExamples: expect.arrayContaining(['anthropic.claude-3-5-sonnet']),
    });
    expect(result.warnings).toEqual([]);
    
    consoleLogSpy.mockRestore();
  });

  it('should include model examples for each provider type', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://key1';
    process.env.QUIQR_LLM_PROVIDER_1 = 'google://key2';
    process.env.QUIQR_LLM_PROVIDER_2 = 'mistral://key3';
    
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = initializeLLMProviders();
    
    const openaiProvider = result.providers.find(p => p.type === 'openai');
    expect(openaiProvider?.modelExamples).toContain('gpt-4');
    
    const googleProvider = result.providers.find(p => p.type === 'google');
    expect(googleProvider?.modelExamples).toContain('gemini-pro');
    
    const mistralProvider = result.providers.find(p => p.type === 'mistral');
    expect(mistralProvider?.modelExamples).toContain('mistral-large');
    
    consoleLogSpy.mockRestore();
  });
});

describe('Model Pattern Matching', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    for (let i = 0; i < 10; i++) {
      delete process.env[`QUIQR_LLM_PROVIDER_${i}`];
    }
    // @ts-expect-error - Reset singleton
    ProviderRegistry.instance = null;
  });

  afterEach(() => {
    process.env = originalEnv;
    // @ts-expect-error - Reset singleton
    ProviderRegistry.instance = null;
  });

  it('should match OpenAI models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'openai://key';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('gpt-4').type).toBe('openai');
    expect(registry.getProvider('gpt-3.5-turbo').type).toBe('openai');
    expect(registry.getProvider('gpt-4o').type).toBe('openai');
    expect(registry.getProvider('o1-preview').type).toBe('openai');
    expect(registry.getProvider('text-davinci-003').type).toBe('openai');
  });

  it('should match Anthropic models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'anthropic://key';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('claude-3-5-sonnet').type).toBe('anthropic');
    expect(registry.getProvider('claude-3-opus').type).toBe('anthropic');
    expect(registry.getProvider('claude-2').type).toBe('anthropic');
  });

  it('should match Bedrock models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'bedrock://key?region=us-east-1';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('anthropic.claude-v2').type).toBe('bedrock');
    expect(registry.getProvider('eu.anthropic.claude-v3').type).toBe('bedrock');
    expect(registry.getProvider('amazon.titan-text-express').type).toBe('bedrock');
    expect(registry.getProvider('meta.llama3-70b').type).toBe('bedrock');
    expect(registry.getProvider('cohere.command-r-v1').type).toBe('bedrock');
  });

  it('should match Google models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'google://key';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('gemini-pro').type).toBe('google');
    expect(registry.getProvider('gemini-1.5-pro').type).toBe('google');
    expect(registry.getProvider('models/gemini-pro').type).toBe('google');
  });

  it('should match Azure models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'azure://key@endpoint?deployment=gpt4';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('azure/gpt-4').type).toBe('azure');
    expect(registry.getProvider('deployment/gpt-35-turbo').type).toBe('azure');
  });

  it('should match Mistral models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'mistral://key';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('mistral-large').type).toBe('mistral');
    expect(registry.getProvider('mistral-medium').type).toBe('mistral');
    expect(registry.getProvider('open-mistral-7b').type).toBe('mistral');
  });

  it('should match Cohere models', () => {
    process.env.QUIQR_LLM_PROVIDER_0 = 'cohere://key';
    const registry = ProviderRegistry.getInstance();
    
    expect(registry.getProvider('command-r-plus').type).toBe('cohere');
    expect(registry.getProvider('command-r').type).toBe('cohere');
    expect(registry.getProvider('embed-english-v3').type).toBe('cohere');
  });
});
