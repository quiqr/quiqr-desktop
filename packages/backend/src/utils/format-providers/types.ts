/**
 * Format Provider Interface
 *
 * Format providers handle parsing and serialization of different frontmatter formats
 * (YAML, TOML, JSON) in markdown/content files.
 */

/**
 * Type guard to check if a value is a plain object (Record<string, unknown>).
 * Use this to validate parse() results before spreading or merging.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface ParsedContent {
  mainContent?: string;
  [key: string]: unknown;
}

export interface FormatProvider {
  /**
   * Get the default file extension for this format (without dot)
   */
  defaultExt(): string;

  /**
   * Check if a line matches the start of this format's frontmatter
   */
  matchContentFirstLine(line: string): boolean;

  /**
   * Parse a string in this format to an object.
   * Returns unknown since the structure depends on the file content.
   * Callers should validate the result with Zod or type guards.
   */
  parse(str: string): unknown;

  /**
   * Serialize an object to a string in this format.
   * Accepts unknown since any serializable value can be converted.
   */
  dump(obj: unknown): string;

  /**
   * Serialize an object with mainContent to a full content file string
   * (includes frontmatter delimiters)
   */
  dumpContent(obj: ParsedContent): string;

  /**
   * Parse a content file string (with frontmatter and markdown content)
   * Returns object with parsed frontmatter and mainContent property
   */
  parseFromMdFileString(str: string): ParsedContent;
}
