/**
 * Provider Registry
 *
 * Central registry for all SSG providers (built-in and plugins).
 * Handles provider discovery, registration, and lifecycle.
 */

import type { SSGProvider, ProviderMetadata, SSGProviderDependencies } from './types.js';

/**
 * Provider constructor type
 */
export type ProviderConstructor = new (dependencies: SSGProviderDependencies) => SSGProvider;

/**
 * Provider registration info
 */
export interface ProviderRegistration {
  constructor: ProviderConstructor;
  metadata: ProviderMetadata;
  isBuiltIn: boolean;
  pluginPath?: string;
}

/**
 * Provider Registry manages all available SSG providers
 */
export class ProviderRegistry {
  private providers = new Map<string, ProviderRegistration>();
  private instances = new Map<string, SSGProvider>();
  private dependencies: SSGProviderDependencies;

  constructor(dependencies: SSGProviderDependencies) {
    this.dependencies = dependencies;
  }

  /**
   * Register built-in providers
   * This is called after construction to avoid circular dependencies
   */
  async registerBuiltInProviders(): Promise<void> {
    try {
      // Dynamically import Hugo provider to avoid circular dependencies
      const { HugoProvider } = await import('./hugo/hugo-provider.js');
      this.registerProvider(HugoProvider, true);
    } catch (error) {
      this.dependencies.outputConsole.appendLine(
        `Failed to register Hugo provider: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    try {
      // Dynamically import Eleventy provider
      const { EleventyProvider } = await import('./eleventy/eleventy-provider.js');
      this.registerProvider(EleventyProvider, true);
    } catch (error) {
      this.dependencies.outputConsole.appendLine(
        `Failed to register Eleventy provider: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Register a provider
   */
  registerProvider(
    providerConstructor: ProviderConstructor,
    isBuiltIn: boolean = false,
    pluginPath?: string
  ): void {
    // Create temporary instance to get metadata
    const tempInstance = new providerConstructor(this.dependencies);
    const metadata = tempInstance.getMetadata();

    this.providers.set(metadata.type, {
      constructor: providerConstructor,
      metadata,
      isBuiltIn,
      pluginPath,
    });
  }

  /**
   * Get or create a provider instance
   */
  getProvider(type: string): SSGProvider {
    // Return cached instance if available
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    // Get registration
    const registration = this.providers.get(type);
    if (!registration) {
      throw new Error(
        `SSG provider '${type}' not found. Available: ${Array.from(this.providers.keys()).join(', ')}`
      );
    }

    // Create and cache instance
    const instance = new registration.constructor(this.dependencies);
    this.instances.set(type, instance);

    return instance;
  }

  /**
   * Check if a provider is registered
   */
  hasProvider(type: string): boolean {
    return this.providers.has(type);
  }

  /**
   * Get all registered provider metadata
   */
  getAllProviderMetadata(): ProviderMetadata[] {
    return Array.from(this.providers.values()).map((reg) => reg.metadata);
  }

  /**
   * Auto-detect SSG type from workspace directory
   */
  async detectSSGType(workspacePath: string): Promise<string | null> {
    const results: Array<{ type: string; result: SSGDetectionResult }> = [];

    // Try all registered providers
    for (const [type] of this.providers) {
      const provider = this.getProvider(type);
      const detectionResult = await provider.detectSite(workspacePath);

      if (detectionResult.isDetected) {
        results.push({ type, result: detectionResult });
      }
    }

    // Sort by confidence and return best match
    if (results.length === 0) return null;

    results.sort((a, b) => {
      const confidenceScore = { high: 3, medium: 2, low: 1 };
      return confidenceScore[b.result.confidence] - confidenceScore[a.result.confidence];
    });

    return results[0].type;
  }

  /**
   * Discover and register plugin providers from filesystem
   * For Phase 7 - Plugin System implementation
   */
  async discoverPlugins(pluginDir: string): Promise<void> {
    // TODO: Implement in Phase 7
    // This will scan pluginDir for provider plugins and register them
    this.dependencies.outputConsole.appendLine(
      `Plugin discovery not yet implemented. Plugin directory: ${pluginDir}`
    );
  }
}

/**
 * Type for SSGDetectionResult (imported from provider detection)
 */
interface SSGDetectionResult {
  isDetected: boolean;
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  configFiles?: string[];
  metadata?: Record<string, unknown>;
}
