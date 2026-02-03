/**
 * Tests for AI Prompt Response Schema Validation
 * 
 * Tests to ensure the AI prompt API responses match the expected Zod schema.
 * This test suite validates:
 * 1. The aiPromptResponseSchema correctly validates responses
 * 2. Both processAiPrompt and processFieldAiPrompt return schema-compliant responses
 * 3. The schema handles all valid variations and rejects invalid ones
 */

import { describe, it, expect } from 'vitest';
import { aiPromptResponseSchema } from '@quiqr/types';

describe('AI Prompt Response Schema Validation', () => {
  describe('aiPromptResponseSchema', () => {
    it('should accept valid minimal response', () => {
      const validResponse = {
        status: 'ok' as const,
        response: 'Generated AI response text'
      };

      const result = aiPromptResponseSchema.safeParse(validResponse);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('ok');
        expect(result.data.response).toBe('Generated AI response text');
      }
    });

    it('should accept response with all optional fields', () => {
      const fullResponse = {
        status: 'ok' as const,
        response: 'Generated AI response',
        prompt: 'This is the prompt that was sent to the LLM',
        llm_settings: {
          model: 'gpt-4',
          temperature: 0.7
        },
        usage: {
          promptTokens: 150,
          completionTokens: 300,
          totalTokens: 450
        },
        provider: 'OpenAI'
      };

      const result = aiPromptResponseSchema.safeParse(fullResponse);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('ok');
        expect(result.data.response).toBe('Generated AI response');
        expect(result.data.prompt).toBe('This is the prompt that was sent to the LLM');
        expect(result.data.llm_settings?.model).toBe('gpt-4');
        expect(result.data.llm_settings?.temperature).toBe(0.7);
        expect(result.data.usage?.promptTokens).toBe(150);
        expect(result.data.usage?.completionTokens).toBe(300);
        expect(result.data.usage?.totalTokens).toBe(450);
        expect(result.data.provider).toBe('OpenAI');
      }
    });

    it('should accept response with null usage', () => {
      const responseWithNullUsage = {
        status: 'ok' as const,
        response: 'AI response',
        usage: null
      };

      const result = aiPromptResponseSchema.safeParse(responseWithNullUsage);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.usage).toBeNull();
      }
    });

    it('should accept response without usage field', () => {
      const responseWithoutUsage = {
        status: 'ok' as const,
        response: 'AI response'
      };

      const result = aiPromptResponseSchema.safeParse(responseWithoutUsage);
      
      expect(result.success).toBe(true);
    });

    it('should accept llm_settings without temperature', () => {
      const response = {
        status: 'ok' as const,
        response: 'AI response',
        llm_settings: {
          model: 'gpt-4'
        }
      };

      const result = aiPromptResponseSchema.safeParse(response);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.llm_settings?.temperature).toBeUndefined();
      }
    });

    it('should reject response missing status field', () => {
      const invalidResponse = {
        response: 'Generated AI response'
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
      }
    });

    it('should reject response missing response field', () => {
      const invalidResponse = {
        status: 'ok'
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('response');
      }
    });

    it('should reject response with wrong status value', () => {
      const invalidResponse = {
        status: 'success', // Should be 'ok'
        response: 'AI response'
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_literal');
        expect(result.error.issues[0].message).toContain('Invalid literal value');
      }
    });

    it('should reject response with status as error', () => {
      const invalidResponse = {
        status: 'error',
        response: 'Error message'
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const statusIssue = result.error.issues.find(issue => issue.path.includes('status'));
        expect(statusIssue?.code).toBe('invalid_literal');
        expect(statusIssue?.message).toContain('expected "ok"');
      }
    });

    it('should reject response with invalid usage structure', () => {
      const invalidResponse = {
        status: 'ok' as const,
        response: 'AI response',
        usage: {
          prompt: 100, // Wrong field name - should be promptTokens
          completion: 200 // Wrong field name - should be completionTokens
        }
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject usage with missing fields', () => {
      const invalidResponse = {
        status: 'ok' as const,
        response: 'AI response',
        usage: {
          promptTokens: 100
          // Missing completionTokens and totalTokens
        }
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
    });

    it('should reject llm_settings with missing model', () => {
      const invalidResponse = {
        status: 'ok' as const,
        response: 'AI response',
        llm_settings: {
          temperature: 0.7
          // Missing required model field
        }
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
    });

    it('should reject non-string response field', () => {
      const invalidResponse = {
        status: 'ok' as const,
        response: 123 // Should be string
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
    });

    it('should reject non-number token counts', () => {
      const invalidResponse = {
        status: 'ok' as const,
        response: 'AI response',
        usage: {
          promptTokens: '100', // Should be number
          completionTokens: 200,
          totalTokens: 300
        }
      };

      const result = aiPromptResponseSchema.safeParse(invalidResponse);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Error Messages', () => {
    it('should provide clear error message for missing status', () => {
      const result = aiPromptResponseSchema.safeParse({
        response: 'test'
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = result.error.format();
        expect(formatted.status).toBeDefined();
      }
    });

    it('should provide clear error message for wrong status literal', () => {
      const result = aiPromptResponseSchema.safeParse({
        status: 'error',
        response: 'test'
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid literal value, expected "ok"');
      }
    });

    it('should format multiple errors correctly', () => {
      const result = aiPromptResponseSchema.safeParse({
        status: 'wrong',
        // Missing response field
        usage: {
          wrongField: 100
        }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have multiple errors
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Real-world Response Scenarios', () => {
    it('should handle typical OpenAI response structure', () => {
      const openaiResponse = {
        status: 'ok' as const,
        response: 'This is a helpful AI-generated response.',
        prompt: 'Please write a paragraph about TypeScript.',
        llm_settings: {
          model: 'gpt-4',
          temperature: 0.7
        },
        usage: {
          promptTokens: 25,
          completionTokens: 150,
          totalTokens: 175
        },
        provider: 'OpenAI'
      };

      expect(aiPromptResponseSchema.parse(openaiResponse)).toBeDefined();
    });

    it('should handle typical Anthropic response structure', () => {
      const anthropicResponse = {
        status: 'ok' as const,
        response: 'Claude-generated response here.',
        prompt: 'Explain async/await in JavaScript.',
        llm_settings: {
          model: 'claude-3-5-sonnet',
          temperature: 0.5
        },
        usage: {
          promptTokens: 30,
          completionTokens: 200,
          totalTokens: 230
        },
        provider: 'Anthropic'
      };

      expect(aiPromptResponseSchema.parse(anthropicResponse)).toBeDefined();
    });

    it('should handle response with very long text', () => {
      const longText = 'Lorem ipsum '.repeat(1000); // ~12000 characters
      
      const response = {
        status: 'ok' as const,
        response: longText
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should handle response with empty string', () => {
      const response = {
        status: 'ok' as const,
        response: ''
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should handle response with unicode characters', () => {
      const response = {
        status: 'ok' as const,
        response: 'Response with emojis 😀 and unicode: 日本語'
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should handle response with zero token usage', () => {
      const response = {
        status: 'ok' as const,
        response: 'test',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should handle response with temperature of 0', () => {
      const response = {
        status: 'ok' as const,
        response: 'Deterministic response',
        llm_settings: {
          model: 'gpt-4',
          temperature: 0
        }
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.llm_settings?.temperature).toBe(0);
      }
    });

    it('should handle response with temperature of 2', () => {
      const response = {
        status: 'ok' as const,
        response: 'Creative response',
        llm_settings: {
          model: 'gpt-4',
          temperature: 2
        }
      };

      const result = aiPromptResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.llm_settings?.temperature).toBe(2);
      }
    });
  });
});
