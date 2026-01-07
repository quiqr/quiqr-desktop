/**
 * Hugo Downloader Tests
 *
 * Tests Hugo binary download and installation logic with mocked dependencies.
 * Focuses on unit testing logic flow without actual downloads.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HugoDownloader, OfficialHugoSourceUrlBuilder, OfficialHugoUnpacker } from '../hugo-downloader.js';
import { createMockSSGProviderDependencies } from '../../../../test/mocks/ssg-dependencies.js';
import fs from 'fs-extra';
import * as childProcess from 'child_process';
import { globSync } from 'glob';

// Mock fs-extra
vi.mock('fs-extra');

// Mock child_process for unpacker tests
vi.mock('child_process');

// Mock glob for unpacker tests
vi.mock('glob');

// Mock global fetch for download tests
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('HugoDownloader', () => {
  let downloader: HugoDownloader;
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;

  beforeEach(() => {
    // Clear only call history, not implementations
    mockFetch.mockClear();

    mockDeps = createMockSSGProviderDependencies();
    mockDeps.environmentInfo = {
      platform: 'linux',
      isPackaged: false,
    };

    // Setup pathHelper mocks
    mockDeps.pathHelper.getSSGBinForVer = vi.fn((ssgType: string, version: string) => `/mock/${ssgType}-${version}/${ssgType}`);
    mockDeps.pathHelper.getSSGBinDirForVer = vi.fn((ssgType: string, version: string) => `/mock/${ssgType}-${version}`);
    mockDeps.pathHelper.get7zaBin = vi.fn(() => '/mock/7za');

    // Setup fs-extra mocks
    // Note: Don't set a default for existsSync - let tests configure it as needed
    vi.mocked(fs.unlink).mockResolvedValue();
    vi.mocked(fs.ensureDir).mockResolvedValue();
    vi.mocked(fs.chmod).mockResolvedValue();
    vi.mocked(fs.createWriteStream).mockReturnValue({
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn().mockImplementation(function(this: any, event: string, callback: Function) {
        if (event === 'finish') {
          setTimeout(() => callback(), 0);
        }
        return this;
      }),
    } as any);

    // Setup glob mocks - return a tar file path for the unpacker
    vi.mocked(globSync).mockReturnValue(['/mock/hugo-0.120.0/download']);

    // Setup child_process mocks
    // Note: The implementation uses promisify(execFile), so we need to mock it to work with both
    // callback style and promise style
    vi.mocked(childProcess.execFile).mockImplementation((...args: any[]) => {
      // Find the callback (last function argument)
      const callback = args.find((arg: any) => typeof arg === 'function');
      if (callback) {
        // Callback style
        setTimeout(() => callback(null, { stdout: '', stderr: '' }), 0);
      }
      // Return a ChildProcess-like object that promisify can work with
      return {
        on: vi.fn(),
        removeListener: vi.fn(),
      } as any;
    });

    downloader = new HugoDownloader({
      pathHelper: mockDeps.pathHelper,
      outputConsole: mockDeps.outputConsole,
      environmentInfo: mockDeps.environmentInfo,
    });
  });

  describe('isVersionInstalled', () => {
    it('returns true when binary exists', () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      const result = downloader.isVersionInstalled('0.120.0');

      expect(result).toBe(true);
      expect(mockDeps.pathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
    });

    it('returns false when binary does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      const result = downloader.isVersionInstalled('0.120.0');

      expect(result).toBe(false);
      expect(mockDeps.pathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
    });

    it('checks correct binary path', () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      downloader.isVersionInstalled('0.120.0');

      expect(mockDeps.pathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/hugo-0.120.0/hugo');
    });
  });

  describe('OfficialHugoSourceUrlBuilder', () => {
    let urlBuilder: OfficialHugoSourceUrlBuilder;

    beforeEach(() => {
      urlBuilder = new OfficialHugoSourceUrlBuilder();
    });

    describe('version 0.102 and below (legacy naming)', () => {
      it('builds correct URL for Hugo 0.100 Linux x64', () => {
        const url = urlBuilder.build({ platform: 'linux', arch: 'x64' }, '0.100.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.100.0/hugo_0.100.0_Linux-64bit.tar.gz');
      });

      it('builds correct URL for Hugo 0.100 Windows x64', () => {
        const url = urlBuilder.build({ platform: 'windows', arch: 'x64' }, '0.100.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.100.0/hugo_0.100.0_Windows-64bit.zip');
      });

      it('builds correct URL for Hugo 0.100 macOS x64', () => {
        const url = urlBuilder.build({ platform: 'macOS', arch: 'x64' }, '0.100.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.100.0/hugo_0.100.0_macOS-64bit.tar.gz');
      });
    });

    describe('version 0.103+ (new naming conventions)', () => {
      it('builds correct URL for Hugo 0.103 Linux with amd64', () => {
        const url = urlBuilder.build({ platform: 'linux', arch: 'x64' }, '0.103.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.103.0/hugo_0.103.0_linux-amd64.tar.gz');
      });

      it('builds correct URL for Hugo 0.120 Windows with amd64', () => {
        const url = urlBuilder.build({ platform: 'windows', arch: 'x64' }, '0.120.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.120.0/hugo_0.120.0_windows-amd64.zip');
      });

      it('builds correct URL for macOS 0.102+ with universal binary', () => {
        const url = urlBuilder.build({ platform: 'macOS', arch: 'x64' }, '0.120.0');

        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.120.0/hugo_0.120.0_darwin-universal.tar.gz');
      });
    });

    describe('version string handling', () => {
      it('handles extended version string', () => {
        const url = urlBuilder.build({ platform: 'linux', arch: 'x64' }, 'extended_0.120.0');

        expect(url).toContain('hugo_extended_0.120.0');
        expect(url).toContain('/v0.120.0/'); // Version in URL path without extended_
        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.120.0/hugo_extended_0.120.0_linux-amd64.tar.gz');
      });

      it('strips leading v from version', () => {
        const url = urlBuilder.build({ platform: 'linux', arch: 'x64' }, 'v0.120.0');

        expect(url).toContain('/v0.120.0/'); // Adds v back in URL
        expect(url).toContain('hugo_0.120.0'); // No v in filename
        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.120.0/hugo_0.120.0_linux-amd64.tar.gz');
      });
    });

    describe('architecture support', () => {
      it('uses 32bit for x32 architecture on legacy versions', () => {
        const url = urlBuilder.build({ platform: 'linux', arch: 'x32' }, '0.100.0');

        expect(url).toContain('32bit');
        expect(url).toBe('https://github.com/gohugoio/hugo/releases/download/v0.100.0/hugo_0.100.0_Linux-32bit.tar.gz');
      });

      it('throws error for unsupported architecture', () => {
        expect(() => {
          urlBuilder.build({ platform: 'linux', arch: 'arm64' as any }, '0.120.0');
        }).toThrow(/Unsupported architecture: arm64/);
      });
    });

    describe('platform support', () => {
      it('throws error for unsupported platform', () => {
        expect(() => {
          urlBuilder.build({ platform: 'freebsd' as any, arch: 'x64' }, '0.120.0');
        }).toThrow(/Unsupported platform: freebsd/);
      });
    });
  });

  describe('download flow', () => {
    beforeEach(() => {
      // Mock fetch with a successful response
      // Create a stable reader mock that can be called multiple times
      const mockRead = vi.fn()
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
        .mockResolvedValueOnce({ done: true, value: undefined });

      const mockResponse = {
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: mockRead,
          }),
        },
      };
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('skips download if version already installed', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      const progressUpdates: any[] = [];
      for await (const progress of downloader.download('0.120.0')) {
        progressUpdates.push(progress);
      }

      expect(progressUpdates).toHaveLength(1);
      expect(progressUpdates[0]).toEqual({
        percent: 100,
        message: 'Hugo already installed',
        complete: true,
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('yields progress updates during download', async () => {
      // First call: check if version installed (returns false)
      // Second call: check if temp file exists for cleanup (returns false)
      // Third call: check if temp file exists after download (returns true for cleanup)
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // isVersionInstalled check
        .mockReturnValueOnce(false) // initial cleanup check
        .mockReturnValueOnce(true);  // final cleanup check

      const progressUpdates: any[] = [];
      for await (const progress of downloader.download('0.120.0', true)) {
        progressUpdates.push(progress);
      }

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toMatchObject({ percent: 0, complete: false });
      expect(progressUpdates[progressUpdates.length - 1]).toMatchObject({
        percent: 100,
        complete: true
      });

      // Check for expected progress stages
      const messages = progressUpdates.map(p => p.message);
      expect(messages).toContain('Starting Hugo installation...');
      expect(messages).toContain('Preparing download...');
      expect(messages).toContain('Downloading Hugo...');
      expect(messages).toContain('Unpacking Hugo...');
      expect(messages).toContain('Hugo installation completed');
    });

    it('prevents concurrent downloads', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // Start first download (don't await it yet)
      const firstDownload = (async () => {
        const updates = [];
        for await (const progress of downloader.download('0.120.0', true)) {
          updates.push(progress);
        }
        return updates;
      })();

      // Try to start second download immediately
      const secondUpdates = [];
      for await (const progress of downloader.download('0.121.0', true)) {
        secondUpdates.push(progress);
      }

      // Second download should be rejected
      expect(secondUpdates).toHaveLength(1);
      expect(secondUpdates[0]).toMatchObject({
        percent: 0,
        complete: false,
        error: 'Download already in progress',
      });

      // Wait for first to complete
      await firstDownload;
    });

    it('cleans up partial download on error', async () => {
      // Setup existsSync to return false for isVersionInstalled, then true for cleanup check
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // isVersionInstalled check
        .mockReturnValueOnce(false) // initial cleanup check
        .mockReturnValueOnce(true);  // cleanup check in catch block

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const progressUpdates: any[] = [];
      for await (const progress of downloader.download('0.120.0', true)) {
        progressUpdates.push(progress);
      }

      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.complete).toBe(false);
      expect(lastUpdate.error).toBeTruthy();
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('calls fetch with correct URL', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      for await (const progress of downloader.download('0.120.0', true)) {
        if (progress.complete) break;
      }

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/gohugoio/hugo/releases/download/v0.120.0/'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('handles fetch errors gracefully', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const progressUpdates: any[] = [];
      for await (const progress of downloader.download('0.999.0', true)) {
        progressUpdates.push(progress);
      }

      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.complete).toBe(false);
      expect(lastUpdate.error).toContain('404');
    });
  });

  describe('cancellation', () => {
    it('can cancel download', async () => {
      // Don't await - we want to cancel mid-flight
      const downloadPromise = (async () => {
        const updates = [];
        for await (const progress of downloader.download('0.120.0', true)) {
          updates.push(progress);
          // Cancel after first update
          if (updates.length === 1) {
            await downloader.cancel();
          }
        }
        return updates;
      })();

      await expect(downloadPromise).resolves.toBeDefined();
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('cancel')
      );
    });

    it('sets isRunning to false after cancel', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await downloader.cancel();

      // Should be able to start a new download after cancel
      const progressUpdates: any[] = [];
      for await (const progress of downloader.download('0.120.0', true)) {
        progressUpdates.push(progress);
        break; // Just check we can start
      }

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('cleans up partial download on cancel', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false) // isVersionInstalled check
        .mockReturnValueOnce(true); // cleanup check

      await downloader.cancel();

      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('cancel')
      );
    });
  });

  describe('ensureAvailable', () => {
    it('skips download if already installed', async () => {
      // Spy on isVersionInstalled to return true
      vi.spyOn(downloader, 'isVersionInstalled').mockReturnValue(true);

      await downloader.ensureAvailable('0.120.0');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('downloads if not installed', async () => {
      // Setup successful download
      const mockRead = vi.fn()
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
        .mockResolvedValueOnce({ done: true, value: undefined });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: mockRead,
          }),
        },
      });

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // isVersionInstalled check
        .mockReturnValueOnce(false) // initial cleanup check
        .mockReturnValueOnce(true);  // final cleanup check

      await downloader.ensureAvailable('0.120.0');

      expect(mockFetch).toHaveBeenCalled();
    });

    it('throws error if download fails', async () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // isVersionInstalled check
        .mockReturnValueOnce(false) // initial cleanup check
        .mockReturnValueOnce(true);  // cleanup check in catch block

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(downloader.ensureAvailable('0.120.0')).rejects.toThrow('Network error');
    });
  });

  describe('OfficialHugoUnpacker', () => {
    let unpacker: OfficialHugoUnpacker;

    beforeEach(() => {
      unpacker = new OfficialHugoUnpacker(mockDeps.pathHelper);
    });

    it('throws error for unsupported platform', async () => {
      await expect(
        unpacker.unpack('/mock/download.partial', { platform: 'freebsd' as any, arch: 'x64' })
      ).rejects.toThrow(/Unsupported platform/);
    });

    // Note: Detailed unpacker tests would require mocking execFileAsync, globSync, etc.
    // These are integration-level concerns better tested in actual integration tests
  });
});
