/**
 * Scaffold Model Types
 *
 * Type definitions for the scaffold model service.
 */

/**
 * Supported data types for scaffolding
 */
export type ScaffoldDataType = 'single' | 'collection';

/**
 * Supported file extensions for scaffolding
 */
export const SCAFFOLD_SUPPORTED_EXTENSIONS = [
  'yaml',
  'yml',
  'toml',
  'json',
  'md',
  'markdown',
  'qmd',
] as const;

export type ScaffoldSupportedExtension = (typeof SCAFFOLD_SUPPORTED_EXTENSIONS)[number];

/**
 * Field definition inferred from data
 */
export interface InferredField {
  key: string;
  type: string;
  fields?: InferredField[];
  groupdata?: boolean;
  /** Child field definition for leaf-array type */
  field?: {
    key: string;
    type: string;
    title?: string;
  };
}

/**
 * Model configuration for a single
 */
export interface SingleModelConfig {
  key: string;
  title: string;
  file: string;
  dataformat: string;
  fields: InferredField[];
}

/**
 * Model configuration for a collection
 */
export interface CollectionModelConfig {
  key: string;
  title: string;
  folder: string;
  extension: string;
  dataformat: string;
  itemtitle: string;
  fields: InferredField[];
}

/**
 * Result of a scaffold operation
 */
export interface ScaffoldResult {
  success: boolean;
  modelKey?: string;
  modelPath?: string;
  error?: string;
}

/**
 * Dependencies for ScaffoldModelService
 */
export interface ScaffoldModelServiceDependencies {
  dialogAdapter: import('../../adapters/types.js').DialogAdapter;
  formatResolver: import('../../utils/format-provider-resolver.js').FormatProviderResolver;
}
