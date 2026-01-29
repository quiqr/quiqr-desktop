# Change: SSG Provider System

## Why

The application initially only supported Hugo as a Static Site Generator. To support multiple SSGs (Eleventy, Jekyll, etc.), a pluggable provider system was needed that abstracts SSG-specific operations behind a common interface while supporting different distribution methods (standalone binaries, npm packages).

## What Changes

- Create pluggable SSG provider architecture with common interfaces
- Implement `SSGProvider`, `SSGBinaryManager`, `SSGDevServer`, `SSGBuilder` interfaces
- Support two distribution patterns: standalone binaries (Hugo) and npm packages (Eleventy)
- Centralized provider registry (`ProviderFactory`) for registration and discovery
- Async generator pattern for streaming download progress via SSE
- Site detection logic with confidence levels (high/medium/low)
- Configuration migration from `hugover` to `ssgType` + `ssgVersion`
- Platform-specific binary handling (Linux, macOS, Windows)
- Standard dev server port (13131) across all providers
- **BREAKING**: Config format change from `hugover: X` to `ssgType: hugo, ssgVersion: X`

## Impact

- Affected specs: backend-architecture, type-system
- Affected code:
  - `packages/backend/src/ssg-providers/` (created entire system)
  - `packages/backend/src/ssg-providers/types.ts` (interface definitions)
  - `packages/backend/src/ssg-providers/provider-registry.ts` (factory)
  - `packages/backend/src/ssg-providers/hugo/` (Hugo provider implementation)
  - `packages/backend/src/ssg-providers/eleventy/` (Eleventy provider implementation)
  - `packages/backend/src/utils/path-helper.ts` (SSG binary path resolution)
  - `packages/types/src/schemas/config.ts` (config migration)
  - All site configuration files (migrated to new format)
