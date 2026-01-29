# Spec: Desktop Builds

**Capability ID:** `desktop-builds`  
**Change:** `modernize-platform-packaging`  
**Version:** 1.0

## Overview

This capability expands Quiqr Desktop's distribution formats to include portable Windows packaging and improved macOS support with code signing and notarization.

---

## ADDED Requirements

### Requirement: Windows Portable Package
**Priority:** Medium  
**Rationale:** Many users prefer portable applications that don't require installation or admin rights.

The build system SHALL produce a portable Windows package as a ZIP archive that MUST be runnable without installation.

#### Scenario: User runs Quiqr Desktop without installation

**Given** the user downloads `quiqr-desktop_1.0.0_windows_x64_portable.zip`  
**When** the user extracts the zip to any directory  
**And** double-clicks `quiqr.exe`  
**Then** Quiqr Desktop launches without installation  
**And** all features work identically to the installed version  
**And** user data is stored in the portable directory or user profile  

#### Scenario: Portable version is moved to different location

**Given** Quiqr Desktop portable is running from `C:\Apps\Quiqr`  
**When** the user closes the application  
**And** moves the entire directory to `D:\Tools\Quiqr`  
**And** launches `quiqr.exe` from the new location  
**Then** the application starts successfully  
**And** user preferences and recent sites are preserved  

---

### Requirement: macOS Notarized Package
**Priority:** Medium  
**Rationale:** macOS Gatekeeper requires notarization for apps distributed outside the App Store.

The macOS DMG package MUST be code-signed and notarized to pass Gatekeeper validation. The build SHALL support universal binaries (x64 + arm64).

#### Scenario: User installs DMG on macOS without security warnings

**Given** the user downloads `quiqr-desktop_1.0.0_macos_universal.dmg`  
**When** the user opens the DMG file  
**And** drags Quiqr to Applications folder  
**And** launches Quiqr from Applications  
**Then** the application opens without Gatekeeper warning  
**And** no "unverified developer" message appears  
**And** the application has necessary permissions (Files, Network)  

#### Scenario: macOS universal binary runs on Intel and Apple Silicon

**Given** Quiqr Desktop DMG is built as universal binary  
**When** the user installs on an Intel Mac (x64)  
**Then** the application runs natively on Intel architecture  
**Given** the user installs on an Apple Silicon Mac (arm64)  
**Then** the application runs natively on ARM architecture  
**And** performance is optimal for each architecture  

---

### Requirement: Build Configuration for All Formats
**Priority:** High  
**Rationale:** electron-builder must be configured to produce all target formats reliably.

The build configuration SHALL support all desktop formats, and each format MUST include the embgit binary. Hugo is downloaded dynamically and not packaged.

#### Scenario: Build script generates all desktop formats

**Given** a developer runs `npm run build` on a Linux system  
**When** the build completes successfully  
**Then** AppImage, deb, and rpm files are created  
**And** all files follow the naming convention `quiqr-desktop_${version}_${platform}_${arch}.${ext}`  

#### Scenario: Platform-specific resources are bundled correctly

**Given** the build system packages Quiqr Desktop for Linux  
**When** the embgit binary for Linux is in `resources/embgit.tar.gz` or `resources/linux/`  
**Then** the embgit binary is included in all Linux packages  
**And** the binary is executable after installation  
**And** the application can locate and execute it  
**And** the application can download Hugo dynamically at first run  

---

### Requirement: Package Metadata Consistency
**Priority:** Medium  
**Rationale:** All packages should have consistent metadata for branding and discoverability.

All packages MUST include consistent metadata (name, version, description, license) that SHALL match the values in package.json.

#### Scenario: Package metadata reflects application information

**Given** Quiqr Desktop is packaged in any format  
**When** the user inspects package metadata (via store, package manager, or file properties)  
**Then** the application name is "Quiqr Desktop"  
**And** the version matches the git tag and package.json  
**And** the description is "Local-first CMS for Hugo and Quarto static sites"  
**And** the license is displayed correctly  
**And** the vendor is "Quiqr"  

---

## MODIFIED Requirements

### Requirement: Linux deb Package (Existing)
**Priority:** High  
**Change:** Improve desktop integration and dependency declarations

The deb package SHALL register desktop menu entries and MUST integrate with the desktop environment (GNOME, KDE, etc.).

#### Scenario: Debian package integrates with desktop environment

**Given** the user installs `quiqr-desktop_1.0.0_amd64.deb` on Ubuntu  
**When** the installation completes  
**Then** Quiqr Desktop appears in the Activities menu (GNOME) or KMenu (KDE)  
**And** the correct icon is displayed  
**And** clicking the menu item launches the application  
**And** MIME type associations are registered for `.qrc` files (if applicable)  

---

### Requirement: Linux rpm Package (Existing)
**Priority:** High  
**Change:** Add Fedora-specific optimizations and desktop integration

The rpm package SHALL install all dependencies automatically and MUST integrate with Fedora/RHEL desktop environments.

#### Scenario: RPM package installs on Fedora

**Given** the user installs `quiqr-desktop_1.0.0_x86_64.rpm` on Fedora  
**When** the installation completes via dnf  
**Then** all dependencies are automatically installed  
**And** Quiqr Desktop is listed in `dnf list installed`  
**And** the application appears in GNOME Overview or KDE menu  
**And** SELinux policies (if any) allow proper operation  

---

## REMOVED Requirements

_No requirements removed in this capability._

---

## Related Capabilities

- **`server-builds`**: Server packaging shares resource bundling logic
- **`ci-automation`**: CI workflow builds all desktop formats defined here

---

## Acceptance Criteria

- [ ] All desktop formats build successfully on respective platforms
- [ ] Windows portable version runs from USB drive without issues
- [ ] macOS DMG passes notarization and runs on macOS 11+
- [ ] All packages launch and display correct version in About dialog
- [ ] embgit binary works in all package formats
- [ ] Hugo can be downloaded dynamically at runtime in all formats
