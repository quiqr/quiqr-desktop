/**
 * Integration tests for fresh install scenario
 * Tests: fresh install → configure → restart
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createUnifiedConfigService } from '../../unified-config-service.js';

describe('Fresh Install Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'quiqr-fresh-install-'));
  });

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Initial State', () => {
    it('should start with no config files', () => {
      expect(existsSync(join(tempDir, 'instance_settings.json'))).toBe(false);
      expect(existsSync(join(tempDir, 'user_prefs_default.json'))).toBe(false);
    });

    it('should provide default preferences without config files', () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      const prefs = service.getEffectivePreferences();
      
      expect(prefs.interfaceStyle).toBe('quiqr10-light');
      expect(prefs.dataFolder).toBe('~/Quiqr');
      expect(prefs.sitesListingView).toBe('all');
    });

    it('should provide default instance settings', () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      const settings = service.getInstanceSettings();
      
      expect(settings?.storage.type).toBe('fs');
      expect(settings?.storage.dataFolder).toBe('~/Quiqr');
      expect(settings?.experimentalFeatures).toBe(false);
    });
  });

  describe('User Configuration', () => {
    it('should save and retrieve user preferences', async () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      // Set preference
      await service.setUserPreference('interfaceStyle', 'quiqr10-dark');
      
      // Verify it was saved
      const style = service.getEffectivePreference('interfaceStyle');
      expect(style).toBe('quiqr10-dark');
      
      // Verify file was created
      expect(existsSync(join(tempDir, 'user_prefs_default.json'))).toBe(true);
    });

    it('should persist preferences after service restart', async () => {
      // First service instance
      const service1 = createUnifiedConfigService({ configDir: tempDir });
      await service1.setUserPreference('interfaceStyle', 'quiqr10-dark');
      await service1.setUserPreference('dataFolder', '/custom/path');
      
      // Create new service instance (simulates restart)
      const service2 = createUnifiedConfigService({ configDir: tempDir });
      
      // Verify preferences persisted
      expect(service2.getEffectivePreference('interfaceStyle')).toBe('quiqr10-dark');
      expect(service2.getEffectivePreference('dataFolder')).toBe('/custom/path');
    });

    it('should save multiple preferences at once', async () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      await service.setUserPreferences({
        interfaceStyle: 'quiqr10-dark',
        dataFolder: '/batch/update',
        sitesListingView: 'recent',
      });
      
      const prefs = service.getEffectivePreferences();
      expect(prefs.interfaceStyle).toBe('quiqr10-dark');
      expect(prefs.dataFolder).toBe('/batch/update');
      expect(prefs.sitesListingView).toBe('recent');
    });
  });

  describe('Last Opened Site', () => {
    it('should save and retrieve last opened site', async () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      await service.setLastOpenedSite('my-blog', 'main', '/path/to/blog');
      
      const lastSite = service.getLastOpenedSite();
      expect(lastSite?.siteKey).toBe('my-blog');
      expect(lastSite?.workspaceKey).toBe('main');
      expect(lastSite?.sitePath).toBe('/path/to/blog');
    });

    it('should persist last opened site after restart', async () => {
      const service1 = createUnifiedConfigService({ configDir: tempDir });
      await service1.setLastOpenedSite('portfolio', 'dev', '/sites/portfolio');
      
      const service2 = createUnifiedConfigService({ configDir: tempDir });
      const lastSite = service2.getLastOpenedSite();
      
      expect(lastSite?.siteKey).toBe('portfolio');
      expect(lastSite?.workspaceKey).toBe('dev');
    });
  });

  describe('Site Settings', () => {
    it('should save and retrieve site-specific settings', async () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      await service.updateSiteSettings('my-site', {
        customOption: true,
        buildCommand: 'hugo --minify',
      });
      
      const settings = await service.getSiteSettings('my-site');
      expect(settings?.settings.customOption).toBe(true);
      expect(settings?.settings.buildCommand).toBe('hugo --minify');
    });

    it('should list all sites with settings', async () => {
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      await service.updateSiteSettings('site-a', { theme: 'dark' });
      await service.updateSiteSettings('site-b', { theme: 'light' });
      
      const sites = await service.listSitesWithSettings();
      expect(sites).toContain('site-a');
      expect(sites).toContain('site-b');
    });
  });

  describe('Complete Flow', () => {
    it('should handle full user workflow', async () => {
      // Step 1: Fresh start
      const service = createUnifiedConfigService({ configDir: tempDir });
      expect(service.getEffectivePreference('interfaceStyle')).toBe('quiqr10-light');
      
      // Step 2: User configures preferences
      await service.setUserPreference('interfaceStyle', 'quiqr10-dark');
      await service.setUserPreference('dataFolder', '/home/user/sites');
      
      // Step 3: User opens a site
      await service.setLastOpenedSite('company-blog', 'production', '/home/user/sites/company-blog');
      
      // Step 4: Site-specific settings
      await service.updateSiteSettings('company-blog', {
        autoSave: true,
        previewPort: 1313,
      });
      
      // Step 5: Simulate restart
      const newService = createUnifiedConfigService({ configDir: tempDir });
      
      // Verify everything persisted
      expect(newService.getEffectivePreference('interfaceStyle')).toBe('quiqr10-dark');
      expect(newService.getEffectivePreference('dataFolder')).toBe('/home/user/sites');
      
      const lastSite = newService.getLastOpenedSite();
      expect(lastSite?.siteKey).toBe('company-blog');
      
      const siteSettings = await newService.getSiteSettings('company-blog');
      expect(siteSettings?.settings.autoSave).toBe(true);
    });
  });
});
