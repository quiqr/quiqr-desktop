/**
 * Tests for preview configuration in instance settings
 */

import { describe, it, expect } from 'vitest';
import { instanceSettingsSchema } from '@quiqr/types';

describe('Preview Instance Settings', () => {
  it('defaults preview.enabled to true', () => {
    const result = instanceSettingsSchema.parse({});
    expect(result.preview.enabled).toBe(true);
  });

  it('defaults preview.baseUrl to an empty string (runtime-mode fallback applies in the frontend)', () => {
    const result = instanceSettingsSchema.parse({});
    expect(result.preview.baseUrl).toBe('');
  });

  it('accepts custom preview config', () => {
    const result = instanceSettingsSchema.parse({
      preview: {
        enabled: false,
        baseUrl: 'https://preview.example.com',
      },
    });
    expect(result.preview.enabled).toBe(false);
    expect(result.preview.baseUrl).toBe('https://preview.example.com');
  });

  it('allows partial preview config with defaults', () => {
    const result = instanceSettingsSchema.parse({
      preview: { enabled: false },
    });
    expect(result.preview.enabled).toBe(false);
    expect(result.preview.baseUrl).toBe('');
  });

  it('returns an explicitly set baseUrl verbatim (admin override)', () => {
    const result = instanceSettingsSchema.parse({
      preview: { baseUrl: 'https://cms.example.com:13131' },
    });
    expect(result.preview.baseUrl).toBe('https://cms.example.com:13131');
  });
});
