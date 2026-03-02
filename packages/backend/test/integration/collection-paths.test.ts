/**
 * Collection Path Handling Tests
 *
 * Tests that collection item keys are properly normalized across platforms,
 * specifically addressing the Windows drive letter case sensitivity issue.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createContainer } from '../../src/config/container.js';
import { createMockAdapters } from '../mocks/adapters.js';
import { createTestSiteFixture } from '../helpers/fixture-builder.js';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import type { AppContainer } from '../../src/config/container.js';

describe('Collection Path Normalization', () => {
  let testDir: string;
  let container: AppContainer;
  const siteKey = 'test-path-normalization';

  beforeEach(async () => {
    // Create temp directory for test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'quiqr-path-test-'));

    // Create mock adapters with test directory paths
    const mockAdapters = createMockAdapters({
      appInfo: {
        isPackaged: () => false,
        getAppPath: () => testDir,
        getVersion: () => '1.0.0-test',
        getPath: () => testDir,
      },
    });

    // Create container with test configuration
    container = createContainer({
      userDataPath: testDir,
      rootPath: testDir,
      adapters: mockAdapters,
    });

    // Create test site with collections
    const siteRoot = path.join(testDir, 'Quiqr', 'sites', siteKey);
    await fs.ensureDir(siteRoot);

    await createTestSiteFixture(siteRoot, {
      siteKey,
      workspaces: ['main'],
      collections: [
        {
          key: 'pages',
          folder: 'content/pages',
          items: [
            { key: 'about', frontmatter: { title: 'About' }, content: 'About page' },
            { key: 'contact', frontmatter: { title: 'Contact' }, content: 'Contact page' },
          ],
        },
        {
          key: 'posts',
          folder: 'content/posts',
          items: [
            { key: 'first-post', frontmatter: { title: 'First Post' }, content: 'First post content' },
          ],
        },
      ],
    });
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(testDir);
  });

  describe('listCollectionItems', () => {
    it('should return relative paths as keys, not absolute paths', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');
      const items = await service.listCollectionItems('pages');

      // Verify we get relative paths
      expect(items).toHaveLength(2);

      // Keys should be relative paths (not starting with C:\ or /)
      items.forEach(item => {
        expect(item.key).not.toMatch(/^[A-Z]:\\/); // No Windows absolute paths
        expect(item.key).not.toMatch(/^[/\\]/);    // No leading slashes

        // Keys should be in forward-slash format
        expect(item.key).not.toContain('\\');

        // Keys should be simple relative paths
        expect(item.key).toMatch(/^[a-z-]+\/index\.(md|html|markdown|qmd)$/);
      });

      // Verify specific keys are present
      const keys = items.map(i => i.key);
      expect(keys).toContain('about/index.md');
      expect(keys).toContain('contact/index.md');
    });

    it('should work with nested directory structures', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');
      const items = await service.listCollectionItems('posts');

      expect(items).toHaveLength(1);
      expect(items[0].key).toBe('first-post/index.md');
      expect(items[0].key).not.toContain('\\');
    });
  });

  describe('getCollectionItem', () => {
    it('should accept relative path keys and return item', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');

      // Use relative path key (what frontend sends)
      const item = await service.getCollectionItem('pages', 'about/index.md');

      expect(item).toBeDefined();
      expect(item.title).toBe('About');
      expect(item.mainContent).toContain('About page');
    });

    it('should not require absolute paths', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');

      // This should work - relative path
      const validItem = await service.getCollectionItem('pages', 'about/index.md');
      expect(validItem).toBeDefined();

      // This would be the bug - sending an absolute Windows path
      // (We can't easily test this would fail, but documenting expected behavior)
    });
  });

  describe('Cross-platform path handling', () => {
    it('should normalize all paths to forward slashes', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');
      const items = await service.listCollectionItems('pages');

      items.forEach(item => {
        // All paths should use forward slashes (POSIX-style)
        expect(item.key).not.toContain('\\');
        expect(item.label).not.toContain('\\');

        // Keys should be relative
        expect(item.key).not.toMatch(/^[A-Z]:/i);
        expect(item.key).not.toMatch(/^[/\\]/);
      });
    });

    it('should use path.posix.relative for key extraction', async () => {
      const service = await container.getWorkspaceService(siteKey, 'main');
      const items = await service.listCollectionItems('pages');

      // The fix ensures that even if Windows glob returns C:\Users\...
      // and folder is c:\Users\... (different case), path.posix.relative
      // will still work because both are normalized to forward slashes

      // Verify the keys are clean relative paths
      items.forEach(item => {
        // Should look like: "about/index.md" or "nested/path/index.md"
        expect(item.key).toMatch(/^[^/\\][^:]*$/); // No leading slash, no colon
        expect(item.key).toContain('/'); // Should have at least one forward slash
      });
    });
  });
});
