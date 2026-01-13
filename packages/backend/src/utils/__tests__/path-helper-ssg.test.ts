import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PathHelper } from '../path-helper.js';
import { createMockAppInfoAdapter } from '../../../test/mocks/adapters.js';

// Mock fs-extra to prevent actual directory creation
vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    ensureDirSync: vi.fn(),
  },
}));

describe('PathHelper SSG Methods', () => {
  let pathHelper: PathHelper;

  beforeEach(() => {
    pathHelper = new PathHelper(createMockAppInfoAdapter(), '/test/root');
  });

  describe('getSSGBinRoot', () => {
    it('returns hugo binary root', () => {
      const root = pathHelper.getSSGBinRoot('hugo');
      expect(root).toContain('hugobin');
    });

    it('returns eleventy binary root', () => {
      const root = pathHelper.getSSGBinRoot('eleventy');
      expect(root).toContain('eleventybin');
    });

    it('returns jekyll binary root', () => {
      const root = pathHelper.getSSGBinRoot('jekyll');
      expect(root).toContain('jekyllbin');
    });
  });

  describe('getSSGBinDirForVer', () => {
    it('includes version in path', () => {
      const dir = pathHelper.getSSGBinDirForVer('hugo', '0.120.0');
      expect(dir).toContain('0.120.0');
    });
  });

  describe('getSSGBinForVer', () => {
    it('returns hugo binary path', () => {
      const bin = pathHelper.getSSGBinForVer('hugo', '0.120.0');
      expect(bin).toContain('hugo');
    });

    it('returns eleventy binary in node_modules/.bin', () => {
      const bin = pathHelper.getSSGBinForVer('eleventy', '2.0.0');
      expect(bin).toContain('node_modules');
      expect(bin).toContain('.bin');
      expect(bin).toContain('eleventy');
    });

    it('returns jekyll wrapper script', () => {
      const bin = pathHelper.getSSGBinForVer('jekyll', '4.3.0');
      expect(bin).toContain('jekyll');
    });
  });
});
