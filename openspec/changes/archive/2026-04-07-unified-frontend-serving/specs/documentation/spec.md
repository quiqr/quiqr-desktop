## ADDED Requirements

### Requirement: Standalone Deployment Documentation

The documentation site SHALL include a guide for deploying Quiqr in standalone (non-Electron) mode.

#### Scenario: Standalone deployment guide exists
- **WHEN** a user wants to deploy Quiqr as a standalone server
- **THEN** documentation at `packages/docs/docs/getting-started/` SHALL describe:
  - How to build the frontend and backend
  - How to start the unified server
  - Environment variables (`PORT`, `FRONTEND_PATH`)
  - Expected behavior (single port, SPA + API)

#### Scenario: Docker deployment guide exists
- **WHEN** a user wants to deploy Quiqr using Docker
- **THEN** documentation SHALL describe:
  - How to build the Docker image
  - How to run with `docker-compose`
  - Volume mounts for persistent data
  - Environment variable configuration
  - The `docker-compose.yml` as a reference example
