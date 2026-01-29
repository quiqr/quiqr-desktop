/**
 * Provider Factory
 *
 * Factory for creating SSG provider instances and components.
 * Similar to SyncFactory pattern.
 */

import type { SSGProvider, SSGProviderDependencies, SSGServerConfig, SSGBuildConfig } from './types.js';
import type { AppContainer } from '../config/container.js';
import { ProviderRegistry } from './provider-registry.js';

/**
 * Provider Factory - Main entry point for working with SSG providers
 */
export class ProviderFactory {
  private registry: ProviderRegistry;
  private initPromise: Promise<void>;

  constructor(dependencies: SSGProviderDependencies) {
    this.registry = new ProviderRegistry(dependencies);
    // Register built-in providers (Hugo, etc.) - async to handle dynamic imports
    this.initPromise = this.registry.registerBuiltInProviders();
  }

  /**
   * Set container reference after construction (to break circular dependency)
   */
  setContainer(container: AppContainer): void {
    this.registry.setContainer(container);
  }

  /**
   * Ensure providers are initialized
   * Called internally before provider access
   */
  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Get provider instance by type
   */
  async getProvider(ssgType: string): Promise<SSGProvider> {
    await this.ensureInitialized();
    return this.registry.getProvider(ssgType);
  }

  /**
   * Get provider registry for advanced operations
   */
  getRegistry(): ProviderRegistry {
    return this.registry;
  }

  /**
   * Create a dev server for the given SSG type
   */
  async createDevServer(ssgType: string, config: SSGServerConfig) {
    const provider = await this.getProvider(ssgType);
    return provider.createDevServer(config);
  }

  /**
   * Create a builder for the given SSG type
   */
  async createBuilder(ssgType: string, config: SSGBuildConfig) {
    const provider = await this.getProvider(ssgType);
    return provider.createBuilder(config);
  }

  /**
   * Get binary manager for the given SSG type (if applicable)
   */
  async getBinaryManager(ssgType: string) {
    const provider = await this.getProvider(ssgType);
    return provider.getBinaryManager();
  }

  /**
   * Auto-detect SSG type from workspace
   */
  async detectSSGType(workspacePath: string): Promise<string | null> {
    return this.registry.detectSSGType(workspacePath);
  }

  /**
   * Get all available provider metadata
   */
  getAllProviderMetadata() {
    return this.registry.getAllProviderMetadata();
  }

  /**
   * Check if a provider type is available
   */
  async hasProvider(ssgType: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.registry.hasProvider(ssgType);
  }
}
