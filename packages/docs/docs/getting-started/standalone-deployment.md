---
sidebar_position: 6
---

# Standalone Deployment

Run Quiqr as a standalone server without Electron. This serves both the API and the web frontend from a single Express server.

## Prerequisites

- Node.js 20.0 or higher
- npm 9.0 or higher

## Build and Run

```bash
# Install dependencies
npm install

# Build all required packages
npm run build -w @quiqr/types
npm run build -w @quiqr/backend
npm run build -w @quiqr/frontend
npm run build -w @quiqr/adapter-standalone

# Start the server
npm run start -w @quiqr/adapter-standalone
```

The application will be available at `http://localhost:5150`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5150` | Port the server listens on |
| `FRONTEND_PATH` | Auto-detected | Override the frontend build directory path |
| `NODE_ENV` | `production` | Set to `development` for dev mode |

## Preview Server

When you preview a site, Quiqr runs the Hugo development server bound to `0.0.0.0:13131`. The in-app preview link is resolved based on runtime mode:

- **Electron (desktop):** `http://localhost:13131` — Hugo runs on the same machine as the browser.
- **Standalone (server):** the link is derived from the host you used to reach Quiqr — `<protocol>//<your-host>:13131`. So if you open Quiqr at `http://cms.example.com:5150`, the preview opens at `http://cms.example.com:13131`. No configuration is needed.

For this to work in standalone mode, **port `13131` must be reachable from the browser** (expose it the same way you expose the app port).

### Overriding the preview URL

To point previews somewhere else (for example a reverse proxy), set the `preview.baseUrl` instance setting to an explicit URL. When set, it is used verbatim in both modes and takes precedence over host derivation. When empty (the default), the runtime-mode behavior above applies.

:::caution Mixed content
If you serve Quiqr over `https://` while the preview server stays on plain `http://`, browsers may block the preview as mixed content. The derived URL follows the request protocol, but the Hugo preview server itself does not serve TLS. For HTTPS deployments, terminate TLS for the preview server (e.g. via a reverse proxy) and set `preview.baseUrl` accordingly.
:::

## Docker

The simplest way to deploy Quiqr standalone is with Docker.

### Build the image

```bash
docker build -t quiqr .
```

### Run with docker-compose

```bash
docker-compose up -d
```

The included `docker-compose.yml` serves as a reference for deployment:

```yaml
services:
  quiqr:
    build: .
    ports:
      - "5150:5150"
      - "13131:13131" # Hugo preview server (required for in-app site preview)
    environment:
      - NODE_ENV=production
      - PORT=5150
    volumes:
      - quiqr-data:/root/.quiqr-standalone
    restart: unless-stopped

volumes:
  quiqr-data:
    driver: local
```

### Persistent data

User data (site configurations, preferences) is stored in `/root/.quiqr-standalone` inside the container. Mount a volume to persist this data across container restarts.

### Custom frontend path

If you need to serve a frontend build from a non-standard location, set the `FRONTEND_PATH` environment variable:

```yaml
environment:
  - FRONTEND_PATH=/custom/path/to/frontend/build
```

## Authentication

By default, the standalone server has no authentication. To secure your deployment, see the [Authentication](./authentication.md) guide.

## API-only Mode

If the frontend build is not available, the server starts in API-only mode and serves only the REST API. This is useful when running the frontend separately during development.

:::tip
In development, use `npm run dev:standalone` instead, which starts the backend, the standalone server, and the Vite dev server (with hot reload) together. The Vite dev server binds all interfaces, so the dev UI is reachable at `http://<your-host>:4002` from other devices on the network.
:::
