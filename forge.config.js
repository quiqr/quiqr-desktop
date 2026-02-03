const path = require('path');
const fs = require('fs-extra');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

// Determine platform-specific resource directory
function getPlatformResourceDir() {
  switch (process.platform) {
    case 'win32':
      return 'win';
    case 'darwin':
      return 'mac';
    default:
      return 'linux';
  }
}

// Workspace packages to copy into node_modules for module resolution
const workspacePackages = [
  { name: '@quiqr/types', src: 'packages/types' },
  { name: '@quiqr/backend', src: 'packages/backend' },
  { name: '@quiqr/adapter-electron', src: 'packages/adapters/electron' },
];

module.exports = {
  buildIdentifier: 'prod',

  packagerConfig: {
    // Disable pruning - workspace dependencies are hoisted to root node_modules
    // and we need them all included, not just root package.json dependencies
    prune: false,
    asar: true,
    name: 'Quiqr',
    executableName: 'quiqr',
    appBundleId: 'org.quiqr.quiqr-desktop',
    icon: 'packages/frontend/public/icon',

    // Copy workspace packages to node_modules for proper module resolution
    // With npm workspaces, node_modules/@quiqr/* are symlinks that don't work in asar
    // We need to remove them and copy the actual files
    afterCopy: [
      (buildPath, electronVersion, platform, arch, callback) => {
        try {
          console.log('Copying workspace packages to node_modules...');

          for (const ws of workspacePackages) {
            const srcDir = path.resolve(__dirname, ws.src);
            const destDir = path.join(buildPath, 'node_modules', ws.name);

            // Remove existing symlink or directory first
            // Use lstatSync to detect symlinks (existsSync returns false for broken symlinks)
            try {
              const stat = fs.lstatSync(destDir);
              if (stat.isSymbolicLink() || stat.isDirectory()) {
                fs.removeSync(destDir);
                console.log(`  Removed existing ${ws.name} (symlink or dir)`);
              }
            } catch {
              // Path doesn't exist, which is fine
            }

            // Create fresh directory
            fs.ensureDirSync(destDir);

            // Copy dist folder
            const srcDist = path.join(srcDir, 'dist');
            const destDist = path.join(destDir, 'dist');
            if (fs.existsSync(srcDist)) {
              fs.copySync(srcDist, destDist);
              console.log(`  Copied ${ws.name}/dist`);
            } else {
              console.warn(`  Warning: ${srcDist} does not exist`);
            }

            // Copy package.json
            const srcPkg = path.join(srcDir, 'package.json');
            const destPkg = path.join(destDir, 'package.json');
            if (fs.existsSync(srcPkg)) {
              fs.copySync(srcPkg, destPkg);
              console.log(`  Copied ${ws.name}/package.json`);
            }

            // Copy workspace's own node_modules (for non-hoisted dependencies)
            const srcNodeModules = path.join(srcDir, 'node_modules');
            const destNodeModules = path.join(destDir, 'node_modules');
            if (fs.existsSync(srcNodeModules)) {
              fs.copySync(srcNodeModules, destNodeModules);
              console.log(`  Copied ${ws.name}/node_modules`);
            }
          }

          // Also copy the frontend build
          const frontendSrc = path.resolve(__dirname, 'packages/frontend/build');
          const frontendDest = path.join(buildPath, 'packages/frontend/build');
          if (fs.existsSync(frontendSrc)) {
            fs.ensureDirSync(frontendDest);
            fs.copySync(frontendSrc, frontendDest);
            console.log('  Copied packages/frontend/build');
          } else {
            console.warn('  Warning: frontend/build does not exist');
          }

          callback();
        } catch (error) {
          callback(error);
        }
      },
    ],

    // Platform-specific binaries
    extraResource: [
      path.join('resources', getPlatformResourceDir()),
      path.join('resources', 'all'),
    ],

    // Unpack these from asar for filesystem access
    asar: {
      unpack: '{node_modules/@quiqr/**/*,node_modules/7zip-bin/**/*,node_modules/sharp/**/*}',
    },

    // Ignore patterns - exclude dev/build artifacts but include workspace packages
    ignore: [
      /^\/\.git/,
      /^\/\.github/,
      /^\/\.vscode/,
      /^\/\.claude/,
      /^\/out($|\/)/,
      /^\/dist($|\/)/,
      /^\/scripts($|\/)/,
      /^\/openspec($|\/)/,
      // Ignore source files, only keep dist
      /^\/packages\/.*\/src($|\/)/,
      /^\/packages\/.*\/node_modules($|\/)/,
      /^\/packages\/.*\/tsconfig.*\.json$/,
      // Ignore frontend source, only keep build
      /^\/frontend\/src($|\/)/,
      /^\/frontend\/node_modules($|\/)/,
      /^\/frontend\/public($|\/)/,
      /^\/frontend\/index\.html$/,
      /^\/frontend\/vite\.config/,
      /^\/frontend\/tsconfig/,
      // Ignore test files
      /\.test\.[jt]sx?$/,
      /\.spec\.[jt]sx?$/,
      /vitest\.config/,
      // Ignore other dev files
      /^\/CLAUDE\.md$/,
      /^\/README\.md$/,
      /^\/CHANGELOG\.md$/,
      /^\/tsconfig/,
      /^\/\.env/,
      /^\/\.eslint/,
      /^\/\.prettier/,
    ],

    // URL protocol handler
    protocols: [
      {
        name: 'quiqr',
        schemes: ['quiqr'],
      },
    ],

    // macOS specific config
    darwinDarkModeSupport: true,
    osxSign: {},
    osxNotarize: process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD
      ? {
          appleId: process.env.APPLE_ID,
          appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
          teamId: process.env.APPLE_TEAM_ID,
        }
      : undefined,
  },

  rebuildConfig: {},

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'quiqr',
          name: 'quiqr-desktop',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Quiqr',
        authors: 'Quiqr Organization',
        description: 'Local-first CMS for static files and engines like Quarto or Hugo SSG',
        setupIcon: 'packages/frontend/public/icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/quiqr/quiqr-desktop/main/packages/frontend/public/icon.ico',
        loadingGif: undefined,
        noMsi: true,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'quiqr',
          productName: 'Quiqr',
          maintainer: 'Quiqr Organization <info@quiqr.org>',
          homepage: 'https://quiqr.org',
          icon: 'packages/frontend/public/icon.png',
          categories: ['Office', 'Development'],
          description: 'Local-first CMS for static files and engines like Quarto or Hugo SSG',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'quiqr',
          productName: 'Quiqr',
          homepage: 'https://quiqr.org',
          icon: 'packages/frontend/public/icon.png',
          categories: ['Office', 'Development'],
          description: 'Local-first CMS for static files and engines like Quarto or Hugo SSG',
        },
      },
    },
    {
      name: '@reforged/maker-appimage',
      platforms: ['linux'],
      config: {
        options: {
          name: 'quiqr',
          productName: 'Quiqr',
          genericName: 'Static Site CMS',
          categories: ['Office', 'Development'],
          icon: 'packages/frontend/public/icon.png',
        },
      },
    },
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
