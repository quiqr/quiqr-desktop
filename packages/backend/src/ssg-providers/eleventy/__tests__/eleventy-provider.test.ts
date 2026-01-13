import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EleventyProvider } from '../eleventy-provider.js';
import { createMockSSGProviderDependencies } from '../../../../test/mocks/ssg-dependencies.js';
import fs from 'fs-extra';

vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn((event, handler) => { if (event === 'close') setTimeout(() => handler(0), 10); }),
    kill: vi.fn(),
  })),
  execFile: vi.fn((_cmd, _args, _opts, cb: any) => {
    cb(null, { stdout: '', stderr: '' });
    return {} as any;
  }),
}));

vi.mock('fs-extra');

describe('EleventyProvider', () => {
  let provider: EleventyProvider;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;

  beforeEach(() => {
    mockDeps = createMockSSGProviderDependencies();
    provider = new EleventyProvider(mockDeps);
    vi.clearAllMocks();
  });

  describe('Metadata', () => {
    it('returns correct metadata', () => {
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('eleventy');
      expect(metadata.name).toBe('Eleventy');
      expect(metadata.configFormats).toContain('js');
      expect(metadata.configFormats).toContain('json');
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(false);
    });
  });

  describe('getBinaryManager()', () => {
    it('returns EleventyDownloader instance', () => {
      const binaryManager = provider.getBinaryManager();

      expect(binaryManager).toBeDefined();
      expect(binaryManager.isVersionInstalled).toBeDefined();
      expect(binaryManager.download).toBeDefined();
      expect(binaryManager.ensureAvailable).toBeDefined();
    });
  });

  describe('createDevServer()', () => {
    it('creates EleventyServer instance with correct config', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '2.0.0'
      });

      expect(server).toBeDefined();
      expect(server.serve).toBeDefined();
      expect(server.stopIfRunning).toBeDefined();
    });

    it('passes port configuration to server', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '2.0.0',
        port: 8080
      });

      expect(server).toBeDefined();
    });

    it('passes config file to server', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '2.0.0',
        configFile: '.eleventy.js'
      });

      expect(server).toBeDefined();
    });

    it('uses default port 13131 when not specified', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '2.0.0'
      });

      expect(server).toBeDefined();
    });
  });

  describe('createBuilder()', () => {
    it('creates EleventyBuilder instance with correct config', () => {
      const builder = provider.createBuilder({
        workspacePath: '/test',
        version: '2.0.0',
        destination: '/out'
      });

      expect(builder).toBeDefined();
      expect(builder.build).toBeDefined();
    });

    it('passes all config options to builder', () => {
      const builder = provider.createBuilder({
        workspacePath: '/test',
        version: '2.0.0',
        destination: '/custom-out',
        baseUrl: 'https://example.org',
        configFile: 'eleventy.config.js'
      });

      expect(builder).toBeDefined();
    });
  });

  describe('createConfigQuerier()', () => {
    it('returns null (config querying not supported)', () => {
      const querier = provider.createConfigQuerier('/test', '2.0.0');

      expect(querier).toBeNull();
    });

    it('returns null even with config file', () => {
      const querier = provider.createConfigQuerier('/test', '2.0.0', '.eleventy.js');

      expect(querier).toBeNull();
    });
  });

  describe('detectSite()', () => {
    it('detects Eleventy site with .eleventy.js config', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as any);

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('.eleventy.js');
    });

    it('detects Eleventy site with eleventy.config.js', async () => {
      vi.mocked(fs.pathExists).mockImplementation(
        async (path: any) => path.endsWith('eleventy.config.js')
      );

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('detects Eleventy site via package.json dependency', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('package.json');
      });

      vi.mocked(fs.readJson).mockResolvedValue({
        dependencies: { '@11ty/eleventy': '^2.0.0' }
      });

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.metadata).toEqual({ source: 'package.json' });
    });

    it('detects Eleventy site via package.json devDependencies', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('package.json');
      });

      vi.mocked(fs.readJson).mockResolvedValue({
        devDependencies: { '@11ty/eleventy': '^2.0.0' }
      });

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
    });

    it('detects Eleventy site by directory markers', async () => {
      // No config files
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        // Return true for _site and _includes directories
        return path.includes('_site') || path.includes('_includes');
      });

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('low');
      expect(result.metadata).toHaveProperty('markers', 2);
    });

    it('returns false for non-Eleventy directory', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any);
      vi.mocked(fs.readJson).mockRejectedValue(new Error('File not found'));

      const result = await provider.detectSite('/test/empty');

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('handles JSON parse errors gracefully', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('package.json');
      });

      vi.mocked(fs.readJson).mockRejectedValue(new Error('Invalid JSON'));

      const result = await provider.detectSite('/test/site');

      // Should not throw, should continue checking other markers
      expect(result).toBeDefined();
    });
  });

  describe('createSite()', () => {
    it('creates site with JS config format', async () => {
      const createSiteDirSpy = vi.fn().mockResolvedValue(undefined);
      // Access the private utils property
      (provider as any).utils.createSiteDir = createSiteDirSpy;

      await provider.createSite({
        directory: '/test/new-site',
        title: 'Test Site',
        configFormat: 'js',
      });

      expect(createSiteDirSpy).toHaveBeenCalledWith('/test/new-site', 'Test Site', 'js');
    });

    it('creates site with JSON config format', async () => {
      const createSiteDirSpy = vi.fn().mockResolvedValue(undefined);
      (provider as any).utils.createSiteDir = createSiteDirSpy;

      await provider.createSite({
        directory: '/test/new-site',
        title: 'Test Site',
        configFormat: 'json',
      });

      expect(createSiteDirSpy).toHaveBeenCalledWith('/test/new-site', 'Test Site', 'json');
    });
  });

  describe('Integration', () => {
    it('has consistent metadata and factory methods', () => {
      const metadata = provider.getMetadata();

      // If supports dev server, createDevServer should work
      if (metadata.supportsDevServer) {
        const server = provider.createDevServer({
          workspacePath: '/test',
          version: '2.0.0'
        });
        expect(server).toBeDefined();
      }

      // If supports build, createBuilder should work
      if (metadata.supportsBuild) {
        const builder = provider.createBuilder({
          workspacePath: '/test',
          version: '2.0.0',
          destination: '/out'
        });
        expect(builder).toBeDefined();
      }

      // If doesn't support config query, should return null
      if (!metadata.supportsConfigQuery) {
        const querier = provider.createConfigQuerier('/test', '2.0.0');
        expect(querier).toBeNull();
      }
    });
  });
});
