/**
 * Field Inferrer
 *
 * Infers field types from data values for scaffold model generation.
 */

import type { InferredField } from './types.js';

/**
 * Infer field type from a JavaScript value
 */
export function inferFieldType(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return 'string';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    // Special case: mainContent field should be markdown
    if (key === 'mainContent' || key === 'body' || key === 'content') {
      return 'markdown';
    }
    return 'string';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'leaf-array';
    }
    const firstItem = value[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      return 'accordion';
    }
    return 'leaf-array';
  }

  if (typeof value === 'object') {
    return 'nest';
  }

  return 'string';
}

/**
 * Recursively parse object keys into field definitions
 *
 * @param obj - The object to parse
 * @param fields - The array to populate with inferred fields
 * @param level - Current nesting level (for debugging)
 */
export function parseKeysToFields(
  obj: Record<string, unknown>,
  fields: InferredField[] = [],
  level: number = 0
): InferredField[] {
  for (const [key, value] of Object.entries(obj)) {
    const fieldType = inferFieldType(key, value);
    const field: InferredField = {
      key,
      type: fieldType,
    };

    // Handle nested objects
    if (fieldType === 'nest' && typeof value === 'object' && value !== null) {
      field.groupdata = true;
      field.fields = parseKeysToFields(value as Record<string, unknown>, [], level + 1);
    }

    // Handle arrays of objects (accordion)
    if (fieldType === 'accordion' && Array.isArray(value) && value.length > 0) {
      const firstItem = value[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        field.fields = parseKeysToFields(firstItem as Record<string, unknown>, [], level + 1);
      }
    }

    // Handle leaf-array: add child field definition
    if (fieldType === 'leaf-array') {
      let childType = 'string'; // default
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'boolean') {
          childType = 'boolean';
        } else if (typeof firstItem === 'number') {
          childType = 'number';
        }
        // strings remain 'string'
      }
      field.field = {
        key: 'item',
        type: childType,
      };
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Infer fields from parsed content data
 *
 * @param data - The parsed content data (frontmatter or raw data file)
 * @returns Array of inferred field definitions
 */
export function inferFieldsFromData(data: unknown): InferredField[] {
  if (data === null || data === undefined) {
    return [];
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    return [];
  }
  return parseKeysToFields(data as Record<string, unknown>);
}
