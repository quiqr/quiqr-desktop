---
sidebar_position: 1
---

# Installation

Get Quiqr Desktop up and running on your system.

## System Requirements

- **Operating System**: Windows 10/11, macOS 10.13+, or Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Disk Space**: 500MB for application, additional space for sites
- **Node.js**: Version 20.0 or higher (for development)

## Download Quiqr Desktop

### Official Releases

Download the latest stable version from:

- [quiqr.org](https://quiqr.org) - Official website
- [GitHub Releases](https://github.com/quiqr/quiqr-desktop/releases) - All versions and platform-specific builds

### Platform-Specific Instructions

#### Windows

1. Download the `.exe` installer from the releases page
2. Run the installer and follow the setup wizard
3. Launch Quiqr from the Start Menu or desktop shortcut

#### macOS

1. Download the `.dmg` file from the releases page
2. Open the DMG and drag Quiqr to your Applications folder
3. Launch Quiqr from Applications

:::warning
On first launch, you may need to right-click and select "Open" to bypass Gatekeeper restrictions.
:::

#### Linux

**AppImage (Universal)**

1. Download the `.AppImage` file
2. Make it executable: `chmod +x Quiqr-*.AppImage`
3. Run it: `./Quiqr-*.AppImage`

**Debian/Ubuntu (.deb)**

```bash
sudo dpkg -i quiqr-desktop_*.deb
sudo apt-get install -f  # Install dependencies if needed
```

**Fedora/RHEL (.rpm)**

```bash
sudo rpm -i quiqr-desktop-*.rpm
# Or with dnf
sudo dnf install quiqr-desktop-*.rpm
```

## Verify Installation

After installation, launch Quiqr. You should see the welcome screen with options to:

- Create a new site from a template
- Import an existing Hugo site
- Open a recently used site

## Next Steps

Once installed:

1. [Quick Start Guide](./quick-start.md) - Create your first site
2. [Import Existing Site](./import-site.md) - Work with your existing Hugo project
3. [Configuration](./configuration.md) - Customize Quiqr settings

## Troubleshooting

### Application Won't Launch

**Windows**: Check Windows Defender logs, Quiqr may need to be whitelisted

**macOS**: Ensure you've allowed the app in System Preferences > Security & Privacy

**Linux**: Verify execute permissions on the AppImage or check system logs

### Missing Dependencies

If you see dependency errors:

- **Windows**: Install Visual C++ Redistributable
- **Linux**: Install required libraries: `sudo apt-get install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev`

## Development Installation

For developers wanting to contribute or run from source:

```bash
# Clone the repository
git clone https://github.com/quiqr/quiqr-desktop.git
cd quiqr-desktop

# Install dependencies
npm install

# Run in development mode
npm run dev
```

See the [Developer Guide](../developer-guide/index.md) for more details.
