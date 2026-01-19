/**
 * SSG Fixture Builder
 *
 * Helper utilities for creating SSG site fixtures for testing.
 * Creates realistic Hugo, Eleventy, and Jekyll site structures.
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export interface SSGFixtureOptions {
  /**
   * Include config file
   */
  includeConfig?: boolean;

  /**
   * Config file format (for Hugo: 'toml' | 'yaml' | 'json', for others varies)
   */
  configFormat?: string;

  /**
   * Include marker directories (layouts, themes, etc.)
   */
  includeMarkerDirs?: boolean;

  /**
   * Include package.json (for Eleventy)
   */
  includePackageJson?: boolean;

  /**
   * Include Gemfile (for Jekyll)
   */
  includeGemfile?: boolean;

  /**
   * Custom config content
   */
  configContent?: Record<string, unknown>;
}

/**
 * Create a minimal Hugo site structure
 */
export async function createHugoSite(
  directory: string,
  options: SSGFixtureOptions = {}
): Promise<void> {
  const {
    includeConfig = true,
    configFormat = 'toml',
    includeMarkerDirs = false,
    configContent = {},
  } = options;

  await fs.ensureDir(directory);

  // Create config file
  if (includeConfig) {
    const config = {
      baseURL: 'http://example.org/',
      title: 'Test Hugo Site',
      ...configContent,
    };

    let configFileName: string;
    let configFileContent: string;

    if (configFormat === 'toml') {
      configFileName = 'hugo.toml';
      configFileContent = toToml(config);
    } else if (configFormat === 'yaml' || configFormat === 'yml') {
      configFileName = `hugo.${configFormat}`;
      configFileContent = yaml.dump(config);
    } else if (configFormat === 'json') {
      configFileName = 'hugo.json';
      configFileContent = JSON.stringify(config, null, 2);
    } else {
      throw new Error(`Unsupported config format: ${configFormat}`);
    }

    await fs.writeFile(path.join(directory, configFileName), configFileContent);
  }

  // Create Hugo marker directories
  if (includeMarkerDirs) {
    await fs.ensureDir(path.join(directory, 'archetypes'));
    await fs.ensureDir(path.join(directory, 'content'));
    await fs.ensureDir(path.join(directory, 'layouts'));
    await fs.ensureDir(path.join(directory, 'static'));
    await fs.ensureDir(path.join(directory, 'themes'));

    // Create a sample content file
    await fs.writeFile(
      path.join(directory, 'content', 'test.md'),
      `---
title: Test Post
date: 2024-01-01
---

Test content.
`
    );
  }
}

/**
 * Create a minimal Eleventy site structure
 */
export async function createEleventySite(
  directory: string,
  options: SSGFixtureOptions = {}
): Promise<void> {
  const {
    includeConfig = true,
    configFormat = 'js',
    includeMarkerDirs = false,
    includePackageJson = false,
  } = options;

  await fs.ensureDir(directory);

  // Create config file
  if (includeConfig) {
    let configFileName: string;
    let configFileContent: string;

    if (configFormat === 'js') {
      configFileName = '.eleventy.js';
      configFileContent = `module.exports = function(eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
`;
    } else if (configFormat === 'cjs') {
      configFileName = '.eleventy.cjs';
      configFileContent = `module.exports = function(eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
`;
    } else if (configFormat === 'config-js') {
      configFileName = 'eleventy.config.js';
      configFileContent = `export default function(eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
`;
    } else {
      throw new Error(`Unsupported config format: ${configFormat}`);
    }

    await fs.writeFile(path.join(directory, configFileName), configFileContent);
  }

  // Create package.json with Eleventy dependency
  if (includePackageJson) {
    const packageJson = {
      name: 'test-eleventy-site',
      version: '1.0.0',
      dependencies: {
        '@11ty/eleventy': '^2.0.0',
      },
      scripts: {
        build: 'eleventy',
        serve: 'eleventy --serve',
      },
    };

    await fs.writeJson(path.join(directory, 'package.json'), packageJson, { spaces: 2 });
  }

  // Create Eleventy marker directories
  if (includeMarkerDirs) {
    await fs.ensureDir(path.join(directory, '_includes'));
    await fs.ensureDir(path.join(directory, '_data'));
    await fs.ensureDir(path.join(directory, '_site'));

    // Create a sample data file
    await fs.writeJson(path.join(directory, '_data', 'site.json'), {
      title: 'Test Eleventy Site',
    });
  }
}

/**
 * Create a minimal Jekyll site structure
 */
