/**
 * Workspace Configuration Validator
 *
 * Validates workspace configuration using Zod schemas from @quiqr/types.
 * Replaces the old Joi-based validator.
 */

import path from 'path';
import { z } from 'zod';
import {
  workspaceDetailsBaseSchema,
  singleConfigSchema,
  collectionConfigSchema,
  type SingleConfig,
  type CollectionConfig,
  type WorkspaceDetails,
} from '@quiqr/types';
import { FormatProviderResolver } from '../../utils/format-provider-resolver.js';

/**
 * Workspace configuration with optional dynamics field
 * Extends WorkspaceDetails from @quiqr/types with dynamics support
 */
export interface WorkspaceConfig extends WorkspaceDetails {
  dynamics?: any[];
}

/**
 * Validation utilities for content and data formats
 */
class ValidationUtils {
  private formatResolver: FormatProviderResolver;
  contentFormatReg: RegExp;
  dataFormatReg: RegExp;
  allFormatsReg: RegExp;

  constructor() {
    this.formatResolver = new FormatProviderResolver();
    const dataFormatsPiped = this.formatResolver.allFormatsExt().join('|');
    this.contentFormatReg = new RegExp('^(md|qmd|mmark)$');
    this.dataFormatReg = new RegExp('^(' + dataFormatsPiped + ')$');
    this.allFormatsReg = new RegExp('^(' + dataFormatsPiped + '|md|qmd|mmark)$');
  }
}

const validationUtils = new ValidationUtils();

/**
 * WorkspaceConfigValidator validates workspace configuration files
 * Uses Zod schemas for type-safe validation
 */
export class WorkspaceConfigValidator {
  /**
   * Normalize config by ensuring collections and singles arrays exist
   */
  normalizeConfig(config: Partial<WorkspaceConfig>): void {
    if (config) {
      if (!config.collections) config.collections = [];
      if (!config.singles) config.singles = [];
    }
  }

  /**
   * Validate the entire workspace configuration
   * @returns null if valid, error message string if invalid
   */
  validate(config: Partial<WorkspaceConfig>): string | null {
    this.normalizeConfig(config);

    // Extend workspaceDetailsBaseSchema to include dynamics (not in base schema yet)
    const workspaceConfigSchema = workspaceDetailsBaseSchema.extend({
      dynamics: z.array(z.any()).optional(),
    });

    try {
      workspaceConfigSchema.parse(config);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // TODO
        // we need to output clear schema error to the log
        // model-developers need this when creating new sites
        return String(err);
      }
      return String(err);
    }

    // Validate each collection
    if (config.collections) {
      for (const collection of config.collections) {
        const error = this.validateCollection(collection);
        if (error) return error;
      }
    }

    // Validate each single
    if (config.singles) {
      for (const single of config.singles) {
        const error = this.validateSingle(single);
        if (error) return error;
      }
    }

    return null;
  }

  /**
   * Check that all fields have unique keys
   */
  checkFieldsKeys(fields: any[] | null | undefined, hintPath: string): void {
    if (fields == null) return;

    const keys: string[] = [];
    const error = `${hintPath}: Each field must have an unique key and the key must be a string.`;

    for (const field of fields) {
      const key = field.key;

      if (key == null) {
        throw new Error(error + ` Field without a key is not allowed.`);
      }
      if (typeof key !== 'string') {
        throw new Error(error + ' Field key must be a string.');
      } else if (keys.indexOf(key) !== -1) {
        throw new Error(error + ` The key "${key}" is duplicated.`);
      } else {
        keys.push(key);
        this.checkFieldsKeys(field.fields, `${hintPath} > Field[key=${key}]`);
      }
    }
  }

  /**
   * Validate a single collection configuration
   * @returns null if valid, error message string if invalid
   */
  validateCollection(collection: any): string | null {
    try {
      // Use the Zod schema from @quiqr/types
      collectionConfigSchema.parse(collection);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return `Collection validation error: ${err.errors[0].message}`;
      }
      return String(err);
    }

    // Additional validation for content files vs data files
    if (validationUtils.contentFormatReg.test(collection.extension)) {
      // Content files require dataformat
      if (!collection.dataformat) {
        return 'The dataformat value is invalid. Content files require a dataformat.';
      }
      if (!validationUtils.dataFormatReg.test(collection.dataformat)) {
        return 'The dataformat value is invalid.';
      }
    } else {
      // Data files: dataformat should match extension
      if (collection.dataformat && collection.dataformat !== collection.extension) {
        return 'The dataformat value does not match the extension value.';
      }
    }

    // Check field keys are unique
    try {
      this.checkFieldsKeys(collection.fields, `Collection[key=${collection.key}]`);
    } catch (err) {
      return String(err);
    }

    return null;
  }

  /**
   * Validate a single configuration
   * @returns null if valid, error message string if invalid
   */
  validateSingle(single: any): string | null {
    try {
      // Use the Zod schema from @quiqr/types
      singleConfigSchema.parse(single);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return `Single validation error: ${err.errors[0].message}`;
      }
      return String(err);
    }

    const extension = path.extname(single.file).replace('.', '');

    // Additional validation for content files
    if (single.file.startsWith('content') || single.file.startsWith('quiqr/home')) {
      // Content files require dataformat
      if (!single.dataformat) {
        return 'The dataformat value is invalid. Content files require a dataformat.';
      }
      if (!validationUtils.dataFormatReg.test(single.dataformat)) {
        return 'The dataformat value is invalid.';
      }
    } else {
      // Data files: dataformat should match extension
      if (single.dataformat && single.dataformat !== extension) {
        return 'The dataformat value does not match the file value: ' + single.dataformat;
      }
    }

    // Check field keys are unique
    try {
      this.checkFieldsKeys(single.fields, `Single[key=${single.key}]`);
    } catch (err) {
      return String(err);
    }

    return null;
  }
}

/**
 * Default singleton instance
 */
export default WorkspaceConfigValidator;
