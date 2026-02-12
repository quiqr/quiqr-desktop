---
sidebar_position: 3
---

# All Settings

Advanced settings provide fine-grained control over Quiqr's behavior. These options are for power users who need to customize Hugo paths, Git configuration, network settings, or enable debugging features.

## Hugo Configuration

### Custom Hugo Path

Specify a custom Hugo binary instead of using Quiqr's bundled version:

```json
{
  "hugoPath": "/opt/homebrew/bin/hugo"
}
```

**Use cases:**
- Testing with a specific Hugo version
- Using Hugo Extended with custom build
- Development with Hugo from source

### Hugo Version Check

Control whether Quiqr checks Hugo version compatibility:

```json
{
  "checkHugoVersion": true
}
```

### Hugo Environment Variables

Set environment variables for Hugo builds:

```json
{
  "hugoEnv": {
    "HUGO_ENV": "production",
    "HUGO_CACHEDIR": "/tmp/hugo_cache"
  }
}
```

## Git Configuration

### Custom Git Path

Use a specific Git installation:

```json
{
  "gitPath": "/usr/local/bin/git"
}
```

### Git User Configuration

Override Git user for Quiqr commits:

```json
{
  "gitUser": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Git Commit Template

Set a default commit message template:

```json
{
  "gitCommitTemplate": "docs: {{message}}\n\nUpdated by Quiqr"
}
```

### SSH Key Path

Specify SSH key for Git operations:

```json
{
  "sshKeyPath": "~/.ssh/id_rsa_quiqr"
}
```

## Network Settings

### Proxy Configuration

Configure HTTP/HTTPS proxy:

```json
{
  "proxy": {
    "enabled": true,
    "http": "http://proxy.example.com:8080",
    "https": "https://proxy.example.com:8443"
  }
}
```

### Timeout Settings

Set network operation timeouts (in milliseconds):

```json
{
  "timeouts": {
    "git": 30000,
    "http": 10000
  }
}
```

### Offline Mode

Disable network features:

```json
{
  "offlineMode": false
}
```

## Performance Settings

### Cache Configuration

Control Quiqr's caching behavior:

```json
{
  "cache": {
    "enabled": true,
    "maxSize": 500,
    "ttl": 3600000
  }
}
```

- `maxSize`: Cache size in MB
- `ttl`: Time-to-live in milliseconds

### Memory Limits

Set memory limits for Node.js processes:

```json
{
  "memoryLimit": 2048
}
```

Value in MB.

### Concurrent Operations

Limit concurrent file operations:

```json
{
  "maxConcurrentOps": 10
}
```

## Developer Options

### Debug Mode

Enable verbose logging:

```json
{
  "debug": true
}
```

### Log Level

Set logging verbosity:

```json
{
  "logLevel": "debug"
}
```

Options: `error`, `warn`, `info`, `debug`, `trace`

### Log File Path

Specify log file location:

```json
{
  "logPath": "~/quiqr-logs/app.log"
}
```

### Developer Tools

Enable Chrome DevTools on launch:

```json
{
  "enableDevTools": false
}
```

### Console Output

Show console in Electron:

```json
{
  "showConsole": false
}
```

## File System Settings

### Watch Directories

Configure file watching behavior:

```json
{
  "fileWatch": {
    "enabled": true,
    "ignorePatterns": [
      "node_modules/**",
      ".git/**",
      "public/**"
    ]
  }
}
```

### File Operations

Control file handling:

```json
{
  "fileOperations": {
    "backupBeforeEdit": true,
    "autoCreateDirectories": true
  }
}
```

## Security Settings

### Allowed Protocols

Specify allowed URL protocols:

```json
{
  "allowedProtocols": [
    "http:",
    "https:",
    "file:"
  ]
}
```

### Disable External Links

Prevent external link opening:

```json
{
  "disableExternalLinks": false
}
```

### Content Security Policy

Set CSP for Quiqr UI:

```json
{
  "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'"
}
```

## Experimental Features

### Enable Experiments

Opt into experimental features:

```json
{
  "experimental": {
    "enabled": true,
    "features": [
      "enhanced-preview",
      "ai-assist"
    ]
  }
}
```

:::warning
Experimental features may be unstable and could change or be removed in future versions.
:::

## Complete Advanced Configuration Example

```json
{
  // Hugo Configuration
  "hugoPath": "/opt/homebrew/bin/hugo",
  "checkHugoVersion": true,
  "hugoEnv": {
    "HUGO_ENV": "production"
  },
  
  // Git Configuration
  "gitPath": "/usr/local/bin/git",
  "gitUser": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  
  // Network Settings
  "proxy": {
    "enabled": false
  },
  "timeouts": {
    "git": 30000,
    "http": 10000
  },
  
  // Performance
  "cache": {
    "enabled": true,
    "maxSize": 500
  },
  "memoryLimit": 2048,
  "maxConcurrentOps": 10,
  
  // Developer Options
  "debug": false,
  "logLevel": "info",
  "enableDevTools": false,
  
  // File System
  "fileWatch": {
    "enabled": true,
    "ignorePatterns": [
      "node_modules/**",
      ".git/**"
    ]
  },
  
  // Security
  "allowedProtocols": [
    "http:",
    "https:"
  ],
  
  // Experimental
  "experimental": {
    "enabled": false
  }
}
```

## Best Practices

1. **Document changes** - Note why you changed a setting
2. **Test first** - Try changes on non-critical sites
3. **Backup configuration** - Keep a working copy
4. **Start conservative** - Use defaults unless needed
5. **Monitor performance** - Watch impact of changes

## Troubleshooting

### Hugo Not Found

**Solution:**
- Verify `hugoPath` is correct and executable
- Check file permissions
- Try full absolute path

### Git Operations Failing

**Solution:**
- Verify `gitPath` is correct
- Check Git configuration
- Ensure SSH keys are properly configured

### Performance Issues

**Solution:**
- Increase memory limit
- Enable caching
- Reduce concurrent operations
- Check disk space

### Debug Not Working

**Solution:**
- Ensure `debug: true` is set
- Check log file location exists
- Verify log level is appropriate

## Security Considerations

⚠️ **Important Security Notes:**

1. **Don't store secrets** - No passwords, API keys, or tokens
2. **Proxy credentials** - Use environment variables, not config file
3. **File permissions** - Restrict config file access (`chmod 600`)
4. **CSP settings** - Be careful relaxing security policies

## Next Steps

- [Variables](./variables.md) - Custom variables
- [Site & CMS Developer Guide](../site-and-cms-developer-guide/index.md) - Advanced development

## Related

- [Configuration Overview](./index.md) - Back to configuration
- [Troubleshooting](../getting-started/troubleshooting.md) - Common issues
