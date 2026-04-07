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
In development, use `npm run dev` instead, which starts the Vite dev server with hot reload alongside the backend.
:::
