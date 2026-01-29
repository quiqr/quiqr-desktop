## 1. Define Core Interfaces
- [x] 1.1 Create `packages/backend/src/ssg-providers/types.ts`
- [x] 1.2 Define `SSGProvider` interface
- [x] 1.3 Define `SSGBinaryManager` interface
- [x] 1.4 Define `SSGDevServer` interface
- [x] 1.5 Define `SSGBuilder` interface
- [x] 1.6 Define `SSGConfigQuerier` interface (optional)
- [x] 1.7 Define `ProviderMetadata` interface
- [x] 1.8 Define `SSGDetectionResult` interface
- [x] 1.9 Define `DownloadProgress` type

## 2. Implement Provider Registry
- [x] 2.1 Create `packages/backend/src/ssg-providers/provider-registry.ts`
- [x] 2.2 Implement `ProviderFactory` class
- [x] 2.3 Add `registerProvider()` method
- [x] 2.4 Add `getProvider()` method
- [x] 2.5 Add `getAvailableProviders()` method
- [x] 2.6 Add `registerBuiltInProviders()` method
- [x] 2.7 Implement error handling for failed provider loads

## 3. Refactor Hugo Provider
- [x] 3.1 Create `packages/backend/src/ssg-providers/hugo/` directory
- [x] 3.2 Extract Hugo logic into `HugoProvider` class
- [x] 3.3 Implement `HugoDownloader` (binary download from GitHub)
- [x] 3.4 Implement `HugoServer` (dev server on port 13131)
- [x] 3.5 Implement `HugoBuilder` (static site builder)
- [x] 3.6 Implement Hugo site detection
- [x] 3.7 Register Hugo provider in registry

## 4. Implement Eleventy Provider
- [x] 4.1 Create `packages/backend/src/ssg-providers/eleventy/` directory
- [x] 4.2 Implement `EleventyProvider` class
- [x] 4.3 Implement `EleventyDownloader` (npm package installation)
- [x] 4.4 Implement `EleventyServer` (dev server on port 13131)
- [x] 4.5 Implement `EleventyBuilder` (static site builder)
- [x] 4.6 Implement Eleventy site detection
- [x] 4.7 Handle Windows `.cmd` wrapper for npm binaries
- [x] 4.8 Register Eleventy provider in registry

## 5. Update Path Helper
- [x] 5.1 Add `getSSGBinForVer(ssgType, version)` method
- [x] 5.2 Add `getSSGBinDirForVer(ssgType, version)` method
- [x] 5.3 Support both binary and npm package paths
- [x] 5.4 Handle platform-specific paths (Windows, Linux, macOS)

## 6. Config Schema Migration
- [x] 6.1 Update `packages/types/src/schemas/config.ts`
- [x] 6.2 Add `ssgType` field to schema
- [x] 6.3 Add `ssgVersion` field to schema
- [x] 6.4 Implement migration from `hugover` to `ssgType + ssgVersion`
- [x] 6.5 Validate migrated configs

## 7. Backend API Updates
- [x] 7.1 Update SSG binary check API to accept `ssgType` parameter
- [x] 7.2 Update download endpoint: `/api/ssg/download/:ssgType/:version`
- [x] 7.3 Implement SSE streaming for download progress
- [x] 7.4 Update build/serve APIs to use provider system
- [x] 7.5 Add error handling for unsupported SSG types

## 8. Frontend Updates
- [x] 8.1 Update `useSSGDownload()` hook to accept `ssgType`
- [x] 8.2 Update workspace views to display correct SSG name
- [x] 8.3 Test download progress UI with both providers
- [x] 8.4 Update documentation and help text

## 9. Testing
- [x] 9.1 Create Hugo test site with new config format
- [x] 9.2 Create Eleventy test site with new config format
- [x] 9.3 Test Hugo provider (download, serve, build)
- [x] 9.4 Test Eleventy provider (npm install, serve, build)
- [x] 9.5 Test config migration for existing Hugo sites
- [x] 9.6 Test site detection for both providers
- [x] 9.7 Test on all platforms (Linux, macOS, Windows)
- [x] 9.8 Test edge cases (cancel download, missing binary, errors)

## 10. Documentation
- [x] 10.1 Create SSG Provider Implementation Guide
- [x] 10.2 Document provider interfaces
- [x] 10.3 Document binary vs npm distribution patterns
- [x] 10.4 Create example site templates for both Hugo and Eleventy
- [x] 10.5 Update AGENTS.md with SSG provider patterns
- [x] 10.6 Add troubleshooting guide
