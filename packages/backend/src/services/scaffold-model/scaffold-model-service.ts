/**
 * Scaffold Model Service
 *
 * Service for scaffolding content model configurations from existing data files.
 * Analyzes file structure and infers field types to generate model definitions.
 */

import path from 'path';
import fs from 'fs-extra';
import type { DialogAdapter } from '../../adapters/types.js';
import type { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import type {
  ScaffoldDataType,
  ScaffoldResult,
  SingleModelConfig,
  CollectionModelConfig,
  InferredField,
  ScaffoldSupportedExtension,
} from './types.js';
import { SCAFFOLD_SUPPORTED_EXTENSIONS } from './types.js';
import { inferFieldsFromData } from './field-inferrer.js';

/**
 * Dependencies for ScaffoldModelService
 */
export interface ScaffoldModelServiceDependencies {
  dialogAdapter: DialogAdapter;
  formatResolver: FormatProviderResolver;
}

/**
 * ScaffoldModelService creates content model configurations by analyzing
 * existing data files and inferring their field structure.
 */
export class ScaffoldModelService {
  private workspacePath: string;
  private deps: ScaffoldModelServiceDependencies;

  constructor(workspacePath: string, deps: ScaffoldModelServiceDependencies) {
    this.workspacePath = workspacePath;
    this.deps = deps;
  }

  /**
   * Scaffold a single model from a selected file
   *
   * Opens a file dialog for the user to select a data file, parses it,
   * infers field types, and creates a single model configuration.
   */
  async scaffoldSingleFromFile(dataType: string = 'data'): Promise<ScaffoldResult> {
    try {
      // Open file dialog
      const filePaths = await this.deps.dialogAdapter.showOpenDialog({
        title: 'Select a data file to scaffold',
        defaultPath: this.workspacePath,
        buttonLabel: 'Scaffold Single',
        filters: [
          {
            name: 'Data Files',
            extensions: [...SCAFFOLD_SUPPORTED_EXTENSIONS],
          },
        ],
        properties: ['openFile'],
      });

      if (!filePaths || filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }

      const filePath = filePaths[0];
      return await this.createSingleFromFile(filePath, dataType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.showErrorDialog('Scaffold Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Scaffold a collection model from a selected file
   *
   * Opens a file dialog for the user to select a data file from a collection folder,
   * parses it, infers field types, and creates a collection model configuration.
   */
  async scaffoldCollectionFromFile(dataType: string = 'content'): Promise<ScaffoldResult> {
    try {
      // Open file dialog
      const filePaths = await this.deps.dialogAdapter.showOpenDialog({
        title: 'Select a file from the collection folder',
        defaultPath: this.workspacePath,
        buttonLabel: 'Scaffold Collection',
        filters: [
          {
            name: 'Data Files',
            extensions: [...SCAFFOLD_SUPPORTED_EXTENSIONS],
          },
        ],
        properties: ['openFile'],
      });

      if (!filePaths || filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }

      const filePath = filePaths[0];
      return await this.createCollectionFromFile(filePath, dataType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.showErrorDialog('Scaffold Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create a single model configuration from a file path
   */
  async createSingleFromFile(filePath: string, dataType: string): Promise<ScaffoldResult> {
    const parsed = await this.parseFile(filePath);
    if (!parsed.success) {
      return parsed;
    }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    const relativePath = path.relative(this.workspacePath, filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const modelKey = this.generateModelKey(baseName);

    // Infer fields from parsed data
    const fields = inferFieldsFromData(parsed.data!);

    // Create single model config
    const singleConfig: SingleModelConfig = {
      key: modelKey,
      title: this.titleCase(baseName),
      file: relativePath,
      dataformat: this.normalizeDataFormat(ext),
      fields,
    };

    // Write model file
    const modelPath = await this.writeSingleModel(singleConfig, dataType);

    // Add to menu
    await this.addToMenu(modelKey, 'single', dataType);

    return {
      success: true,
      modelKey,
      modelPath,
    };
  }

  /**
   * Create a collection model configuration from a file path
   */
  async createCollectionFromFile(filePath: string, dataType: string): Promise<ScaffoldResult> {
    const parsed = await this.parseFile(filePath);
    if (!parsed.success) {
      return parsed;
    }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    const folderPath = path.dirname(filePath);
    const relativeFolder = path.relative(this.workspacePath, folderPath);
    const folderName = path.basename(folderPath);
    const modelKey = this.generateModelKey(folderName);

    // Infer fields from parsed data
    const fields = inferFieldsFromData(parsed.data!);

    // Create collection model config
    const collectionConfig: CollectionModelConfig = {
      key: modelKey,
      title: this.titleCase(folderName),
      folder: relativeFolder,
      extension: ext,
      dataformat: this.normalizeDataFormat(ext),
      itemtitle: 'title',
      fields,
    };

    // Write model file
    const modelPath = await this.writeCollectionModel(collectionConfig, dataType);

    // Add to menu
    await this.addToMenu(modelKey, 'collection', dataType);

    return {
      success: true,
      modelKey,
      modelPath,
    };
  }

  /**
   * Parse a file and extract its data content
   */
  private async parseFile(
    filePath: string
  ): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath).slice(1).toLowerCase() as ScaffoldSupportedExtension;
    const content = await fs.readFile(filePath, 'utf-8');

    if (!content.trim()) {
      return { success: false, error: 'File is empty' };
    }

    try {
      // Handle markdown files with frontmatter
      if (['md', 'markdown', 'qmd'].includes(ext)) {
        return this.parseFrontmatter(content);
      }

      // Handle data files (yaml, toml, json)
      const formatProvider = this.deps.formatResolver.resolveForExtension(ext);
      if (!formatProvider) {
        return { success: false, error: `Unsupported file format: ${ext}` };
      }

      const data = formatProvider.parse(content);
      if (typeof data !== 'object' || data === null) {
        return { success: false, error: 'File does not contain valid object data' };
      }

      return { success: true, data: data as Record<string, unknown> };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Parse error: ${errorMessage}` };
    }
  }

  /**
   * Parse frontmatter from markdown content
   */
  private parseFrontmatter(
    content: string
  ): { success: boolean; data?: Record<string, unknown>; error?: string } {
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim();

    // Detect frontmatter delimiter and format
    let delimiterPattern: RegExp | null = null;
    let formatProvider = this.deps.formatResolver.resolveForMdFirstLine(firstLine);

    if (firstLine === '---') {
      delimiterPattern = /^---\s*$/;
      formatProvider = formatProvider || this.deps.formatResolver.resolveForExtension('yaml');
    } else if (firstLine === '+++') {
      delimiterPattern = /^\+\+\+\s*$/;
      formatProvider = this.deps.formatResolver.resolveForExtension('toml');
    } else if (firstLine === '{') {
      // JSON frontmatter
      formatProvider = this.deps.formatResolver.resolveForExtension('json');
    } else {
      return { success: false, error: 'No frontmatter found in markdown file' };
    }

    if (!formatProvider) {
      return { success: false, error: 'Could not determine frontmatter format' };
    }

    // Extract frontmatter content
    let frontmatterEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (delimiterPattern && delimiterPattern.test(lines[i].trim())) {
        frontmatterEnd = i;
        break;
      }
    }

    if (frontmatterEnd === -1) {
      // Try parsing the whole content as the format (for JSON frontmatter)
      if (firstLine === '{') {
        try {
          // Find matching closing brace
          let braceCount = 0;
          let jsonEnd = -1;
          for (let i = 0; i < lines.length; i++) {
            for (const char of lines[i]) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
              if (braceCount === 0) {
                jsonEnd = i;
                break;
              }
            }
            if (jsonEnd !== -1) break;
          }
          if (jsonEnd !== -1) {
            const jsonContent = lines.slice(0, jsonEnd + 1).join('\n');
            const data = formatProvider.parse(jsonContent);
            return { success: true, data: data as Record<string, unknown> };
          }
        } catch {
          // Fall through to error
        }
      }
      return { success: false, error: 'Could not find end of frontmatter' };
    }

    const frontmatterContent = lines.slice(1, frontmatterEnd).join('\n');
    try {
      const data = formatProvider.parse(frontmatterContent);
      if (typeof data !== 'object' || data === null) {
        return { success: false, error: 'Frontmatter does not contain valid object data' };
      }
      return { success: true, data: data as Record<string, unknown> };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Frontmatter parse error: ${errorMessage}` };
    }
  }

  /**
   * Write a single model configuration file
   */
  private async writeSingleModel(config: SingleModelConfig, dataType: string): Promise<string> {
    const modelDir = path.join(this.workspacePath, 'quiqr', 'model', 'includes', 'singles');
    await fs.ensureDir(modelDir);

    const modelPath = path.join(modelDir, `${config.key}.yaml`);
    const yamlProvider = this.deps.formatResolver.resolveForExtension('yaml');

    if (!yamlProvider) {
      throw new Error('YAML format provider not available');
    }

    const yamlContent = yamlProvider.dump(config);
    await fs.writeFile(modelPath, yamlContent, 'utf-8');

    return modelPath;
  }

  /**
   * Write a collection model configuration file
   */
  private async writeCollectionModel(
    config: CollectionModelConfig,
    dataType: string
  ): Promise<string> {
    const modelDir = path.join(this.workspacePath, 'quiqr', 'model', 'includes', 'collections');
    await fs.ensureDir(modelDir);

    const modelPath = path.join(modelDir, `${config.key}.yaml`);
    const yamlProvider = this.deps.formatResolver.resolveForExtension('yaml');

    if (!yamlProvider) {
      throw new Error('YAML format provider not available');
    }

    const yamlContent = yamlProvider.dump(config);
    await fs.writeFile(modelPath, yamlContent, 'utf-8');

    return modelPath;
  }

  /**
   * Add a scaffolded model to the menu.yaml in quiqr/model/includes/
   * The menu.yaml in includes/ stores items directly at root level (no 'menu:' wrapper)
   */
  private async addToMenu(
    modelKey: string,
    modelType: 'single' | 'collection',
    dataType: string
  ): Promise<void> {
    const menuPath = path.join(
      this.workspacePath,
      'quiqr',
      'model',
      'includes',
      'menu.yaml'
    );

    let menuItems: Array<Record<string, unknown>> = [];
    const yamlProvider = this.deps.formatResolver.resolveForExtension('yaml');

    if (!yamlProvider) {
      throw new Error('YAML format provider not available');
    }

    // Read existing menu if it exists
    if (fs.existsSync(menuPath)) {
      const content = await fs.readFile(menuPath, 'utf-8');
      if (content.trim()) {
        const parsed = yamlProvider.parse(content);
        // Menu items are stored directly as an array at root level
        if (Array.isArray(parsed)) {
          menuItems = parsed as Array<Record<string, unknown>>;
        }
      }
    }

    // Find or create the data type group
    let group = menuItems.find((item) => item.key === dataType);

    if (!group) {
      group = {
        key: dataType,
        title: this.titleCase(dataType),
        menuItems: [],
      };
      menuItems.push(group);
    }

    // Ensure menuItems array exists in the group
    if (!Array.isArray(group.menuItems)) {
      group.menuItems = [];
    }

    const groupMenuItems = group.menuItems as Array<Record<string, unknown>>;

    // Check if item already exists
    const existingItem = groupMenuItems.find((item) => item.key === modelKey);
    if (!existingItem) {
      groupMenuItems.push({
        key: modelKey,
        [modelType]: modelKey,
      });
    }

    // Write updated menu - items directly at root level (no wrapper)
    await fs.ensureDir(path.dirname(menuPath));
    const yamlContent = yamlProvider.dump(menuItems);
    await fs.writeFile(menuPath, yamlContent, 'utf-8');
  }

  /**
   * Transform inferred fields to YAML-compatible format
   */
  private transformFieldsForYaml(fields: InferredField[]): Record<string, unknown>[] {
    return fields.map((field) => {
      const result: Record<string, unknown> = {
        key: field.key,
        type: field.type,
      };

      if (field.groupdata) {
        result.groupdata = true;
      }

      if (field.fields && field.fields.length > 0) {
        result.fields = this.transformFieldsForYaml(field.fields);
      }

      return result;
    });
  }

  /**
   * Generate a unique model key from a base name
   */
  private generateModelKey(baseName: string): string {
    // Convert to lowercase, replace spaces/special chars with hyphens
    return baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Convert string to title case
   */
  private titleCase(str: string): string {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Normalize data format extension
   */
  private normalizeDataFormat(ext: string): string {
    if (ext === 'yml') return 'yaml';
    if (['md', 'markdown', 'qmd'].includes(ext)) return 'yaml'; // Default frontmatter format
    return ext;
  }

  /**
   * Show an error dialog to the user
   */
  private async showErrorDialog(title: string, message: string): Promise<void> {
    await this.deps.dialogAdapter.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      title,
      message,
      detail: message,
    });
  }
}

/**
 * Factory function to create a ScaffoldModelService instance
 */
export function createScaffoldModelService(
  workspacePath: string,
  deps: ScaffoldModelServiceDependencies
): ScaffoldModelService {
  return new ScaffoldModelService(workspacePath, deps);
}
