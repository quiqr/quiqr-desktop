import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ScaffoldModelServiceDependencies } from '../types.js';
import type { DialogAdapter } from '../../../adapters/types.js';
import { FormatProviderResolver } from '../../../utils/format-provider-resolver.js';
import * as path from 'path';
import { tmpdir } from 'os';

// Use vi.hoisted to define mocks that can be used in vi.mock
const { mockExistsSync, mockReadFile, mockEnsureDir, mockWriteFile } = vi.hoisted(() => ({
  mockExistsSync: vi.fn(),
  mockReadFile: vi.fn(),
  mockEnsureDir: vi.fn(),
  mockWriteFile: vi.fn(),
}));

// Mock fs-extra with hoisted mocks
vi.mock('fs-extra', () => ({
  default: {
    existsSync: mockExistsSync,
    readFile: mockReadFile,
    ensureDir: mockEnsureDir,
    writeFile: mockWriteFile,
  },
  existsSync: mockExistsSync,
  readFile: mockReadFile,
  ensureDir: mockEnsureDir,
  writeFile: mockWriteFile,
}));

// Import after mock setup
import { ScaffoldModelService, createScaffoldModelService } from '../scaffold-model-service.js';

describe('ScaffoldModelService', () => {
  let mockDialogAdapter: DialogAdapter;
  let formatResolver: FormatProviderResolver;
  let workspacePath: string;
  let service: ScaffoldModelService;

  beforeEach(() => {
    vi.clearAllMocks();

    workspacePath = path.join(tmpdir(), 'test-workspace');

    mockDialogAdapter = {
      showOpenDialog: vi.fn(),
      showMessageBox: vi.fn(),
      showSaveDialog: vi.fn(),
    };

    formatResolver = new FormatProviderResolver();

    service = createScaffoldModelService(workspacePath, {
      dialogAdapter: mockDialogAdapter,
      formatResolver,
    });
  });

  describe('scaffoldSingleFromFile', () => {
    it('should return error when user cancels file selection', async () => {
      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([]);

      const result = await service.scaffoldSingleFromFile('single');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('should scaffold a single from YAML file', async () => {
      const yamlContent = `title: Test Page
author: John Doe
published: true
views: 100
`;
      const filePath = path.join(workspacePath, 'content', 'test.yaml');

      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([filePath]);
      mockExistsSync.mockResolvedValue(true);
      mockReadFile.mockResolvedValue(yamlContent);
      mockEnsureDir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.scaffoldSingleFromFile('single');

      expect(result.success).toBe(true);
      expect(result.modelKey).toBeDefined();
      expect(result.modelPath).toContain('singles');
    });

    it('should handle parse errors gracefully', async () => {
      const invalidYaml = `title: [invalid yaml`;
      const filePath = path.join(workspacePath, 'content', 'test.yaml');

      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([filePath]);
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockResolvedValue(invalidYaml);
      vi.mocked(mockDialogAdapter.showMessageBox).mockResolvedValue(0);

      const result = await service.scaffoldSingleFromFile('single');

      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toContain('parse');
    });
  });

  describe('scaffoldCollectionFromFile', () => {
    it('should return error when user cancels file selection', async () => {
      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([]);

      const result = await service.scaffoldCollectionFromFile('collection');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('should scaffold a collection from markdown file with frontmatter', async () => {
      const mdContent = `---
title: Blog Post
date: 2024-01-15
tags:
  - tech
  - news
---

# Main Content

This is the body of the post.
`;
      const filePath = path.join(workspacePath, 'content', 'posts', 'test.md');

      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([filePath]);
      // Mock existsSync to return true for the file, but false for menu.yaml
      mockExistsSync.mockImplementation((p: string) => {
        if (p.endsWith('menu.yaml')) return false;
        return p === filePath;
      });
      mockReadFile.mockResolvedValue(mdContent);
      mockEnsureDir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.scaffoldCollectionFromFile('collection');

      expect(result.success).toBe(true);
      expect(result.modelKey).toBeDefined();
      expect(result.modelPath).toContain('collections');
    });

    it('should handle JSON files', async () => {
      const jsonContent = JSON.stringify({
        name: 'Product',
        price: 29.99,
        inStock: true,
        categories: ['electronics', 'gadgets'],
      });
      const filePath = path.join(workspacePath, 'data', 'product.json');

      vi.mocked(mockDialogAdapter.showOpenDialog).mockResolvedValue([filePath]);
      // Mock existsSync to return true for the file, but false for menu.yaml
      mockExistsSync.mockImplementation((p: string) => {
        if (p.endsWith('menu.yaml')) return false;
        return p === filePath;
      });
      mockReadFile.mockResolvedValue(jsonContent);
      mockEnsureDir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.scaffoldCollectionFromFile('collection');

      expect(result.success).toBe(true);
      expect(result.modelKey).toBeDefined();
    });
  });

  describe('createScaffoldModelService factory', () => {
    it('should create a ScaffoldModelService instance', () => {
      const deps: ScaffoldModelServiceDependencies = {
        dialogAdapter: mockDialogAdapter,
        formatResolver,
      };

      const svc = createScaffoldModelService(workspacePath, deps);

      expect(svc).toBeInstanceOf(ScaffoldModelService);
    });
  });
});
