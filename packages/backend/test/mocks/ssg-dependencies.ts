/**
 * SSG Provider Mock Dependencies
 *
 * Mock utilities specifically for testing SSG providers.
 * These mocks simulate PathHelper, EnvironmentInfo, and other SSG-specific dependencies.
 */

import { vi } from 'vitest';
import type {
  PathHelper,
  EnvironmentInfo,
  PathHelperConfig,
} from '../../src/utils/path-helper.js';
import type {
  SSGProviderDependencies,
  DownloadProgress,
} from '../../src/ssg-providers/types.js';
import type {
  OutputConsole,
  WindowAdapter,
  ShellAdapter,
  AppInfoAdapter,
} from '../../src/adapters/types.js';
import type { AppConfig } from '../../src/config/app-config.js';
import path from 'path';

/**
 * Create a mock PathHelper with SSG-specific methods
 */
export function createMockPathHelper(overrides?: Partial<PathHelper>): PathHelper {
  const mockPathHelper = {
    // Basic paths
    getRoot: vi.fn(() => '/mock/quiqr'),
    getTempDir: vi.fn(() => '/mock/quiqr/temp'),
    getSiteRoot: vi.fn((siteKey: string) => `/mock/quiqr/sites/${siteKey}`),
    getSiteRootMountPath: vi.fn(() => undefined),
    getSiteDefaultPublishDir: vi.fn(
      (siteKey: string, publishKey: string) => `/mock/quiqr/sites/${siteKey}/publish/${publishKey}`
    ),
    getPublishReposRoot: vi.fn(() => '/mock/quiqr/sitesRepos'),

    // SSG-specific paths
    getSSGBinRoot: vi.fn((ssgType: string) => `/mock/quiqr/tools/${ssgType}bin`),
    getSSGBinDirForVer: vi.fn(
      (ssgType: string, version: string) => `/mock/quiqr/tools/${ssgType}bin/${version}`
    ),
    getSSGBinForVer: vi.fn((ssgType: string, version: string) => {
      const platform = process.platform.toLowerCase();
      const binDir = `/mock/quiqr/tools/${ssgType}bin/${version}`;

      if (ssgType.toLowerCase() === 'eleventy') {
        const npmBinPath = path.join(binDir, 'node_modules', '.bin', 'eleventy');
        if (platform.startsWith('win')) {
          return npmBinPath + '.cmd';
        }
        return npmBinPath;
      }

      if (ssgType.toLowerCase() === 'jekyll') {
        if (platform.startsWith('win')) {
          return path.join(binDir, 'jekyll.cmd');
        }
        return path.join(binDir, 'jekyll.sh');
      }

      // For standalone binaries like Hugo
      if (platform.startsWith('win')) {
        return path.join(binDir, `${ssgType}.exe`);
      } else {
        return path.join(binDir, ssgType);
      }
    }),

    // Deprecated methods (still present for compatibility)
    getHugoBinRoot: vi.fn(() => '/mock/quiqr/tools/hugobin'),
    getHugoBinDirForVer: vi.fn((version: string) => `/mock/quiqr/tools/hugobin/${version}`),
    getHugoBinForVer: vi.fn((version: string) => {
      const platform = process.platform.toLowerCase();
      if (platform.startsWith('win')) {
        return `/mock/quiqr/tools/hugobin/${version}/hugo.exe`;
      }
      return `/mock/quiqr/tools/hugobin/${version}/hugo`;
    }),

    // Other methods
    getLastBuildDir: vi.fn(() => undefined),
    getBuildDir: vi.fn((dir: string) => dir),
    getThemesDir: vi.fn(() => '/mock/quiqr/tools/hugothemes'),
    getApplicationResourcesDir: vi.fn(() => '/mock/resources'),
    workspaceCacheThumbsPath: vi.fn((workspacePath: string, relativePath: string) =>
      path.join(workspacePath, '.quiqr-cache/thumbs', relativePath)
    ),
    getKnownHosts: vi.fn(() => '/mock/home/.ssh/known_hosts'),
    getSiteMountConfigPath: vi.fn((siteKey: string) => `/mock/quiqr/sites/${siteKey}/config.json`),
    get7zaBin: vi.fn(() => '/mock/bin/7za'),
    randomPathSafeString: vi.fn((length: number) => 'mock-random-string'.substring(0, length)),
    isLinuxAppImage: vi.fn(() => false),
    hugoConfigFilePath: vi.fn((hugoRootDir: string) => {
      // Return first config file found
      return path.join(hugoRootDir, 'config.toml');
    }),

    ...overrides,
  } as PathHelper;

  return mockPathHelper;
}

/**
 * Create a mock EnvironmentInfo
 */
