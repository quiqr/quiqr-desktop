/**
 * Format Provider Resolver
 *
 * Resolves the appropriate format provider (YAML, TOML, JSON) based on
 * file extension, file content, or first line of frontmatter.
 */

import fs from 'fs-extra';
import path from 'path';
import type { FormatProvider } from './format-providers/types.js';
import { JsonFormatProvider } from './format-providers/json-format-provider.js';
import { TomlFormatProvider } from './format-providers/toml-format-provider.js';
import { YamlFormatProvider } from './format-providers/yaml-format-provider.js';

/**
 * FormatProviderResolver manages format providers and resolves the correct one
 * based on various inputs (file path, content, first line, etc.)
 */
export class FormatProviderResolver {
  private _formats: Record<string, FormatProvider>;
  private _exts: string[];

  constructor() {
    const yaml = new YamlFormatProvider();
    this._formats = {
      json: new JsonFormatProvider(),
      toml: new TomlFormatProvider(),
      yaml: yaml,
      yml: yaml, // yml is an alias for yaml
    };

    this._exts = Object.keys(this._formats);
  }

  /**
   * Get the default format provider (YAML)
   */
  getDefaultFormat(): FormatProvider {
    return this._formats[this.getDefaultFormatExt()];
  }

  /**
   * Get the default format extension
   */
  getDefaultFormatExt(): string {
    return 'yaml';
  }

  /**
   * Read a specific line from a file (async)
   * @private
   */
  private _getFileLinePromise(filename: string, line_no: number): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filename, {
        flags: 'r',
        encoding: 'utf8',
        mode: 0o666,
      });

      let fileData = '';
      stream.on('data', (data: string | Buffer) => {
        fileData += data.toString();
        // The next lines should be improved
        const lines = fileData.split('\n');
        if (lines.length >= line_no + 1) {
          stream.destroy();
          resolve(lines[line_no]);
        }
      });

      stream.on('error', (e) => {
        reject(e);
      });

      stream.on('end', () => {
        resolve(undefined);
      });
    });
  }

  /**
   * Resolve format provider by matching the first line of frontmatter
   */
  resolveForMdFirstLine(line: string | undefined): FormatProvider | undefined {
    if (line === undefined) return undefined;

    for (let i = 0; i < this._exts.length; i++) {
      const f = this._formats[this._exts[i]];
      if (f.matchContentFirstLine(line)) {
        return f;
      }
    }
    return undefined;
  }

  /**
   * Resolve format provider based on file path extension
   */
  resolveForFilePath(filePath: string | undefined): FormatProvider | undefined {
    if (filePath === undefined) return undefined;
    const ext = path.extname(filePath).replace('.', '');
    return this.resolveForExtension(ext);
  }

  /**
   * Resolve format provider by analyzing file content string
   */
  resolveForMdFileString(fileContent: string | undefined): FormatProvider | null {
    if (fileContent === undefined) return null;
    const firstLine = fileContent.split('\n', 1)[0];
    return this.resolveForMdFirstLine(firstLine) ?? null;
  }

  /**
   * Resolve format provider by reading file and checking first line
   */
  async resolveForMdFilePromise(
    filePath: string
  ): Promise<FormatProvider | null | undefined> {
    const line = await this._getFileLinePromise(filePath, 0);
    if (line != null) {
      return this.resolveForMdFirstLine(line);
    }
    return null;
  }

  /**
   * Resolve format provider by file extension
   */
  resolveForExtension(ext: string | undefined): FormatProvider | undefined {
    if (ext === undefined) return undefined;
    ext = ext.toLowerCase();
    return this._formats[ext];
  }

  /**
   * Get all supported format extensions
   */
  allFormatsExt(): string[] {
    return this._exts;
  }
}

/**
 * Default singleton instance
 */
export default new FormatProviderResolver();
