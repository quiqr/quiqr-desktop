## Context

Preview URLs are hardcoded to `http://localhost:13131` in four frontend locations:
- `Workspace.tsx` line 120 — toolbar preview button
- `Single.tsx` line 121 — single item preview link
- `CollectionItem.tsx` line 111 — collection item preview link
- `Collection/index.tsx` line 554 — collection list preview link

The SSG dev server (Hugo/Jekyll/Eleventy) binds to port 13131 on the backend. In Electron this is accessible. In standalone mode behind nginx, the browser can't reach `localhost:13131` on the server.

## Goals / Non-Goals

**Goals:**
- Make preview URL configurable via instance settings
- Allow disabling preview entirely for headless/server deployments
- Default behavior unchanged for Electron users

**Non-Goals:**
- Proxying the SSG dev server through Quiqr's Express server
- Adding preview config to the Preferences UI

## Decisions

### 1. Instance settings schema

Add to `instanceSettingsSchema`:
```typescript
preview: z.object({
  enabled: z.boolean().default(true),
  baseUrl: z.string().default('http://localhost:13131'),
}).default({ enabled: true, baseUrl: 'http://localhost:13131' })
```

**Rationale:** Follows the same pattern as `hugo`, `dev`, `logging` sections. Default preserves current behavior.

### 2. Frontend reads preview config via API

The frontend already reads instance settings via `getInstanceSetting()`. It will read `preview.enabled` and `preview.baseUrl` at the workspace level and pass them down.

`Workspace.tsx` already controls `showPreviewButton` — it will additionally check `preview.enabled`. The `previewBaseUrl` will be passed to components that construct preview URLs.

### 3. Replace hardcoded URLs

All four locations follow the same pattern: `'http://localhost:13131' + path`. Replace with `previewBaseUrl + path` where `previewBaseUrl` comes from instance settings.

### 4. Remove dead PreviewConfig type

The unused `PreviewConfig` type and `isValidPreviewConfiguration` guard in `type-guards.ts` will be removed. The new implementation uses instance settings instead.

## Risks / Trade-offs

**Risk: SSG dev server port mismatch**
If the SSG server is configured to use a different port, the default `baseUrl` won't match.
Mitigation: The port is also hardcoded in the SSG providers. A future change could unify both under a single config. For now the default matches.
