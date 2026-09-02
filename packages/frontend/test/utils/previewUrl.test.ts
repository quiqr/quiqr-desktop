/**
 * previewUrl Utility Tests
 *
 * Tests for resolvePreviewBaseUrl: runtime-mode-aware resolution of the
 * Hugo preview server base URL. See change: fix-server-mode-preview-url.
 */

import { describe, it, expect } from 'vitest';
import {
  resolvePreviewBaseUrl,
  ELECTRON_PREVIEW_BASE_URL,
} from '../../src/utils/previewUrl';

describe('resolvePreviewBaseUrl', () => {
  it('returns the Electron localhost URL when not standalone and no override', () => {
    expect(
      resolvePreviewBaseUrl({ isStandalone: false, setting: '' }),
    ).toBe(ELECTRON_PREVIEW_BASE_URL);
    expect(ELECTRON_PREVIEW_BASE_URL).toBe('http://localhost:13131');
  });

  it('derives from the browser host in standalone mode (http)', () => {
    expect(
      resolvePreviewBaseUrl({
        isStandalone: true,
        setting: '',
        protocol: 'http:',
        hostname: 'cms.example.com',
      }),
    ).toBe('http://cms.example.com:13131');
  });

  it('preserves the request protocol in standalone mode (https)', () => {
    expect(
      resolvePreviewBaseUrl({
        isStandalone: true,
        setting: '',
        protocol: 'https:',
        hostname: 'cms.example.com',
      }),
    ).toBe('https://cms.example.com:13131');
  });

  it('drops the app port — derivation uses hostname, not host', () => {
    // hostname never carries the app's serving port; the fixed preview port is appended.
    expect(
      resolvePreviewBaseUrl({
        isStandalone: true,
        setting: '',
        protocol: 'http:',
        hostname: 'cms.example.com', // host would be cms.example.com:3000
      }),
    ).toBe('http://cms.example.com:13131');
  });

  it('uses an explicit override verbatim in standalone mode', () => {
    expect(
      resolvePreviewBaseUrl({
        isStandalone: true,
        setting: 'https://preview.example.com',
        protocol: 'http:',
        hostname: 'cms.example.com',
      }),
    ).toBe('https://preview.example.com');
  });

  it('uses an explicit override verbatim in Electron mode', () => {
    expect(
      resolvePreviewBaseUrl({
        isStandalone: false,
        setting: 'https://preview.example.com',
      }),
    ).toBe('https://preview.example.com');
  });

  it('treats a whitespace-only setting as unset', () => {
    expect(
      resolvePreviewBaseUrl({ isStandalone: false, setting: '   ' }),
    ).toBe(ELECTRON_PREVIEW_BASE_URL);
  });

  it('falls back to Electron URL in standalone when hostname is unavailable', () => {
    expect(
      resolvePreviewBaseUrl({ isStandalone: true, setting: '', protocol: 'http:' }),
    ).toBe(ELECTRON_PREVIEW_BASE_URL);
  });
});
