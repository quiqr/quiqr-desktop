/**
 * EnvOverrideLayer - Environment Variable Configuration Overrides
 *
 * Processes QUIQR_* environment variables and applies them as config overrides.
 * Environment variables take precedence over file-based configuration.
 */

import {
  type EnvVarMapping,
  standardEnvMappings,
} from '@quiqr/types';

/**
 * Result of parsing an environment variable
 */
export interface EnvOverride {
  configPath: string;
  value: unknown;
  envVar: string;
}

/**
 * EnvOverrideLayer handles environment variable configuration
 */
export class EnvOverrideLayer {
  private prefix: string;
  private mappings: EnvVarMapping[];
  private overrides: Map<string, EnvOverride>;

  constructor(prefix: string = 'QUIQR_', customMappings?: EnvVarMapping[]) {
    this.prefix = prefix;
    this.mappings = customMappings || standardEnvMappings;
    this.overrides = new Map();
    this.loadFromEnvironment();
  }

  /**
   * Load overrides from current environment
   */
  loadFromEnvironment(): void {
    this.overrides.clear();

    // Process standard mappings
    for (const mapping of this.mappings) {
      const envVarName = `${this.prefix}${mapping.envVar}`;
      const rawValue = process.env[envVarName];

      if (rawValue !== undefined) {
        const value = this.transformValue(rawValue, mapping.transform);
        this.overrides.set(mapping.configPath, {
          configPath: mapping.configPath,
          value,
          envVar: envVarName,
        });
      }
    }

    // Also process any QUIQR_* vars that follow the convention
    // Format: QUIQR_SECTION_KEY or QUIQR_SECTION_SUBSECTION_KEY
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(this.prefix) && value !== undefined) {
        const pathParts = key.slice(this.prefix.length).toLowerCase().split('_');
        if (pathParts.length >= 2) {
          const configPath = pathParts.join('.');

          // Skip if already handled by explicit mapping
          if (!this.overrides.has(configPath)) {
            // Auto-detect type
            const transformedValue = this.autoTransform(value);
            this.overrides.set(configPath, {
              configPath,
              value: transformedValue,
              envVar: key,
            });
          }
        }
      }
    }
  }

  /**
   * Get all current overrides
   */
  getOverrides(): EnvOverride[] {
    return Array.from(this.overrides.values());
  }

  /**
   * Get override for a specific config path
   */
  getOverride(configPath: string): EnvOverride | undefined {
    return this.overrides.get(configPath);
  }

  /**
   * Check if a config path has an env override
   */
  hasOverride(configPath: string): boolean {
    return this.overrides.has(configPath);
  }

  /**
   * Get the override value for a config path
   */
  getValue(configPath: string): unknown | undefined {
    return this.overrides.get(configPath)?.value;
  }

  /**
   * Apply overrides to a config object
   * Modifies the object in place and returns paths that were overridden
   */
  applyOverrides(config: Record<string, unknown>): string[] {
    const appliedPaths: string[] = [];

    for (const override of this.overrides.values()) {
      this.setNestedValue(config, override.configPath, override.value);
      appliedPaths.push(override.configPath);
    }

    return appliedPaths;
  }

  /**
   * Transform a string value based on the specified type
   */
  private transformValue(
    value: string,
    transform: 'string' | 'number' | 'boolean' | 'json'
  ): unknown {
    switch (transform) {
      case 'string':
        return value;
      case 'number':
        const num = Number(value);
        return isNaN(num) ? value : num;
      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  /**
   * Auto-detect and transform a value
   */
  private autoTransform(value: string): unknown {
    // Check for boolean
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return value.toLowerCase() === 'true';
    }

    // Check for number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }

    // Check for JSON
    if ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch {
        // Not valid JSON, return as string
      }
    }

    return value;
  }

  /**
   * Set a nested value in an object using dot notation
   */
  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }
}