export async function createJekyllSite(
  directory: string,
  options: SSGFixtureOptions = {}
): Promise<void> {
  const {
    includeConfig = true,
    configFormat = 'yml',
    includeMarkerDirs = false,
    includeGemfile = false,
    configContent = {},
  } = options;

  await fs.ensureDir(directory);

  // Create config file
  if (includeConfig) {
    const config = {
      title: 'Test Jekyll Site',
      url: 'http://example.org',
      markdown: 'kramdown',
      ...configContent,
    };

    let configFileName: string;
    if (configFormat === 'yml' || configFormat === 'yaml') {
      configFileName = `_config.${configFormat}`;
    } else {
      throw new Error(`Unsupported config format for Jekyll: ${configFormat}`);
    }

    await fs.writeFile(path.join(directory, configFileName), yaml.dump(config));
  }

  // Create Gemfile with Jekyll dependency
  if (includeGemfile) {
    const gemfileContent = `source "https://rubygems.org"

gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
end
`;

    await fs.writeFile(path.join(directory, 'Gemfile'), gemfileContent);
  }

  // Create Jekyll marker directories
  if (includeMarkerDirs) {
    await fs.ensureDir(path.join(directory, '_posts'));
    await fs.ensureDir(path.join(directory, '_layouts'));
    await fs.ensureDir(path.join(directory, '_includes'));
    await fs.ensureDir(path.join(directory, '_site'));

    // Create a sample post
    await fs.writeFile(
      path.join(directory, '_posts', '2024-01-01-test-post.md'),
      `---
layout: post
title: "Test Post"
date: 2024-01-01 00:00:00 +0000
---

Test content.
`
    );

    // Create a simple layout
    await fs.writeFile(
      path.join(directory, '_layouts', 'default.html'),
      `<!DOCTYPE html>
<html>
<head>
  <title>{{ page.title }}</title>
</head>
<body>
  {{ content }}
</body>
</html>
`
    );
  }
}

/**
 * Create a minimal SSG config file
 */
export async function createMinimalConfig(
  directory: string,
  ssgType: 'hugo' | 'eleventy' | 'jekyll',
  format: string
): Promise<string> {
  await fs.ensureDir(directory);

  let configFileName: string;
  let configContent: string;

  switch (ssgType) {
    case 'hugo':
      if (format === 'toml') {
        configFileName = 'hugo.toml';
        configContent = `baseURL = "http://example.org/"
title = "Test Site"
`;
      } else if (format === 'yaml' || format === 'yml') {
        configFileName = `hugo.${format}`;
        configContent = yaml.dump({
          baseURL: 'http://example.org/',
          title: 'Test Site',
        });
      } else if (format === 'json') {
        configFileName = 'hugo.json';
        configContent = JSON.stringify(
          {
            baseURL: 'http://example.org/',
            title: 'Test Site',
          },
          null,
          2
        );
      } else {
        throw new Error(`Unsupported format ${format} for Hugo`);
      }
      break;

    case 'eleventy':
      if (format === 'js') {
        configFileName = '.eleventy.js';
        configContent = `module.exports = function(eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
`;
      } else {
        throw new Error(`Unsupported format ${format} for Eleventy`);
      }
      break;

    case 'jekyll':
      if (format === 'yml' || format === 'yaml') {
        configFileName = `_config.${format}`;
        configContent = yaml.dump({
          title: 'Test Site',
          url: 'http://example.org',
        });
      } else {
        throw new Error(`Unsupported format ${format} for Jekyll`);
      }
      break;

    default:
      throw new Error(`Unknown SSG type: ${ssgType}`);
  }

  const configPath = path.join(directory, configFileName);
  await fs.writeFile(configPath, configContent);

  return configPath;
}

/**
 * Create an empty site (for negative detection tests)
 */
export async function createEmptySite(directory: string): Promise<void> {
  await fs.ensureDir(directory);
  // Just create the directory, no files
}

/**
 * Create an ambiguous site with markers from multiple SSGs
 */
export async function createAmbiguousSite(directory: string): Promise<void> {
  await fs.ensureDir(directory);

  // Create directories that could belong to multiple SSGs
  await fs.ensureDir(path.join(directory, '_site')); // Could be Eleventy or Jekyll
  await fs.ensureDir(path.join(directory, 'content')); // Could be Hugo
  await fs.ensureDir(path.join(directory, '_includes')); // Could be Jekyll or Eleventy

  // No config files - rely on directory detection
}

/**
 * Simple TOML serializer (basic implementation)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toToml(obj: Record<string, any>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      lines.push(`${key} = "${value}"`);
    } else if (typeof value === 'number') {
      lines.push(`${key} = ${value}`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key} = ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key} = ${JSON.stringify(value)}`);
    } else if (typeof value === 'object') {
      // For nested objects, create a section
      lines.push(`\n[${key}]`);
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (typeof nestedValue === 'string') {
          lines.push(`${nestedKey} = "${nestedValue}"`);
        } else {
          lines.push(`${nestedKey} = ${nestedValue}`);
        }
      }
    }
  }

  return lines.join('\n');
}
