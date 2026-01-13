/**
 * SSGProvider Behavioral Tests
 *
 * Tests actual provider behavior and consistency across Hugo, Eleventy, and Jekyll.
 * Interface structure is validated by TypeScript at compile time.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HugoProvider } from '../hugo/hugo-provider.js';
import { EleventyProvider } from '../eleventy/eleventy-provider.js';
import { JekyllProvider } from '../jekyll/jekyll-provider.js';
import { createMockSSGProviderDependencies } from '../../../test/mocks/ssg-dependencies.js';
import type { SSGProvider, SSGProviderDependencies } from '../types.js';

describe('SSGProvider Behavior', () => {
  let mockDeps: SSGProviderDependencies;

  beforeEach(() => {
    mockDeps = createMockSSGProviderDependencies();
  });

  const providers: Array<{ name: string; Provider: new (deps: SSGProviderDependencies) => SSGProvider }> = [
    { name: 'hugo', Provider: HugoProvider },
    { name: 'eleventy', Provider: EleventyProvider },
    { name: 'jekyll', Provider: JekyllProvider },
  ];

  describe('Provider Metadata', () => {
    it('all providers return unique type identifiers', () => {
      const types = providers.map(({ Provider }) => {
        const provider = new Provider(mockDeps);
        return provider.getMetadata().type;
      });

      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(providers.length);
      expect(types).toEqual(['hugo', 'eleventy', 'jekyll']);
    });

    it('hugo has correct metadata', () => {
      const provider = new HugoProvider(mockDeps);
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('hugo');
      expect(metadata.name).toBe('Hugo');
      expect(metadata.configFormats).toContain('toml');
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(true);
    });

    it('eleventy has correct metadata', () => {
      const provider = new EleventyProvider(mockDeps);
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('eleventy');
      expect(metadata.name).toBe('Eleventy');
      expect(metadata.configFormats).toContain('js');
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(false);
    });

    it('jekyll has correct metadata', () => {
      const provider = new JekyllProvider(mockDeps);
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('jekyll');
      expect(metadata.name).toBe('Jekyll');
      expect(metadata.configFormats).toContain('yml');
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(false);
    });
  });

  describe('Provider Capabilities', () => {
    it('all providers support dev server and build', () => {
      providers.forEach(({ Provider }) => {
        const provider = new Provider(mockDeps);
        const metadata = provider.getMetadata();

        expect(metadata.supportsDevServer).toBe(true);
        expect(metadata.supportsBuild).toBe(true);
      });
    });

    it('all providers require binaries', () => {
      providers.forEach(({ Provider }) => {
        const provider = new Provider(mockDeps);
        const metadata = provider.getMetadata();

        expect(metadata.requiresBinary).toBe(true);
        expect(provider.getBinaryManager()).not.toBeNull();
      });
    });

    it('only hugo supports config query', () => {
      const hugo = new HugoProvider(mockDeps);
      const eleventy = new EleventyProvider(mockDeps);
      const jekyll = new JekyllProvider(mockDeps);

      expect(hugo.getMetadata().supportsConfigQuery).toBe(true);
      expect(hugo.createConfigQuerier('/test', '1.0.0')).not.toBeNull();

      expect(eleventy.getMetadata().supportsConfigQuery).toBe(false);
      expect(eleventy.createConfigQuerier('/test', '1.0.0')).toBeNull();

      expect(jekyll.getMetadata().supportsConfigQuery).toBe(false);
      expect(jekyll.createConfigQuerier('/test', '1.0.0')).toBeNull();
    });
  });

  describe('Factory Methods', () => {
    it('providers create dev servers with correct configuration', () => {
      providers.forEach(({ Provider }) => {
        const provider = new Provider(mockDeps);
        const server = provider.createDevServer({
          workspacePath: '/test/workspace',
          version: '1.0.0',
          port: 8080,
        });

        expect(server).toBeDefined();
        expect(typeof server.serve).toBe('function');
        expect(typeof server.stopIfRunning).toBe('function');
      });
    });

    it('providers create builders with correct configuration', () => {
      providers.forEach(({ Provider }) => {
        const provider = new Provider(mockDeps);
        const builder = provider.createBuilder({
          workspacePath: '/test/workspace',
          version: '1.0.0',
          destination: '/test/output',
        });

        expect(builder).toBeDefined();
        expect(typeof builder.build).toBe('function');
      });
    });
  });

  describe('Detection', () => {
    it('providers return valid detection results', async () => {
      for (const { Provider } of providers) {
        const provider = new Provider(mockDeps);
        const result = await provider.detectSite('/test/directory');

        expect(result).toBeDefined();
        expect(typeof result.isDetected).toBe('boolean');
        expect(['high', 'medium', 'low']).toContain(result.confidence);
      }
    });
  });
});
