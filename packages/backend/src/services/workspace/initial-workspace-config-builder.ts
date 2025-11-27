/**
 * Initial Workspace Config Builder
 *
 * Creates initial Quiqr configuration files for new or unconfigured workspaces.
 */

import path from 'path';
import fs from 'fs-extra';
import type { FormatProvider } from '../../utils/format-providers/types.js';
import { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import type { PathHelper } from '../../utils/path-helper.js';

/**
 * InitialWorkspaceConfigBuilder creates default configuration files
 * for workspaces that don't have Quiqr configuration yet
 */
export class InitialWorkspaceConfigBuilder {
  private workspacePath: string;
  private formatProviderResolver: FormatProviderResolver;
  private pathHelper: PathHelper;

  constructor(
    workspacePath: string,
    formatProviderResolver: FormatProviderResolver,
    pathHelper: PathHelper
  ) {
    this.workspacePath = workspacePath;
    this.formatProviderResolver = formatProviderResolver;
    this.pathHelper = pathHelper;
  }

  /**
   * Build all initial configuration files
   * @param hugoVersion - Hugo version to use
   * @returns Path to the created base config file
   */
  buildAll(hugoVersion: string = '0.88.1'): string {
    this.buildHomeReadme();

    const { dataBase, formatProvider } = this.buildBase(hugoVersion);

    fs.ensureDirSync(path.join(this.workspacePath, 'quiqr', 'model'));
    fs.ensureDirSync(path.join(this.workspacePath, 'quiqr', 'model', 'includes'));
    fs.ensureDirSync(path.join(this.workspacePath, 'quiqr', 'model', 'partials'));

    const filePathBase = path.join(
      this.workspacePath,
      'quiqr',
      'model',
      'base.' + formatProvider.defaultExt()
    );

    fs.writeFileSync(filePathBase, formatProvider.dump(dataBase));

    return filePathBase;
  }

  /**
   * Get the default configuration object
   */
  private getConfig(opts: {
    hugover: string;
    configFile: string;
    ext: string;
    hugoConfigData: any;
  }): any {
    const rootKeysLower: Record<string, string> = {};
    Object.keys(opts.hugoConfigData).forEach((key) => {
      rootKeysLower[key.toLowerCase()] = key;
    });

    const getBestKey = (key: string): string => {
      return rootKeysLower[key.toLowerCase()] || key;
    };

    return {
      hugover: opts.hugover || '',
      serve: [{ key: 'default', config: opts.configFile }],
      build: [{ key: 'default', config: opts.configFile }],
      menu: [
        {
          key: 'settings',
          title: 'Settings',
          menuItems: [{ key: 'mainConfig' }],
        },
      ],
      collections: [],
      singles: [
        {
          key: 'mainConfig',
          title: 'Site Configuration',
          file: `${opts.configFile}`,
          fields: [
            {
              key: getBestKey('title'),
              title: 'Site Title',
              type: 'string',
              tip: 'Your page title.',
            },
            {
              key: getBestKey('baseURL'),
              title: 'Base URL',
              type: 'string',
              tip: 'Your site URL.',
            },
          ],
        },
      ],
    };
  }

  /**
   * Build default partials configuration
   */
  buildPartials(): any {
    return {
      dataformat: 'yaml',
      fields: [
        {
          key: 'info',
          type: 'info',
          content: '# Info\nYou can write custom instructions here.',
        },
        { key: 'title', title: 'Title', type: 'string' },
        { key: 'mainContent', title: 'Content', type: 'markdown' },
        { key: 'pubdate', title: 'Pub Date', type: 'date', default: 'now' },
        { key: 'draft', title: 'Draft', type: 'boolean' },
        {
          key: 'bundle-manager',
          type: 'bundle-manager',
          path: 'imgs',
          extensions: ['png', 'jpg', 'gif'],
          fields: [
            { key: 'title', title: 'Title', type: 'string' },
            { key: 'description', title: 'Description', type: 'string', multiLine: true },
          ],
        },
      ],
    };
  }

  /**
   * Build default includes configuration
   */
  buildInclude(): any[] {
    return [
      {
        key: 'pages',
        title: 'Other Pages',
        folder: 'content/page/',
        extension: 'md',
        itemtitle: 'Page',
        _mergePartial: 'page',
      },
    ];
  }

  /**
   * Build base configuration
   */
  private buildBase(hugoVersion: string): {
    formatProvider: FormatProvider;
    dataBase: any;
  } {
    let hugoConfigPath = this.pathHelper.hugoConfigFilePath(this.workspacePath);
    let formatProvider: FormatProvider;

    if (hugoConfigPath == null) {
      hugoConfigPath = path.join(
        this.workspacePath,
        'config.' + this.formatProviderResolver.getDefaultFormatExt()
      );
      formatProvider = this.formatProviderResolver.getDefaultFormat();
      const minimalConfigStr = formatProvider.dump({
        title: 'New Site Title',
        baseURL: 'http://newsite.com',
      });
      fs.writeFileSync(hugoConfigPath, minimalConfigStr, 'utf-8');
    } else {
      const resolved = this.formatProviderResolver.resolveForFilePath(hugoConfigPath);
      if (!resolved) {
        throw new Error('Could not resolve a FormatProvider.');
      }
      formatProvider = resolved;
    }

    const hugoConfigData = formatProvider.parse(fs.readFileSync(hugoConfigPath, 'utf-8'));
    const relHugoConfigPath = path.relative(this.workspacePath, hugoConfigPath);

    const dataBase = this.getConfig({
      configFile: relHugoConfigPath,
      ext: formatProvider.defaultExt(),
      hugover: hugoVersion,
      hugoConfigData,
    });

    return { formatProvider, dataBase };
  }

  /**
   * Build home README file
   */
  private buildHomeReadme(): void {
    const readmePath = path.join(this.workspacePath, 'quiqr', 'home', 'index.md');
    if (!fs.existsSync(readmePath)) {
      fs.ensureDirSync(path.join(this.workspacePath, 'quiqr', 'home'));
      fs.writeFileSync(
        readmePath,
        `
# README FOR NEW SITE

If you're a website developer you can read the [Quiqr Site Developer
Docs](https://book.quiqr.org/)
how to customize your Site Admin.

Quiqr is a Desktop App made for [Hugo](https://gohugo.io). Read all about
[creating Hugo websites](https://gohugo.io/getting-started/quick-start/).

To change this about text, edit this file: *${readmePath}*.

Happy Creating.

❤️ Quiqr
        `.trim()
      );
    }
  }
}
