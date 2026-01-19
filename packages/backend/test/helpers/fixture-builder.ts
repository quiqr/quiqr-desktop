/**
 * Fixture Builder
 *
 * Helper utilities for creating test fixtures programmatically.
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export interface FixtureOptions {
  siteKey: string;
  workspaces: string[];
  collections?: Array<{
    key: string;
    folder: string;
    items: Array<{
      key: string;
      frontmatter: Record<string, unknown>;
      content?: string;
    }>;
  }>;
}

export async function createTestSiteFixture(
  targetDir: string,
  options: FixtureOptions
): Promise<void> {
  const { siteKey, workspaces, collections = [] } = options;

  // Create site config.json
  await fs.writeJson(path.join(targetDir, 'config.json'), {
    key: siteKey,
    name: siteKey,
    source: {
      type: 'folder',
      path: 'main',
    },
  });

  // Create each workspace
  for (const workspaceKey of workspaces) {
    const workspacePath = path.join(targetDir, workspaceKey);
    await fs.ensureDir(workspacePath);

    // Create Hugo config
    await fs.writeFile(
      path.join(workspacePath, 'config.yaml'),
      yaml.dump({
        baseURL: 'http://example.org',
        title: 'Test Site',
      })
    );

    // Create Quiqr model structure
    const modelPath = path.join(workspacePath, 'quiqr/model');
    await fs.ensureDir(modelPath);
    await fs.ensureDir(path.join(modelPath, 'includes'));

    // Create base.yaml
    await fs.writeFile(
      path.join(modelPath, 'base.yaml'),
      yaml.dump({
        hugover: '0.120.0',
        include: [
          'includes/collections.yaml',
          'includes/menu.yml',
        ],
      })
    );

    // Create collections.yaml
    const collectionsConfig = collections.map(col => ({
      key: col.key,
      title: col.key.charAt(0).toUpperCase() + col.key.slice(1),
      folder: col.folder,
      extension: 'md',
      dataformat: 'yaml',
      itemtitle: 'Item',
      fields: [
        { key: 'title', type: 'string' },
        { key: 'mainContent', type: 'markdown' },
      ],
    }));

    await fs.writeFile(
      path.join(modelPath, 'includes/collections.yaml'),
      yaml.dump(collectionsConfig)
    );

    // Create menu.yml
    await fs.writeFile(
      path.join(modelPath, 'includes/menu.yml'),
      yaml.dump([
        {
          title: 'Content',
          menuItems: collections.map(col => ({ key: col.key })),
        },
      ])
    );

    // Create collection content
    for (const collection of collections) {
      const collectionPath = path.join(workspacePath, collection.folder);

      for (const item of collection.items) {
        const itemPath = path.join(collectionPath, item.key);
        await fs.ensureDir(itemPath);

        // Create frontmatter content
        const frontmatter = yaml.dump(item.frontmatter);
        const content = item.content || '';
        const fileContent = `---\n${frontmatter}---\n\n${content}\n`;

        await fs.writeFile(
          path.join(itemPath, 'index.md'),
          fileContent
        );
      }
    }
  }
}
