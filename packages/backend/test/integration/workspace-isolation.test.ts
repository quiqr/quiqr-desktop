/**
 * Workspace Isolation Integration Tests
 *
 * Tests that changes in one workspace don't affect another workspace.
 * Uses real file system operations on programmatically created test fixtures.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createContainer } from '../../src/config/container.js';
import { createMockAdapters } from '../mocks/adapters.js';
import { createListWorkspacesHandler } from '../../src/api/handlers/workspace-handlers.js';
import { createTestSiteFixture } from '../helpers/fixture-builder.js';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import type { AppContainer } from '../../src/config/container.js';

describe('Workspace Isolation', () => {
  let testDir: string;
  let container: AppContainer;
  const siteKey = 'test-workspace-isolation-site';

  beforeEach(async () => {
    // Create temp directory for test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'quiqr-workspace-test-'));

    // Create mock adapters with test directory paths
    const mockAdapters = createMockAdapters({
      appInfo: {
        isPackaged: () => false,
        getAppPath: () => testDir,
        getVersion: () => '1.0.0-test',
        getPath: () => testDir, // Use testDir for all paths
      },
    });

    // Create container with test configuration
    container = createContainer({
      userDataPath: testDir,
      rootPath: testDir,
      adapters: mockAdapters,
    });

    // Create test site fixtures programmatically in the proper location
    const siteRoot = path.join(testDir, 'Quiqr', 'sites', siteKey);
    await fs.ensureDir(siteRoot);

    await createTestSiteFixture(siteRoot, {
      siteKey,
      workspaces: ['main', 'staging'],
      collections: [
        {
          key: 'pages',
          folder: 'content/pages',
          items: [
            {
              key: 'hallo',
              frontmatter: {
                title: 'Main Workspace Page',
              },
              content: 'Content from main workspace.',
            },
          ],
        },
      ],
    });

    // Create staging workspace with different content
    const stagingPath = path.join(siteRoot, 'staging', 'content', 'pages', 'hallo');
    await fs.ensureDir(stagingPath);
    await fs.writeFile(
      path.join(stagingPath, 'index.md'),
      `---
title: Staging Workspace Page
---

Content from staging workspace.
`
    );
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(testDir);
  });

  describe('Collection Item Updates', () => {
    it('should isolate changes between main and staging workspaces', async () => {
      const collectionKey = 'pages';
      const itemKey = 'hallo/index.md';

      // 1. Mount main workspace and get initial content
      const mainService = await container.getWorkspaceService(siteKey, 'main');
      const mainInitial = await mainService.getCollectionItem(collectionKey, itemKey);
      expect(mainInitial.title).toBe('Main Workspace Page');

      // 2. Update content in main workspace
      const mainUpdated = {
        ...mainInitial,
        title: 'Updated Main Workspace Page',
        mainContent: 'This is the updated main workspace content.'
      };
      await mainService.updateCollectionItem(collectionKey, itemKey, mainUpdated);

      // 3. Verify main workspace has the update
      const mainAfterUpdate = await mainService.getCollectionItem(collectionKey, itemKey);
      expect(mainAfterUpdate.title).toBe('Updated Main Workspace Page');
      expect(mainAfterUpdate.mainContent).toBe('This is the updated main workspace content.');

      // 4. Switch to staging workspace
      const stagingService = await container.getWorkspaceService(siteKey, 'staging');
      const stagingInitial = await stagingService.getCollectionItem(collectionKey, itemKey);

      // 5. Verify staging workspace still has original content (not affected by main)
      expect(stagingInitial.title).toBe('Staging Workspace Page');
      expect(stagingInitial.mainContent).toContain('Content from staging workspace');

      // 6. Update staging workspace with different content
      const stagingUpdated = {
        ...stagingInitial,
        title: 'Updated Staging Workspace Page',
        mainContent: 'This is the updated staging workspace content.'
      };
      await stagingService.updateCollectionItem(collectionKey, itemKey, stagingUpdated);

      // 7. Verify staging has its update
      const stagingAfterUpdate = await stagingService.getCollectionItem(collectionKey, itemKey);
      expect(stagingAfterUpdate.title).toBe('Updated Staging Workspace Page');
      expect(stagingAfterUpdate.mainContent).toBe('This is the updated staging workspace content.');

      // 8. Go back to main workspace and verify it wasn't affected by staging changes
      const mainFinal = await mainService.getCollectionItem(collectionKey, itemKey);
      expect(mainFinal.title).toBe('Updated Main Workspace Page');
      expect(mainFinal.mainContent).toBe('This is the updated main workspace content.');

      // 9. Read actual files to verify physical isolation
      const siteRoot = path.join(testDir, 'Quiqr', 'sites', siteKey);
      const mainFilePath = path.join(siteRoot, 'main/content/pages/hallo/index.md');
      const stagingFilePath = path.join(siteRoot, 'staging/content/pages/hallo/index.md');

      const mainFileContent = await fs.readFile(mainFilePath, 'utf-8');
      const stagingFileContent = await fs.readFile(stagingFilePath, 'utf-8');

      expect(mainFileContent).toContain('Updated Main Workspace Page');
      expect(mainFileContent).toContain('This is the updated main workspace content.');
      expect(stagingFileContent).toContain('Updated Staging Workspace Page');
      expect(stagingFileContent).toContain('This is the updated staging workspace content.');
    });

    it('should maintain separate workspace service instances', async () => {
      // Get workspace services
      const mainService = await container.getWorkspaceService(siteKey, 'main');
      const stagingService = await container.getWorkspaceService(siteKey, 'staging');

      // Verify they have different workspace paths
      const mainPath = mainService.getWorkspacePath();
      const stagingPath = stagingService.getWorkspacePath();

      expect(mainPath).toContain('main');
      expect(stagingPath).toContain('staging');
      expect(mainPath).not.toBe(stagingPath);
    });
  });

  describe('Workspace Listing', () => {
    it('should list both main and staging workspaces', async () => {
      const handler = createListWorkspacesHandler(container);
      const workspaces = await handler({ siteKey: 'test-workspace-isolation-site' });

      expect(workspaces).toHaveLength(2);
      expect(workspaces.map(w => w.key)).toContain('main');
      expect(workspaces.map(w => w.key)).toContain('staging');
    });
  });
});
