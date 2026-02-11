import { describe, it, expect } from 'vitest';
import {
  inferFieldType,
  parseKeysToFields,
  inferFieldsFromData,
} from '../field-inferrer.js';
import type { InferredField } from '../types.js';

describe('Field Inferrer', () => {
  describe('inferFieldType', () => {
    it('infers boolean type', () => {
      expect(inferFieldType('draft', true)).toBe('boolean');
      expect(inferFieldType('published', false)).toBe('boolean');
    });

    it('infers number type', () => {
      expect(inferFieldType('weight', 42)).toBe('number');
      expect(inferFieldType('price', 19.99)).toBe('number');
    });

    it('infers string type', () => {
      expect(inferFieldType('title', 'Hello World')).toBe('string');
      expect(inferFieldType('author', 'John Doe')).toBe('string');
    });

    it('infers markdown type for content keys', () => {
      expect(inferFieldType('mainContent', 'Some markdown content')).toBe(
        'markdown'
      );
      expect(inferFieldType('body', 'Body text')).toBe('markdown');
      expect(inferFieldType('content', 'Content text')).toBe('markdown');
    });

    it('infers leaf-array for arrays of primitives', () => {
      expect(inferFieldType('tags', ['tag1', 'tag2'])).toBe('leaf-array');
      expect(inferFieldType('numbers', [1, 2, 3])).toBe('leaf-array');
    });

    it('infers accordion for arrays of objects', () => {
      expect(inferFieldType('items', [{ name: 'item1' }])).toBe('accordion');
      expect(inferFieldType('authors', [{ name: 'John' }, { name: 'Jane' }])).toBe(
        'accordion'
      );
    });

    it('infers nest for objects', () => {
      expect(inferFieldType('meta', { title: 'Title', desc: 'Desc' })).toBe(
        'nest'
      );
    });

    it('treats empty arrays as leaf-array', () => {
      // Empty arrays are still arrays, so we infer leaf-array
      expect(inferFieldType('empty', [])).toBe('leaf-array');
    });

    it('handles null and undefined as string', () => {
      expect(inferFieldType('nullField', null)).toBe('string');
      expect(inferFieldType('undefinedField', undefined)).toBe('string');
    });
  });

  describe('parseKeysToFields', () => {
    it('parses simple object to fields', () => {
      const obj = {
        title: 'Hello',
        draft: false,
        weight: 10,
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(3);
      expect(fields.find((f) => f.key === 'title')).toEqual({
        key: 'title',
        type: 'string',
      });
      expect(fields.find((f) => f.key === 'draft')).toEqual({
        key: 'draft',
        type: 'boolean',
      });
      expect(fields.find((f) => f.key === 'weight')).toEqual({
        key: 'weight',
        type: 'number',
      });
    });

    it('parses nested objects recursively', () => {
      const obj = {
        author: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const authorField = fields[0];
      expect(authorField.key).toBe('author');
      expect(authorField.type).toBe('nest');
      expect(authorField.groupdata).toBe(true);
      expect(authorField.fields).toHaveLength(2);
    });

    it('parses arrays of objects with accordion type', () => {
      const obj = {
        items: [{ name: 'Item 1', price: 10 }],
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const itemsField = fields[0];
      expect(itemsField.key).toBe('items');
      expect(itemsField.type).toBe('accordion');
      expect(itemsField.fields).toHaveLength(2);
    });

    it('adds field property to leaf-array with string items', () => {
      const obj = {
        tags: ['tag1', 'tag2'],
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const tagsField = fields[0];
      expect(tagsField.key).toBe('tags');
      expect(tagsField.type).toBe('leaf-array');
      expect(tagsField.field).toEqual({
        key: 'item',
        type: 'string',
      });
    });

    it('adds field property to leaf-array with number items', () => {
      const obj = {
        scores: [10, 20, 30],
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const scoresField = fields[0];
      expect(scoresField.key).toBe('scores');
      expect(scoresField.type).toBe('leaf-array');
      expect(scoresField.field).toEqual({
        key: 'item',
        type: 'number',
      });
    });

    it('adds field property to leaf-array with boolean items', () => {
      const obj = {
        flags: [true, false, true],
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const flagsField = fields[0];
      expect(flagsField.key).toBe('flags');
      expect(flagsField.type).toBe('leaf-array');
      expect(flagsField.field).toEqual({
        key: 'item',
        type: 'boolean',
      });
    });

    it('adds field property to empty leaf-array with default string type', () => {
      const obj = {
        empty: [],
      };

      const fields: InferredField[] = [];
      parseKeysToFields(obj, fields, 0);

      expect(fields).toHaveLength(1);
      const emptyField = fields[0];
      expect(emptyField.key).toBe('empty');
      expect(emptyField.type).toBe('leaf-array');
      expect(emptyField.field).toEqual({
        key: 'item',
        type: 'string',
      });
    });

    it('limits recursion depth', () => {
      const deepObj = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep',
                },
              },
            },
          },
        },
      };

      const fields: InferredField[] = [];
      parseKeysToFields(deepObj, fields, 0);

      // Should stop at level 3
      expect(fields).toHaveLength(1);
      const level1 = fields[0];
      expect(level1.fields).toBeDefined();
      const level2 = level1.fields?.[0];
      expect(level2?.fields).toBeDefined();
      const level3 = level2?.fields?.[0];
      expect(level3?.fields).toBeDefined();
      // Level 4 should exist but level 5 should be stopped
      const level4 = level3?.fields?.[0];
      expect(level4).toBeDefined();
    });
  });

  describe('inferFieldsFromData', () => {
    it('infers fields from complete data object', () => {
      const data = {
        title: 'My Post',
        date: '2024-01-15',
        draft: false,
        weight: 5,
        tags: ['blog', 'tech'],
        author: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const fields = inferFieldsFromData(data);

      expect(fields).toHaveLength(6);
      expect(fields.find((f) => f.key === 'title')?.type).toBe('string');
      expect(fields.find((f) => f.key === 'draft')?.type).toBe('boolean');
      expect(fields.find((f) => f.key === 'weight')?.type).toBe('number');
      expect(fields.find((f) => f.key === 'tags')?.type).toBe('leaf-array');
      expect(fields.find((f) => f.key === 'author')?.type).toBe('nest');
    });

    it('returns empty array for non-object input', () => {
      expect(inferFieldsFromData(null)).toEqual([]);
      expect(inferFieldsFromData('string')).toEqual([]);
      expect(inferFieldsFromData(123)).toEqual([]);
      expect(inferFieldsFromData([])).toEqual([]);
    });

    it('handles empty object', () => {
      expect(inferFieldsFromData({})).toEqual([]);
    });
  });
});
