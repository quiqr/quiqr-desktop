---
sidebar_position: 14
---

# Select From Query

The select from query field creates a dropdown populated dynamically from content files using glob patterns and Quiqr Query Language (QQL). This enables dynamic, data-driven selections based on your site's content.

:::info Field Type
**Type:** `select-from-query`  
**Category:** Data Field  
**Output:** String or Array (depending on `multiple` setting)  
**Version:** Available since Quiqr v0.16.0
:::

## Basic Configuration

```yaml
- key: related-post
  type: select-from-query
  title: Related Post
  query_glob: "content/posts/**/*.md"
  query_string: ".title[]"
```

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |
| `default` | string/array | No | - | Default value(s) |
| `multiple` | boolean | No | `false` | Allow selecting multiple options |
| `autoSave` | boolean | No | `false` | Automatically save when value changes |
| `query_glob` | string | Yes | - | Glob pattern to match content files |
| `query_string` | string | Yes | - | QQL query to extract data from matched files |
| `option_image_path` | string | No | - | Path to images for visual options |
| `option_image_width` | integer | No | - | Width of option images in pixels |
| `option_image_extension` | string | No | - | Image file extension for options |

## Quiqr Query Language (QQL)

QQL is inspired by [jq](https://stedolan.github.io/jq/) and provides powerful data extraction capabilities.

### Meta Functions

Access file metadata:

| Function | Description | Example Output |
|----------|-------------|----------------|
| `#file_path` | Full file path | `content/posts/my-post.md` |
| `#file_name` | Filename with extension | `my-post.md` |
| `#file_base_name` | Filename without extension | `my-post` |
| `#parent_dir` | Parent directory name | `posts` |

### Content Queries

Query frontmatter values using dot notation:

| Query | Description |
|-------|-------------|
| `.title[]` | Get title field value |
| `.author[]` | Get author field value |
| `.tags[]` | Get tags array |
| `.date[]` | Get date field value |

## Visual Examples

![Select From Query with Images](/img/fields/select_visual.png)

The field can display options with thumbnail images for visual selection.

## Usage Examples

### Select Post by Title

```yaml
- key: related-post
  type: select-from-query
  title: Related Post
  query_glob: "content/posts/**/*.md"
  query_string: ".title[]"
```

**Output:**
```yaml
related-post: "Getting Started with Hugo"
```

### Select Multiple Categories

```yaml
- key: categories
  type: select-from-query
  title: Categories
  multiple: true
  query_glob: "content/categories/**/*.md"
  query_string: ".title[]"
```

**Output:**
```yaml
categories:
  - "Technology"
  - "Web Development"
  - "Hugo"
```

### Select by Filename

```yaml
- key: template
  type: select-from-query
  title: Page Template
  query_glob: "layouts/_default/*.html"
  query_string: "#file_base_name"
```

**Output:**
```yaml
template: "single"
```

### Select Author

```yaml
- key: author
  type: select-from-query
  title: Author
  query_glob: "data/authors/*.yaml"
  query_string: ".name[]"
  tip: "Select the author from the list of available authors"
```

### Select by Parent Directory

```yaml
- key: section
  type: select-from-query
  title: Content Section
  query_glob: "content/**/*.md"
  query_string: "#parent_dir"
```

## Visual Options

### With Images

Display thumbnail images alongside options:

```yaml
- key: product
  type: select-from-query
  title: Featured Product
  query_glob: "content/products/**/*.md"
  query_string: ".title[]"
  option_image_path: "static/images/products"
  option_image_width: 100
  option_image_extension: ".jpg"
```

**How it works:**
- Query finds all product markdown files
- Extracts titles using `.title[]`
- Looks for images in `static/images/products/{slug}.jpg`
- Displays 100px wide thumbnails next to each option

### Custom Image Path

```yaml
- key: team-member
  type: select-from-query
  title: Team Member
  query_glob: "content/team/**/*.md"
  query_string: ".name[]"
  option_image_path: "/assets/team-photos"
  option_image_width: 80
  option_image_extension: ".png"
```

## Advanced Examples

### Related Content Selection

```yaml
fields:
  - key: related-articles
    type: select-from-query
    title: Related Articles
    tip: "Select up to 3 related articles to display at the end of this post"
    multiple: true
    query_glob: "content/articles/**/*.md"
    query_string: ".title[]"
    autoSave: true
```

### Dynamic Tag Selection

```yaml
- key: tags
  type: select-from-query
  title: Tags
  multiple: true
  query_glob: "content/tags/*.md"
  query_string: ".title[]"
  tip: "Select all relevant tags for this content"
```

### Template Selection

```yaml
- key: layout
  type: select-from-query
  title: Page Layout
  query_glob: "layouts/**/*.html"
  query_string: "#file_base_name"
  default: "default"
```

### Series Selection

```yaml
- key: series
  type: select-from-query
  title: Article Series
  query_glob: "data/series/*.yaml"
  query_string: ".name[]"
  tip: "Assign this post to a series"
```

## Complex Query Examples

### Get Author from Nested Data

```yaml
- key: author
  type: select-from-query
  title: Author
  query_glob: "content/posts/**/*.md"
  query_string: ".params.author[]"
```

### Filter by Directory

```yaml
- key: tech-post
  type: select-from-query
  title: Related Tech Post
  query_glob: "content/posts/technology/**/*.md"
  query_string: ".title[]"
```

### Multiple Glob Patterns

While `query_glob` accepts a single pattern, you can use wildcards creatively:

```yaml
# Match multiple sections
query_glob: "content/{posts,articles,blogs}/**/*.md"

# Match specific depth
query_glob: "content/*/*.md"

# Match specific file patterns
query_glob: "content/posts/*-tutorial.md"
```

## Use Cases

### Blog Post Relationships

```yaml
collections:
  - key: posts
    title: Blog Posts
    folder: content/posts
    fields:
      - key: title
        type: string
        title: Title
      
      - key: related-posts
        type: select-from-query
        title: Related Posts
        multiple: true
        query_glob: "content/posts/**/*.md"
        query_string: ".title[]"
        tip: "Select up to 3 related posts"
```

### Product Categories

```yaml
- key: category
  type: select-from-query
  title: Product Category
  query_glob: "data/categories/*.yaml"
  query_string: ".name[]"

- key: subcategory
  type: select-from-query
  title: Subcategory
  query_glob: "data/categories/*.yaml"
  query_string: ".subcategories[].name"
```

### Portfolio Projects

```yaml
- key: featured-project
  type: select-from-query
  title: Featured Project
  query_glob: "content/portfolio/**/*.md"
  query_string: ".title[]"
  option_image_path: "static/images/portfolio"
  option_image_width: 120
  option_image_extension: ".jpg"
```

### Documentation Cross-References

```yaml
- key: see-also
  type: select-from-query
  title: See Also
  multiple: true
  query_glob: "content/docs/**/*.md"
  query_string: ".title[]"
  tip: "Add links to related documentation pages"
```

## Best Practices

1. **Specific Globs:** Use narrow glob patterns to avoid performance issues with large sites
2. **Meaningful Queries:** Choose query strings that provide clear, readable options
3. **Image Optimization:** Keep option images small and optimized
4. **Default Values:** Provide sensible defaults when appropriate
5. **Tooltips:** Use `tip` to explain what users should select
6. **Multiple Selection:** Enable `multiple` for many-to-many relationships

## Performance Considerations

- **Glob Patterns:** Narrow patterns (e.g., `content/posts/**/*.md`) perform better than broad patterns (e.g., `**/*.md`)
- **File Count:** Consider performance with hundreds of files
- **Images:** Loading many option images can slow down the interface
- **Caching:** Quiqr caches query results, but initial load may be slow for large sites

## Comparison with Select Field

| Feature | Select From Query | Select |
|---------|-------------------|--------|
| **Options Source** | Dynamic from content | Static in config |
| **Maintenance** | Automatic updates | Manual updates |
| **Performance** | Query overhead | No overhead |
| **Flexibility** | Content-driven | Config-driven |
| **Use Case** | Dynamic content relationships | Fixed option lists |

**When to use select-from-query:**
- Options change as content is added/removed
- Need to reference existing content
- Building relationships between content items

**When to use select:**
- Fixed, predefined options
- Small, stable option lists
- Performance is critical

## Troubleshooting

### No Options Appear

If the dropdown is empty:

1. **Check Glob:** Verify `query_glob` matches existing files
2. **Test Query:** Ensure `query_string` returns values
3. **File Format:** Confirm files have frontmatter with queried fields
4. **Syntax:** Check for typos in QQL syntax

### Wrong Values Returned

If unexpected values appear:

1. **Review Query:** Double-check the `query_string` syntax
2. **Inspect Files:** Verify frontmatter structure in matched files
3. **Test Incrementally:** Start with simple queries and build complexity

## Output

### Single Selection

```yaml
# String value
related-post: "Introduction to Hugo"
```

### Multiple Selection

```yaml
# Array of strings
categories:
  - "Web Development"
  - "Static Sites"
  - "Hugo"
```

## Related Fields

- [Select](./select.md) - Dropdown with static options
- [Chips](./chips.md) - Multiple tag-style selections
- [String](./string.md) - Free-form text input
