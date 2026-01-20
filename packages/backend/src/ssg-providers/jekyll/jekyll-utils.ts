/**
 * Jekyll Utilities
 *
 * Helper functions for Jekyll operations.
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * JekyllUtils - Utility functions for Jekyll
 */
export class JekyllUtils {
  /**
   * Create a basic Jekyll site directory
   */
  async createSiteDir(
    directory: string,
    title: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configFormat: 'yaml' | 'yml' = 'yml'
  ): Promise<void> {
    // Create directory structure
    await fs.ensureDir(directory);
    await fs.ensureDir(path.join(directory, '_posts'));
    await fs.ensureDir(path.join(directory, '_layouts'));
    await fs.ensureDir(path.join(directory, '_includes'));
    await fs.ensureDir(path.join(directory, '_data'));
    await fs.ensureDir(path.join(directory, 'assets'));
    await fs.ensureDir(path.join(directory, 'assets', 'css'));
    await fs.ensureDir(path.join(directory, 'assets', 'images'));

    // Create _config.yml
    const configContent = `# Site settings
title: ${title}
description: ${title} - Built with Jekyll
baseurl: ""
url: "http://localhost:13131"

# Build settings
markdown: kramdown
theme: minima

# Collections
collections:
  posts:
    output: true
    permalink: /blog/:year/:month/:day/:title/

# Exclude from processing
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
  - .bundle
  - .sass-cache
  - .jekyll-cache
`;

    await fs.writeFile(path.join(directory, '_config.yml'), configContent);

    // Create Gemfile
    const gemfileContent = `source 'https://rubygems.org'

gem 'jekyll', '~> 4.3'
gem 'webrick', '~> 1.8'

group :jekyll_plugins do
  gem 'jekyll-feed'
  gem 'jekyll-seo-tag'
end
`;

    await fs.writeFile(path.join(directory, 'Gemfile'), gemfileContent);

    // Create .gitignore
    const gitignore = `_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
vendor/
.bundle/
*.gem
*.rbc
.DS_Store
`;
    await fs.writeFile(path.join(directory, '.gitignore'), gitignore);

    // Create default layout
    const defaultLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }} - {{ site.title }}</title>
  <link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
</head>
<body>
  <header>
    <h1><a href="{{ '/' | relative_url }}">{{ site.title }}</a></h1>
    <p>{{ site.description }}</p>
  </header>

  <main>
    {{ content }}
  </main>

  <footer>
    <p>&copy; {{ 'now' | date: "%Y" }} {{ site.title }}</p>
  </footer>
</body>
</html>
`;
    await fs.writeFile(
      path.join(directory, '_layouts', 'default.html'),
      defaultLayout
    );

    // Create post layout
    const postLayout = `---
layout: default
---
<article>
  <h1>{{ page.title }}</h1>
  <p class="post-meta">
    <time datetime="{{ page.date | date_to_xmlschema }}">
      {{ page.date | date: "%B %d, %Y" }}
    </time>
  </p>

  {{ content }}
</article>
`;
    await fs.writeFile(
      path.join(directory, '_layouts', 'post.html'),
      postLayout
    );

    // Create index page
    const indexContent = `---
layout: default
title: Home
---

# Welcome to {{ site.title }}

This is a basic Jekyll site created with Quiqr Desktop.

## Recent Posts

<ul>
  {% for post in site.posts limit:5 %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
    </li>
  {% endfor %}
</ul>
`;
    await fs.writeFile(path.join(directory, 'index.md'), indexContent);

    // Create about page
    const aboutContent = `---
layout: default
title: About
permalink: /about/
---

# About {{ site.title }}

This is the about page for your Jekyll site.
`;
    await fs.writeFile(path.join(directory, 'about.md'), aboutContent);

    // Create a sample post
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const postFilename = `${dateStr}-welcome-to-jekyll.md`;

    const postContent = `---
layout: post
title: "Welcome to Jekyll!"
date: ${today.toISOString()}
categories: jekyll update
---

Welcome to your new Jekyll site! This is your first blog post.

You can edit this post in the \`_posts\` directory. Posts are written in Markdown and include front matter at the top.

## Getting Started

To create a new post, create a new file in the \`_posts\` directory with the format:

\`\`\`
YYYY-MM-DD-title.md
\`\`\`

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll.

[jekyll-docs]: https://jekyllrb.com/docs/
`;
    await fs.writeFile(
      path.join(directory, '_posts', postFilename),
      postContent
    );

    // Create basic CSS
    const cssContent = `/* Basic styles for Jekyll site */

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  border-bottom: 2px solid #333;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

header h1 {
  margin: 0;
}

header h1 a {
  color: #333;
  text-decoration: none;
}

header p {
  color: #666;
  margin: 0.5rem 0 0 0;
}

main {
  margin-bottom: 3rem;
}

footer {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

article h1 {
  margin-bottom: 0.5rem;
}

.post-meta {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0;
}

.post-date {
  color: #999;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: #0066cc;
}

a:hover {
  color: #004499;
}
`;
    await fs.writeFile(
      path.join(directory, 'assets', 'css', 'main.css'),
      cssContent
    );
  }
}
