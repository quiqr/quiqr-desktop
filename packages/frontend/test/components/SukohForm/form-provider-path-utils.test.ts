/**
 * Path Utilities Tests
 *
 * Tests for the pure utility functions exported from FormProvider:
 * - getAtPath: Get nested values using dot/bracket notation
 * - setAtPath: Set nested values immutably
 * - deleteAtPath: Delete nested values immutably
 */

import { describe, it, expect } from 'vitest';
import { getAtPath, setAtPath, deleteAtPath } from '../../../src/components/SukohForm/FormProvider';

describe('getAtPath', () => {
  const testObj = {
    foo: { bar: { baz: 'value' } },
    items: [{ name: 'first' }, { name: 'second' }],
    mixed: {
      arr: [1, 2, 3],
      nested: { deep: { value: 'found' } },
    },
    nullValue: null,
    emptyString: '',
    zero: 0,
    falseValue: false,
  };

  describe('basic path access', () => {
    it('gets nested value with dot notation', () => {
      expect(getAtPath(testObj, 'foo.bar.baz')).toBe('value');
    });

    it('gets top-level value', () => {
      expect(getAtPath(testObj, 'foo')).toEqual({ bar: { baz: 'value' } });
    });

    it('returns object for empty path', () => {
      expect(getAtPath(testObj, '')).toBe(testObj);
    });
  });

  describe('array access', () => {
    it('gets array item with bracket notation', () => {
      expect(getAtPath(testObj, 'items[0].name')).toBe('first');
    });

    it('gets array item with dot notation (numeric key)', () => {
      expect(getAtPath(testObj, 'items.1.name')).toBe('second');
    });

    it('gets nested array value', () => {
      expect(getAtPath(testObj, 'mixed.arr[1]')).toBe(2);
    });

    it('gets deeply nested value through array', () => {
      expect(getAtPath(testObj, 'mixed.nested.deep.value')).toBe('found');
    });
  });

  describe('missing paths', () => {
    it('returns undefined for missing path', () => {
      expect(getAtPath(testObj, 'foo.missing.path')).toBeUndefined();
    });

    it('returns undefined for missing array index', () => {
      expect(getAtPath(testObj, 'items[99].name')).toBeUndefined();
    });

    it('returns undefined when accessing property of null', () => {
      expect(getAtPath(testObj, 'nullValue.something')).toBeUndefined();
    });

    it('returns undefined for nonexistent top-level key', () => {
      expect(getAtPath(testObj, 'nonexistent')).toBeUndefined();
    });
  });

  describe('falsy values', () => {
    it('correctly returns null value', () => {
      expect(getAtPath(testObj, 'nullValue')).toBeNull();
    });

    it('correctly returns empty string', () => {
      expect(getAtPath(testObj, 'emptyString')).toBe('');
    });

    it('correctly returns zero', () => {
      expect(getAtPath(testObj, 'zero')).toBe(0);
    });

    it('correctly returns false', () => {
      expect(getAtPath(testObj, 'falseValue')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles path with only dots (returns object since segments are empty)', () => {
      // Path "..." splits to ["", "", "", ""], filter(Boolean) returns [],
      // so it's equivalent to empty path which returns the whole object
      expect(getAtPath(testObj, '...')).toBe(testObj);
    });

    it('handles path starting with dot', () => {
      expect(getAtPath(testObj, '.foo')).toEqual({ bar: { baz: 'value' } });
    });

    it('handles consecutive brackets', () => {
      const arrObj = { items: [[1, 2], [3, 4]] };
      expect(getAtPath(arrObj, 'items[0][1]')).toBe(2);
    });
  });
});

describe('setAtPath', () => {
  describe('basic setting', () => {
    it('sets nested value immutably', () => {
      const obj = { foo: { bar: 'old' } };
      const result = setAtPath(obj, 'foo.bar', 'new');

      expect(result.foo.bar).toBe('new');
      expect(obj.foo.bar).toBe('old'); // Original unchanged
      expect(result).not.toBe(obj);
    });

    it('sets top-level value', () => {
      const obj = { foo: 'old' };
      const result = setAtPath(obj, 'foo', 'new');

      expect(result.foo).toBe('new');
      expect(obj.foo).toBe('old');
    });

    it('returns value directly for empty path', () => {
      const obj = { foo: 'bar' };
      const result = setAtPath(obj, '', { new: 'value' });

      expect(result).toEqual({ new: 'value' });
    });
  });

  describe('creating intermediate structures', () => {
    it('creates intermediate objects', () => {
      const obj: Record<string, unknown> = {};
      const result = setAtPath(obj, 'a.b.c', 'value');

      expect(result).toEqual({ a: { b: { c: 'value' } } });
    });

    it('creates arrays for numeric indices', () => {
      const obj: Record<string, unknown> = {};
      const result = setAtPath(obj, 'items.0.name', 'first');

      expect(Array.isArray(result.items)).toBe(true);
      expect((result.items as Array<{ name: string }>)[0].name).toBe('first');
    });

    it('creates nested array with bracket notation', () => {
      const obj: Record<string, unknown> = {};
      const result = setAtPath(obj, 'data[0].values[1]', 'item');

      expect(result).toEqual({
        data: [{ values: [undefined, 'item'] }],
      });
    });
  });

  describe('immutability', () => {
    it('does not mutate nested objects', () => {
      const nested = { value: 'original' };
      const obj = { foo: nested, bar: 'unchanged' };
      const result = setAtPath(obj, 'foo.value', 'modified');

      expect(nested.value).toBe('original');
      expect(result.foo.value).toBe('modified');
      expect(result.bar).toBe('unchanged');
    });

    it('does not mutate arrays', () => {
      const arr = [1, 2, 3];
      const obj = { items: arr };
      const result = setAtPath(obj, 'items.1', 99);

      expect(arr[1]).toBe(2);
      expect((result.items as number[])[1]).toBe(99);
    });

    it('preserves sibling properties', () => {
      const obj = {
        a: { x: 1, y: 2 },
        b: { z: 3 },
      };
      const result = setAtPath(obj, 'a.x', 100);

      expect(result.a.x).toBe(100);
      expect(result.a.y).toBe(2);
      expect(result.b.z).toBe(3);
    });
  });

  describe('setting various value types', () => {
    it('sets null value', () => {
      const obj = { foo: 'bar' };
      const result = setAtPath(obj, 'foo', null);
      expect(result.foo).toBeNull();
    });

    it('sets undefined value', () => {
      const obj = { foo: 'bar' };
      const result = setAtPath(obj, 'foo', undefined);
      expect(result.foo).toBeUndefined();
    });

    it('sets object value', () => {
      const obj: Record<string, unknown> = { foo: 'bar' };
      const newValue = { nested: 'object' };
      const result = setAtPath(obj, 'foo', newValue);
      expect(result.foo).toEqual(newValue);
    });

    it('sets array value', () => {
      const obj: Record<string, unknown> = { foo: 'bar' };
      const result = setAtPath(obj, 'foo', [1, 2, 3]);
      expect(result.foo).toEqual([1, 2, 3]);
    });
  });
});

describe('deleteAtPath', () => {
  describe('basic deletion', () => {
    it('deletes nested value immutably', () => {
      const obj = { foo: { bar: 'value', other: 'keep' } };
      const result = deleteAtPath(obj, 'foo.bar');

      expect(result.foo.bar).toBeUndefined();
      expect(result.foo.other).toBe('keep');
      expect(obj.foo.bar).toBe('value'); // Original unchanged
    });

    it('deletes top-level value', () => {
      const obj = { foo: 'bar', baz: 'keep' };
      const result = deleteAtPath(obj, 'foo');

      expect(result.foo).toBeUndefined();
      expect(result.baz).toBe('keep');
      expect(obj.foo).toBe('bar');
    });
  });

  describe('array element deletion', () => {
    it('deletes array element', () => {
      const obj = { items: ['a', 'b', 'c'] };
      const result = deleteAtPath(obj, 'items.1');

      // Note: delete on array creates a hole, doesn't shift elements
      expect((result.items as string[])[1]).toBeUndefined();
      expect(obj.items[1]).toBe('b');
    });

    it('deletes nested property in array element', () => {
      const obj = { items: [{ name: 'first', value: 1 }] };
      const result = deleteAtPath(obj, 'items.0.name');

      expect((result.items as Array<{ name?: string; value: number }>)[0].name).toBeUndefined();
      expect((result.items as Array<{ name?: string; value: number }>)[0].value).toBe(1);
    });
  });

  describe('missing paths', () => {
    it('returns original object for missing path', () => {
      const obj = { foo: { bar: 'value' } };
      const result = deleteAtPath(obj, 'foo.missing.path');

      expect(result).toBe(obj); // Same reference if path doesn't exist
    });

    it('returns empty object for empty path', () => {
      const obj = { foo: 'bar' };
      const result = deleteAtPath(obj, '');

      expect(result).toEqual({});
    });
  });

  describe('immutability', () => {
    it('does not mutate original object', () => {
      const original = { a: { b: { c: 'value' } } };
      const frozen = JSON.parse(JSON.stringify(original));

      deleteAtPath(original, 'a.b.c');

      expect(original).toEqual(frozen);
    });

    it('preserves sibling properties', () => {
      const obj = {
        a: { x: 1, y: 2, z: 3 },
        b: { w: 4 },
      };
      const result = deleteAtPath(obj, 'a.y');

      expect(result.a.x).toBe(1);
      expect(result.a.y).toBeUndefined();
      expect(result.a.z).toBe(3);
      expect(result.b.w).toBe(4);
    });
  });
});

describe('integration: combined operations', () => {
  it('set then get returns the set value', () => {
    const obj: Record<string, unknown> = { foo: 'bar' };
    const updated = setAtPath(obj, 'new.nested.value', 'test');
    const retrieved = getAtPath(updated, 'new.nested.value');

    expect(retrieved).toBe('test');
  });

  it('delete then get returns undefined', () => {
    const obj = { foo: { bar: 'value' } };
    const updated = deleteAtPath(obj, 'foo.bar');
    const retrieved = getAtPath(updated, 'foo.bar');

    expect(retrieved).toBeUndefined();
  });

  it('multiple sets preserve all values', () => {
    let obj: Record<string, unknown> = {};
    obj = setAtPath(obj, 'a.x', 1);
    obj = setAtPath(obj, 'a.y', 2);
    obj = setAtPath(obj, 'b.z', 3);

    expect(getAtPath(obj, 'a.x')).toBe(1);
    expect(getAtPath(obj, 'a.y')).toBe(2);
    expect(getAtPath(obj, 'b.z')).toBe(3);
  });

  it('handles real-world form data scenario', () => {
    let formData: Record<string, unknown> = {
      title: 'My Post',
      author: { name: 'John', email: 'john@example.com' },
      tags: ['javascript', 'testing'],
    };

    // Update author name
    formData = setAtPath(formData, 'author.name', 'Jane');
    expect(getAtPath(formData, 'author.name')).toBe('Jane');
    expect(getAtPath(formData, 'author.email')).toBe('john@example.com');

    // Add a new tag
    formData = setAtPath(formData, 'tags.2', 'vitest');
    expect(getAtPath(formData, 'tags.2')).toBe('vitest');

    // Delete author email
    formData = deleteAtPath(formData, 'author.email');
    expect(getAtPath(formData, 'author.email')).toBeUndefined();
    expect(getAtPath(formData, 'author.name')).toBe('Jane');
  });
});
