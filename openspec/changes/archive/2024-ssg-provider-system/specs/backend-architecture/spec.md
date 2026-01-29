## ADDED Requirements

### Requirement: Pluggable SSG Provider System

The system SHALL provide a pluggable architecture for supporting multiple Static Site Generators through a common interface.

#### Scenario: Register built-in providers
- **WHEN** the backend initializes
- **THEN** it SHALL load and register all built-in providers (Hugo, Eleventy)
- **AND** each provider SHALL be registered independently with error isolation
- **AND** failure to load one provider SHALL NOT prevent loading others
- **AND** errors SHALL be logged to OutputConsole

#### Scenario: Get provider by type
- **WHEN** code requests a provider by SSG type (e.g., "hugo", "eleventy")
- **THEN** the provider registry SHALL return the appropriate provider instance
- **AND** if provider is not found, SHALL throw clear error message

#### Scenario: List available providers
- **WHEN** code queries available providers
- **THEN** the registry SHALL return metadata for all registered providers
- **AND** metadata SHALL include: type, name, config formats, capabilities

### Requirement: SSG Provider Interface

All SSG providers SHALL implement the `SSGProvider` interface with standardized methods.

#### Scenario: Provider metadata
- **WHEN** provider metadata is requested
- **THEN** it SHALL return `ProviderMetadata` with:
  - `type` (string identifier, e.g., "hugo")
  - `name` (display name, e.g., "Hugo")
  - `configFormats` (supported formats: yaml, toml, json)
  - `requiresBinary` (boolean, whether download needed)
  - `supportsDevServer` (boolean)
  - `supportsBuild` (boolean)
  - `supportsConfigQuery` (boolean)
  - `version` (provider version)

#### Scenario: Create dev server
- **WHEN** dev server is requested with config
- **THEN** provider SHALL return `SSGDevServer` instance
- **AND** server SHALL use provided workspace path, version, config file
- **AND** server SHALL use port 13131 (standard across all SSGs)

#### Scenario: Create builder
- **WHEN** builder is requested with config
- **THEN** provider SHALL return `SSGBuilder` instance
- **AND** builder SHALL use provided workspace path, version, destination, config file

#### Scenario: Detect site in directory
- **WHEN** provider is asked to detect SSG in a directory
- **THEN** it SHALL return `SSGDetectionResult` with:
  - `isDetected` (boolean)
  - `confidence` ("high" | "medium" | "low")
  - `configFiles` (optional array of found configs)
- **AND** high confidence when config files found
- **AND** medium confidence when package.json has dependency
- **AND** low confidence when multiple marker directories present

### Requirement: Binary Manager Interface

The system SHALL support two distribution patterns for SSG installations: standalone binaries and npm packages.

#### Scenario: Check if version installed (standalone binary)
- **WHEN** checking if a specific version is installed
- **THEN** it SHALL check path from `pathHelper.getSSGBinForVer(ssgType, version)`
- **AND** return true if binary file exists
- **AND** return false otherwise

#### Scenario: Check if version installed (npm package)
- **WHEN** checking if npm package version is installed
- **THEN** it SHALL check `[installDir]/node_modules/.bin/[package]`
- **AND** on Windows, SHALL also check for `.cmd` wrapper
- **AND** return true if executable exists

#### Scenario: Download with progress (async generator)
- **WHEN** downloading/installing SSG version
- **THEN** it SHALL use async generator pattern yielding `DownloadProgress`
- **AND** each yield SHALL include: `percent`, `message`, `complete`, optional `error`
- **AND** progress SHALL range from 0-100
- **AND** final yield SHALL have `complete: true`
- **AND** errors SHALL set `error` field with message

#### Scenario: Support graceful cancellation
- **WHEN** cancel() is called during download
- **THEN** `cancelRequested` flag SHALL be set to true
- **AND** ongoing operations SHALL check flag and abort
- **AND** partial downloads SHALL be cleaned up

#### Scenario: Ensure availability
- **WHEN** `ensureAvailable(version)` is called
- **THEN** if version not installed, SHALL download it
- **AND** SHALL consume download generator until complete
- **AND** SHALL throw error if download fails

### Requirement: Standard Dev Server Port

