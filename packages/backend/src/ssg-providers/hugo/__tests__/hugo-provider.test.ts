/**
 * Hugo Provider Tests
 *
 * Tests the main HugoProvider class behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HugoProvider } from '../hugo-provider.js';
import { createMockSSGProviderDependencies } from '../../../../test/mocks/ssg-dependencies.js';
import { createHugoSite } from '../../../../test/helpers/ssg-fixture-builder.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('HugoProvider', () => {
  let provider: HugoProvider;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;
  let testDir: string;

  beforeEach(async () => {
    mockDeps = createMockSSGProviderDependencies();
    provider = new HugoProvider(mockDeps);
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hugo-provider-test-'));
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Metadata', () => {
    it('returns correct Hugo metadata', () => {
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('hugo');
      expect(metadata.name).toBe('Hugo');
      expect(metadata.configFormats).toEqual(['toml', 'yaml', 'json']);
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(true);
    });
  });

  describe('Binary Manager', () => {
    it('returns HugoDownloader instance', () => {
      const binaryManager = provider.getBinaryManager();

      expect(binaryManager).not.toBeNull();
      expect(binaryManager?.isVersionInstalled).toBeDefined();
      expect(binaryManager?.download).toBeDefined();
    });
  });

  describe('Dev Server Factory', () => {
    it('creates HugoServer instance', () => {
      const server = provider.createDevServer({
        workspacePath: '/test/workspace',
        version: '0.120.0',
      });

      expect(server).toBeDefined();
      expect(server.serve).toBeDefined();
      expect(server.stopIfRunning).toBeDefined();
    });

    it('passes configuration to server', () => {
      const config = {
        workspacePath: '/test/workspace',
        version: '0.120.0',
        port: 8080,
        configFile: 'custom.toml',
      };

      const server = provider.createDevServer(config);
      expect(server).toBeDefined();
    });
  });

  describe('Builder Factory', () => {
    it('creates HugoBuilder instance', () => {
      const builder = provider.createBuilder({
        workspacePath: '/test/workspace',
        version: '0.120.0',
        destination: '/test/output',
      });

      expect(builder).toBeDefined();
      expect(builder.build).toBeDefined();
    });

    it('passes configuration to builder', () => {
      const config = {
        workspacePath: '/test/workspace',
        version: '0.120.0',
        destination: '/test/output',
        baseUrl: 'https://example.org',
        configFile: 'custom.toml',
      };

      const builder = provider.createBuilder(config);
      expect(builder).toBeDefined();
    });
  });

  describe('Config Querier Factory', () => {
    it('creates HugoConfig instance', () => {
      const querier = provider.createConfigQuerier('/test/workspace', '0.120.0');

      expect(querier).not.toBeNull();
      expect(querier?.getConfig).toBeDefined();
      expect(querier?.getConfigLines).toBeDefined();
    });

    it('passes configuration to querier', () => {
      const querier = provider.createConfigQuerier(
        '/test/workspace',
        '0.120.0',
        'custom.toml'
      );

      expect(querier).not.toBeNull();
    });
  });

  describe('Site Detection', () => {
    it('detects Hugo site with hugo.toml', async () => {
      await createHugoSite(testDir, {
        includeConfig: true,
        configFormat: 'toml',
      });

      const result = await provider.detectSite(testDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('hugo.toml');
    });

    it('detects Hugo site with config.toml', async () => {
      await createHugoSite(testDir, { includeConfig: false });
      await fs.writeFile(path.join(testDir, 'config.toml'), 'title = "Test"');

      const result = await provider.detectSite(testDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('config.toml');
    });

    it('detects Hugo site by directory markers', async () => {
      await createHugoSite(testDir, {
        includeConfig: false,
        includeMarkerDirs: true,
      });

      const result = await provider.detectSite(testDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
    });

    it('returns false for non-Hugo directory', async () => {
      const result = await provider.detectSite(testDir);

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('prioritizes config files over directory markers', async () => {
      await createHugoSite(testDir, {
        includeConfig: true,
        configFormat: 'toml',
        includeMarkerDirs: true,
      });

      const result = await provider.detectSite(testDir);

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high'); // High from config, not medium from dirs
      expect(result.configFiles).toBeDefined();
    });
  });

  describe('Site Creation', () => {
    it('creates Hugo site with default settings', async () => {
      const siteDir = path.join(testDir, 'new-site');

      await provider.createSite({
        directory: siteDir,
        title: 'Test Site',
        configFormat: 'toml',
      });

      expect(await fs.pathExists(siteDir)).toBe(true);
    });

    it('creates Hugo site with YAML config', async () => {
      const siteDir = path.join(testDir, 'yaml-site');

      await provider.createSite({
        directory: siteDir,
        title: 'YAML Site',
        configFormat: 'yaml',
      });

      expect(await fs.pathExists(siteDir)).toBe(true);
    });

    it('creates Hugo site with JSON config', async () => {
      const siteDir = path.join(testDir, 'json-site');

      await provider.createSite({
        directory: siteDir,
        title: 'JSON Site',
        configFormat: 'json',
      });

      expect(await fs.pathExists(siteDir)).toBe(true);
    });
  });
});
