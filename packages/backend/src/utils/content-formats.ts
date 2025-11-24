/**
 * Content Format Utilities
 *
 * Functions for identifying and validating content file types.
 */

export const SUPPORTED_CONTENT_EXTENSIONS = ['md', 'markdown', 'html', 'qmd'] as const;

export type ContentExtension = (typeof SUPPORTED_CONTENT_EXTENSIONS)[number];

/**
 * Check if a file path has a valid content file extension
 * @param filePath - Path to check
 * @returns True if the file has a supported content extension
 */
export function allValidContentFilesExt(filePath: string | undefined): boolean {
  return Boolean(
    filePath &&
      (filePath.endsWith('.md') ||
        filePath.endsWith('.markdown') ||
        filePath.endsWith('.qmd') ||
        filePath.endsWith('.html'))
  );
}

/**
 * Check if a file is a content file based on its extension
 * @param filePath - Path to check
 * @returns True if the file is a content file
 */
export function isContentFile(filePath: string | undefined): boolean {
  if (filePath === undefined) return false;
  const parts = filePath.split('.');
  const extension = parts[parts.length - 1];
  return SUPPORTED_CONTENT_EXTENSIONS.includes(extension as ContentExtension);
}
