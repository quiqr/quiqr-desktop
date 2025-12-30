/**
 * Glob Pattern Tests
 *
 * Tests all glob patterns used throughout the backend to ensure they work correctly
 * before and after upgrading the glob package.
 *
 * These tests verify:
 * 1. Basic pattern matching with extensions
 * 2. Sync vs async glob operations
 * 3. Complex patterns with subdirectories and negations
 * 4. Glob options (nodir, absolute, cwd)
 * 5. Multi-extension patterns
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { glob, globSync } from 'glob';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('Glob Patterns - Backend Usage', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temp directory for tests
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'quiqr-glob-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(testDir);
  });

  describe('Pattern 1: Config File Discovery (configuration-data-provider.ts)', () => {
    beforeEach(async () => {
      // Create test structure for site configs
      await fs.ensureDir(path.join(testDir, 'sites', 'site1'));
      await fs.ensureDir(path.join(testDir, 'sites', 'site2'));

      // Create config files
      await fs.writeFile(
        path.join(testDir, 'sites', 'site1', 'config.json'),
        JSON.stringify({ key: 'site1', name: 'Site 1' })
      );
      await fs.writeFile(
        path.join(testDir, 'sites', 'site2', 'config.json'),
        JSON.stringify({ key: 'site2', name: 'Site 2' })
      );

      // Create old-style config file
      await fs.writeFile(
        path.join(testDir, 'config.oldsite.json'),
        JSON.stringify({ key: 'oldsite', name: 'Old Site' })
      );
    });

    it('should find new-style site config files in sites/*/config.json', async () => {
      const pattern = path.join(testDir, 'sites', '*/config.json').replace(/\\/g, '/');
      const files = await glob(pattern);

      expect(files).toHaveLength(2);
      expect(files.some(f => f.includes('site1'))).toBe(true);
      expect(files.some(f => f.includes('site2'))).toBe(true);
    });

    it('should find old-style config files with config.*.json pattern', async () => {
      const pattern = path.join(testDir, 'config.*.json').replace(/\\/g, '/');
      const files = await glob(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('config.oldsite.json');
    });

    it('should combine results from both patterns', async () => {
      const pattern1 = path.join(testDir, 'sites', '*/config.json').replace(/\\/g, '/');
      const pattern2 = path.join(testDir, 'config.*.json').replace(/\\/g, '/');

      const files = [
        ...(await glob(pattern1)),
        ...(await glob(pattern2))
      ];

      expect(files).toHaveLength(3);
    });
  });

  describe('Pattern 2: Screenshot and Favicon Discovery (configuration-data-provider.ts)', () => {
    beforeEach(async () => {
      const screenshotDir = path.join(testDir, 'quiqr', 'etalage', 'screenshots');
      const faviconDir = path.join(testDir, 'quiqr', 'etalage', 'favicon');

      await fs.ensureDir(screenshotDir);
      await fs.ensureDir(faviconDir);

      // Create screenshot files
      await fs.writeFile(path.join(screenshotDir, 'screen1.png'), 'fake png');
      await fs.writeFile(path.join(screenshotDir, 'screen2.jpg'), 'fake jpg');
      await fs.writeFile(path.join(screenshotDir, 'screen3.jpeg'), 'fake jpeg');
      await fs.writeFile(path.join(screenshotDir, 'screen4.gif'), 'fake gif');
      await fs.writeFile(path.join(screenshotDir, 'readme.txt'), 'not an image');

      // Create favicon files
      await fs.writeFile(path.join(faviconDir, 'favicon.ico'), 'fake ico');
      await fs.writeFile(path.join(faviconDir, 'favicon.png'), 'fake png');
    });

    it('should find screenshot files with multi-extension pattern', () => {
      const screenshotPath = path.join(testDir, 'quiqr', 'etalage', 'screenshots');
      const pattern = path.join(screenshotPath, '*.{png,jpg,jpeg,gif}').replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(4);
      expect(files.some(f => f.endsWith('.png'))).toBe(true);
      expect(files.some(f => f.endsWith('.jpg'))).toBe(true);
      expect(files.some(f => f.endsWith('.jpeg'))).toBe(true);
      expect(files.some(f => f.endsWith('.gif'))).toBe(true);
      expect(files.some(f => f.endsWith('.txt'))).toBe(false);
    });

    it('should find favicon files with multi-extension pattern including ico', () => {
      const faviconPath = path.join(testDir, 'quiqr', 'etalage', 'favicon');
      const pattern = path.join(faviconPath, '*.{png,jpg,jpeg,gif,ico}').replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(2);
      expect(files.some(f => f.endsWith('.ico'))).toBe(true);
      expect(files.some(f => f.endsWith('.png'))).toBe(true);
    });
  });

  describe('Pattern 3: Hugo Tar File Discovery (hugo-downloader.ts)', () => {
    beforeEach(async () => {
      const downloadDir = path.join(testDir, 'hugo-downloads');
      await fs.ensureDir(downloadDir);

      // Create a tar file that would be the result of extracting .tar.gz
      await fs.writeFile(
        path.join(downloadDir, 'hugo_extended_0.119.0_Linux-64bit.download'),
        'fake tar file'
      );
    });

    it('should find extracted tar file by replacing .partial with actual name', () => {
      const downloadPath = path.join(
        testDir,
        'hugo-downloads',
        'hugo_extended_0.119.0_Linux-64bit.download.partial'
      );

      // Simulate the pattern used in hugo-downloader.ts
      const globExpression = downloadPath.replace('download.partial', 'download');
      const matches = globSync(globExpression);

      expect(matches).toHaveLength(1);
      expect(matches[0]).toContain('download');
      expect(matches[0]).not.toContain('partial');
    });
  });

  describe('Pattern 4: Workspace Config Discovery (workspace-config-provider.ts)', () => {
    beforeEach(async () => {
      const modelDir = path.join(testDir, 'workspace', 'quiqr', 'model');
      await fs.ensureDir(modelDir);

      // Create base config files in different formats
      await fs.writeFile(
        path.join(modelDir, 'base.yaml'),
        'hugover: 0.119.0\nsingles: []\ncollections: []'
      );
    });

    it('should find base config with multi-format pattern', () => {
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'base.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('base.yaml');
    });

    it('should fallback to sukoh.* pattern if base.* not found', () => {
      const sukohDir = path.join(testDir, 'workspace2');
      fs.ensureDirSync(sukohDir);
      fs.writeFileSync(
        path.join(sukohDir, 'sukoh.json'),
        JSON.stringify({ hugover: '0.119.0' })
      );

      const pattern = path
        .join(sukohDir, 'sukoh.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('sukoh.json');
    });
  });

  describe('Pattern 5: Include Files Discovery (workspace-config-provider.ts)', () => {
    beforeEach(async () => {
      const includesDir = path.join(testDir, 'workspace', 'quiqr', 'model', 'includes');
      const singlesDir = path.join(includesDir, 'singles');
      const collectionsDir = path.join(includesDir, 'collections');
      const menusDir = path.join(includesDir, 'menus');

      await fs.ensureDir(singlesDir);
      await fs.ensureDir(collectionsDir);
      await fs.ensureDir(menusDir);

      // Create include files
      await fs.writeFile(path.join(includesDir, 'build.yaml'), 'build: []');
      await fs.writeFile(path.join(includesDir, 'serve.yaml'), 'serve: []');
      await fs.writeFile(path.join(singlesDir, 'home.yaml'), 'key: home');
      await fs.writeFile(path.join(collectionsDir, 'posts.yaml'), 'key: posts');
      await fs.writeFile(path.join(menusDir, 'main.yaml'), 'key: main');
    });

    it('should find all include files in includes directory', () => {
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'includes', '*.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(2);
      expect(files.some(f => f.includes('build.yaml'))).toBe(true);
      expect(files.some(f => f.includes('serve.yaml'))).toBe(true);
    });

    it('should find singles includes', () => {
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'includes', 'singles', '*.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('home.yaml');
    });

    it('should find collections includes', () => {
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'includes', 'collections', '*.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('posts.yaml');
    });

    it('should find menus includes', () => {
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'includes', 'menus', '*.{yaml,yml,json,toml}')
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('main.yaml');
    });
  });

  describe('Pattern 6: Partial Files Discovery (workspace-config-provider.ts)', () => {
    beforeEach(async () => {
      const partialsDir = path.join(testDir, 'workspace', 'quiqr', 'model', 'partials');
      await fs.ensureDir(partialsDir);

      await fs.writeFile(path.join(partialsDir, 'blogpost.yaml'), 'fields: []');
      await fs.writeFile(path.join(partialsDir, 'author.json'), '{"fields": []}');
    });

    it('should find partial by name with multi-format pattern', () => {
      const partialName = 'blogpost';
      const pattern = path
        .join(testDir, 'workspace', 'quiqr', 'model', 'partials', `${partialName}.{yaml,yml,json,toml}`)
        .replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('blogpost.yaml');
    });
  });

  describe('Pattern 7: Bundle Resources (workspace-service.ts)', () => {
    beforeEach(async () => {
      const bundleDir = path.join(testDir, 'content', 'posts', 'my-post');
      await fs.ensureDir(bundleDir);

      // Create content file
      await fs.writeFile(path.join(bundleDir, 'index.md'), '# Post');

      // Create resource files
      await fs.writeFile(path.join(bundleDir, 'image.png'), 'fake image');
      await fs.writeFile(path.join(bundleDir, 'document.pdf'), 'fake pdf');

      // Create subdirectory with files
      await fs.ensureDir(path.join(bundleDir, 'assets'));
      await fs.writeFile(path.join(bundleDir, 'assets', 'chart.svg'), 'fake svg');
    });

    it('should find all files excluding index files with glob options', async () => {
      const directory = path.join(testDir, 'content', 'posts', 'my-post');
      const globExp = '*';

      const allFiles = await glob(globExp, {
        nodir: true,
        absolute: false,
        cwd: directory,
      });

      // Filter out index files
      const indexPattern = /_?index[.](md|html|markdown|qmd)$/;
      const filtered = allFiles.filter(x => !indexPattern.test(x));

      expect(filtered).toHaveLength(2);
      expect(filtered).toContain('image.png');
      expect(filtered).toContain('document.pdf');
    });

    it('should find files in subdirectory with targetPath', async () => {
      const directory = path.join(testDir, 'content', 'posts', 'my-post');
      const targetPath = 'assets';
      const globExp = `${targetPath}/*`;

      const allFiles = await glob(globExp, {
        nodir: true,
        absolute: false,
        cwd: directory,
      });

      expect(allFiles).toHaveLength(1);
      expect(allFiles[0]).toContain('chart.svg');
    });

    it('should respect nodir option to exclude directories', async () => {
      const directory = path.join(testDir, 'content', 'posts', 'my-post');

      const withNoDir = await glob('*', {
        nodir: true,
        cwd: directory,
      });

      const withoutNoDir = await glob('*', {
        nodir: false,
        cwd: directory,
      });

      expect(withNoDir.length).toBeLessThan(withoutNoDir.length);
      expect(withoutNoDir.some(f => f === 'assets')).toBe(true);
      expect(withNoDir.some(f => f === 'assets')).toBe(false);
    });
  });

  describe('Pattern 8: Collection Items (workspace-service.ts)', () => {
    beforeEach(async () => {
      const contentDir = path.join(testDir, 'content', 'blog');
      await fs.ensureDir(contentDir);

      // Create page bundles (folders with index.md)
      await fs.ensureDir(path.join(contentDir, 'post-1'));
      await fs.writeFile(
        path.join(contentDir, 'post-1', 'index.md'),
        '---\ntitle: Post 1\n---\nContent'
      );

      await fs.ensureDir(path.join(contentDir, 'post-2'));
      await fs.writeFile(
        path.join(contentDir, 'post-2', 'index.md'),
        '---\ntitle: Post 2\n---\nContent'
      );

      // Create section index (should be excluded when hideIndex is true)
      await fs.writeFile(
        path.join(contentDir, '_index.md'),
        '---\ntitle: Blog Section\n---'
      );

      // Create subdirectory posts
      await fs.ensureDir(path.join(contentDir, 'archived', 'old-post'));
      await fs.writeFile(
        path.join(contentDir, 'archived', 'old-post', 'index.md'),
        '---\ntitle: Old Post\n---\nArchived'
      );
    });

    it('should find all markdown files with subdirectories', async () => {
      const folder = path.join(testDir, 'content', 'blog').replace(/\\/g, '/');
      const pattern = path.join(folder, '**/*.{md,html,markdown,qmd}');

      const files = await glob(pattern);

      expect(files.length).toBeGreaterThanOrEqual(4);
      expect(files.some(f => f.includes('post-1'))).toBe(true);
      expect(files.some(f => f.includes('post-2'))).toBe(true);
      expect(files.some(f => f.includes('_index.md'))).toBe(true);
      expect(files.some(f => f.includes('old-post'))).toBe(true);
    });

    it('should exclude _index.md files when using negation pattern', async () => {
      const folder = path.join(testDir, 'content', 'blog').replace(/\\/g, '/');
      const pattern = path.join(folder, '**/!(_index).{md,html,markdown,qmd}');

      const files = await glob(pattern);

      expect(files.some(f => f.includes('post-1'))).toBe(true);
      expect(files.some(f => f.includes('post-2'))).toBe(true);
      expect(files.some(f => f.endsWith('_index.md'))).toBe(false);
    });

    it('should limit to single level when includeSubdirs is false', async () => {
      const folder = path.join(testDir, 'content', 'blog').replace(/\\/g, '/');
      const pattern = path.join(folder, '*.{md,html,markdown,qmd}');

      const files = await glob(pattern);

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('_index.md');
    });
  });

  describe('Pattern 9: Data Files (workspace-service.ts)', () => {
    beforeEach(async () => {
      const dataDir = path.join(testDir, 'data');
      await fs.ensureDir(path.join(dataDir, 'authors'));
      await fs.ensureDir(path.join(dataDir, 'config', 'theme'));

      await fs.writeFile(path.join(dataDir, 'site.yaml'), 'title: Site');
      await fs.writeFile(path.join(dataDir, 'authors', 'john.json'), '{"name": "John"}');
      await fs.writeFile(path.join(dataDir, 'authors', 'jane.toml'), 'name = "Jane"');
      await fs.writeFile(path.join(dataDir, 'config', 'theme', 'colors.json'), '{}');
    });

    it('should find all data files recursively with multi-format pattern', async () => {
      const folder = path.join(testDir, 'data').replace(/\\/g, '/');
      const pattern = path.join(folder, '**/*.{yaml,yml,json,toml}');

      const files = await glob(pattern);

      expect(files).toHaveLength(4);
      expect(files.some(f => f.includes('site.yaml'))).toBe(true);
      expect(files.some(f => f.includes('john.json'))).toBe(true);
      expect(files.some(f => f.includes('jane.toml'))).toBe(true);
      expect(files.some(f => f.includes('colors.json'))).toBe(true);
    });
  });

  describe('Pattern 10: Glob Job Generic Wrapper (glob-job.ts)', () => {
    beforeEach(async () => {
      await fs.ensureDir(path.join(testDir, 'mixed'));
      await fs.writeFile(path.join(testDir, 'mixed', 'file1.txt'), 'text');
      await fs.writeFile(path.join(testDir, 'mixed', 'file2.md'), 'markdown');
      await fs.writeFile(path.join(testDir, 'mixed', 'file3.json'), '{}');
    });

    it('should work with generic glob expression and options', async () => {
      const expression = path.join(testDir, 'mixed', '*').replace(/\\/g, '/');
      const files = await glob(expression, { nodir: true });

      expect(files).toHaveLength(3);
    });

    it('should work with custom options like ignore', async () => {
      const expression = path.join(testDir, 'mixed', '*').replace(/\\/g, '/');
      const files = await glob(expression, {
        nodir: true,
        ignore: '**/*.md'
      });

      expect(files).toHaveLength(2);
      expect(files.some(f => f.endsWith('.md'))).toBe(false);
    });
  });

  describe('Pattern 11: GlobSync Handler (workspace-handlers.ts)', () => {
    beforeEach(async () => {
      const workspaceDir = path.join(testDir, 'workspace');
      await fs.ensureDir(path.join(workspaceDir, 'content', 'pages'));

      await fs.writeFile(
        path.join(workspaceDir, 'content', 'pages', 'about.md'),
        '# About'
      );
      await fs.writeFile(
        path.join(workspaceDir, 'content', 'pages', 'contact.md'),
        '# Contact'
      );
    });

    it('should use globSync with custom cwd option', () => {
      const cwd = path.join(testDir, 'workspace');
      const pattern = 'content/pages/*.md';

      const matches = globSync(pattern, { cwd });

      expect(matches).toHaveLength(2);
      expect(matches).toContain('content/pages/about.md');
      expect(matches).toContain('content/pages/contact.md');
    });
  });

  describe('Edge Cases and Cross-Platform Compatibility', () => {
    it('should handle Windows-style paths by converting to forward slashes', () => {
      const windowsPath = 'C:\\Users\\test\\sites\\*\\config.json';
      const unixPath = windowsPath.replace(/\\/g, '/');

      expect(unixPath).toBe('C:/Users/test/sites/*/config.json');
      expect(unixPath).not.toContain('\\');
    });

    it('should handle empty results gracefully', async () => {
      const pattern = path.join(testDir, 'nonexistent', '*.json').replace(/\\/g, '/');
      const files = await glob(pattern);

      expect(files).toHaveLength(0);
      expect(Array.isArray(files)).toBe(true);
    });

    it('should handle patterns with no matches in sync mode', () => {
      const pattern = path.join(testDir, 'nothing', '*.xyz').replace(/\\/g, '/');
      const files = globSync(pattern);

      expect(files).toHaveLength(0);
      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large directory structures efficiently', async () => {
      // Create a directory with many files
      const largeDir = path.join(testDir, 'large');
      await fs.ensureDir(largeDir);

      const fileCount = 100;
      for (let i = 0; i < fileCount; i++) {
        await fs.writeFile(path.join(largeDir, `file${i}.txt`), `content ${i}`);
      }

      const start = Date.now();
      const pattern = path.join(largeDir, '*.txt').replace(/\\/g, '/');
      const files = await glob(pattern);
      const duration = Date.now() - start;

      expect(files).toHaveLength(fileCount);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
