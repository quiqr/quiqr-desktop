/**
 * JSON Format Provider
 *
 * Handles parsing and serialization of JSON frontmatter in content files.
 */

import type { FormatProvider, ParsedContent } from './types.js';

export class JsonFormatProvider implements FormatProvider {
  defaultExt(): string {
    return 'json';
  }

  matchContentFirstLine(line: string): boolean {
    return line.startsWith('{');
  }

  parse(str: string): any {
    return JSON.parse(str);
  }

  dump(obj: any): string {
    return JSON.stringify(obj, null, '  ');
  }

  dumpContent(obj: ParsedContent): string {
    let content = '';
    if (obj.mainContent) {
      content = obj.mainContent;
      delete obj.mainContent;
    }
    const header = this.dump(obj);
    return `${header}

${content}`;
  }

  parseFromMdFileString(str: string): ParsedContent {
    const data = str;
    const jsonExecResult = /^} *(\r?\n|\r|^)/m.exec(data);
    let jsonEnd = -1;
    let hasFrontMatter = true;

    if (jsonExecResult != null) {
      jsonEnd = jsonExecResult.index;
    }
    // TODO: test
    // what if the file only has a json?
    // and what if it only has a markdown?

    let json: string, md: string;

    if (jsonEnd === -1) {
      json = '{}';
      md = data;
    } else {
      json = data.substr(0, jsonEnd + 1);
      md = data.substr(jsonEnd + 1);
    }

    let parsedData: ParsedContent = this.parse(json);
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
