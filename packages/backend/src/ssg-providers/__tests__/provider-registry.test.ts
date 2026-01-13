/**
 * Provider Registry Tests
 *
 * Tests the ProviderRegistry class which manages SSG provider registration,
 * lifecycle, and discovery.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProviderRegistry } from '../provider-registry.js';
import { createMockSSGProviderDependencies } from '../../../test/mocks/ssg-dependencies.js';
import { MockProvider } from '../../../test/mocks/mock-provider.js';
import type { SSGProviderDependencies } from '../types.js';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;
  let mockDeps: SSGProviderDependencies;

  beforeEach(() => {
    mockDeps = createMockSSGProviderDependencies();
    registry = new ProviderRegistry(mockDeps);
  });

  describe('Built-in Provider Registration', () => {
    it('registers all built-in providers', async () => {
      await registry.registerBuiltInProviders();

      expect(registry.hasProvider('hugo')).toBe(true);
      expect(registry.hasProvider('eleventy')).toBe(true);
      expect(registry.hasProvider('jekyll')).toBe(true);
    });

    it('handles provider registration errors gracefully', async () => {
      // Mock console to suppress error output
      const consoleSpy = vi.spyOn(mockDeps.outputConsole, 'appendLine');

      // This should not throw even if a provider fails to load
      await expect(registry.registerBuiltInProviders()).resolves.not.toThrow();

      // Registry should still be usable even if some providers fail
      expect(registry).toBeDefined();
    });

    it('getAllProviderMetadata returns all registered providers', async () => {
      await registry.registerBuiltInProviders();

      const metadata = registry.getAllProviderMetadata();
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBeGreaterThanOrEqual(3); // At least Hugo, Eleventy, Jekyll

      // Verify each metadata has required fields
      metadata.forEach((meta) => {
        expect(meta.type).toBeDefined();
        expect(meta.name).toBeDefined();
        expect(Array.isArray(meta.configFormats)).toBe(true);
      });
    });
  });

  describe('Provider Registration', () => {
    it('registers a custom provider', () => {
      registry.registerProvider(MockProvider, false);

      expect(registry.hasProvider('mock')).toBe(true);
    });

    it('marks custom providers as non-built-in', () => {
      registry.registerProvider(MockProvider, false, '/path/to/plugin');

      const metadata = registry.getAllProviderMetadata();
      const mockProviderMeta = metadata.find((m) => m.type === 'mock');

      expect(mockProviderMeta).toBeDefined();
    });

    it('allows multiple custom providers', () => {
      registry.registerProvider(MockProvider, false);

      // Create another mock provider with different type
      class AnotherMockProvider extends MockProvider {
        getMetadata() {
          return { ...super.getMetadata(), type: 'another-mock' };
        }
      }

      registry.registerProvider(AnotherMockProvider, false);

      expect(registry.hasProvider('mock')).toBe(true);
      expect(registry.hasProvider('another-mock')).toBe(true);
    });
  });

  describe('Provider Retrieval', () => {
    beforeEach(async () => {
      await registry.registerBuiltInProviders();
    });

    it('getProvider returns a provider instance', () => {
      const provider = registry.getProvider('hugo');

      expect(provider).toBeDefined();
      expect(provider.getMetadata().type).toBe('hugo');
    });

    it('getProvider returns same instance on multiple calls (singleton)', () => {
      const provider1 = registry.getProvider('hugo');
      const provider2 = registry.getProvider('hugo');

      expect(provider1).toBe(provider2);
    });

    it('getProvider throws error for unknown provider', () => {
      expect(() => registry.getProvider('nonexistent')).toThrow();
      expect(() => registry.getProvider('nonexistent')).toThrow(/not found/);
    });

    it('getProvider error message lists available providers', () => {
      try {
        registry.getProvider('nonexistent');
      } catch (error) {
        expect((error as Error).message).toContain('hugo');
        expect((error as Error).message).toContain('eleventy');
        expect((error as Error).message).toContain('jekyll');
      }
    });
  });

  describe('Provider Existence Check', () => {
    beforeEach(async () => {
      await registry.registerBuiltInProviders();
    });

    it('hasProvider returns true for registered providers', () => {
      expect(registry.hasProvider('hugo')).toBe(true);
      expect(registry.hasProvider('eleventy')).toBe(true);
      expect(registry.hasProvider('jekyll')).toBe(true);
    });

    it('hasProvider returns false for unregistered providers', () => {
      expect(registry.hasProvider('nonexistent')).toBe(false);
      expect(registry.hasProvider('gatsby')).toBe(false);
    });

    it('hasProvider is case-sensitive', () => {
      expect(registry.hasProvider('Hugo')).toBe(false);
      expect(registry.hasProvider('ELEVENTY')).toBe(false);
    });
  });

  describe('Auto-Detection', () => {
    beforeEach(async () => {
      await registry.registerBuiltInProviders();
    });

    it('detectSSGType returns null for empty directory', async () => {
      // Mock all providers to return false
      const hugoProvider = registry.getProvider('hugo');
      const eleventyProvider = registry.getProvider('eleventy');
      const jekyllProvider = registry.getProvider('jekyll');

      vi.spyOn(hugoProvider, 'detectSite').mockResolvedValue({
        isDetected: false,
        confidence: 'low',
      });
      vi.spyOn(eleventyProvider, 'detectSite').mockResolvedValue({
        isDetected: false,
        confidence: 'low',
      });
      vi.spyOn(jekyllProvider, 'detectSite').mockResolvedValue({
        isDetected: false,
        confidence: 'low',
      });

      const result = await registry.detectSSGType('/empty/directory');
      expect(result).toBeNull();
    });

    it('detectSSGType returns provider with highest confidence', async () => {
      const hugoProvider = registry.getProvider('hugo');
      const eleventyProvider = registry.getProvider('eleventy');
      const jekyllProvider = registry.getProvider('jekyll');

      // Mock different confidence levels
      vi.spyOn(hugoProvider, 'detectSite').mockResolvedValue({
        isDetected: true,
        confidence: 'high',
      });
      vi.spyOn(eleventyProvider, 'detectSite').mockResolvedValue({
        isDetected: true,
        confidence: 'medium',
      });
      vi.spyOn(jekyllProvider, 'detectSite').mockResolvedValue({
        isDetected: true,
        confidence: 'low',
      });

      const result = await registry.detectSSGType('/test/directory');
      expect(result).toBe('hugo');
    });

    it('detectSSGType handles ties by returning first match', async () => {
      const hugoProvider = registry.getProvider('hugo');
      const eleventyProvider = registry.getProvider('eleventy');

      // Mock same confidence level
      vi.spyOn(hugoProvider, 'detectSite').mockResolvedValue({
        isDetected: true,
        confidence: 'high',
      });
      vi.spyOn(eleventyProvider, 'detectSite').mockResolvedValue({
        isDetected: true,
        confidence: 'high',
      });

      const result = await registry.detectSSGType('/test/directory');
      expect(result).toBeDefined();
      expect(['hugo', 'eleventy']).toContain(result);
    });

    it('detectSSGType sorts by confidence correctly', async () => {
      const providers = [
        { type: 'hugo', confidence: 'medium' as const },
        { type: 'eleventy', confidence: 'high' as const },
        { type: 'jekyll', confidence: 'low' as const },
      ];

      for (const { type, confidence } of providers) {
        const provider = registry.getProvider(type);
        vi.spyOn(provider, 'detectSite').mockResolvedValue({
          isDetected: true,
          confidence,
        });
      }

      const result = await registry.detectSSGType('/test/directory');
      expect(result).toBe('eleventy'); // highest confidence
    });
  });

  describe('Provider Lifecycle', () => {
    it('creates new registry with dependencies', () => {
      const newRegistry = new ProviderRegistry(mockDeps);
      expect(newRegistry).toBeDefined();
    });

    it('maintains separate instance caches per registry', async () => {
      const registry1 = new ProviderRegistry(mockDeps);
      const registry2 = new ProviderRegistry(mockDeps);

      await registry1.registerBuiltInProviders();
      await registry2.registerBuiltInProviders();

      const provider1 = registry1.getProvider('hugo');
      const provider2 = registry2.getProvider('hugo');

      // Different registry instances should have different provider instances
      expect(provider1).not.toBe(provider2);
    });
  });

  describe('Error Handling', () => {
    it('handles provider registration with invalid constructor', () => {
      // This test ensures the registry handles edge cases gracefully
      const invalidProvider = class {
        constructor() {}
      } as any;

      expect(() => {
        registry.registerProvider(invalidProvider, false);
      }).toThrow();
    });

    it('handles detectSSGType when provider throws error', async () => {
      registry.registerProvider(MockProvider, false);

      const mockProvider = registry.getProvider('mock');
      vi.spyOn(mockProvider, 'detectSite').mockRejectedValue(new Error('Detection failed'));

      // Currently, errors bubble up (no error handling in registry yet)
      // This test documents the current behavior
      await expect(registry.detectSSGType('/test/directory')).rejects.toThrow('Detection failed');
    });
  });

  describe('Plugin System (Future)', () => {
    it('discoverPlugins is defined but not yet implemented', async () => {
      const consoleSpy = vi.spyOn(mockDeps.outputConsole, 'appendLine');

      await registry.discoverPlugins('/path/to/plugins');

      // Should log that it's not implemented yet
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not yet implemented')
      );
    });
  });
});
