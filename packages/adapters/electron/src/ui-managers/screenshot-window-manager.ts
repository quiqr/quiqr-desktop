/**
 * Screenshot Window Manager - Captures screenshots and favicons from Hugo server
 */

import { BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import net from 'net';

let screenshotWindow: BrowserWindow | null = null;

/**
 * Capture a screenshot of the current page
 */
async function capture(targetPath: string): Promise<void> {
  if (!screenshotWindow) {
    throw new Error('Screenshot window not initialized');
  }

  try {
    const image = await screenshotWindow.webContents.capturePage();

    // Ensure screenshots directory exists
    const screenshotDir = path.join(targetPath, 'screenshots');
    await fs.ensureDir(screenshotDir);

    // Save as JPEG with 75% quality
    const screenshotPath = path.join(screenshotDir, 'quiqr-generated-screenshot.jpg');
    await fs.writeFile(screenshotPath, image.toJPEG(75));

    console.log('Screenshot saved:', screenshotPath);
  } catch (error) {
    console.error('Screenshot capture error:', error);
  } finally {
    screenshotWindow?.close();
  }
}

/**
 * Check if a port is open by attempting to connect
 */
function waitForPort(port: number, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnection = () => {
      const client = new net.Socket();

      client.once('connect', () => {
        client.end();
        resolve();
      });

      client.once('error', (error) => {
        // Port not ready yet, try again
        if (Date.now() - startTime < timeout) {
          setTimeout(tryConnection, 500);
        } else {
          reject(new Error(`Timeout waiting for port ${port}: ${error.message}`));
        }
      });

      client.connect({ port });
    };

    tryConnection();
  });
}

/**
 * Download a favicon from a URL
 */
async function downloadFavicon(faviconUrl: string, targetPath: string): Promise<void> {
  try {
    // Extract filename from URL
    const faviconFile = faviconUrl.split('/').pop() || 'favicon.ico';

    // Fetch the favicon
    const response = await fetch(faviconUrl);

    if (!response.ok) {
      console.warn(`Failed to download favicon: ${response.statusText}`);
      return;
    }

    // Ensure favicon directory exists
    const faviconDir = path.join(targetPath, 'favicon');
    await fs.ensureDir(faviconDir);

    // Save the favicon
    const buffer = await response.arrayBuffer();
    const dest = path.join(faviconDir, faviconFile);
    await fs.writeFile(dest, Buffer.from(buffer));

    console.log('Favicon downloaded:', dest);
  } catch (error) {
    console.error('Error downloading favicon:', error);
  }
}

/**
 * Create a screenshot and download favicons from a running Hugo server
 *
 * @param host - Server host (usually 'localhost')
 * @param port - Server port
 * @param targetPath - Directory to save screenshots and favicons
 * @param baseUrl - Optional base URL path (e.g., '/blog/')
 */
export function createScreenshotAndFavicon(
  host: string,
  port: number,
  targetPath: string,
  baseUrl = ''
): void {
  // Create hidden window for capturing
  screenshotWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      offscreen: true // Better for screenshots
    }
  });

  screenshotWindow.setMenuBarVisibility(false);

  const url = `http://${host}:${port}${baseUrl}`;

  console.log(`Capturing screenshot from: ${url}`);

  // Wait for the port to be available, then load the page
  waitForPort(port)
    .then(() => {
      if (!screenshotWindow) return;

      screenshotWindow.loadURL(url);

      // Hide scrollbars for cleaner screenshot
      screenshotWindow.webContents.executeJavaScript(
        "document.body.style.overflow = 'hidden'"
      );

      // Wait for page to render, then capture
      setTimeout(() => {
        capture(targetPath);
      }, 2000);

      // Listen for favicon updates
      screenshotWindow.webContents.once('page-favicon-updated', async (event, urls) => {
        console.log('Favicons detected:', urls);

        for (const faviconUrl of urls) {
          await downloadFavicon(faviconUrl, targetPath);
        }
      });
    })
    .catch((error) => {
      console.error('Failed to connect to Hugo server:', error);
      screenshotWindow?.close();
    });

  // Clean up reference when closed
  screenshotWindow.on('closed', () => {
    screenshotWindow = null;
  });
}
