# Hide Instance Settings in Standalone Mode

## Summary

In standalone mode, instance settings are managed externally (e.g., via NixOS module, Docker config, or manual `instance_settings.json`). The Preferences UI should hide the entire "Application Settings" section (Storage, Git, Logging, Hugo, Variables, Feature Flags) when running in standalone mode, since changes made through the UI would be overwritten on the next restart.

## Motivation

When Quiqr runs as a standalone server behind a NixOS module, the `instance_settings.json` is generated declaratively from Nix expressions and copied into the data directory on each service start via `QUIQR_CONFIG_FILE`. Any changes a user makes through the Preferences UI are lost on restart. Showing these settings is misleading and confusing.

The frontend already has `useEnvironment().isStandalone` to detect standalone mode. Only the Preferences sidebar and routing need updating.

## Scope

### In scope

1. Hide the "Application Settings" menu section in `PrefsSidebar` when `isStandalone` is true
2. Guard the standalone-only preference routes in `PrefsRouted` — redirect to the general preferences page if accessed directly in standalone mode
3. Keep "Preferences" section (Appearance, Behaviour) visible in both modes — these are user preferences, not instance settings

### Out of scope

- Per-key hiding (showing some instance settings but not others)
- "Managed externally" labels or disabled states
- Changes to the backend or instance settings schema
