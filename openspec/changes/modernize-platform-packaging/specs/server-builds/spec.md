# Spec: Server Builds

**Capability ID:** `server-builds`  
**Change:** `modernize-platform-packaging`  
**Version:** 1.0

## Overview

This capability introduces packaging for Quiqr Server, a headless deployment mode of Quiqr's backend that can be accessed via browser. Server packages enable running Quiqr on remote servers, NAS devices, or containerized environments.

---

## ADDED Requirements

### Requirement: Server Archive Packages
**Priority:** High  
**Rationale:** `.tar.gz` (Linux/macOS) and `.zip` (Windows) archives are the simplest distribution format for server deployments.

The build system SHALL produce archive packages for all platforms that MUST include startup scripts, resources, and all dependencies.

#### Scenario: User deploys server from archive on Linux

**Given** the user downloads `quiqr-server_1.0.0_linux_x64.tar.gz`  
**When** the user extracts the archive with `tar -xzf quiqr-server_*.tar.gz`  
**And** runs `./quiqr-server/quiqr-server --port 3030`  
**Then** the server starts and listens on port 3030  
**And** accessing `http://localhost:3030` in a browser shows Quiqr UI  
**And** embgit binary is accessible to the server  
**And** Hugo can be downloaded dynamically when needed  
**And** running `./quiqr-server/quiqr-server --version` displays the version  

#### Scenario: Server archive includes startup script

**Given** the server archive is extracted  
**When** the user inspects the contents  
**Then** a startup script `quiqr-server` (Linux/macOS) or `quiqr-server.bat` (Windows) is present  
**And** the script accepts command-line arguments `--port`, `--data-dir`, `--host`  
**And** running the script with `--help` displays usage information  

---

### Requirement: Debian Server Package
**Priority:** Medium  
**Rationale:** `.deb` packages enable easy installation on Debian/Ubuntu servers with systemd integration.

The Debian package SHALL install to a standard system location and MUST include a systemd service unit that runs as a non-root user.

#### Scenario: User installs Quiqr Server on Ubuntu

**Given** the user downloads `quiqr-server_1.0.0_amd64.deb`  
**When** the user runs `sudo apt install ./quiqr-server_*.deb`  
**Then** the package installs to `/usr/lib/quiqr-server/` or `/opt/quiqr-server/`  
**And** a systemd service `quiqr-server.service` is created  
**And** the service is enabled but not started by default  

#### Scenario: Systemd service manages server lifecycle

**Given** Quiqr Server is installed via deb package  
**When** the admin runs `sudo systemctl start quiqr-server`  
**Then** the server starts and listens on port 3030 (or configured port)  
**And** the service runs as a non-root user (e.g., `quiqr`)  
**And** running `sudo systemctl status quiqr-server` shows "active (running)"  
**And** the server automatically restarts on failure  

#### Scenario: Debian package is uninstalled cleanly

**Given** Quiqr Server is installed  
**When** the admin runs `sudo apt remove quiqr-server`  
**Then** the service is stopped  
**And** the systemd service file is removed  
**And** application files in `/usr/lib/quiqr-server` are removed  
**And** user data in `/var/lib/quiqr-server` is preserved (unless purged)  

---

### Requirement: RPM Server Package
**Priority:** Medium  
**Rationale:** `.rpm` packages enable installation on RHEL, Fedora, CentOS, openSUSE.

The RPM package SHALL provide equivalent functionality to the Debian package and MUST integrate with systemd on RPM-based distributions.

#### Scenario: User installs Quiqr Server on Fedora

**Given** the user downloads `quiqr-server_1.0.0_x86_64.rpm`  
**When** the user runs `sudo dnf install ./quiqr-server_*.rpm`  
**Then** the package installs with all dependencies  
**And** a systemd service is created  
**And** the service is managed identically to the deb package  

---

### Requirement: Docker Image
**Priority:** High  
**Rationale:** Docker is the standard for containerized deployments, enabling easy scaling and orchestration.

A Docker image SHALL be published for each release that MUST run as a non-root user and include a HEALTHCHECK directive.

#### Scenario: User runs Quiqr Server in Docker