export function createMockEnvironmentInfo(
  overrides?: Partial<EnvironmentInfo>
): EnvironmentInfo {
  const platform = process.platform;
  let mockPlatform: 'macOS' | 'windows' | 'linux' = 'linux';

  if (platform === 'darwin') {
    mockPlatform = 'macOS';
  } else if (platform === 'win32') {
    mockPlatform = 'windows';
  }

  return {
    platform: mockPlatform,
    isPackaged: false,
    ...overrides,
  };
}

/**
 * Create a mock AppConfig for testing
 */
export function createMockAppConfig(): AppConfig {
  return {
    // Add minimal AppConfig mock
    prefs: {},
    getPreference: vi.fn(),
    setPreference: vi.fn(),
  } as any;
}

/**
 * Create a complete set of SSG provider dependencies
 */
export function createMockSSGProviderDependencies(
  overrides?: Partial<SSGProviderDependencies>
): SSGProviderDependencies {
  return {
    pathHelper: createMockPathHelper(),
    environmentInfo: createMockEnvironmentInfo(),
    outputConsole: {
      appendLine: vi.fn(),
    } as OutputConsole,
    windowAdapter: {
      showLogWindow: vi.fn(),
      reloadMainWindow: vi.fn(),
      sendToRenderer: vi.fn(),
      openSiteLibrary: vi.fn().mockResolvedValue(undefined),
      setMenuBarVisibility: vi.fn(),
      appendToOutputConsole: vi.fn(),
    } as WindowAdapter,
    shellAdapter: {
      openExternal: vi.fn().mockResolvedValue(undefined),
      showItemInFolder: vi.fn(),
      openPath: vi.fn().mockResolvedValue(''),
    } as ShellAdapter,
    appConfig: createMockAppConfig(),
    ...overrides,
  };
}

/**
 * Mock async generator for download progress
 */
export async function* createMockDownloadStream(
  progressSteps: DownloadProgress[]
): AsyncGenerator<DownloadProgress> {
  for (const progress of progressSteps) {
    yield progress;
  }
}

/**
 * Create mock progress steps for testing download functionality
 */
export function createMockProgressSteps(complete: boolean = true): DownloadProgress[] {
  const steps: DownloadProgress[] = [
    { percent: 0, message: 'Starting download...', complete: false },
    { percent: 25, message: 'Downloading... 25%', complete: false },
    { percent: 50, message: 'Downloading... 50%', complete: false },
    { percent: 75, message: 'Downloading... 75%', complete: false },
    { percent: 100, message: 'Download complete', complete: true },
  ];

  if (!complete) {
    // Simulate failed download
    return [
      ...steps.slice(0, 3),
      {
        percent: 50,
        message: 'Download failed',
        complete: false,
        error: 'Network error',
      },
    ];
  }

  return steps;
}

/**
 * Helper to mock child_process.execFile
 * Returns a mock that can be customized for different test scenarios
 */
export function createMockExecFile() {
  return vi.fn((cmd: string, args: string[], opts: any, callback: Function) => {
    // Default: successful execution
    callback(null, { stdout: 'success', stderr: '' });
  });
}

/**
 * Helper to mock child_process.spawn
 * Returns a mock process object with stdout, stderr, and event handlers
 */
export function createMockSpawn() {
  return vi.fn(() => {
    const mockProcess = {
      stdout: {
        on: vi.fn((event: string, handler: Function) => {
          if (event === 'data') {
            // Simulate some output
            setTimeout(() => handler(Buffer.from('Mock output')), 10);
          }
        }),
        setEncoding: vi.fn(),
      },
      stderr: {
        on: vi.fn((event: string, handler: Function) => {
          // No error output by default
        }),
        setEncoding: vi.fn(),
      },
      on: vi.fn((event: string, handler: Function) => {
        if (event === 'close') {
          // Simulate successful exit
          setTimeout(() => handler(0), 50);
        }
      }),
      kill: vi.fn(),
      pid: 12345,
    };
    return mockProcess;
  });
}

/**
 * Setup mock for child_process module
 * Call this in your test file's vi.mock() statement
 */
export function mockChildProcess() {
  return {
    execFile: createMockExecFile(),
    spawn: createMockSpawn(),
  };
}

/**
 * Reset all SSG dependency mocks
 */
export function resetSSGDependencyMocks(deps: SSGProviderDependencies): void {
  // Reset PathHelper mocks
  vi.mocked(deps.pathHelper.getRoot).mockReset();
  vi.mocked(deps.pathHelper.getSSGBinForVer).mockReset();
  vi.mocked(deps.pathHelper.getSSGBinDirForVer).mockReset();

  // Reset OutputConsole
  vi.mocked(deps.outputConsole.appendLine).mockReset();

  // Reset WindowAdapter
  vi.mocked(deps.windowAdapter.showLogWindow).mockReset();
  vi.mocked(deps.windowAdapter.sendToRenderer).mockReset();

  // Reset ShellAdapter
  vi.mocked(deps.shellAdapter.openExternal).mockReset();
}
