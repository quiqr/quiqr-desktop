# Implementation Tasks

## 1. Planning and Research
- [x] 1.1 Research `openspecui` fork with static export functionality
- [x] 1.2 Verify Nix-based export works locally with the openspecui fork
- [x] 1.3 Determine deployment path for OpenSpec UI on GitHub Pages (root path chosen)
- [x] 1.4 Decide to add to existing `test.yml` workflow as new job

## 2. Workflow Implementation
- [x] 2.1 Add new job `publish-openspec` to `.github/workflows/test.yml`
- [x] 2.2 Install Nix in workflow using `cachix/install-nix-action@v24` with flakes support
- [x] 2.3 Execute `nix run github:mipmip/openspecui/feature/nixFlake -- export --dir . --clean ./openspec-export`
- [x] 2.4 Configure deployment using `actions/upload-pages-artifact` and `actions/deploy-pages`
- [x] 2.5 Ensure workflow runs only on push to `main` or `ng` branches (not on PRs)
- [x] 2.6 Add necessary workflow permissions (`contents: read`, `pages: write`, `id-token: write`)

## 3. GitHub Pages Configuration
- [x] 3.1 Verify GitHub Pages is configured to use "GitHub Actions" as deployment source
- [x] 3.2 Test that existing coverage badge at `/badges/coverage.svg` remains accessible after deployment
- [x] 3.3 Verify OpenSpec UI deploys to root path without overwriting badges

## 4. Documentation
- [x] 4.1 Add workflow comments explaining OpenSpec UI publishing with Nix
- [x] 4.2 Update README with link to published OpenSpec UI (optional, based on preference)
- [x] 4.3 Document prerequisites (GitHub Pages must use "GitHub Actions" source)
- [x] 4.4 Document the fork usage and plan for switching to official package when PR merges

## 5. Testing and Validation
- [x] 5.1 Test workflow on a feature branch pushed to remote
- [x] 5.2 Verify OpenSpec UI is accessible at expected URL after deployment
- [x] 5.3 Confirm coverage badge is not broken by the new deployment
- [x] 5.4 Validate that both `main` and `ng` branch pushes trigger publishing correctly
- [x] 5.5 Monitor CI execution time to ensure it stays under 5 minutes total
- [x] 5.6 Run `openspec validate add-openspecui-publishing --strict` to ensure proposal is valid
