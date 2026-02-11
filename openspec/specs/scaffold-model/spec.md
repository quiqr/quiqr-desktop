# scaffold-model Specification

## Purpose
TBD - created by archiving change restore-scaffold-model. Update Purpose after archive.
## Requirements
### Requirement: Scaffold Single from File

The system SHALL allow users to scaffold a single content model definition from an existing data file.

#### Scenario: Scaffold single from YAML file
- **Given** a site is mounted
- **When** the user triggers "Scaffold Single from File" and selects a YAML data file
- **Then** the system parses the file, infers field types, and creates a model definition in `quiqr/model/includes/singles/`
- **And** the new single is added to the menu configuration

#### Scenario: Scaffold single from Markdown with frontmatter
- **Given** a site is mounted
- **When** the user triggers "Scaffold Single from File" and selects a Markdown file with frontmatter
- **Then** the system extracts and parses the frontmatter
- **And** infers field types from the frontmatter keys
- **And** adds a `mainContent` field of type `markdown` for the body content
- **And** creates a model definition in `quiqr/model/includes/singles/`

#### Scenario: User cancels file selection
- **Given** a site is mounted
- **When** the user triggers "Scaffold Single from File" but cancels the file dialog
- **Then** no model is created and no error is shown

### Requirement: Scaffold Collection from File

The system SHALL allow users to scaffold a collection content model definition from an existing data file representing a collection item.

#### Scenario: Scaffold collection from JSON file
- **Given** a site is mounted
- **When** the user triggers "Scaffold Collection from File" and selects a JSON file from a content folder
- **Then** the system parses the file, infers field types
- **And** creates a collection model definition in `quiqr/model/includes/collections/`
- **And** the new collection is added to the menu configuration

#### Scenario: Scaffold collection with nested objects
- **Given** a site is mounted
- **When** the user selects a file containing nested objects
- **Then** nested objects are scaffolded as `nest` fields with `groupdata: true`
- **And** the nested object's keys become child fields

### Requirement: Field Type Inference

The system SHALL correctly infer field types from JavaScript value types.

#### Scenario: Infer string field
- **Given** a data object with a string value
- **When** the field inferrer processes the object
- **Then** the field type is set to `string`

#### Scenario: Infer markdown field for mainContent
- **Given** a data object with a key named `mainContent` containing a string
- **When** the field inferrer processes the object
- **Then** the field type is set to `markdown`

#### Scenario: Infer number field
- **Given** a data object with a numeric value
- **When** the field inferrer processes the object
- **Then** the field type is set to `number`

#### Scenario: Infer boolean field
- **Given** a data object with a boolean value
- **When** the field inferrer processes the object
- **Then** the field type is set to `boolean`

#### Scenario: Infer leaf-array field
- **Given** a data object with an array of primitive values
- **When** the field inferrer processes the object
- **Then** the field type is set to `leaf-array`
- **And** a mandatory `field` property is added containing the child field definition
- **And** the child field type is inferred from the first array element (string, number, or boolean)

#### Scenario: Infer accordion field for array of objects
- **Given** a data object with an array of objects
- **When** the field inferrer processes the object
- **Then** the field type is set to `accordion`
- **And** the nested object keys become child field definitions

#### Scenario: Infer nest field for object
- **Given** a data object with a nested object value
- **When** the field inferrer processes the object
- **Then** the field type is set to `nest` with `groupdata: true`
- **And** the nested object keys become child field definitions

### Requirement: Supported File Formats

The scaffold service SHALL support multiple file formats.

#### Scenario: Parse YAML file
- **Given** a file with `.yaml` or `.yml` extension
- **When** the scaffold service processes the file
- **Then** the file is parsed using YAML format provider

#### Scenario: Parse TOML file
- **Given** a file with `.toml` extension
- **When** the scaffold service processes the file
- **Then** the file is parsed using TOML format provider

#### Scenario: Parse JSON file
- **Given** a file with `.json` extension
- **When** the scaffold service processes the file
- **Then** the file is parsed using JSON format provider

#### Scenario: Parse Markdown frontmatter
- **Given** a file with `.md`, `.markdown`, or `.qmd` extension
- **When** the scaffold service processes the file
- **Then** the frontmatter delimiter is detected (--- or +++)
- **And** the appropriate format provider is used based on the delimiter

### Requirement: Menu Integration

The scaffold service SHALL add scaffolded models to the menu configuration.

#### Scenario: Add single to menu
- **Given** a single model has been successfully scaffolded
- **When** the scaffold service completes
- **Then** the model is added to `quiqr/model/includes/menu.yaml`
- **And** the menu items are stored as a root-level array (no `menu:` wrapper key)
- **And** the model is grouped under a "Singles" menu group

#### Scenario: Add collection to menu
- **Given** a collection model has been successfully scaffolded
- **When** the scaffold service completes
- **Then** the model is added to `quiqr/model/includes/menu.yaml`
- **And** the menu items are stored as a root-level array (no `menu:` wrapper key)
- **And** the model is grouped under a "Collections" menu group

#### Scenario: Menu file structure
- **Given** the menu.yaml file at `quiqr/model/includes/menu.yaml`
- **When** items are added
- **Then** the file structure is a YAML array at root level:
  ```yaml
  - key: singles
    title: Singles
    menuItems:
      - key: my-single
        title: My Single
  - key: collections
    title: Collections
    menuItems:
      - key: my-collection
        title: My Collection
  ```

### Requirement: Error Handling

The scaffold service SHALL handle errors gracefully.

#### Scenario: Invalid file format
- **Given** a file that cannot be parsed
- **When** the scaffold service attempts to process it
- **Then** an error dialog is shown with a descriptive message
- **And** no model file is created

#### Scenario: Empty file
- **Given** an empty data file
- **When** the scaffold service processes the file
- **Then** an error dialog is shown indicating the file is empty
- **And** no model file is created

