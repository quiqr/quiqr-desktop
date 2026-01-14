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
  packagerConfig: {
    asar: true,
    name: 'Quiqr',
    executableName: 'quiqr',
    appBundleId: 'org.quiqr.quiqr-desktop',
    icon: 'frontend/public/icon',

    // Copy workspace packages to node_modules for proper module resolution
    afterCopy: [
      (buildPath, electronVersion, platform, arch, callback) => {
        try {
          console.log('Copying workspace packages to node_modules...');

          for (const ws of workspacePackages) {
            const srcDir = path.resolve(__dirname, ws.src);
            const destDir = path.join(buildPath, 'node_modules', ws.name);

            // Ensure destination exists
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
          }

          // Also copy the frontend build
          const frontendSrc = path.resolve(__dirname, 'frontend/build');
          const frontendDest = path.join(buildPath, 'frontend/build');
          if (fs.existsSync(frontendSrc)) {
            fs.ensureDirSync(frontendDest);
            fs.copySync(frontendSrc, frontendDest);
            console.log('  Copied frontend/build');
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
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Quiqr',
        authors: 'Quiqr Organization',
        description: 'Local-first CMS for static files and engines like Quarto or Hugo SSG',
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
          icon: 'frontend/public/icon.png',
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
          icon: 'frontend/public/icon.png',
          categories: ['Office', 'Development'],
          description: 'Local-first CMS for static files and engines like Quarto or Hugo SSG',
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