**Given** the user has Docker installed  
**When** the user runs `docker run -d -p 3030:3030 quiqr/server:1.0.0`  
**Then** the container starts successfully  
**And** Quiqr UI is accessible at `http://localhost:3030`  
**And** the container stays running (does not exit immediately)  

#### Scenario: Docker container persists data

**Given** the user runs `docker run -d -p 3030:3030 -v ~/quiqr-data:/data quiqr/server:1.0.0`  
**When** the user creates a site via the UI  
**Then** site files are written to `~/quiqr-data` on the host  
**And** stopping and restarting the container preserves the data  
**And** the user can access site files directly on the host filesystem  

#### Scenario: Docker image is minimal and secure

**Given** the Quiqr Server Docker image is built  
**When** the image is inspected  
**Then** the base image is an official minimal Linux image (e.g., `node:22-alpine`)  
**And** the image size is under 300MB  
**And** the container runs as a non-root user  
**And** a `HEALTHCHECK` is defined to verify the server is responding  

---

### Requirement: Server Build Scripts
**Priority:** High  
**Rationale:** Automated build scripts ensure consistent server packaging.

A build script MUST compile the standalone adapter and bundle all dependencies. The script SHALL support targeting multiple platforms from a single command.

#### Scenario: Developer builds server packages

**Given** a developer runs `npm run build:server`  
**When** the build completes  
**Then** the standalone adapter is compiled from TypeScript  
**And** all dependencies are bundled or listed in `node_modules`  
**And** embgit binary for the target platform is copied to `resources/`  
**And** artifacts are created in `dist/server/` directory  

---

### Requirement: Server Configuration
**Priority:** Medium  
**Rationale:** Server deployments need configurable settings (port, data directory, etc.).

The server MUST support configuration via environment variables and SHALL accept a configuration file path via command-line argument.

#### Scenario: Server reads configuration from environment variables

**Given** Quiqr Server is installed  
**When** the user sets environment variable `QUIQR_PORT=8080`  
**And** starts the server  
**Then** the server listens on port 8080 instead of default 3030  

#### Scenario: Server reads configuration from file

**Given** a configuration file `config.json` exists with `{"port": 8080, "dataDir": "/mnt/data"}`  
**When** the user starts the server with `./quiqr-server --config config.json`  
**Then** the server listens on port 8080  
**And** stores data in `/mnt/data`  

---

### Requirement: Server Resource Bundling
**Priority:** High  
**Rationale:** Server packages must include embgit binary for Git operations; Hugo is downloaded dynamically at runtime.

All server packages SHALL include the platform-specific embgit binary, and the server MUST locate this binary at runtime regardless of installation location. Hugo SHALL be downloaded dynamically when first needed.

#### Scenario: Server packages bundle platform-specific binaries

**Given** Quiqr Server is packaged for Linux x64  
**When** the package is inspected  
**Then** embgit binary for Linux x64 is in `resources/embgit.tar.gz` or `resources/linux/git`  
**And** the binary has execute permissions  
**And** no Hugo binary is included (downloaded dynamically)  

#### Scenario: Server locates bundled binaries at runtime

**Given** Quiqr Server is running from a deb package  
**When** a user triggers Git operations  
**Then** the server finds the embgit binary in `/usr/lib/quiqr-server/resources/`  
**And** executes it successfully  
**When** a user triggers Hugo site generation  
**Then** the server downloads Hugo if not already cached  
**And** executes the downloaded Hugo binary successfully  

---

## MODIFIED Requirements

_No existing requirements modified._

---

## REMOVED Requirements

_No requirements removed in this capability._

---

## Related Capabilities

- **`desktop-builds`**: Shares resource bundling strategy and version management
- **`ci-automation`**: CI workflow builds all server formats defined here

---

## Acceptance Criteria

- [ ] Archive packages (.tar.gz, .zip) extract and run on clean systems
- [ ] Debian package installs and systemd service starts successfully
- [ ] RPM package installs on Fedora and service starts successfully
- [ ] Docker image builds, runs, and passes health checks
- [ ] All server packages include embgit binary
- [ ] Server can download Hugo dynamically at runtime
- [ ] Server responds to HTTP requests at configured port
- [ ] `--version` flag displays correct version in all packages
- [ ] Server can be stopped cleanly (SIGTERM handled gracefully)
- [ ] Documentation includes server installation and configuration guide
