import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HugoServer } from '../hugo-server.js';
import { createMockSSGProviderDependencies } from '../../../../test/mocks/ssg-dependencies.js';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';

// Create mock process factory
const createMockProcess = () => {
  const mockProcess: Partial<ChildProcess> = {
    stdout: {
      on: vi.fn(),
      setEncoding: vi.fn(),
      resume: vi.fn(),
      emit: vi.fn(),
    } as any,
    stderr: {
      on: vi.fn(),
      setEncoding: vi.fn(),
    } as any,
    on: vi.fn(),
    kill: vi.fn(),
  };
  return mockProcess as ChildProcess;
};

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(() => true),
  },
}));

describe('HugoServer', () => {
  let mockDeps: ReturnType<typeof createMockSSGProviderDependencies>;
  let mockProcess: ChildProcess;

  beforeEach(async () => {
    mockDeps = createMockSSGProviderDependencies();
    // Add hugoServeDraftMode as a writable property
    (mockDeps.appConfig as any).hugoServeDraftMode = false;
    mockProcess = createMockProcess();
    vi.mocked(spawn).mockReturnValue(mockProcess);
    vi.clearAllMocks();

    // Ensure fs.existsSync returns true by default
    const fs = await import('fs-extra');
    vi.mocked(fs.default.existsSync).mockReturnValue(true);
  });

  describe('Constructor', () => {
    it('initializes with config and dependencies', () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );
      expect(server).toBeDefined();
      expect(server.getCurrentProcess()).toBeUndefined();
    });
  });

  describe('serve()', () => {
    it('spawns hugo server with correct arguments', async () => {
      const server = new HugoServer(
        { workspacePath: '/test/workspace', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(mockDeps.pathHelper.getSSGBinForVer).toHaveBeenCalledWith('hugo', '0.120.0');
      const spawnCall = vi.mocked(spawn).mock.calls[0];
      expect(spawnCall[1]).toEqual(['server', '--bind', '0.0.0.0', '--port', '13131', '--disableFastRender']);
      expect(spawnCall[2]).toEqual({ cwd: '/test/workspace' });
    });

    it('handles error when sendToRenderer fails on initial serverDown', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(mockDeps.windowAdapter.sendToRenderer).mockImplementationOnce(() => {
        throw new Error('IPC failed');
      });

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(consoleLogSpy).toHaveBeenCalledWith('Failed to send serverDown message:', expect.any(Error));
      expect(server.getCurrentProcess()).toBeDefined();
      consoleLogSpy.mockRestore();
    });

    it('includes --buildDrafts when draft mode is enabled', async () => {
      (mockDeps.appConfig as any).hugoServeDraftMode = true;

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--buildDrafts']),
        expect.any(Object)
      );
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        'Server Draft Mode Enabled...'
      );
    });

    it('includes --config when custom config file is specified', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0', config: 'custom-config.toml' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--config', 'custom-config.toml']),
        expect.any(Object)
      );
    });

    it('sends serverDown event before starting', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(mockDeps.windowAdapter.sendToRenderer).toHaveBeenCalledWith('serverDown', {});
    });

    it('sends serverLive event when server starts outputting', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      // Simulate first line of output
      const stdoutOnLine = vi.mocked(mockProcess.stdout!.on);
      const lineHandler = stdoutOnLine.mock.calls.find((call) => call[0] === 'line')?.[1] as any;

      if (lineHandler) {
        lineHandler('Hugo server started');
        expect(mockDeps.windowAdapter.sendToRenderer).toHaveBeenCalledWith('serverLive', {});
      }
    });

    it('handles error when sendToRenderer fails on serverLive', async () => {
      vi.mocked(mockDeps.windowAdapter.sendToRenderer)
        .mockImplementationOnce(() => {}) // First call for serverDown succeeds
        .mockImplementationOnce(() => {
          throw new Error('IPC failed on serverLive');
        });

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      // Simulate first line of output to trigger serverLive
      const stdoutOnLine = vi.mocked(mockProcess.stdout!.on);
      const lineHandler = stdoutOnLine.mock.calls.find((call) => call[0] === 'line')?.[1] as any;

      if (lineHandler) {
        lineHandler('Hugo server started');
        expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
          'Failed to send serverLive message.'
        );
      }
    });

    it('logs subsequent output lines after the first', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      const stdoutOnLine = vi.mocked(mockProcess.stdout!.on);
      const lineHandler = stdoutOnLine.mock.calls.find((call) => call[0] === 'line')?.[1] as any;

      if (lineHandler) {
        // First line triggers serverLive
        lineHandler('Hugo server started');
        // Second and subsequent lines should be logged
        lineHandler('Web Server is available at http://localhost:13131/');
        lineHandler('Press Ctrl+C to stop');

        expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
          'Web Server is available at http://localhost:13131/'
        );
        expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith('Press Ctrl+C to stop');
      }
    });

    it('attaches stderr listener for errors', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(mockProcess.stderr!.on).toHaveBeenCalledWith('data', expect.any(Function));

      // Simulate stderr data
      const stderrOnData = vi.mocked(mockProcess.stderr!.on);
      const dataHandler = stderrOnData.mock.calls.find((call) => call[0] === 'data')?.[1] as any;

      if (dataHandler) {
        dataHandler('Error message');
        expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
          'Hugo Server Error: Error message'
        );
      }
    });

    it('attaches close listener', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(mockProcess.on).toHaveBeenCalledWith('close', expect.any(Function));

      // Simulate process close
      const processOn = vi.mocked(mockProcess.on);
      const closeHandler = processOn.mock.calls.find((call: any) => call[0] === 'close')?.[1] as any;

      if (closeHandler) {
        closeHandler(0);
        expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
          'Hugo Server Closed: 0'
        );
      }
    });

    it('throws error when hugo binary does not exist', async () => {
      const fs = await import('fs-extra');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await expect(server.serve()).rejects.toThrow(
        'Could not find hugo executable for version 0.120.0'
      );
    });

    it('stores process reference after starting', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      expect(server.getCurrentProcess()).toBeUndefined();

      await server.serve();

      expect(server.getCurrentProcess()).toBe(mockProcess);
    });

    it('throws error when process has no stdout/stderr', async () => {
      const processWithoutStreams: Partial<ChildProcess> = {
        stdout: null,
        stderr: null,
        on: vi.fn(),
        kill: vi.fn(),
      };
      vi.mocked(spawn).mockReturnValue(processWithoutStreams as ChildProcess);

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await expect(server.serve()).rejects.toThrow(
        'Failed to get stdout/stderr from Hugo process'
      );
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        'Hugo Server failed to start.'
      );
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        'Failed to get stdout/stderr from Hugo process'
      );
    });

    it('handles spawn error and sends serverDown', async () => {
      const spawnError = new Error('spawn ENOENT');
      vi.mocked(spawn).mockImplementation(() => {
        throw spawnError;
      });

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await expect(server.serve()).rejects.toThrow('spawn ENOENT');

      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith('Hugo Server failed to start.');
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith('spawn ENOENT');
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith('Sending serverDown.');
      expect(mockDeps.windowAdapter.sendToRenderer).toHaveBeenCalledWith('serverDown', {});
    });

    it('handles spawn error and failure to send serverDown', async () => {
      const spawnError = new Error('spawn ENOENT');
      vi.mocked(spawn).mockImplementation(() => {
        throw spawnError;
      });
      vi.mocked(mockDeps.windowAdapter.sendToRenderer)
        .mockImplementationOnce(() => {}) // First call for initial serverDown succeeds
        .mockImplementationOnce(() => {
          throw new Error('IPC failed');
        });

      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await expect(server.serve()).rejects.toThrow('spawn ENOENT');

      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        'Failed to send serverDown message.'
      );
    });

    it('handles emitLines with multiple lines in data chunk', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      // Get the data handler attached to stdout
      const stdoutOnData = vi.mocked(mockProcess.stdout!.on);
      const dataHandler = stdoutOnData.mock.calls.find((call) => call[0] === 'data')?.[1] as any;

      expect(dataHandler).toBeDefined();

      if (dataHandler) {
        // Simulate data with multiple newlines
        dataHandler('Line 1\nLine 2\nLine 3\n');

        // Verify that 'line' event was emitted for each line
        const emitCalls = vi.mocked(mockProcess.stdout!.emit).mock.calls;
        const lineCalls = emitCalls.filter((call) => call[0] === 'line');

        expect(lineCalls.length).toBeGreaterThanOrEqual(3);
        expect(lineCalls[0][1]).toBe('Line 1');
        expect(lineCalls[1][1]).toBe('Line 2');
        expect(lineCalls[2][1]).toBe('Line 3');
      }
    });

    it('handles emitLines with partial lines and end event', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      const stdoutOnData = vi.mocked(mockProcess.stdout!.on);
      const dataHandler = stdoutOnData.mock.calls.find((call) => call[0] === 'data')?.[1] as any;
      const endHandler = stdoutOnData.mock.calls.find((call) => call[0] === 'end')?.[1] as any;

      expect(dataHandler).toBeDefined();
      expect(endHandler).toBeDefined();

      if (dataHandler && endHandler) {
        // Simulate data without trailing newline
        dataHandler('Partial line without newline');

        // Simulate end event - should emit the remaining backlog
        endHandler();

        const emitCalls = vi.mocked(mockProcess.stdout!.emit).mock.calls;
        const lineCalls = emitCalls.filter((call) => call[0] === 'line');

        // Should have emitted the partial line on end
        expect(lineCalls.some((call) => call[1] === 'Partial line without newline')).toBe(true);
      }
    });
  });

  describe('stopIfRunning()', () => {
    it('does nothing when no server is running', () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      server.stopIfRunning();

      expect(mockDeps.outputConsole.appendLine).not.toHaveBeenCalledWith(
        'Stopping Hugo Server...'
      );
    });

    it('kills process when server is running', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();
      server.stopIfRunning();

      expect(mockProcess.kill).toHaveBeenCalled();
      expect(mockDeps.outputConsole.appendLine).toHaveBeenCalledWith(
        'Stopping Hugo Server...'
      );
    });

    it('clears process reference after stopping', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();
      expect(server.getCurrentProcess()).toBeDefined();

      server.stopIfRunning();
      expect(server.getCurrentProcess()).toBeUndefined();
    });
  });

  describe('getCurrentProcess()', () => {
    it('returns undefined initially', () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      expect(server.getCurrentProcess()).toBeUndefined();
    });

    it('returns process after serve is called', async () => {
      const server = new HugoServer(
        { workspacePath: '/test', hugover: '0.120.0' },
        mockDeps.pathHelper,
        mockDeps.appConfig,
        mockDeps.windowAdapter,
        mockDeps.outputConsole
      );

      await server.serve();

      expect(server.getCurrentProcess()).toBe(mockProcess);
    });
  });
});
