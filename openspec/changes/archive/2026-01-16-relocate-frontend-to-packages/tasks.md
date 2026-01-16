# Tasks: Relocate frontend workspace to packages directory

## 1. Preparation
- [x] 1.1 Verify git working tree is clean
- [x] 1.2 Create a new feature branch from `ng` (skipped - working on ng branch directly)

## 2. Move and rename
- [x] 2.1 Move `/frontend/` directory to `/packages/frontend/`
- [x] 2.2 Add `"name": "@quiqr/frontend"` to `packages/frontend/package.json`

## 3. Update root package.json
- [x] 3.1 Update workspace config: change `"frontend"` to `"packages/frontend"`
- [x] 3.2 Update `dev:frontend` script: `cd frontend` -> `cd packages/frontend`
- [x] 3.3 Update `build:frontend` script: `cd frontend` -> `cd packages/frontend`
- [x] 3.4 Update `clean` script: update all `frontend/` paths to `packages/frontend/`
- [x] 3.5 Update electron-builder `build.files`: `frontend/build/**/*` -> `packages/frontend/build/**/*`
- [x] 3.6 Update electron-builder `build.directories.buildResources`: `frontend/public` -> `packages/frontend/public`

## 4. Update configuration files
- [x] 4.1 Update `vitest.config.ts`: change `./frontend/vitest.config.ts` to `./packages/frontend/vitest.config.ts`
- [x] 4.2 Update `.gitignore`: change `frontend/build` to `packages/frontend/build`

## 5. Update CI workflows
- [x] 5.1 Update `.github/workflows/test.yml`: change `working-directory: ./frontend` to `working-directory: ./packages/frontend`

## 6. Update documentation
- [x] 6.1 Update `AGENTS.md`: update frontend path references
- [x] 6.2 Update `CONTRIBUTING.md`: update `cd frontend` commands
- [x] 6.3 Update `openspec/project.md`: update all `frontend/` path references
- [x] 6.4 Update `openspec/specs/ci-automation/spec.md`: update path references
- [x] 6.5 Update `openspec/specs/frontend-components/spec.md`: update path references

## 7. Reinstall dependencies
- [x] 7.1 Delete `node_modules` and `package-lock.json`
- [x] 7.2 Run `npm install` to regenerate workspace links

## 8. Validation
- [x] 8.1 Verify workspace resolution: `npm ls @quiqr/frontend`
- [x] 8.2 Run frontend build: `npm run build:frontend`
- [x] 8.3 Run frontend tests: `npm run test:frontend` (71 tests passed)
- [ ] 8.4 Run full dev environment: `npm run dev` (skipped - requires interactive mode)
- [x] 8.5 Verify TypeScript: `cd packages/frontend && npx tsc --noEmit` (pre-existing errors, expected)

## 9. Finalize
- [ ] 9.1 Commit changes
- [ ] 9.2 Create pull request
