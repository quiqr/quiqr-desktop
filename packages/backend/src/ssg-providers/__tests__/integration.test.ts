import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '../provider-registry.js';
import { createMockSSGProviderDependencies } from '../../../test/mocks/ssg-dependencies.js';

describe('Provider Integration', () => {
  let registry: ProviderRegistry;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;

  beforeEach(async () => {
    mockDeps = createMockSSGProviderDependencies();
    registry = new ProviderRegistry(mockDeps);
    await registry.registerBuiltInProviders();
  });

  it('all providers coexist without conflicts', () => {
    const hugo = registry.getProvider('hugo');
    const eleventy = registry.getProvider('eleventy');
    const jekyll = registry.getProvider('jekyll');

    expect(hugo.getMetadata().type).toBe('hugo');
    expect(eleventy.getMetadata().type).toBe('eleventy');
    expect(jekyll.getMetadata().type).toBe('jekyll');
  });

  it('provider instances are cached', () => {
    const hugo1 = registry.getProvider('hugo');
    const hugo2 = registry.getProvider('hugo');
    expect(hugo1).toBe(hugo2);
  });

  it('dependencies are injected correctly', () => {
    const hugo = registry.getProvider('hugo');
    expect(hugo.getBinaryManager()).not.toBeNull();
  });
});
