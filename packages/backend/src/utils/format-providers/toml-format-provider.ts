/**
 * TOML Format Provider
 *
 * Handles parsing and serialization of TOML frontmatter in content files.
 */

import tomlify from 'tomlify-j0.4';
import toml from 'toml';
import type { FormatProvider, ParsedContent } from './types.js';

export class TomlFormatProvider implements FormatProvider {
  defaultExt(): string {
    return 'toml';
  }

  matchContentFirstLine(line: string): boolean {
    return line.startsWith('+++');
  }

  parse(str: string): unknown {
    return toml.parse(str);
  }

  dump(obj: unknown): string {
    return tomlify.toToml(obj, { space: 2 });
  }

  dumpContent(obj: ParsedContent): string {
    let content = '';
    if (obj.mainContent) {
      content = obj.mainContent;
      delete obj.mainContent;
    }
    const header = this.dump(obj);
    return `+++
${header}+++

${content}`;
  }

  parseFromMdFileString(str: string): ParsedContent {
    const data = str;
    const reg = /^[+]{3} *(\r?\n|\r|^)/gm;
    let tomlEnd = -1;
    for (let i = 0; i < 2; i++) {
      const execResult = reg.exec(data);
      if (execResult === null) break;
      if (i === 1) tomlEnd = execResult.index;
    }

    let tomlStr: string, md: string;

    if (tomlEnd === -1) {
      tomlStr = '';
      md = data;
    } else {
      tomlStr = data.substr(3, tomlEnd - 3);
      md = data.substr(tomlEnd + 3);
    }

    const parsedData = this.parse(tomlStr) as ParsedContent;
    if (parsedData === undefined) {
      return {};
    }

    if (/\S/.test(md)) {
      // if have non whitespaces
      // remove the two first line breaks
      md = md.replace(/(\r?\n|\r)/, '').replace(/(\r?\n|\r)/, '');
      parsedData.mainContent = md;
    }

    return parsedData;
  }
}
