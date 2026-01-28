# Change: Add OpenSpec UI Publishing to CI

## Why
The project uses OpenSpec for spec-driven development, but the specifications are only visible in Markdown files within the repository. Publishing the OpenSpec documentation as an interactive website on GitHub Pages would make the specifications more discoverable and easier to navigate for both team members and external contributors. This addresses issue #613 by implementing automated OpenSpecUI publishing in the CI pipeline using a fork that adds static export capabilities.

## What Changes
- Add a new GitHub Actions workflow job that runs after pushes to `main` or `ng` branches
- Install Nix with flakes support using `cachix/install-nix-action`
- Execute a fork of `openspecui` (`github:mipmip/openspecui/feature/nixFlake`) that supports static export to generate HTML documentation from the repository root
- Publish the generated documentation to GitHub Pages at the root path (coverage badges remain at `/badges/`)
- Ensure the workflow has appropriate permissions to update GitHub Pages
- Add clear documentation about how to access the published OpenSpec UI

## Impact
- **Affected specs**: `ci-automation`
- **Affected code**: 
  - `.github/workflows/test.yml` (or new workflow file)
  - Potentially `README.md` if we add a link/badge to the published specs
- **Benefits**:
  - Improved documentation discoverability
  - Better onboarding experience for new contributors
  - Interactive browsing of requirements and specifications
  - Automated documentation updates on every merge
- **Risks**:
  - Must coordinate with existing GitHub Pages deployment (coverage badge at `/badges/`)
  - Additional CI time for Nix installation and documentation generation (~1-2 minutes)
  - Dependency on a fork of `openspecui` until static export is merged upstream
  - Requires GitHub Pages to use "GitHub Actions" as source (not "Deploy from branch")
