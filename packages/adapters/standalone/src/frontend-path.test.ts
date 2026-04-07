/**
 * Tests for frontend build path resolution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { findFrontendBuildDir } from './frontend-path';

describe('findFrontendBuildDir', () => {
  let rootDir: string;

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'quiqr-test-root-'));
    delete process.env.FRONTEND_PATH;
  });

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true });
    delete process.env.FRONTEND_PATH;
  });

  it('returns default path when frontend build exists', () => {
    const buildDir = join(rootDir, 'packages', 'frontend', 'build');
    mkdirSync(buildDir, { recursive: true });
    writeFileSync(join(buildDir, 'index.html'), '<html></html>');

    const result = findFrontendBuildDir(rootDir);
    expect(result).toBe(buildDir);
  });

  it('returns undefined when frontend build does not exist', () => {
    const result = findFrontendBuildDir(rootDir);
    expect(result).toBeUndefined();
  });

  it('returns undefined when build dir exists but index.html is missing', () => {
    const buildDir = join(rootDir, 'packages', 'frontend', 'build');
    mkdirSync(buildDir, { recursive: true });

    const result = findFrontendBuildDir(rootDir);
    expect(result).toBeUndefined();
  });

  it('uses FRONTEND_PATH env var when set and valid', () => {
    const customDir = mkdtempSync(join(tmpdir(), 'quiqr-test-custom-frontend-'));
    writeFileSync(join(customDir, 'index.html'), '<html></html>');
    process.env.FRONTEND_PATH = customDir;

    const result = findFrontendBuildDir(rootDir);
    expect(result).toBe(customDir);

    rmSync(customDir, { recursive: true, force: true });
  });

  it('falls back to default when FRONTEND_PATH is set but invalid', () => {
    process.env.FRONTEND_PATH = '/nonexistent/path';

    const buildDir = join(rootDir, 'packages', 'frontend', 'build');
    mkdirSync(buildDir, { recursive: true });
    writeFileSync(join(buildDir, 'index.html'), '<html></html>');

    const result = findFrontendBuildDir(rootDir);
    expect(result).toBe(buildDir);
  });

  it('returns undefined when FRONTEND_PATH is invalid and default is missing', () => {
    process.env.FRONTEND_PATH = '/nonexistent/path';

    const result = findFrontendBuildDir(rootDir);
    expect(result).toBeUndefined();
  });
});
