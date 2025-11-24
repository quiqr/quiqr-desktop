/**
 * Format Provider Interface
 *
 * Format providers handle parsing and serialization of different frontmatter formats
 * (YAML, TOML, JSON) in markdown/content files.
 */

export interface ParsedContent {
  mainContent?: string;
  [key: string]: any;
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
   * Parse a string in this format to an object
   */
  parse(str: string): any;

  /**
   * Serialize an object to a string in this format
   */
  dump(obj: any): string;

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
