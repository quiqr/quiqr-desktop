---
sidebar_position: 2
---

# File Field

The `file` field provides generic file upload capabilities for any file type.

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default file path |
| `path` | string | No | static/files/ | Upload directory path |
| `max_size` | number | No | 10 | Maximum file size in MB |
| `allowed_types` | array | No | * | Allowed file extensions |

## Examples

### Example 1: PDF Document

**Configuration:**

```yaml
key: resume
title: Resume/CV
type: file
path: static/documents/
allowed_types:
  - pdf
max_size: 5
tip: Upload your resume in PDF format
```

**Output:**

```yaml
resume: /documents/john-doe-resume.pdf
```

### Example 2: Data File

**Configuration:**

```yaml
key: dataset
title: Dataset
type: file
path: static/data/
allowed_types:
  - csv
  - json
  - xlsx
max_size: 50
```

**Output:**

```yaml
dataset: /data/sales-2026.csv
```

### Example 3: Any File Type

**Configuration:**

```yaml
key: attachment
title: Attachment
type: file
path: static/attachments/
tip: Upload any supporting file
```

**Output:**

```yaml
attachment: /attachments/supporting-document.docx
```

## Features

- **Upload**: Browse or drag-and-drop to upload
- **File info**: Display filename, size, type
- **Select**: Choose from existing files
- **Remove**: Clear selected file
- **Validation**: File size and type checking

## Common File Types

| Extension | Description | Common Use |
|-----------|-------------|------------|
| `.pdf` | PDF document | Reports, forms, ebooks |
| `.docx` | Word document | Documents, templates |
| `.xlsx` | Excel spreadsheet | Data, reports |
| `.csv` | CSV data | Data export/import |
| `.json` | JSON data | Configuration, data |
| `.zip` | Archive | Multiple files |
| `.txt` | Text file | Notes, logs |
| `.md` | Markdown | Documentation |

## Use Cases

- **Documents**: PDFs, Word docs, spreadsheets
- **Data**: CSV, JSON, XML files
- **Archives**: ZIP files, backups
- **Media**: Audio files, video files
- **Code**: Source code, configuration files

## File Size Guidelines

| Use Case | Max Size | Reason |
|----------|----------|--------|
| Documents | 5-10 MB | Reasonable for PDFs/docs |
| Data files | 10-50 MB | Depends on dataset size |
| Media | 50-100 MB | Audio/video can be large |
| Archives | 100+ MB | May contain many files |

## Security Notes

- Always validate file types on upload
- Scan uploaded files for malware
- Limit file sizes to prevent abuse
- Store files outside public directories when sensitive

## Related Fields

- [Image](./image.md) - Specialized for image files
- [String](../data-fields/string.md) - For file URLs
- [Hidden](../data-fields/hidden.md) - For system file paths
