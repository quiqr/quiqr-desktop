/**
 * YAML Format Provider
 *
 * Handles parsing and serialization of YAML frontmatter in content files.
 */

import jsYaml from 'js-yaml';
import type { FormatProvider, ParsedContent } from './types.js';

export class YamlFormatProvider implements FormatProvider {
  defaultExt(): string {
    return 'yaml';
  }

  matchContentFirstLine(line: string): boolean {
    return line.startsWith('---');
  }

  parse(str: string): any {
    return jsYaml.load(str);
  }

  dump(obj: any): string {
    return jsYaml.dump(obj);
  }

  dumpContent(obj: ParsedContent): string {
    let content = '';
    if (obj.mainContent) {
      content = obj.mainContent;
      delete obj.mainContent;
    }

    if (
      obj &&
      Object.keys(obj).length === 0 &&
      Object.getPrototypeOf(obj) === Object.prototype
    ) {
      return `${content}`;
    } else {
      const header = this.dump(obj);
      // TODO WHY??? This causes https://github.com/quiqr/quiqr-desktop/issues/421
      // header = header.split(/\r?\n/).filter(line => line.trim() !== "").join("\n");
      return `---
${header}---

${content}`;
    }
  }

  parseFromMdFileString(str: string): ParsedContent {
    const data = str;
    const reg = /^[-]{3} *(\r?\n|\r|^)/gm;
    let yamlEnd = -1;
    let hasFrontMatter = true;

    for (let i = 0; i < 2; i++) {
      const execResult = reg.exec(data);
      if (execResult === null) break;
      if (i === 1) yamlEnd = execResult.index;
    }

    let yamlStr: string, md: string;

    if (yamlEnd === -1) {
      yamlStr = '';
      md = data;
    } else {
      yamlStr = data.substr(3, yamlEnd - 3);
      md = data.substr(yamlEnd + 3);
    }

    let parsedData: ParsedContent = this.parse(yamlStr);
    if (parsedData === undefined) {
      parsedData = {};
      hasFrontMatter = false;
    }

    if (hasFrontMatter && /\S/.test(md)) {
      // if have non whitespaces
      // remove the two first line breaks
      md = md.replace(/(\r?\n|\r)/, '').replace(/(\r?\n|\r)/, '');
    }
    parsedData.mainContent = md;

    return parsedData;
  }
}
