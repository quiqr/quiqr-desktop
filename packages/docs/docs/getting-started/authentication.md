---
sidebar_position: 7
---

# Authentication

Quiqr standalone mode supports JWT-based authentication to protect access to the application. Authentication is disabled in Electron (desktop) mode.

## How It Works

When auth is enabled, all API endpoints require a valid JWT token. The frontend shows a login page for unauthenticated users. Tokens are short-lived (15 minutes by default) with automatic refresh.

## Enabling Authentication

Add an `auth` block to your instance settings file (`~/.quiqr-standalone/instance_settings.json`):

```json
{
  "auth": {
    "enabled": true,
    "provider": "local"
  }
}
```

Or use the environment variable:

```bash
QUIQR_AUTH_ENABLED=true
```

On first startup with auth enabled, a default admin user is created automatically:

```
Email:    admin@localhost
Password: admin
```

You will be required to change this password on first login.

## Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `auth.enabled` | `false` | Enable authentication |
| `auth.provider` | `"local"` | Auth provider type |
| `auth.local.usersFile` | `"users.json"` | Users file name in config dir |
| `auth.session.secret` | Auto-generated | JWT signing secret |
| `auth.session.accessTokenExpiry` | `"15m"` | Access token lifetime |
| `auth.session.refreshTokenExpiry` | `"7d"` | Refresh token lifetime |

### Environment Variables

| Variable | Maps to |
|----------|---------|
| `QUIQR_AUTH_ENABLED` | `auth.enabled` |
| `QUIQR_AUTH_SESSION_SECRET` | `auth.session.secret` |

## User Management CLI

Users are managed via the command-line tool:

```bash
# Add a user
npm run user -w @quiqr/adapter-standalone -- add user@example.com

# List all users
npm run user -w @quiqr/adapter-standalone -- list

# Reset a user's password
npm run user -w @quiqr/adapter-standalone -- reset-password user@example.com

# Remove a user
npm run user -w @quiqr/adapter-standalone -- remove user@example.com
```

New users and password resets set the `mustChangePassword` flag, requiring a password change on next login.

## Docker

### Enable auth in docker-compose

```yaml
environment:
  - QUIQR_AUTH_ENABLED=true
```

### Manage users inside the container

```bash
# Add a user
docker exec quiqr npm run user -w @quiqr/adapter-standalone -- add admin@example.com

# List users
docker exec quiqr npm run user -w @quiqr/adapter-standalone -- list
```

### Persistent auth data

The users file is stored in the config volume (`quiqr-conf`), which is already persisted in the default `docker-compose.yml`.

## Security Notes

- Passwords are hashed with bcrypt and never stored in plaintext
- The users file is stored in the config directory, not the sites directory, to prevent exposure through git sync
- Access tokens are short-lived (15 minutes) to limit the impact of token theft
- The session secret is auto-generated on first startup and persisted for subsequent restarts
- SSE connections authenticate via query parameter (`?token=...`) since EventSource cannot send headers
