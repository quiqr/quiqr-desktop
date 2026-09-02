# Configurable Preview URL

## Summary

Replace the hardcoded `http://localhost:13131` preview URL with a configurable instance setting. Add an `enabled` toggle to hide preview buttons entirely in deployments where preview is not available.

## Motivation

The preview URL is hardcoded to `http://localhost:13131` — the port where the SSG dev server (Hugo/Jekyll/Eleventy) runs. This works in Electron where everything is local, but breaks in standalone/server mode behind a reverse proxy. The user's browser tries to connect to their own `localhost:13131` which doesn't exist.

A dead `PreviewConfig` type already exists in `packages/frontend/src/utils/type-guards.ts` with `{ enable: boolean; preview_url: string }` — someone designed this but never wired it.

## Scope

### In scope

1. Add `preview` section to `instanceSettingsSchema` with `enabled` (boolean, default `true`) and `baseUrl` (string, default `http://localhost:13131`)
2. Replace all 4 hardcoded `http://localhost:13131` references in the frontend with the configured `baseUrl`
3. Hide preview buttons (toolbar + per-item) when `preview.enabled` is `false`
4. Remove the dead `PreviewConfig` type guard from `type-guards.ts`
5. Expose preview settings via the existing config API so the frontend can read them

### Out of scope

- Proxying the SSG dev server through Quiqr (future enhancement)
- Preview URL configuration in the Preferences UI (can use instance_settings.json directly for now)
- Per-site or per-workspace preview URL overrides
