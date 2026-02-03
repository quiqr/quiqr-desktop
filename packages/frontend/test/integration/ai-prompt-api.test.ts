/**
 * Frontend Integration Tests for AI Prompt APIs
 * 
 * Tests that verify the frontend API methods correctly handle AI prompt responses
 * and validate them against the Zod schema.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { request } from '../../src/utils/main-process-bridge';
import type { AiPromptResponse } from '@quiqr/types';

describe('AI Prompt API Integration', () => {
  beforeAll(() => {
    // MSW server is already started in setup.ts
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('processFieldAiPrompt', () => {
    it('should validate and return response matching schema', async () => {
      const mockResponse: AiPromptResponse = {
        status: 'ok',
        response: 'AI-generated field content',
        prompt: 'Generate a title for: {{field.content}}',
        llm_settings: {
          model: 'gpt-4',
          temperature: 0.7
        },
        usage: {
          promptTokens: 50,
          completionTokens: 100,
          totalTokens: 150
        },
        provider: 'OpenAI'
      };

      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await request('processFieldAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'field-template',
        formValues: { content: 'test' },
        fieldContext: {
          fieldKey: 'title',
          fieldType: 'string',
          fieldContent: 'test content'
        }
      });

      expect(result).toMatchObject({
        status: 'ok',
        response: 'AI-generated field content'
      });
      expect(result.usage?.promptTokens).toBe(50);
      expect(result.usage?.completionTokens).toBe(100);
      expect(result.provider).toBe('OpenAI');
    });

    it('should accept minimal valid response (status and response only)', async () => {
      const minimalResponse: AiPromptResponse = {
        status: 'ok',
        response: 'Minimal AI response'
      };

      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json(minimalResponse);
        })
      );

      const result = await request('processFieldAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'template',
        formValues: {},
        fieldContext: {
          fieldKey: 'field',
          fieldType: 'string',
          fieldContent: ''
        }
      });

      expect(result.status).toBe('ok');
      expect(result.response).toBe('Minimal AI response');
    });

    it('should throw validation error when status is missing', async () => {
      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json({
            response: 'Missing status field'
          });
        })
      );

      await expect(
        request('processFieldAiPrompt', {
          siteKey: 'test-site',
          workspaceKey: 'main',
          templateKey: 'template',
          formValues: {},
          fieldContext: {
            fieldKey: 'field',
            fieldType: 'string',
            fieldContent: ''
          }
        })
      ).rejects.toThrow(/API response validation failed/);
    });

    it('should throw validation error when status is not "ok"', async () => {
      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json({
            status: 'error',
            response: 'Error response'
          });
        })
      );

      await expect(
        request('processFieldAiPrompt', {
          siteKey: 'test-site',
          workspaceKey: 'main',
          templateKey: 'template',
          formValues: {},
          fieldContext: {
            fieldKey: 'field',
            fieldType: 'string',
            fieldContent: ''
          }
        })
      ).rejects.toThrow(/API response validation failed/);
    });

    it('should throw validation error when response field is missing', async () => {
      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json({
            status: 'ok'
          });
        })
      );

      await expect(
        request('processFieldAiPrompt', {
          siteKey: 'test-site',
          workspaceKey: 'main',
          templateKey: 'template',
          formValues: {},
          fieldContext: {
            fieldKey: 'field',
            fieldType: 'string',
            fieldContent: ''
          }
        })
      ).rejects.toThrow(/API response validation failed/);
    });

    it('should handle response with null usage', async () => {
      const responseWithNullUsage: AiPromptResponse = {
        status: 'ok',
        response: 'AI response without usage stats',
        usage: null
      };

      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json(responseWithNullUsage);
        })
      );

      const result = await request('processFieldAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'template',
        formValues: {},
        fieldContext: {
          fieldKey: 'field',
          fieldType: 'string',
          fieldContent: ''
        }
      });

      expect(result.status).toBe('ok');
      expect(result.usage).toBeNull();
    });

    it('should throw validation error for invalid usage structure', async () => {
      server.use(
        http.post('http://localhost:5150/api/processFieldAiPrompt', () => {
          return HttpResponse.json({
            status: 'ok',
            response: 'Test',
            usage: {
              prompt: 100, // Wrong field name
              completion: 200
            }
          });
        })
      );

      await expect(
        request('processFieldAiPrompt', {
          siteKey: 'test-site',
          workspaceKey: 'main',
          templateKey: 'template',
          formValues: {},
          fieldContext: {
            fieldKey: 'field',
            fieldType: 'string',
            fieldContent: ''
          }
        })
      ).rejects.toThrow(/API response validation failed/);
    });
  });

  describe('processAiPrompt', () => {
    it('should validate and return response matching schema', async () => {
      const mockResponse: AiPromptResponse = {
        status: 'ok',
        response: 'AI-generated page content',
        prompt: 'Write a blog post about TypeScript',
        llm_settings: {
          model: 'claude-3-5-sonnet',
          temperature: 0.5
        },
        usage: {
          promptTokens: 100,
          completionTokens: 500,
          totalTokens: 600
        },
        provider: 'Anthropic'
      };

      server.use(
        http.post('http://localhost:5150/api/processAiPrompt', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await request('processAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'page-template',
        formValues: { title: 'Test' },
        context: {}
      });

      expect(result).toMatchObject({
        status: 'ok',
        response: 'AI-generated page content'
      });
      expect(result.llm_settings?.model).toBe('claude-3-5-sonnet');
      expect(result.provider).toBe('Anthropic');
    });

    it('should accept response without optional fields', async () => {
      const minimalResponse: AiPromptResponse = {
        status: 'ok',
        response: 'Simple AI response'
      };

      server.use(
        http.post('http://localhost:5150/api/processAiPrompt', () => {
          return HttpResponse.json(minimalResponse);
        })
      );

      const result = await request('processAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'template',
        formValues: {},
        context: {}
      });

      expect(result.status).toBe('ok');
      expect(result.response).toBe('Simple AI response');
      expect(result.prompt).toBeUndefined();
      expect(result.usage).toBeUndefined();
      expect(result.provider).toBeUndefined();
    });

    it('should throw error when backend returns invalid schema', async () => {
      server.use(
        http.post('http://localhost:5150/api/processAiPrompt', () => {
          return HttpResponse.json({
            status: 'success', // Wrong literal value
            response: 'Response text'
          });
        })
      );

      await expect(
        request('processAiPrompt', {
          siteKey: 'test-site',
          workspaceKey: 'main',
          templateKey: 'template',
          formValues: {},
          context: {}
        })
      ).rejects.toThrow(/API response validation failed/);
    });

    it('should handle long response text', async () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100);
      
      server.use(
        http.post('http://localhost:5150/api/processAiPrompt', () => {
          return HttpResponse.json({
            status: 'ok',
            response: longText
          });
        })
      );

      const result = await request('processAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'template',
        formValues: {},
        context: {}
      });

      expect(result.status).toBe('ok');
      expect(result.response.length).toBeGreaterThan(1000);
    });

    it('should handle response with unicode and special characters', async () => {
      server.use(
        http.post('http://localhost:5150/api/processAiPrompt', () => {
          return HttpResponse.json({
            status: 'ok',
            response: 'Response with emoji 😀 and unicode: 日本語 中文'
          });
        })
      );

      const result = await request('processAiPrompt', {
        siteKey: 'test-site',
        workspaceKey: 'main',
        templateKey: 'template',
        formValues: {},
        context: {}
      });

      expect(result.status).toBe('ok');
      expect(result.response).toContain('😀');
      expect(result.response).toContain('日本語');
    });
  });
});
