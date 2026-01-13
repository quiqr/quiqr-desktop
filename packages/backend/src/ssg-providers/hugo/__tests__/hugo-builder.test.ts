import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HugoBuilder } from '../hugo-builder.js';
import { createMockPathHelper } from '../../../../test/mocks/ssg-dependencies.js';
import { execFile } from 'child_process';

vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(() => true),
  },
}));

describe('HugoBuilder', () => {
  let mockPathHelper: ReturnType<typeof createMockPathHelper>;

  beforeEach(async () => {
    mockPathHelper = createMockPathHelper();
    vi.clearAllMocks();

    // Ensure fs.existsSync returns true by default
    const fs = await import('fs-extra');
    vi.mocked(fs.default.existsSync).mockReturnValue(true);

    // Default mock behavior - successful build
    vi.mocked(execFile).mockImplementation((_cmd, _args, _opts, callback: any) => {
      callback(null, { stdout: '', stderr: '' });
      return {} as any;
    });
  });

  describe('Constructor', () => {
    it('initializes with config and pathHelper', () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );
      expect(builder).toBeDefined();
    });
  });

  describe('build()', () => {
    it('calls execFile with correct hugo binary', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await builder.build();

      expect(mockPathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      expect(execFile).toHaveBeenCalled();
    });

    it('includes destination in arguments', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/custom-output' },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--destination', '/custom-output']),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('includes baseURL when provided', async () => {
      const builder = new HugoBuilder(
        {
          workspacePath: '/test',
          hugover: '0.120.0',
          destination: '/out',
          baseUrl: 'https://example.org',
        },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--baseURL', 'https://example.org']),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('includes config file when provided', async () => {
      const builder = new HugoBuilder(
        {
          workspacePath: '/test',
          hugover: '0.120.0',
          destination: '/out',
          config: 'custom-config.toml',
        },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--config', 'custom-config.toml']),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('includes all options when provided', async () => {
      const builder = new HugoBuilder(
        {
          workspacePath: '/test/workspace',
          hugover: '0.120.0',
          destination: '/custom-out',
          baseUrl: 'https://example.org',
          config: 'production.toml',
        },
        mockPathHelper
      );

      await builder.build();

      const call = vi.mocked(execFile).mock.calls[0];
      expect(call[1]).toEqual([
        '--destination',
        '/custom-out',
        '--config',
        'production.toml',
        '--baseURL',
        'https://example.org',
      ]);
      expect(call[2]).toMatchObject({
        cwd: '/test/workspace',
        windowsHide: true,
        timeout: 60000,
      });
    });

    it('uses correct working directory', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test/custom-workspace', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ cwd: '/test/custom-workspace' }),
        expect.any(Function)
      );
    });

    it('sets windowsHide to true', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ windowsHide: true }),
        expect.any(Function)
      );
    });

    it('sets timeout to 60 seconds', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await builder.build();

      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ timeout: 60000 }),
        expect.any(Function)
      );
    });

    it('throws error when hugo binary does not exist', async () => {
      const fs = await import('fs-extra');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await expect(builder.build()).rejects.toThrow(
        'Could not find hugo executable for version 0.120.0'
      );
    });

    it('rejects when hugo command fails', async () => {
      const buildError = new Error('Hugo build failed');
      vi.mocked(execFile).mockImplementation((_cmd, _args, _opts, callback: any) => {
        callback(buildError);
        return {} as any;
      });

      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await expect(builder.build()).rejects.toThrow('Hugo build failed');
    });

    it('resolves successfully on successful build', async () => {
      vi.mocked(execFile).mockImplementation((_cmd, _args, _opts, callback: any) => {
        callback(null, { stdout: 'Build complete', stderr: '' });
        return {} as any;
      });

      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: '0.120.0', destination: '/out' },
        mockPathHelper
      );

      await expect(builder.build()).resolves.toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles version with extended prefix', async () => {
      const builder = new HugoBuilder(
        { workspacePath: '/test', hugover: 'extended_0.120.0', destination: '/out' },
        mockPathHelper
      );

      await builder.build();

      expect(mockPathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', 'extended_0.120.0');
    });

    it('handles paths with spaces', async () => {
      const builder = new HugoBuilder(
        {
          workspacePath: '/test/my workspace',
          hugover: '0.120.0',
          destination: '/output folder',
        },
        mockPathHelper
      );

      await builder.build();

      const call = vi.mocked(execFile).mock.calls[0];
      expect(call[1]).toContain('/output folder');
      expect(call[2]).toMatchObject({ cwd: '/test/my workspace' });
    });
  });
});
