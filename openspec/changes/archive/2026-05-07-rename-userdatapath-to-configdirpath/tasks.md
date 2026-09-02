## 1. Rename userDataPath to configDirPath

- [x] 1.1 Rename in `packages/backend/src/config/container.ts` — ContainerOptions interface and createContainer function
- [x] 1.2 Rename in `packages/backend/src/config/unified-config-service.ts` — already uses `configDir`, no change needed
- [x] 1.3 Rename in `packages/backend/src/config/config-store.ts` — already clean, no change needed
- [x] 1.4 Rename in `packages/adapters/standalone/src/main.ts`
- [x] 1.5 Rename in `packages/adapters/standalone/src/cli/user-admin.ts`
- [x] 1.6 Rename in `packages/adapters/electron/src/main.ts`
- [x] 1.7 Renamed remaining references: `app-config.ts`, integration tests, `README.md`

## 2. Rename env var QUIQR_DATA_DIR to QUIQR_CONF_DIR

- [x] 2.1 Rename in `packages/adapters/standalone/src/main.ts`
- [x] 2.2 Rename in `packages/adapters/standalone/src/cli/user-admin.ts`

## 3. Verification

- [x] 3.1 TypeScript compiles cleanly for all packages (backend, standalone, electron)
- [x] 3.2 All 451 tests pass
- [x] 3.3 Re-verified after env var rename — no stale QUIQR_DATA_DIR references remain
