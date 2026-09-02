## ADDED Requirements

### Requirement: Preview base URL resolution by runtime mode

The system SHALL resolve the in-app preview base URL such that preview links point at the host actually serving the Hugo preview server (port 13131), for both Electron and standalone runtime modes.

Resolution precedence SHALL be:

1. **Explicit override** — if the `preview.baseUrl` instance setting resolves to a non-empty string, that value MUST be used verbatim as the preview base URL, regardless of runtime mode.
2. **Standalone derivation** — otherwise, when the runtime is `standalone`, the preview base URL MUST be derived from the browser location as `<window.location.protocol>//<window.location.hostname>:13131`. The app's own port (`window.location.port`) MUST NOT be carried into the preview URL; the fixed preview port `13131` MUST be used.
3. **Electron fallback** — otherwise (Electron runtime), the preview base URL MUST be `http://localhost:13131`.

A single shared frontend resolver SHALL implement this precedence, and all preview-link builders MUST obtain the preview base URL through it (directly or via `WorkspaceOutletContext.previewBaseUrl`). No preview-link builder may hardcode `http://localhost:13131`.

#### Scenario: Electron mode with no override

- **WHEN** the runtime is `electron` and `preview.baseUrl` is unset (empty)
- **THEN** the preview base URL is `http://localhost:13131`

#### Scenario: Standalone mode derives from browser host

- **WHEN** the runtime is `standalone`, `preview.baseUrl` is unset (empty), and the user reached Quiqr at `http://cms.example.com:3000`
- **THEN** the preview base URL is `http://cms.example.com:13131`

#### Scenario: Standalone mode preserves the request protocol

- **WHEN** the runtime is `standalone`, `preview.baseUrl` is unset, and the user reached Quiqr at `https://cms.example.com`
- **THEN** the derived preview base URL is `https://cms.example.com:13131`

#### Scenario: Explicit override always wins

- **WHEN** `preview.baseUrl` is set to `https://preview.example.com` in instance settings
- **THEN** the preview base URL is `https://preview.example.com` in both Electron and standalone modes, ignoring any host derivation

#### Scenario: All preview-link builders share one resolution

- **WHEN** a preview link is opened from the workspace toolbar, a Single item, a Collection, or a Collection item
- **THEN** every link uses the same resolved preview base URL produced by the shared resolver

### Requirement: Empty default for the preview base URL setting

The `preview.baseUrl` instance setting SHALL default to an empty string so that an unset value is distinguishable from an explicit administrator choice, allowing the runtime-mode fallback to take effect when no override is configured.

The default MUST be empty in all three default sources to stay consistent:

- the Zod schema in `packages/types/src/schemas/config.ts`,
- the app defaults in `packages/backend/src/config/config-store.ts`,
- the app defaults in `packages/backend/src/config/config-resolver.ts`.

#### Scenario: Default resolves to empty, not localhost

- **WHEN** no `preview.baseUrl` has been set in instance settings
- **THEN** `getInstanceSetting('preview.baseUrl')` resolves to an empty string (so the frontend resolver applies the runtime-mode fallback)

#### Scenario: Schema validation accepts an empty string

- **WHEN** instance settings are parsed with `preview.baseUrl` omitted or empty
- **THEN** Zod validation succeeds and `preview.baseUrl` is the empty string