All SSG providers SHALL use port 13131 for development servers.

#### Scenario: Consistent port across SSGs
- **WHEN** any provider starts a dev server
- **THEN** it SHALL use port 13131
- **AND** preview button SHALL always link to `http://localhost:13131`
- **AND** no provider-specific port configuration needed in UI

### Requirement: Download Progress via SSE

The system SHALL stream download progress to frontend via Server-Sent Events.

#### Scenario: SSE endpoint for downloads
- **WHEN** frontend requests download at `/api/ssg/download/:ssgType/:version`
- **THEN** backend SHALL stream progress updates via SSE
- **AND** each update SHALL be JSON with: percent, message, complete, error
- **AND** stream SHALL close when complete or on error

#### Scenario: Frontend progress display
- **WHEN** `useSSGDownload()` hook is used
- **THEN** it SHALL connect to SSE endpoint
- **AND** display real-time progress bar
- **AND** show status messages
- **AND** handle errors gracefully

### Requirement: Site Configuration Format

The system SHALL use `ssgType` and `ssgVersion` fields in site configuration.

#### Scenario: New config format
- **WHEN** site config is created or updated
- **THEN** it SHALL include:
  - `ssgType: string` (e.g., "hugo", "eleventy")
  - `ssgVersion: string` (e.g., "2.0.0")
- **AND** serve/build configs SHALL reference SSG-specific config files

#### Scenario: Config migration from legacy format
- **WHEN** config with `hugover: X` is loaded
- **THEN** it SHALL be migrated to `ssgType: "hugo"` and `ssgVersion: X`
- **AND** migration SHALL happen automatically on load
- **AND** migrated config SHALL validate against schema

### Requirement: Path Helper SSG Support

The PathHelper SHALL provide methods for resolving SSG binary paths.

#### Scenario: Get binary path for version
- **WHEN** `getSSGBinForVer(ssgType, version)` is called
- **THEN** it SHALL return platform-specific binary path
- **AND** path SHALL be `[userDataDir]/ssg-bin/[ssgType]/[version]/[binary]`
- **AND** on Windows, SHALL handle `.exe` extension

#### Scenario: Get binary directory for version
- **WHEN** `getSSGBinDirForVer(ssgType, version)` is called
- **THEN** it SHALL return `[userDataDir]/ssg-bin/[ssgType]/[version]/`
- **AND** directory SHALL be created if needed for installs

### Requirement: Platform-Specific Handling

The system SHALL handle platform differences for SSG installations.

#### Scenario: Windows npm executable wrappers
- **WHEN** checking for npm package binary on Windows
- **THEN** it SHALL check both `[binary]` and `[binary].cmd` paths
- **AND** it SHALL use `npm.cmd` instead of `npm` for installation
- **AND** execution SHALL use `.cmd` wrapper

#### Scenario: Platform-specific binary downloads
- **WHEN** downloading standalone binary (Hugo pattern)
- **THEN** download URL SHALL be selected based on platform
- **AND** Linux SHALL download Linux binary
- **AND** macOS SHALL download Darwin binary
- **AND** Windows SHALL download Windows binary with `.exe`

### Requirement: OutputConsole Logging

All provider operations SHALL log to OutputConsole instead of console.log.

#### Scenario: Provider logs visible in UI
- **WHEN** provider performs operations (download, build, serve)
- **THEN** all status messages SHALL use `outputConsole.appendLine()`
- **AND** logs SHALL be visible in UI console view
- **AND** errors SHALL be logged with clear context

## MODIFIED Requirements

### Requirement: Backend Configuration Schema

The backend configuration schema SHALL support multiple SSG types with version-specific configuration.

#### Scenario: Site config includes SSG type and version
- **WHEN** site configuration is loaded
- **THEN** it SHALL have `ssgType: string` field
- **AND** it SHALL have `ssgVersion: string` field
- **AND** it SHALL validate against `siteConfigSchema` in packages/types
- **AND** serve/build configs SHALL be SSG-agnostic arrays

## REMOVED Requirements

### Requirement: Hugo-Specific Global State
**Reason**: Replaced by pluggable provider system  
**Migration**: Use `providerRegistry.getProvider(ssgType)` instead of hardcoded Hugo references
