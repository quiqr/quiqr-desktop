/**
 * Platform-agnostic utilities for clipboard, external links, etc.
 * These work in both Electron and web browser environments.
 */

import service from '../services/service';

/**
 * Copy text to clipboard using the native Clipboard API.
 * Works in both Electron and web browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Open a URL in the user's default browser.
 * Uses backend ShellAdapter in Electron (opens native browser),
 * falls back to window.open() in web environments.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    // Try backend API first (works in Electron via ShellAdapter)
    await service.api.openExternal(url);
  } catch {
    // Fallback to window.open for web environments or if API fails
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
