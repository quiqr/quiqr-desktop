/**
 * Eleventy Utilities
 *
 * Helper functions for Eleventy operations.
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * EleventyUtils - Utility functions for Eleventy
 */
export class EleventyUtils {
  /**
   * Create a basic Eleventy site directory
   */
  async createSiteDir(
    directory: string,
    title: string,
    configFormat: 'js' | 'json' = 'js'
  ): Promise<void> {
    // Create directory structure
    await fs.ensureDir(directory);
    await fs.ensureDir(path.join(directory, 'src'));
    await fs.ensureDir(path.join(directory, 'src', '_includes'));
    await fs.ensureDir(path.join(directory, 'src', '_data'));
    await fs.ensureDir(path.join(directory, '_site'));

    // Create .eleventy.js config file
    if (configFormat === 'js') {
      const configContent = `module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
};
`;
      await fs.writeFile(path.join(directory, '.eleventy.js'), configContent);
    }

    // Create package.json
    const packageJson = {
      name: title.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: title,
      scripts: {
        build: 'eleventy',
        serve: 'eleventy --serve',
      },
      devDependencies: {
        '@11ty/eleventy': '^2.0.0',
      },
    };
    await fs.writeFile(
      path.join(directory, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create .gitignore
    const gitignore = `node_modules/
_site/
.DS_Store
`;
    await fs.writeFile(path.join(directory, '.gitignore'), gitignore);

    // Create basic site data
    const siteData = {
      title: title,
      description: `${title} - Built with Eleventy`,
      url: 'http://localhost:8080',
    };
    await fs.writeFile(
      path.join(directory, 'src', '_data', 'site.json'),
      JSON.stringify(siteData, null, 2)
    );

    // Create basic index page
    const indexContent = `---
layout: base.njk
title: Home
---

# Welcome to {{ site.title }}

This is a basic Eleventy site.
`;
    await fs.writeFile(path.join(directory, 'src', 'index.md'), indexContent);

    // Create base layout
    const baseLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} - {{ site.title }}</title>
</head>
<body>
  <header>
    <h1>{{ site.title }}</h1>
  </header>
  <main>
    {{ content | safe }}
  </main>
  <footer>
    <p>&copy; {{ site.title }}</p>
  </footer>
</body>
</html>
`;
    await fs.writeFile(
      path.join(directory, 'src', '_includes', 'base.njk'),
      baseLayout
    );
  }
}
