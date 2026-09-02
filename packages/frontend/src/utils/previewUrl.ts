/**
 * Resolution of the in-app preview base URL (Hugo preview server, port 13131).
 *
 * Works in both Electron and standalone runtime modes. See change:
 * fix-server-mode-preview-url.
 */

/** Fixed port the Hugo preview server binds to (`hugo server --bind 0.0.0.0 --port 13131`). */
export const PREVIEW_PORT = 13131;

/** Default preview base URL for Electron desktop, where Hugo runs on the same host as the browser. */
export const ELECTRON_PREVIEW_BASE_URL = `http://localhost:${PREVIEW_PORT}`;

export interface ResolvePreviewBaseUrlOptions {
  /** Value of the `preview.baseUrl` instance setting (empty/undefined when unset). */
  setting?: string | null;
  /** True when running in standalone/server mode (from `useEnvironment().isStandalone`). */
  isStandalone: boolean;
  /** Browser protocol, e.g. `window.location.protocol` ("http:" / "https:"). */
  protocol?: string;
  /** Browser hostname, e.g. `window.location.hostname` (no port). */
  hostname?: string;
}

/**
 * Resolve the preview base URL according to runtime mode.
 *
 * Precedence:
 *   1. Explicit override: a non-empty `setting` is used verbatim (escape hatch for proxied/TLS setups).
 *   2. Standalone: derive from the browser location — `<protocol>//<hostname>:13131`.
 *      The app's own port is intentionally dropped; the fixed preview port is appended.
 *   3. Electron fallback: `http://localhost:13131`.
 *
 * Returned URL has no trailing slash; callers append a path.
 */
export function resolvePreviewBaseUrl({
  setting,
  isStandalone,
  protocol,
  hostname,
}: ResolvePreviewBaseUrlOptions): string {
  const explicit = typeof setting === 'string' ? setting.trim() : '';
  if (explicit) {
    return explicit;
  }

  if (isStandalone && hostname) {
    const proto = protocol === 'https:' ? 'https:' : 'http:';
    return `${proto}//${hostname}:${PREVIEW_PORT}`;
  }

  return ELECTRON_PREVIEW_BASE_URL;
}
