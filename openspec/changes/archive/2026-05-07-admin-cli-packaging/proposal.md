# Admin CLI Packaging

## Summary

Make the `user-admin.ts` CLI discoverable as a proper `quiqr-admin` binary via a `bin` entry in `package.json`, and provide guidance for the nixpkgs `quiqr_server.nix` package and NixOS module to expose it on the system PATH.

## Motivation

The CLI exists and works (`packages/adapters/standalone/src/cli/user-admin.ts`) but is only accessible via `npm run user` during development. On a NixOS deployment there's no `npm` — the CLI needs to be a standalone binary that respects `QUIQR_CONF_DIR`.

The `QUIQR_CONF_DIR` support was already added. What remains is packaging.

## Scope

### In this repo (implementable)

1. Add `"bin"` entry to `packages/adapters/standalone/package.json` pointing to `dist/cli/user-admin.js`
2. Add a hashbang (`#!/usr/bin/env node`) to `user-admin.ts` so it's executable directly
3. Add `--help` output showing `QUIQR_CONF_DIR` env var usage

### In nixpkgs (guidance only, not implementable here)

4. Add a second `makeWrapper` in `quiqr_server.nix` for `$out/bin/quiqr-admin`
5. In the NixOS module, add `environment.systemPackages` with a wrapper that sets `QUIQR_CONF_DIR` to `cfg.dataDir`
