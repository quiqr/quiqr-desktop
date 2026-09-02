# Nixpkgs Changes (reference — apply in nixpkgs repo)

## 1. Package: `quiqr_server.nix`

Add a second `makeWrapper` for the admin CLI:

```nix
makeWrapper '${lib.getExe nodejs}' "$out/bin/quiqr-admin" \
  --add-flags $out/opt/quiqr-server/packages/adapters/standalone/dist/cli/user-admin.js \
  --inherit-argv0
```

## 2. NixOS module: `quiqr-server.nix`

Add `environment.systemPackages` with a wrapper that sets `QUIQR_CONF_DIR`:

```nix
environment.systemPackages = [
  (pkgs.writeShellScriptBin "quiqr-admin" ''
    export QUIQR_CONF_DIR=${cfg.dataDir}
    exec ${cfg.package}/bin/quiqr-admin "$@"
  '')
];
```

This gives all users on the NixOS machine access to `quiqr-admin` with the correct config directory pre-set.
