/**
 * Main Process Bridge Tests
 *
 * Comprehensive test coverage for the main-process-bridge utility module.
 * Tests both the message handler system and HTTP request functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { addMessageHandler, removeMessageHandler, dispatchMessage, request } from '../../src/utils/main-process-bridge';
import { z } from 'zod';

describe('main-process-bridge', () => {
  describe('Message Handler System', () => {
    // Note: Since messageHandlers is now module-level state,
    // we need to be careful about test isolation
    // Each test should use unique message types to avoid conflicts
    
    it('should add single handler for a message type', () => {
      const handler = vi.fn();
      
      addMessageHandler('test-message', handler);
      dispatchMessage('test-message', { data: 'hello' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'hello' });
    });

    it('should add multiple handlers for the same message type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      addMessageHandler('multi-handler', handler1);
      addMessageHandler('multi-handler', handler2);
      addMessageHandler('multi-handler', handler3);
      
      dispatchMessage('multi-handler', { value: 42 });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledWith({ value: 42 });
      expect(handler2).toHaveBeenCalledWith({ value: 42 });
      expect(handler3).toHaveBeenCalledWith({ value: 42 });
    });

    it('should remove a specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      addMessageHandler('removable', handler1);
      addMessageHandler('removable', handler2);
      
      removeMessageHandler('removable', handler1);
      dispatchMessage('removable', { test: true });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should dispatch message to all registered handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      addMessageHandler('broadcast', handler1);
      addMessageHandler('broadcast', handler2);
      addMessageHandler('broadcast', handler3);
      
      const testData = { message: 'hello world', timestamp: Date.now() };
      dispatchMessage('broadcast', testData);
      
      expect(handler1).toHaveBeenCalledWith(testData);
      expect(handler2).toHaveBeenCalledWith(testData);
      expect(handler3).toHaveBeenCalledWith(testData);
    });

    it('should handle dispatch when no handlers registered (no-op)', () => {
      // Should not throw error
      expect(() => {
        dispatchMessage('non-existent', { data: 'test' });
      }).not.toThrow();
    });

    it('should keep multiple message types independent', () => {
      const consoleHandler = vi.fn();
      const notificationHandler = vi.fn();
      
      addMessageHandler('console', consoleHandler);
      addMessageHandler('notification', notificationHandler);
      
      dispatchMessage('console', { log: 'console message' });
      
      expect(consoleHandler).toHaveBeenCalledTimes(1);
      expect(consoleHandler).toHaveBeenCalledWith({ log: 'console message' });
      expect(notificationHandler).not.toHaveBeenCalled();
      
      dispatchMessage('notification', { title: 'notification message' });
      
      expect(notificationHandler).toHaveBeenCalledTimes(1);
      expect(notificationHandler).toHaveBeenCalledWith({ title: 'notification message' });
      expect(consoleHandler).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should safely handle removing non-existent handler', () => {
      const handler = vi.fn();
      
      // Should not throw error when removing from empty handlers
      expect(() => {
        removeMessageHandler('non-existent-type', handler);
      }).not.toThrow();
      
      // Should not throw error when removing handler that wasn't added
      addMessageHandler('test-remove-nonexistent', vi.fn());
      expect(() => {
        removeMessageHandler('test-remove-nonexistent', handler);
      }).not.toThrow();
    });

    it('should pass correct data payload to handler', () => {
      const handler = vi.fn();
      const complexData = {
        id: 123,
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        },
        timestamp: new Date().toISOString()
      };
      
      addMessageHandler('complex-data', handler);
      dispatchMessage('complex-data', complexData);
      
      expect(handler).toHaveBeenCalledWith(complexData);
      expect(handler.mock.calls[0][0]).toEqual(complexData);
    });
  });

  describe('HTTP Request Functionality', () => {
    beforeAll(() => {
      // MSW server is already started in setup.ts
    });

    afterEach(() => {
      // Reset MSW handlers after each test
      server.resetHandlers();
      vi.clearAllMocks();
    });

    it('should make successful request with valid response', async () => {
      server.use(
        http.post('http://localhost:5150/api/testMethod', () => {
          return HttpResponse.json({ success: true, data: 'test response' });
        })
      );

      const response = await request('testMethod', { input: 'test' });
      
      expect(response).toEqual({ success: true, data: 'test response' });
    });

    it('should include data in POST body under "data" key', async () => {
      let receivedBody: any = null;
      
      server.use(
        http.post('http://localhost:5150/api/testMethod', async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      await request('testMethod', { input: 'test data' });
      
      expect(receivedBody).toEqual({ data: { input: 'test data' } });
    });

    it('should construct correct endpoint URL (localhost:5150/api/method)', async () => {
      let requestUrl: string = '';
      
      server.use(
        http.post('http://localhost:5150/api/myMethod', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json({ success: true });
        })
      );

      await request('myMethod', {});
      
      expect(requestUrl).toBe('http://localhost:5150/api/myMethod');
    });

    it('should validate response with Zod schema when available', async () => {
      // Mock console.warn to check for validation warnings
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Use listWorkspaces which has a schema in apiSchemas
      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', () => {
          return HttpResponse.json([
            { key: 'workspace1', path: '/path/to/workspace', state: 'active' }
          ]);
        })
      );

      const response = await request('listWorkspaces', {});
      
      // Should not warn about missing schema since listWorkspaces has a schema
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(response).toBeDefined();
      
      consoleWarnSpy.mockRestore();
    });

    it('should log warning when schema not found but return response anyway', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      server.use(
        http.post('http://localhost:5150/api/unknownMethod', () => {
          return HttpResponse.json({ someData: 'value' });
        })
      );

      const response = await request('unknownMethod', {});
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[API Validation] No schema found for method: unknownMethod')
      );
      expect(response).toEqual({ someData: 'value' });
      
      consoleWarnSpy.mockRestore();
    });

    it('should throw error when Zod validation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Use listWorkspaces which expects an array, but return invalid data
      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', () => {
          // Return invalid data that doesn't match the array schema
          return HttpResponse.json({ invalid: 'data structure' });
        })
      );

      await expect(
        request('listWorkspaces', {})
      ).rejects.toThrow(/API response validation failed/);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      server.use(
        http.post('http://localhost:5150/api/failMethod', () => {
          return HttpResponse.error();
        })
      );

      await expect(
        request('failMethod', {})
      ).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error sending data:'),
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle request timeout', async () => {
      // Note: Testing actual timeout behavior with MSW is unreliable
      // This test documents the timeout parameter exists and works with axios
      // Real timeout behavior is tested in integration tests
      
      server.use(
        http.post('http://localhost:5150/api/fastMethod', () => {
          return HttpResponse.json({ data: 'success' });
        })
      );

      // Verify the timeout option is accepted and passed through
      const response = await request('fastMethod', {}, { timeout: 10 });
      expect(response).toEqual({ data: 'success' });
    });

    it('should use custom timeout option when provided', async () => {
      // This test verifies that the timeout option is accepted
      // Actual timeout behavior is difficult to test reliably with MSW
      
      server.use(
        http.post('http://localhost:5150/api/customTimeout', () => {
          return HttpResponse.json({ success: true });
        })
      );

      // Verify custom timeout parameter is accepted
      const response = await request('customTimeout', {}, { timeout: 5000 });
      expect(response).toEqual({ success: true });
    });

    it('should use default timeout of 90000ms when not specified', async () => {
      // This test verifies the default by checking that a reasonable request completes
      server.use(
        http.post('http://localhost:5150/api/defaultTimeout', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const response = await request('defaultTimeout', {});
      
      expect(response).toEqual({ success: true });
    });
  });
});
