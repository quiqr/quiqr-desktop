## ADDED Requirements

### Requirement: Configurable preview base URL

The frontend SHALL use a configurable base URL from instance settings (`preview.baseUrl`) instead of the hardcoded `http://localhost:13131` when constructing preview URLs for singles, collections, and the workspace toolbar.

#### Scenario: Preview URL with configured baseUrl
- **WHEN** `preview.baseUrl` is set to `https://preview.example.com`
- **AND** the user opens a preview for a page at path `/en/about/`
- **THEN** the browser SHALL open `https://preview.example.com/en/about/`

#### Scenario: Preview URL with default baseUrl
- **WHEN** `preview.baseUrl` is not configured (default)
- **THEN** the preview URL SHALL use `http://localhost:13131` as the base (unchanged behavior)

#### Scenario: Preview URL in workspace toolbar
- **WHEN** the user clicks the preview button in the workspace toolbar
- **THEN** the URL SHALL use `preview.baseUrl` from instance settings

#### Scenario: Preview URL for single items
- **WHEN** a single item has a `previewUrl` configured
- **THEN** the full preview URL SHALL be `preview.baseUrl` + base URL path + `previewUrl`

#### Scenario: Preview URL for collection items
- **WHEN** a collection item preview link is constructed
- **THEN** the full preview URL SHALL be `preview.baseUrl` + computed collection item path

### Requirement: Preview can be disabled

The frontend SHALL hide all preview buttons and links when `preview.enabled` is `false` in instance settings.

#### Scenario: Preview disabled
- **WHEN** `preview.enabled` is `false`
- **THEN** the workspace toolbar SHALL NOT show the preview button
- **AND** single item preview links SHALL NOT be rendered
- **AND** collection item preview links SHALL NOT be rendered

#### Scenario: Preview enabled (default)
- **WHEN** `preview.enabled` is `true` or not configured
- **THEN** preview buttons and links SHALL be shown as normal (unchanged behavior)

## REMOVED Requirements

### Requirement: Dead PreviewConfig type guard
**Reason:** Replaced by instance settings-based preview configuration
**Migration:** Use `getInstanceSetting('preview.enabled')` and `getInstanceSetting('preview.baseUrl')` instead
