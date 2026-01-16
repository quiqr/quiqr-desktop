/**
 * Utilities for handling nested field navigation paths.
 *
 * Nest paths allow deep linking into nested form fields.
 * URL pattern: /singles/:single/nest/author.address
 * The nest path "author.address" means navigate into field "author", then "address".
 */

/**
 * Parse the nest path from a URL pathname.
 * @param pathname - Full URL pathname (e.g., "/sites/x/workspaces/y/singles/z/nest/author.address")
 * @returns The nest path (e.g., "author.address") or undefined if not a nest URL
 */
export function parseNestPath(pathname: string): string | undefined {
  const match = pathname.match(/\/nest\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Build a URL for navigating to a nested field.
 * @param basePath - The base URL without /nest/* (e.g., "/sites/x/workspaces/y/singles/z")
 * @param fieldKey - The field key to navigate to
 * @param currentNestPath - The current nest path if already in a nested view
 * @returns Full URL with nest path
 */
export function buildNestUrl(basePath: string, fieldKey: string, currentNestPath?: string): string {
  const nestPath = currentNestPath ? `${currentNestPath}.${fieldKey}` : fieldKey;
  return `${basePath}/nest/${encodeURIComponent(nestPath)}`;
}

/**
 * Get the base path by stripping any /nest/* suffix from the pathname.
 * @param pathname - Full URL pathname
 * @returns Base path without /nest/*
 */
export function getBasePath(pathname: string): string {
  return pathname.replace(/\/nest\/.*$/, '');
}
