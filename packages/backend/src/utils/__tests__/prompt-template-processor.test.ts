import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildPageSelfObject,
  buildFieldSelfObject,
  buildParentPageObject,
  processPromptTemplate,
  type PageVariableContext,
  type FieldVariableContext,
} from '../prompt-template-processor.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Prompt Template Processor', () => {
  let testDir: string;
  let testWorkspacePath: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `quiqr-test-${Date.now()}`);
    testWorkspacePath = path.join(testDir, 'workspace');
    await fs.ensureDir(testWorkspacePath);
  });

  afterEach(async () => {
    // Cleanup
    await fs.remove(testDir);
  });

  describe('buildFieldSelfObject', () => {
    it('creates field self object with all properties', () => {
      const result = buildFieldSelfObject('title', 'string', 'Hello World');

      expect(result).toEqual({
        content: 'Hello World',
        key: 'title',
        type: 'string',
      });
    });

    it('handles empty content', () => {
      const result = buildFieldSelfObject('description', 'markdown', '');

      expect(result).toEqual({
        content: '',
        key: 'description',
        type: 'markdown',
      });
    });

    it('handles different field types', () => {
      const result = buildFieldSelfObject('tags', 'chips', 'tag1,tag2');

      expect(result.type).toBe('chips');
      expect(result.content).toBe('tag1,tag2');
    });
  });

  describe('buildPageSelfObject', () => {
    it('parses frontmatter and creates page object', async () => {
      const testFile = path.join(testWorkspacePath, 'test-page.md');
      const content = `---
title: Test Page
author: John Doe
tags:
  - test
  - example
---

# Content

This is the page content.`;

      await fs.writeFile(testFile, content);

      const result = await buildPageSelfObject(testWorkspacePath, 'test-page.md');

      expect(result.content).toBe(content);
      expect(result.file_name).toBe('test-page.md');
      expect(result.file_base_name).toBe('test-page');
      expect(result.file_path).toBe('test-page.md');
      expect(result.fields).toEqual({
        title: { content: 'Test Page' },
        author: { content: 'John Doe' },
        tags: { content: ['test', 'example'] },
      });
    });

    it('handles pages without frontmatter', async () => {
      const testFile = path.join(testWorkspacePath, 'simple.md');
      const content = `# Simple Page

Just content, no frontmatter.`;

      await fs.writeFile(testFile, content);

      const result = await buildPageSelfObject(testWorkspacePath, 'simple.md');

      expect(result.content).toBe(content);
      expect(result.fields).toEqual({});
    });

    it('handles nested frontmatter fields', async () => {
      const testFile = path.join(testWorkspacePath, 'nested.md');
      const content = `---
title: Nested Page
author:
  name: Jane Smith
  email: jane@example.com
metadata:
  published: true
  views: 100
---

Content here.`;

      await fs.writeFile(testFile, content);

      const result = await buildPageSelfObject(testWorkspacePath, 'nested.md');

      expect(result.fields).toEqual({
        title: { content: 'Nested Page' },
        author: {
          content: {
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
        metadata: {
          content: {
            published: true,
            views: 100,
          },
        },
      });
    });

    it('handles subdirectory paths correctly', async () => {
      const subdir = path.join(testWorkspacePath, 'content', 'posts');
      await fs.ensureDir(subdir);

      const testFile = path.join(subdir, 'my-post.md');
      const content = `---
title: My Post
---

Content`;

      await fs.writeFile(testFile, content);

      const result = await buildPageSelfObject(
        testWorkspacePath,
        'content/posts/my-post.md'
      );

      expect(result.file_path).toBe('content/posts/my-post.md');
      expect(result.file_name).toBe('my-post.md');
      expect(result.file_base_name).toBe('my-post');
    });

    it('handles file read errors gracefully', async () => {
      const result = await buildPageSelfObject(
        testWorkspacePath,
        'non-existent.md'
      );

      expect(result.content).toContain('[Could not read file:');
      expect(result.fields).toEqual({});
    });
  });

  describe('buildParentPageObject', () => {
    it('creates parent page object identical to page object', async () => {
      const testFile = path.join(testWorkspacePath, 'parent.md');
      const content = `---
title: Parent Page
category: Blog
---

Parent content.`;

      await fs.writeFile(testFile, content);

      const result = await buildParentPageObject(testWorkspacePath, 'parent.md');

      expect(result.content).toBe(content);
      expect(result.fields).toEqual({
        title: { content: 'Parent Page' },
        category: { content: 'Blog' },
      });
      expect(result.file_name).toBe('parent.md');
    });
  });

  describe('processPromptTemplate - Page Context', () => {
    it('replaces simple self variables', async () => {
      const testFile = path.join(testWorkspacePath, 'page.md');
      const content = `---
title: Test Title
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'page.md');
      const context: PageVariableContext = {
        self: selfObject,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      const template = 'File: {{ self.file_name }}, Base: {{ self.file_base_name }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('File: page.md, Base: page');
    });

    it('replaces self.fields variables', async () => {
      const testFile = path.join(testWorkspacePath, 'post.md');
      const content = `---
title: My Blog Post
author: John Doe
published: true
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'post.md');
      const context: PageVariableContext = {
        self: selfObject,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      const template =
        'Title: {{ self.fields.title.content }}, Author: {{ self.fields.author.content }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Title: My Blog Post, Author: John Doe');
    });

    it('handles nested field access', async () => {
      const testFile = path.join(testWorkspacePath, 'nested.md');
      const content = `---
author:
  name: Jane Smith
  social:
    twitter: "@jane"
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'nested.md');
      const context: PageVariableContext = {
        self: selfObject,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      // Note: Deep nested access requires the full object to be accessible
      // This tests that we can access the author.name level
      const template = 'Name: {{ self.fields.author.content.name }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Name: Jane Smith');
    });

    it('replaces field variables from form inputs', async () => {
      const context: PageVariableContext = {
        self: null,
        field: {
          style: 'professional',
          tone: 'formal',
        },
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      const template = 'Write in {{ field.style }} style with a {{ field.tone }} tone.';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Write in professional style with a formal tone.');
    });

    it('handles missing fields gracefully', async () => {
      const testFile = path.join(testWorkspacePath, 'minimal.md');
      await fs.writeFile(testFile, '---\ntitle: Test\n---\nContent');

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'minimal.md');
      const context: PageVariableContext = {
        self: selfObject,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      const template = 'Author: {{ self.fields.author.content }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Author: ');
    });
  });

  describe('processPromptTemplate - Field Context', () => {
    it('replaces self variables for field', async () => {
      const fieldSelf = buildFieldSelfObject('title', 'string', 'Hello World');
      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template =
        'Field "{{ self.key }}" ({{ self.type }}): {{ self.content }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Field "title" (string): Hello World');
    });

    it('replaces parent_page variables', async () => {
      const testFile = path.join(testWorkspacePath, 'parent-page.md');
      const content = `---
title: Parent Title
category: Technology
---
Parent content`;

      await fs.writeFile(testFile, content);

      const fieldSelf = buildFieldSelfObject('description', 'markdown', 'Field content');
      const parentPage = await buildParentPageObject(
        testWorkspacePath,
        'parent-page.md'
      );

      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: parentPage,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = 'Page: {{ parent_page.fields.title.content }}, Field: {{ self.key }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Page: Parent Title, Field: description');
    });

    it('accesses parent page file metadata', async () => {
      const testFile = path.join(testWorkspacePath, 'blog-post.md');
      await fs.writeFile(testFile, '---\ntitle: Test\n---\nContent');

      const fieldSelf = buildFieldSelfObject('excerpt', 'string', 'Short excerpt');
      const parentPage = await buildParentPageObject(testWorkspacePath, 'blog-post.md');

      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: parentPage,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = 'File: {{ parent_page.file_name }}, Base: {{ parent_page.file_base_name }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('File: blog-post.md, Base: blog-post');
    });

    it('combines field, parent_page, and form variables', async () => {
      const testFile = path.join(testWorkspacePath, 'article.md');
      const content = `---
title: My Article
author: Alice
---
Article content`;

      await fs.writeFile(testFile, content);

      const fieldSelf = buildFieldSelfObject('summary', 'markdown', 'Draft summary');
      const parentPage = await buildParentPageObject(testWorkspacePath, 'article.md');

      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: parentPage,
        field: {
          style: 'concise',
          length: '100 words',
        },
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = `Summarize the "{{ self.key }}" field for article "{{ parent_page.fields.title.content }}" by {{ parent_page.fields.author.content }}.
Make it {{ field.style }} ({{ field.length }}).

Current draft: {{ self.content }}`;

      const result = await processPromptTemplate(template, context);

      expect(result).toContain('Summarize the "summary" field');
      expect(result).toContain('article "My Article"');
      expect(result).toContain('by Alice');
      expect(result).toContain('Make it concise (100 words)');
      expect(result).toContain('Current draft: Draft summary');
    });

    it('handles missing parent_page gracefully', async () => {
      const fieldSelf = buildFieldSelfObject('title', 'string', 'Standalone');
      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = 'Field: {{ self.content }}, Page: {{ parent_page.fields.title.content }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Field: Standalone, Page: ');
    });
  });

  describe('processPromptTemplate - Complex Scenarios', () => {
    it('handles multiple variable replacements', async () => {
      const testFile = path.join(testWorkspacePath, 'complex.md');
      const content = `---
title: Complex Page
tags: [a, b, c]
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'complex.md');
      const context: PageVariableContext = {
        self: selfObject,
        field: { action: 'improve' },
        workspacePath: testWorkspacePath,
        contextType: 'page',
      };

      const template = `File: {{ self.file_name }}
Title: {{ self.fields.title.content }}
Action: {{ field.action }}
Base: {{ self.file_base_name }}`;

      const result = await processPromptTemplate(template, context);

      expect(result).toContain('File: complex.md');
      expect(result).toContain('Title: Complex Page');
      expect(result).toContain('Action: improve');
      expect(result).toContain('Base: complex');
    });

    it('handles special characters in content', async () => {
      const fieldSelf = buildFieldSelfObject(
        'code',
        'string',
        'const x = {{ value }};'
      );
      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = 'Code: {{ self.content }}';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('Code: const x = {{ value }};');
    });

    it('preserves whitespace and formatting', async () => {
      const fieldSelf = buildFieldSelfObject('text', 'markdown', 'Line 1\nLine 2\n  Indented');
      const context: FieldVariableContext = {
        self: fieldSelf,
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = `Content:
{{ self.content }}`;

      const result = await processPromptTemplate(template, context);

      expect(result).toBe(`Content:
Line 1
Line 2
  Indented`);
    });

    it('handles empty template', async () => {
      const context: FieldVariableContext = {
        self: buildFieldSelfObject('test', 'string', 'value'),
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const result = await processPromptTemplate('', context);
      expect(result).toBe('');
    });

    it('handles template with no variables', async () => {
      const context: FieldVariableContext = {
        self: buildFieldSelfObject('test', 'string', 'value'),
        parent_page: null,
        field: {},
        workspacePath: testWorkspacePath,
        contextType: 'field',
      };

      const template = 'This is a static template with no variables.';
      const result = await processPromptTemplate(template, context);

      expect(result).toBe('This is a static template with no variables.');
    });
  });

  describe('Edge Cases', () => {
    it('handles array values in frontmatter', async () => {
      const testFile = path.join(testWorkspacePath, 'array-test.md');
      const content = `---
tags:
  - javascript
  - typescript
  - node
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'array-test.md');

      expect(selfObject.fields.tags.content).toEqual([
        'javascript',
        'typescript',
        'node',
      ]);
    });

    it('handles boolean values in frontmatter', async () => {
      const testFile = path.join(testWorkspacePath, 'bool-test.md');
      const content = `---
published: true
draft: false
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'bool-test.md');

      expect(selfObject.fields.published.content).toBe(true);
      expect(selfObject.fields.draft.content).toBe(false);
    });

    it('handles number values in frontmatter', async () => {
      const testFile = path.join(testWorkspacePath, 'number-test.md');
      const content = `---
views: 100
rating: 4.5
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'number-test.md');

      expect(selfObject.fields.views.content).toBe(100);
      expect(selfObject.fields.rating.content).toBe(4.5);
    });

    it('handles null/undefined field values', async () => {
      const testFile = path.join(testWorkspacePath, 'null-test.md');
      const content = `---
title: Test
value: null
---
Content`;

      await fs.writeFile(testFile, content);

      const selfObject = await buildPageSelfObject(testWorkspacePath, 'null-test.md');

      expect(selfObject.fields.value.content).toBe(null);
    });
  });
});
