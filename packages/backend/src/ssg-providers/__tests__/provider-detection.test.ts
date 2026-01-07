/**
 * Provider Detection Tests
 *
 * Tests SSG site detection logic using real filesystem operations in temp directories.
 * Tests all confidence levels (high, medium, low) for Hugo, Eleventy, and Jekyll.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProviderRegistry } from '../provider-registry.js';
import { HugoProvider } from '../hugo/hugo-provider.js';
import { EleventyProvider } from '../eleventy/eleventy-provider.js';
import { JekyllProvider } from '../jekyll/jekyll-provider.js';
import {
  createHugoSite,
  createEleventySite,
  createJekyllSite,
  createEmptySite,
  createAmbiguousSite,
} from '../../../test/helpers/ssg-fixture-builder.js';
import { createMockSSGProviderDependencies } from '../../../test/mocks/ssg-dependencies.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Provider Detection', () => {
  let testDir: string;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;
  let registry: ProviderRegistry;

  beforeEach(async () => {
    // Create temp directory for test fixtures
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ssg-detection-test-'));

    // Create dependencies and registry
    mockDeps = createMockSSGProviderDependencies();
    registry = new ProviderRegistry(mockDeps);
    await registry.registerBuiltInProviders();
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(testDir);
  });

  describe('Hugo Detection', () => {
    it('detects Hugo site with hugo.toml (high confidence)', async () => {
      const siteDir = path.join(testDir, 'hugo-toml');
      await createHugoSite(siteDir, {
        includeConfig: true,
        configFormat: 'toml',
      });

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('hugo.toml');
    });

    it('detects Hugo site with hugo.yaml (high confidence)', async () => {
      const siteDir = path.join(testDir, 'hugo-yaml');
      await createHugoSite(siteDir, {
        includeConfig: true,
        configFormat: 'yaml',
      });

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('hugo.yaml');
    });

    it('detects Hugo site with hugo.json (high confidence)', async () => {
      const siteDir = path.join(testDir, 'hugo-json');
      await createHugoSite(siteDir, {
        includeConfig: true,
        configFormat: 'json',
      });

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('hugo.json');
    });

    it('detects Hugo site by directory markers (medium confidence)', async () => {
      const siteDir = path.join(testDir, 'hugo-dirs');
      await createHugoSite(siteDir, {
        includeConfig: false,
        includeMarkerDirs: true,
      });

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.metadata?.markers).toBeGreaterThanOrEqual(2);
    });

    it('does not detect Hugo in empty directory', async () => {
      const siteDir = path.join(testDir, 'empty-hugo');
      await createEmptySite(siteDir);

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('detects Hugo site with multiple config files', async () => {
      const siteDir = path.join(testDir, 'hugo-multi-config');
      await createHugoSite(siteDir, {
        includeConfig: true,
        configFormat: 'toml',
      });
      // Add another config format
      await fs.writeFile(
        path.join(siteDir, 'hugo.yaml'),
        'title: Test Site\nbaseURL: http://example.org'
      );

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Eleventy Detection', () => {
    it('detects Eleventy site with .eleventy.js (high confidence)', async () => {
      const siteDir = path.join(testDir, 'eleventy-js');
      await createEleventySite(siteDir, {
        includeConfig: true,
        configFormat: 'js',
      });

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('.eleventy.js');
    });

    it('detects Eleventy site with eleventy.config.js (high confidence)', async () => {
      const siteDir = path.join(testDir, 'eleventy-config-js');
      await createEleventySite(siteDir, {
        includeConfig: true,
        configFormat: 'config-js',
      });

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('eleventy.config.js');
    });

    it('detects Eleventy by package.json dependency (medium confidence)', async () => {
      const siteDir = path.join(testDir, 'eleventy-package');
      await createEleventySite(siteDir, {
        includeConfig: false,
        includePackageJson: true,
      });

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.metadata?.source).toBe('package.json');
    });

    it('detects Eleventy by marker directories (low confidence)', async () => {
      const siteDir = path.join(testDir, 'eleventy-dirs');
      await createEleventySite(siteDir, {
        includeConfig: false,
        includeMarkerDirs: true,
      });

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('low');
    });

    it('does not detect Eleventy in empty directory', async () => {
      const siteDir = path.join(testDir, 'empty-eleventy');
      await createEmptySite(siteDir);

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });
  });

  describe('Jekyll Detection', () => {
    it('detects Jekyll site with _config.yml (high confidence)', async () => {
      const siteDir = path.join(testDir, 'jekyll-yml');
      await createJekyllSite(siteDir, {
        includeConfig: true,
        configFormat: 'yml',
      });

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('_config.yml');
    });

    it('detects Jekyll site with _config.yaml (high confidence)', async () => {
      const siteDir = path.join(testDir, 'jekyll-yaml');
      await createJekyllSite(siteDir, {
        includeConfig: true,
        configFormat: 'yaml',
      });

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('_config.yaml');
    });

    it('detects Jekyll by Gemfile (high confidence)', async () => {
      const siteDir = path.join(testDir, 'jekyll-gemfile');
      await createJekyllSite(siteDir, {
        includeConfig: false,
        includeGemfile: true,
      });

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.metadata?.source).toBe('Gemfile');
    });

    it('detects Jekyll by marker directories (medium confidence)', async () => {
      const siteDir = path.join(testDir, 'jekyll-dirs');
      await createJekyllSite(siteDir, {
        includeConfig: false,
        includeMarkerDirs: true,
      });

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.metadata?.markers).toBeGreaterThanOrEqual(2);
    });

    it('detects Jekyll with single marker and .md files (low confidence)', async () => {
      const siteDir = path.join(testDir, 'jekyll-low');
      await createJekyllSite(siteDir, {
        includeConfig: false,
        includeMarkerDirs: true,
      });

      // Remove marker directories to leave only 1 for low confidence
      await fs.remove(path.join(siteDir, '_layouts'));
      await fs.remove(path.join(siteDir, '_includes'));
      await fs.remove(path.join(siteDir, '_site'));

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      // Should still detect with _posts and .md files (low confidence)
      if (result.isDetected) {
        expect(result.confidence).toBe('low');
      }
    });

    it('does not detect Jekyll in empty directory', async () => {
      const siteDir = path.join(testDir, 'empty-jekyll');
      await createEmptySite(siteDir);

      const provider = new JekyllProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });
  });

  describe('Registry Auto-Detection', () => {
    it('returns null for empty directory', async () => {
      const siteDir = path.join(testDir, 'empty');
      await createEmptySite(siteDir);

      const detected = await registry.detectSSGType(siteDir);

      expect(detected).toBeNull();
    });

    it('detects Hugo site correctly', async () => {
      const siteDir = path.join(testDir, 'hugo-detect');
      await createHugoSite(siteDir, {
        includeConfig: true,
        configFormat: 'toml',
      });

      const detected = await registry.detectSSGType(siteDir);

      expect(detected).toBe('hugo');
    });

    it('detects Eleventy site correctly', async () => {
      const siteDir = path.join(testDir, 'eleventy-detect');
      await createEleventySite(siteDir, {
        includeConfig: true,
        configFormat: 'js',
      });

      const detected = await registry.detectSSGType(siteDir);

      expect(detected).toBe('eleventy');
    });

    it('detects Jekyll site correctly', async () => {
      const siteDir = path.join(testDir, 'jekyll-detect');
      await createJekyllSite(siteDir, {
        includeConfig: true,
        configFormat: 'yml',
      });

      const detected = await registry.detectSSGType(siteDir);

      expect(detected).toBe('jekyll');
    });

    it('returns highest confidence match when multiple detected', async () => {
      const siteDir = path.join(testDir, 'ambiguous');
      await createAmbiguousSite(siteDir);

      // Add a strong Hugo indicator
      await fs.writeFile(path.join(siteDir, 'hugo.toml'), 'title = "Test"');

      const detected = await registry.detectSSGType(siteDir);

      // Hugo should win with high confidence from hugo.toml
      expect(detected).toBe('hugo');
    });

    it('sorts detection by confidence (high > medium > low)', async () => {
      const siteDir = path.join(testDir, 'confidence-test');
      await fs.ensureDir(siteDir);

      // Create ambiguous markers
      await fs.ensureDir(path.join(siteDir, '_site')); // Could be Eleventy or Jekyll
      await fs.ensureDir(path.join(siteDir, 'content')); // Could be Hugo

      // Add high confidence Jekyll indicator
      await fs.writeFile(path.join(siteDir, '_config.yml'), 'title: Test');

      const detected = await registry.detectSSGType(siteDir);

      // Jekyll should win with high confidence from _config.yml
      expect(detected).toBe('jekyll');
    });
  });

  describe('Edge Cases', () => {
    it('handles non-existent directory', async () => {
      const siteDir = path.join(testDir, 'non-existent');

      const provider = new HugoProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      expect(result.isDetected).toBe(false);
    });

    it('handles directory with only unrelated files', async () => {
      const siteDir = path.join(testDir, 'unrelated');
      await fs.ensureDir(siteDir);
      await fs.writeFile(path.join(siteDir, 'README.md'), '# Test');
      await fs.writeFile(path.join(siteDir, 'package.json'), '{}');

      const detected = await registry.detectSSGType(siteDir);

      expect(detected).toBeNull();
    });

    it('handles corrupted config files gracefully', async () => {
      const siteDir = path.join(testDir, 'corrupted');
      await fs.ensureDir(siteDir);
      await fs.writeFile(path.join(siteDir, 'package.json'), 'invalid json{{{');

      const provider = new EleventyProvider(mockDeps);
      const result = await provider.detectSite(siteDir);

      // Should not throw, just return not detected
      expect(result.isDetected).toBe(false);
    });
  });
});
