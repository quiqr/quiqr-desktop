## 1. Admin CLI packaging

- [x] 1.1 Add hashbang `#!/usr/bin/env node` to `packages/adapters/standalone/src/cli/user-admin.ts`
- [x] 1.2 Add `"bin": { "quiqr-admin": "dist/cli/user-admin.js" }` to `packages/adapters/standalone/package.json`
- [x] 1.3 Update the help/default output in `user-admin.ts` to show `quiqr-admin` as the command name and document `QUIQR_CONF_DIR`

## 2. Nixpkgs guidance (reference only — changes made in nixpkgs repo)

- [x] 2.1 Document the `makeWrapper` addition for `quiqr_server.nix`: wrap `dist/cli/user-admin.js` as `$out/bin/quiqr-admin`
- [x] 2.2 Document the NixOS module addition: `environment.systemPackages` wrapper setting `QUIQR_CONF_DIR=cfg.dataDir`

## 3. Verification

- [x] 3.1 Verify TypeScript compiles cleanly
- [x] 3.2 Verify `node dist/cli/user-admin.js` shows updated help output after build
