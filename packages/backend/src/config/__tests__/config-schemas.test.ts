/**
 * T1.7: Unit tests for schema validation edge cases
 *
 * Tests the Zod schemas used for configuration validation:
 * - userPreferencesSchema
 * - instanceSettingsSchema
 * - userConfigSchema
 * - siteSettingsSchema
 */

import { describe, it, expect } from 'vitest';
import {
  userPreferencesSchema,
  instanceSettingsSchema,
  userConfigSchema,
  siteSettingsSchema,
  configLayerSchema,
} from '@quiqr/types';

describe('Config Schemas', () => {
  describe('userPreferencesSchema', () => {
    it('should accept valid preferences with all fields', () => {
      const prefs = {
        dataFolder: '~/Documents/Quiqr',
        interfaceStyle: 'quiqr10-dark' as const,
        sitesListingView: 'all',
        libraryView: 'default',
        showSplashAtStartup: true,
        logRetentionDays: 30,
      };

      const result = userPreferencesSchema.parse(prefs);
      expect(result.interfaceStyle).toBe('quiqr10-dark');
      expect(result.dataFolder).toBe('~/Documents/Quiqr');
    });

    it('should apply default for interfaceStyle when not provided', () => {
      const prefs = {
        dataFolder: '~/Quiqr',
      };

      const result = userPreferencesSchema.parse(prefs);
      expect(result.interfaceStyle).toBe('quiqr10-light');
    });

    it('should accept empty object with defaults', () => {
      const result = userPreferencesSchema.parse({});
      expect(result.interfaceStyle).toBe('quiqr10-light');
    });

    it('should reject invalid interfaceStyle', () => {
      const prefs = {
        interfaceStyle: 'invalid-theme',
      };

      expect(() => userPreferencesSchema.parse(prefs)).toThrow();
    });

    it('should allow optional fields to be undefined', () => {
      const prefs = {
        interfaceStyle: 'quiqr10-light' as const,
      };

      const result = userPreferencesSchema.parse(prefs);
      expect(result.dataFolder).toBeUndefined();
      expect(result.systemGitBinPath).toBeUndefined();
    });

    it('should validate logRetentionDays is within range 0-365', () => {
      expect(() =>
        userPreferencesSchema.parse({ logRetentionDays: -1 })
      ).toThrow();

      expect(() =>
        userPreferencesSchema.parse({ logRetentionDays: 366 })
      ).toThrow();

      const validResult = userPreferencesSchema.parse({ logRetentionDays: 0 });
      expect(validResult.logRetentionDays).toBe(0);

      const validMax = userPreferencesSchema.parse({ logRetentionDays: 365 });
      expect(validMax.logRetentionDays).toBe(365);
    });

    it('should allow passthrough of unknown fields', () => {
      const prefs = {
        interfaceStyle: 'quiqr10-light' as const,
        customField: 'custom-value',
      };

      const result = userPreferencesSchema.parse(prefs);
      expect((result as Record<string, unknown>).customField).toBe(
        'custom-value'
      );
    });
  });

  describe('instanceSettingsSchema', () => {
    it('should accept valid instance settings', () => {
      const settings = {
        storage: {
          type: 'fs' as const,
          dataFolder: '~/Quiqr',
        },
        userDefaultPreferences: {},
        userForcedPreferences: {},
        experimentalFeatures: false,
      };

      const result = instanceSettingsSchema.parse(settings);
      expect(result.storage.type).toBe('fs');
      expect(result.experimentalFeatures).toBe(false);
    });

    it('should apply defaults for missing optional fields', () => {
      const settings = {
        storage: {
          type: 'fs' as const,
          dataFolder: '~/Quiqr',
        },
      };

      const result = instanceSettingsSchema.parse(settings);
      expect(result.userDefaultPreferences).toEqual({});
      expect(result.userForcedPreferences).toEqual({});
      expect(result.experimentalFeatures).toBe(false);
    });

    it('should allow forced preferences to override user preferences', () => {
      const settings = {
        storage: {
          type: 'fs' as const,
          dataFolder: '~/Quiqr',
        },
        userForcedPreferences: {
          interfaceStyle: 'quiqr10-dark' as const,
        },
      };

      const result = instanceSettingsSchema.parse(settings);
      expect(result.userForcedPreferences?.interfaceStyle).toBe('quiqr10-dark');
    });

    it('should accept hugo settings', () => {
      const settings = {
        storage: {
          type: 'fs' as const,
          dataFolder: '~/Quiqr',
        },
        hugo: {
          serveDraftMode: true,
        },
      };

      const result = instanceSettingsSchema.parse(settings);
      expect(result.hugo?.serveDraftMode).toBe(true);
    });

    it('should accept dev settings', () => {
      const settings = {
        storage: {
          type: 'fs' as const,
          dataFolder: '~/Quiqr',
        },
        dev: {
          localApi: true,
          disableAutoHugoServe: true,
          showCurrentUser: false,
        },
      };

      const result = instanceSettingsSchema.parse(settings);
      expect(result.dev?.localApi).toBe(true);
      expect(result.dev?.disableAutoHugoServe).toBe(true);
    });
  });

  describe('userConfigSchema', () => {
    it('should accept valid user config', () => {
      const config = {
        userId: 'user123',
        preferences: {
          interfaceStyle: 'quiqr10-dark' as const,
        },
        skipWelcomeScreen: true,
      };

      const result = userConfigSchema.parse(config);
      expect(result.userId).toBe('user123');
      expect(result.skipWelcomeScreen).toBe(true);
    });

    it('should apply default userId', () => {
      const config = {};

      const result = userConfigSchema.parse(config);
      expect(result.userId).toBe('default');
    });

    it('should accept lastOpenedSite with all fields', () => {
      const config = {
        lastOpenedSite: {
          siteKey: 'my-site',
          workspaceKey: 'main',
          sitePath: '/path/to/site',
        },
      };

      const result = userConfigSchema.parse(config);
      expect(result.lastOpenedSite?.siteKey).toBe('my-site');
      expect(result.lastOpenedSite?.workspaceKey).toBe('main');
    });

    it('should accept lastOpenedPublishTargetForSite', () => {
      const config = {
        lastOpenedPublishTargetForSite: {
          'site-1': 'production',
          'site-2': 'staging',
        },
      };

      const result = userConfigSchema.parse(config);
      expect(result.lastOpenedPublishTargetForSite?.['site-1']).toBe(
        'production'
      );
    });

    it('should allow partial preferences', () => {
      const config = {
        preferences: {
          dataFolder: '~/MyQuiqr',
          // interfaceStyle not provided - that's ok for partial
        },
      };

      const result = userConfigSchema.parse(config);
      expect(result.preferences?.dataFolder).toBe('~/MyQuiqr');
    });
  });

  describe('siteSettingsSchema', () => {
    it('should accept valid site settings', () => {
      const settings = {
        siteKey: 'my-site',
        settings: {
          customSetting: 'value',
        },
      };

      const result = siteSettingsSchema.parse(settings);
      expect(result.siteKey).toBe('my-site');
    });

    it('should apply defaults for optional fields', () => {
      const settings = {
        siteKey: 'my-site',
      };

      const result = siteSettingsSchema.parse(settings);
      expect(result.settings).toEqual({});
      expect(result.lastPublish).toBeUndefined();
    });

    it('should accept publishStatus as integer', () => {
      const settings = {
        siteKey: 'my-site',
        publishStatus: 1,
      };

      const result = siteSettingsSchema.parse(settings);
      expect(result.publishStatus).toBe(1);
    });

    it('should reject invalid publishStatus range', () => {
      expect(() =>
        siteSettingsSchema.parse({ siteKey: 'my-site', publishStatus: -1 })
      ).toThrow();

      expect(() =>
        siteSettingsSchema.parse({ siteKey: 'my-site', publishStatus: 9 })
      ).toThrow();
    });
  });

  describe('configLayerSchema', () => {
    it('should accept valid config layers', () => {
      const layers = [
        'app-default',
        'instance-default',
        'user',
        'instance-forced',
      ] as const;

      for (const layer of layers) {
        expect(configLayerSchema.parse(layer)).toBe(layer);
      }
    });

    it('should reject invalid config layers', () => {
      expect(() => configLayerSchema.parse('invalid-layer')).toThrow();
    });
  });
});
