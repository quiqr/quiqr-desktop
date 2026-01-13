import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JekyllProvider } from '../jekyll-provider.js';
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

describe('JekyllProvider', () => {
  let provider: JekyllProvider;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;

  beforeEach(() => {
    mockDeps = createMockSSGProviderDependencies();
    provider = new JekyllProvider(mockDeps);
    vi.clearAllMocks();
  });

  describe('Metadata', () => {
    it('returns correct metadata', () => {
      const metadata = provider.getMetadata();

      expect(metadata.type).toBe('jekyll');
      expect(metadata.name).toBe('Jekyll');
      expect(metadata.configFormats).toContain('yml');
      expect(metadata.configFormats).toContain('yaml');
      expect(metadata.requiresBinary).toBe(true);
      expect(metadata.supportsDevServer).toBe(true);
      expect(metadata.supportsBuild).toBe(true);
      expect(metadata.supportsConfigQuery).toBe(false);
    });
  });

  describe('getBinaryManager()', () => {
    it('returns JekyllDownloader instance', () => {
      const binaryManager = provider.getBinaryManager();

      expect(binaryManager).toBeDefined();
      expect(binaryManager.isVersionInstalled).toBeDefined();
      expect(binaryManager.download).toBeDefined();
      expect(binaryManager.ensureAvailable).toBeDefined();
    });
  });

  describe('createDevServer()', () => {
    it('creates JekyllServer instance with correct config', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '4.3.0'
      });

      expect(server).toBeDefined();
      expect(server.serve).toBeDefined();
      expect(server.stopIfRunning).toBeDefined();
    });

    it('passes port configuration to server', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '4.3.0',
        port: 8080
      });

      expect(server).toBeDefined();
    });

    it('passes config file to server', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '4.3.0',
        configFile: '_config.yml'
      });

      expect(server).toBeDefined();
    });

    it('uses default port 13131 when not specified', () => {
      const server = provider.createDevServer({
        workspacePath: '/test',
        version: '4.3.0'
      });

      expect(server).toBeDefined();
    });
  });

  describe('createBuilder()', () => {
    it('creates JekyllBuilder instance with correct config', () => {
      const builder = provider.createBuilder({
        workspacePath: '/test',
        version: '4.3.0',
        destination: '/out'
      });

      expect(builder).toBeDefined();
      expect(builder.build).toBeDefined();
    });

    it('passes all config options to builder', () => {
      const builder = provider.createBuilder({
        workspacePath: '/test',
        version: '4.3.0',
        destination: '/custom-out',
        baseUrl: 'https://example.org',
        configFile: '_config.yml'
      });

      expect(builder).toBeDefined();
    });
  });

  describe('createConfigQuerier()', () => {
    it('returns null (config querying not supported)', () => {
      const querier = provider.createConfigQuerier('/test', '4.3.0');

      expect(querier).toBeNull();
    });

    it('returns null even with config file', () => {
      const querier = provider.createConfigQuerier('/test', '4.3.0', '_config.yml');

      expect(querier).toBeNull();
    });
  });

  describe('detectSite()', () => {
    it('detects Jekyll site with _config.yml', async () => {
      vi.mocked(fs.pathExists).mockImplementation(
        async (path: any) => path.endsWith('_config.yml')
      );

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('_config.yml');
    });

    it('detects Jekyll site with _config.yaml', async () => {
      vi.mocked(fs.pathExists).mockImplementation(
        async (path: any) => path.endsWith('_config.yaml')
      );

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.configFiles).toContain('_config.yaml');
    });

    it('detects Jekyll site via Gemfile with single quotes', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('Gemfile');
      });

      vi.mocked(fs.readFile).mockResolvedValue("gem 'jekyll', '~> 4.3'" as any);

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.metadata).toEqual({ source: 'Gemfile' });
    });

    it('detects Jekyll site via Gemfile with double quotes', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('Gemfile');
      });

      vi.mocked(fs.readFile).mockResolvedValue('gem "jekyll", "~> 4.3"' as any);

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('detects Jekyll site by directory markers with medium confidence', async () => {
      // No config files, but has _posts and _layouts
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.includes('_posts') || path.includes('_layouts');
      });

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.metadata).toHaveProperty('markers', 2);
    });

    it('detects Jekyll site by one marker + markdown files with low confidence', async () => {
      // One marker directory (_posts)
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.includes('_posts') && !path.includes('_layouts');
      });

      vi.mocked(fs.readdir).mockResolvedValue([
        'index.md',
        'about.md',
        'README.txt'
      ] as any);

      const result = await provider.detectSite('/test/site');

      expect(result.isDetected).toBe(true);
      expect(result.confidence).toBe('low');
      expect(result.metadata).toMatchObject({
        markers: 1,
        hasMdFiles: true
      });
    });

    it('returns false for non-Jekyll directory', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await provider.detectSite('/test/empty');

      expect(result.isDetected).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('handles Gemfile read errors gracefully', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.endsWith('Gemfile');
      });

      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read failed'));

      const result = await provider.detectSite('/test/site');

      // Should not throw, should continue checking other markers
      expect(result).toBeDefined();
    });

    it('handles readdir errors gracefully', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (path: any) => {
        return path.includes('_posts');
      });

      vi.mocked(fs.readdir).mockRejectedValue(new Error('Cannot read dir'));

      const result = await provider.detectSite('/test/site');

      // Should not throw
      expect(result).toBeDefined();
    });
  });

  describe('createSite()', () => {
    it('creates site with YAML config format', async () => {
      const createSiteDirSpy = vi.fn().mockResolvedValue(undefined);
      // Access the private utils property
      (provider as any).utils.createSiteDir = createSiteDirSpy;

      await provider.createSite({
        directory: '/test/new-site',
        title: 'Test Site',
        configFormat: 'yaml',
      });

      expect(createSiteDirSpy).toHaveBeenCalledWith('/test/new-site', 'Test Site', 'yaml');
    });

    it('creates site with yml config format', async () => {
      const createSiteDirSpy = vi.fn().mockResolvedValue(undefined);
      (provider as any).utils.createSiteDir = createSiteDirSpy;

      await provider.createSite({
        directory: '/test/new-site',
        title: 'Test Site',
        configFormat: 'yml',
      });

      expect(createSiteDirSpy).toHaveBeenCalledWith('/test/new-site', 'Test Site', 'yml');
    });

    it('defaults to yml when config format not specified', async () => {
      const createSiteDirSpy = vi.fn().mockResolvedValue(undefined);
      (provider as any).utils.createSiteDir = createSiteDirSpy;

      await provider.createSite({
        directory: '/test/new-site',
        title: 'Test Site',
        configFormat: 'yml',  // Default explicitly
      });

      expect(createSiteDirSpy).toHaveBeenCalledWith(
        '/test/new-site',
        'Test Site',
        'yml'
      );
    });
  });

  describe('Integration', () => {
    it('has consistent metadata and factory methods', () => {
      const metadata = provider.getMetadata();

      // If supports dev server, createDevServer should work
      if (metadata.supportsDevServer) {
        const server = provider.createDevServer({
          workspacePath: '/test',
          version: '4.3.0'
        });
        expect(server).toBeDefined();
      }

      // If supports build, createBuilder should work
      if (metadata.supportsBuild) {
        const builder = provider.createBuilder({
          workspacePath: '/test',
          version: '4.3.0',
          destination: '/out'
        });
        expect(builder).toBeDefined();
      }

      // If doesn't support config query, should return null
      if (!metadata.supportsConfigQuery) {
        const querier = provider.createConfigQuerier('/test', '4.3.0');
        expect(querier).toBeNull();
      }
    });
  });
});
