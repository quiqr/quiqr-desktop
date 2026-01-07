import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HugoConfig } from '../hugo-config.js';
import { createMockPathHelper } from '../../../../test/mocks/ssg-dependencies.js';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Create mock process with EventEmitter functionality
const createMockProcess = () => {
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const process = new EventEmitter() as any;

  process.stdout = stdout;
  process.stderr = stderr;

  return { process, stdout, stderr };
};

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(() => true),
  },
}));

describe('HugoConfig', () => {
  let mockPathHelper: ReturnType<typeof createMockPathHelper>;

  beforeEach(async () => {
    mockPathHelper = createMockPathHelper();
    vi.clearAllMocks();

    // Ensure fs.existsSync returns true by default
    const fs = await import('fs-extra');
    vi.mocked(fs.default.existsSync).mockReturnValue(true);
  });

  describe('Constructor', () => {
    it('initializes with config and pathHelper', () => {
      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );
      expect(config).toBeDefined();
    });
  });

  describe('getConfig()', () => {
    it('returns config object with empty config and mounts', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfig();

      // Simulate hugo config mounts output
      stdout.emit('data', '{\n');
      stdout.emit('data', '  "mounts": []\n');
      stdout.emit('data', '}\n');
      process.emit('close', 0);

      const result = await resultPromise;

      expect(result.config).toEqual({});
      expect(result.mounts).toBeDefined();
    });

    it('parses mounts from hugo config mounts command', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfig();

      // Simulate hugo config mounts output with actual mounts
      stdout.emit('data', '{\n');
      stdout.emit('data', '  "mounts": [{"source": "content", "target": "content"}]\n');
      stdout.emit('data', '}\n');
      process.emit('close', 0);

      const result = await resultPromise;

      expect(result.mounts).toEqual({ mounts: [{ source: 'content', target: 'content' }] });
    });

    it('returns empty array when binary does not exist', async () => {
      const fs = await import('fs-extra');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const result = await config.getConfig();

      expect(result.mounts).toEqual([]);
    });

    it('spawns hugo with correct arguments', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test/workspace', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfig();

      stdout.emit('data', '{}\n');
      process.emit('close', 0);

      await resultPromise;

      expect(mockPathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      const spawnCall = vi.mocked(spawn).mock.calls[0];
      expect(spawnCall[1]).toEqual(['config', 'mounts']);
      expect(spawnCall[2]).toEqual({ cwd: '/test/workspace' });
    });
  });

  describe('getConfigLines()', () => {
    it('returns array of config lines', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfigLines();

      // Simulate hugo config output
      stdout.emit('data', 'title = "My Site"\n');
      stdout.emit('data', 'baseURL = "https://example.org"\n');
      process.emit('close', 0);

      const lines = await resultPromise;

      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
    });

    it('returns empty array when binary does not exist', async () => {
      const fs = await import('fs-extra');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const lines = await config.getConfigLines();

      expect(lines).toEqual([]);
    });

    it('spawns hugo config command', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test/workspace', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfigLines();

      stdout.emit('data', 'config output\n');
      process.emit('close', 0);

      await resultPromise;

      expect(mockPathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      const spawnCall = vi.mocked(spawn).mock.calls[0];
      expect(spawnCall[1]).toEqual(['config']);
      expect(spawnCall[2]).toEqual({ cwd: '/test/workspace' });
    });

    it('returns empty array on error', async () => {
      const { process, stderr } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfigLines();

      stderr.emit('data', 'Error reading config\n');
      process.emit('close', 1);

      const lines = await resultPromise;

      expect(lines).toEqual([]);
    });
  });

  describe('configMountsAsObject()', () => {
    it('extracts JSON from hugo config mounts output', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.configMountsAsObject();

      // Simulate output with extra lines before and after JSON
      stdout.emit('data', 'Some preamble text\n');
      stdout.emit('data', '{\n');
      stdout.emit('data', '  "mounts": [{"source": "static", "target": "static"}]\n');
      stdout.emit('data', '}\n');
      stdout.emit('data', 'Some trailing text\n');
      process.emit('close', 0);

      const result = await resultPromise;

      expect(result).toEqual({ mounts: [{ source: 'static', target: 'static' }] });
    });

    it('returns empty array when no JSON found', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.configMountsAsObject();

      // No JSON brackets in output
      stdout.emit('data', 'No JSON here\n');
      process.emit('close', 0);

      const result = await resultPromise;

      expect(result).toEqual([]);
    });

    it('returns empty array when binary does not exist', async () => {
      const fs = await import('fs-extra');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const result = await config.configMountsAsObject();

      expect(result).toEqual([]);
    });
  });

  describe('configLines()', () => {
    it('splits output into lines', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.configLines();

      stdout.emit('data', 'line 1\nline 2\nline 3\n');
      process.emit('close', 0);

      const lines = await resultPromise;

      expect(lines).toHaveLength(4); // 3 lines + empty line from final \n
      expect(lines[0]).toBe('line 1');
      expect(lines[1]).toBe('line 2');
      expect(lines[2]).toBe('line 3');
    });
  });

  describe('Error Handling', () => {
    it('rejects on spawn error', async () => {
      const { process } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfig();

      process.emit('error', new Error('Spawn failed'));

      await expect(resultPromise).rejects.toThrow('Spawn failed');
    });

    it('rejects when hugo returns non-zero exit code for mounts', async () => {
      const { process, stderr } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfig();

      stderr.emit('data', 'Config error\n');
      process.emit('close', 1);

      await expect(resultPromise).rejects.toThrow('Hugo command failed with code 1');
    });
  });

  describe('Configuration with custom config file', () => {
    it('uses default behavior when no custom config specified', async () => {
      const { process, stdout } = createMockProcess();
      vi.mocked(spawn).mockReturnValue(process as ChildProcess);

      const config = new HugoConfig(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockPathHelper
      );

      const resultPromise = config.getConfigLines();

      stdout.emit('data', 'config\n');
      process.emit('close', 0);

      await resultPromise;

      expect(mockPathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      expect(spawn).toHaveBeenCalled();
    });
  });
});
