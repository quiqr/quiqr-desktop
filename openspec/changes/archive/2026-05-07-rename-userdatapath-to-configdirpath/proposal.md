# Rename userDataPath to configDirPath and QUIQR_DATA_DIR to QUIQR_CONF_DIR

## Summary

Rename the internal variable `userDataPath` to `configDirPath` and the environment variable `QUIQR_DATA_DIR` to `QUIQR_CONF_DIR` throughout the codebase. This is a naming correction with no behavior change.

## Motivation

`userDataPath` and `QUIQR_DATA_DIR` are misleading — the actual user data (site content) lives in `storage.dataFolder` (default `~/Quiqr`). What these point to is the directory containing configuration files, auth data, runtime state, and logs. Renaming to `configDirPath` / `QUIQR_CONF_DIR` makes the intent clear and aligns the public env var with the internal naming.

This is especially important for NixOS packaging where the env var is referenced in the module and the distinction between config directory and data directory matters.

## Scope

1. Rename internal variable `userDataPath` → `configDirPath` in all packages (backend, standalone adapter, electron adapter, tests, docs)
2. Rename environment variable `QUIQR_DATA_DIR` → `QUIQR_CONF_DIR` in the standalone adapter and CLI
3. Update specs to reflect the new naming
