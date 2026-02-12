import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvOverrideLayer } from '../env-override-layer.js';

describe('EnvOverrideLayer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of process.env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadFromEnvironment', () => {
    it('should load QUIQR_STORAGE_TYPE via standard mapping', () => {
      process.env.QUIQR_STORAGE_TYPE = 's3';
      
      const layer = new EnvOverrideLayer();
      
      // Standard mapping: STORAGE_TYPE -> instance.storage.type
      expect(layer.hasOverride('instance.storage.type')).toBe(true);
      expect(layer.getValue('instance.storage.type')).toBe('s3');
    });

    it('should load QUIQR_STORAGE_DATAFOLDER via standard mapping', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/custom/path';
      
      const layer = new EnvOverrideLayer();
      
      // Standard mapping: STORAGE_DATAFOLDER -> instance.storage.dataFolder
      expect(layer.hasOverride('instance.storage.dataFolder')).toBe(true);
      expect(layer.getValue('instance.storage.dataFolder')).toBe('/custom/path');
    });

    it('should load QUIQR_EXPERIMENTAL_FEATURES as boolean', () => {
      process.env.QUIQR_EXPERIMENTAL_FEATURES = 'true';
      
      const layer = new EnvOverrideLayer();
      
      // Standard mapping: EXPERIMENTAL_FEATURES -> instance.experimentalFeatures
      expect(layer.hasOverride('instance.experimentalFeatures')).toBe(true);
      expect(layer.getValue('instance.experimentalFeatures')).toBe(true);
    });

    it('should handle false boolean values', () => {
      process.env.QUIQR_EXPERIMENTAL_FEATURES = 'false';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('instance.experimentalFeatures')).toBe(false);
    });

    it('should load QUIQR_DEV_LOCAL_API as boolean', () => {
      process.env.QUIQR_DEV_LOCAL_API = 'true';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.hasOverride('instance.dev.localApi')).toBe(true);
      expect(layer.getValue('instance.dev.localApi')).toBe(true);
    });

    it('should load QUIQR_HUGO_SERVE_DRAFT_MODE as boolean', () => {
      process.env.QUIQR_HUGO_SERVE_DRAFT_MODE = 'true';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.hasOverride('instance.hugo.serveDraftMode')).toBe(true);
      expect(layer.getValue('instance.hugo.serveDraftMode')).toBe(true);
    });

    it('should auto-discover QUIQR_ prefixed variables not in mappings', () => {
      process.env.QUIQR_CUSTOM_SETTING = 'custom_value';
      
      const layer = new EnvOverrideLayer();
      
      // Auto-discovered vars are stored under their transformed key
      expect(layer.hasOverride('custom.setting')).toBe(true);
      expect(layer.getValue('custom.setting')).toBe('custom_value');
    });

    it('should reload from environment when called explicitly', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/first/path';
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('instance.storage.dataFolder')).toBe('/first/path');
      
      // Change env and reload
      process.env.QUIQR_STORAGE_DATAFOLDER = '/second/path';
      layer.loadFromEnvironment();
      
      expect(layer.getValue('instance.storage.dataFolder')).toBe('/second/path');
    });
  });

  describe('custom prefix', () => {
    it('should support custom prefix with auto-discovery', () => {
      process.env.MYAPP_CUSTOM_SETTING = '/custom/path';
      
      const layer = new EnvOverrideLayer('MYAPP_');
      
      // Auto-discovery: CUSTOM_SETTING -> custom.setting
      expect(layer.hasOverride('custom.setting')).toBe(true);
      expect(layer.getValue('custom.setting')).toBe('/custom/path');
    });

    it('should not pick up vars with different prefix', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/quiqr/path';
      
      const layer = new EnvOverrideLayer('MYAPP_');
      
      // Standard mappings only apply to the configured prefix
      expect(layer.hasOverride('instance.storage.dataFolder')).toBe(false);
    });
  });

  describe('custom mappings', () => {
    it('should support custom env-to-path mappings', () => {
      process.env.QUIQR_CUSTOM_VAR = 'my_value';
      
      const customMappings = [
        { envVar: 'CUSTOM_VAR', configPath: 'custom.path', transform: 'string' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.hasOverride('custom.path')).toBe(true);
      expect(layer.getValue('custom.path')).toBe('my_value');
    });

    it('should apply type transformation for custom mappings', () => {
      process.env.QUIQR_MY_BOOL = 'true';
      process.env.QUIQR_MY_NUM = '42';
      
      const customMappings = [
        { envVar: 'MY_BOOL', configPath: 'custom.bool', transform: 'boolean' as const },
        { envVar: 'MY_NUM', configPath: 'custom.num', transform: 'number' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.getValue('custom.bool')).toBe(true);
      expect(layer.getValue('custom.num')).toBe(42);
    });

    it('should handle JSON transformation', () => {
      process.env.QUIQR_MY_JSON = '{"key":"value","num":123}';
      
      const customMappings = [
        { envVar: 'MY_JSON', configPath: 'custom.json', transform: 'json' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.getValue('custom.json')).toEqual({ key: 'value', num: 123 });
    });

    it('should handle invalid JSON gracefully', () => {
      process.env.QUIQR_MY_JSON = 'not-valid-json';
      
      const customMappings = [
        { envVar: 'MY_JSON', configPath: 'custom.json', transform: 'json' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      // Falls back to string
      expect(layer.getValue('custom.json')).toBe('not-valid-json');
    });
  });

  describe('autoTransform', () => {
    it('should auto-detect boolean true', () => {
      process.env.QUIQR_AUTO_BOOL = 'true';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.bool')).toBe(true);
    });

    it('should auto-detect boolean TRUE (uppercase)', () => {
      process.env.QUIQR_AUTO_BOOL = 'TRUE';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.bool')).toBe(true);
    });

    it('should auto-detect boolean false', () => {
      process.env.QUIQR_AUTO_BOOL = 'false';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.bool')).toBe(false);
    });

    it('should auto-detect integers', () => {
      process.env.QUIQR_AUTO_INT = '42';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.int')).toBe(42);
    });

    it('should auto-detect negative integers', () => {
      process.env.QUIQR_AUTO_INT = '-10';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.int')).toBe(-10);
    });

    it('should auto-detect floats', () => {
      process.env.QUIQR_AUTO_FLOAT = '3.14';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.float')).toBe(3.14);
    });

    it('should auto-detect JSON objects', () => {
      process.env.QUIQR_AUTO_OBJ = '{"a":1}';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.obj')).toEqual({ a: 1 });
    });

    it('should auto-detect JSON arrays', () => {
      process.env.QUIQR_AUTO_ARR = '[1,2,3]';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.arr')).toEqual([1, 2, 3]);
    });

    it('should keep strings as strings', () => {
      process.env.QUIQR_AUTO_STR = 'hello';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.str')).toBe('hello');
    });

    it('should keep paths as strings', () => {
      process.env.QUIQR_AUTO_PATH = '/path/to/folder';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('auto.path')).toBe('/path/to/folder');
    });
  });

  describe('getOverride', () => {
    it('should return override with metadata', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/env/path';
      
      const layer = new EnvOverrideLayer();
      
      const override = layer.getOverride('instance.storage.dataFolder');
      expect(override).toBeDefined();
      expect(override?.value).toBe('/env/path');
      expect(override?.envVar).toBe('QUIQR_STORAGE_DATAFOLDER');
      expect(override?.configPath).toBe('instance.storage.dataFolder');
    });

    it('should return undefined for non-existent override', () => {
      const layer = new EnvOverrideLayer();
      
      const override = layer.getOverride('non.existent.path');
      expect(override).toBeUndefined();
    });
  });

  describe('hasOverride', () => {
    it('should return true for existing overrides', () => {
      process.env.QUIQR_EXPERIMENTAL_FEATURES = 'true';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.hasOverride('instance.experimentalFeatures')).toBe(true);
    });

    it('should return false for non-existing overrides', () => {
      const layer = new EnvOverrideLayer();
      
      expect(layer.hasOverride('non.existent')).toBe(false);
    });
  });

  describe('applyOverrides', () => {
    it('should apply overrides to a config object and return applied paths', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/override/path';
      process.env.QUIQR_EXPERIMENTAL_FEATURES = 'true';
      
      const layer = new EnvOverrideLayer();
      
      const config: Record<string, unknown> = {
        instance: {
          storage: {
            dataFolder: '/original/path',
          },
          experimentalFeatures: false,
        },
      };
      
      const appliedPaths = layer.applyOverrides(config);
      
      // Returns array of applied paths
      expect(appliedPaths).toContain('instance.storage.dataFolder');
      expect(appliedPaths).toContain('instance.experimentalFeatures');
      
      // Config is modified in place
      const instance = config.instance as Record<string, unknown>;
      const storage = instance.storage as Record<string, unknown>;
      expect(storage.dataFolder).toBe('/override/path');
      expect(instance.experimentalFeatures).toBe(true);
    });

    it('should create nested paths that do not exist', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/new/path';
      
      const layer = new EnvOverrideLayer();
      
      const config: Record<string, unknown> = {};
      layer.applyOverrides(config);
      
      const instance = config.instance as Record<string, unknown>;
      const storage = instance?.storage as Record<string, unknown>;
      expect(storage?.dataFolder).toBe('/new/path');
    });
  });

  describe('getOverrides', () => {
    it('should return all loaded overrides as array', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/path1';
      process.env.QUIQR_EXPERIMENTAL_FEATURES = 'true';
      
      const layer = new EnvOverrideLayer();
      
      const overrides = layer.getOverrides();
      
      expect(Array.isArray(overrides)).toBe(true);
      expect(overrides.length).toBeGreaterThanOrEqual(2);
      
      const dataFolderOverride = overrides.find(o => o.configPath === 'instance.storage.dataFolder');
      expect(dataFolderOverride).toBeDefined();
      expect(dataFolderOverride?.value).toBe('/path1');
      
      const expFeaturesOverride = overrides.find(o => o.configPath === 'instance.experimentalFeatures');
      expect(expFeaturesOverride).toBeDefined();
      expect(expFeaturesOverride?.value).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty environment variables with standard mapping', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '';
      
      const layer = new EnvOverrideLayer();
      
      // Empty string should still be stored via standard mapping
      expect(layer.hasOverride('instance.storage.dataFolder')).toBe(true);
      expect(layer.getValue('instance.storage.dataFolder')).toBe('');
    });

    it('should handle whitespace-only values', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '   ';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('instance.storage.dataFolder')).toBe('   ');
    });

    it('should handle special characters in paths', () => {
      process.env.QUIQR_STORAGE_DATAFOLDER = '/path/with spaces/and-dashes/and_underscores';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.getValue('instance.storage.dataFolder')).toBe('/path/with spaces/and-dashes/and_underscores');
    });

    it('should handle deeply nested auto-discovered paths', () => {
      process.env.QUIQR_SECTION_SUBSECTION_KEY = 'deep_value';
      
      const layer = new EnvOverrideLayer();
      
      expect(layer.hasOverride('section.subsection.key')).toBe(true);
      expect(layer.getValue('section.subsection.key')).toBe('deep_value');
    });

    it('should handle explicit mappings alongside auto-discovery', () => {
      // STORAGE_TYPE is explicitly mapped to instance.storage.type
      // Auto-discovery also creates storage.type from the same env var
      process.env.QUIQR_STORAGE_TYPE = 'explicit_value';
      
      const layer = new EnvOverrideLayer();
      
      // Should use explicit mapping
      expect(layer.hasOverride('instance.storage.type')).toBe(true);
      expect(layer.getValue('instance.storage.type')).toBe('explicit_value');
      // Auto-discovery also creates storage.type (different path)
      expect(layer.hasOverride('storage.type')).toBe(true);
    });

    it('should ignore single-part auto-discovered vars', () => {
      // Single part vars need at least 2 parts for path conversion
      process.env.QUIQR_SINGLEPART = 'value';
      
      const layer = new EnvOverrideLayer();
      
      // This won't be auto-discovered because it only has 1 part after prefix
      expect(layer.hasOverride('singlepart')).toBe(false);
    });
  });

  describe('boolean edge cases', () => {
    it('should handle "1" as true for explicit boolean transform', () => {
      process.env.QUIQR_MY_BOOL = '1';
      
      const customMappings = [
        { envVar: 'MY_BOOL', configPath: 'test.bool', transform: 'boolean' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.getValue('test.bool')).toBe(true);
    });

    it('should handle "0" as false for explicit boolean transform', () => {
      process.env.QUIQR_MY_BOOL = '0';
      
      const customMappings = [
        { envVar: 'MY_BOOL', configPath: 'test.bool', transform: 'boolean' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.getValue('test.bool')).toBe(false);
    });

    it('should handle any non-true string as false for explicit boolean', () => {
      process.env.QUIQR_MY_BOOL = 'yes';
      
      const customMappings = [
        { envVar: 'MY_BOOL', configPath: 'test.bool', transform: 'boolean' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      // 'yes' is not 'true' or '1', so it's false
      expect(layer.getValue('test.bool')).toBe(false);
    });
  });

  describe('number edge cases', () => {
    it('should handle invalid number strings gracefully', () => {
      process.env.QUIQR_MY_NUM = 'not-a-number';
      
      const customMappings = [
        { envVar: 'MY_NUM', configPath: 'test.num', transform: 'number' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      // Falls back to original string
      expect(layer.getValue('test.num')).toBe('not-a-number');
    });

    it('should handle zero as a valid number', () => {
      process.env.QUIQR_MY_NUM = '0';
      
      const customMappings = [
        { envVar: 'MY_NUM', configPath: 'test.num', transform: 'number' as const },
      ];
      
      const layer = new EnvOverrideLayer('QUIQR_', customMappings);
      
      expect(layer.getValue('test.num')).toBe(0);
    });
  });
});
