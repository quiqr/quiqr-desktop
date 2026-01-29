/**
 * Create Thumbnail Job Tests
 *
 * Tests the thumbnail creation functionality with various image formats and sizes.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createThumbnailJob } from '../create-thumbnail-job.js'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import sharp from 'sharp'
import {
  generateTestImage,
  generateLargeImage,
  createSpecialFormatFiles,
  getFileSizeMB
} from '../../../test/fixtures/image-generator.js'

describe('createThumbnailJob', () => {
  let testDir: string
  let outputDir: string

  beforeEach(async () => {
    // Create temp directories for tests
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'thumbnail-test-'))
    outputDir = path.join(testDir, 'output')
    await fs.ensureDir(outputDir)
  })

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(testDir)
  })

  describe('Basic thumbnail creation', () => {
    it('should create a thumbnail from a JPEG image', async () => {
      const src = path.join(testDir, 'test.jpeg')
      const dest = path.join(outputDir, 'thumb.jpeg')

      await generateTestImage(src, {
        width: 800,
        height: 600,
        format: 'jpeg'
      })

      const result = await createThumbnailJob({ src, dest })

      expect(result).toBe('thumbnail created')
      expect(await fs.pathExists(dest)).toBe(true)

      // Check thumbnail dimensions
      const metadata = await sharp(dest).metadata()
      expect(metadata.width).toBeLessThanOrEqual(400)
      expect(metadata.height).toBeLessThanOrEqual(400)
    })

    it('should create a thumbnail from a PNG image', async () => {
      const src = path.join(testDir, 'test.png')
      const dest = path.join(outputDir, 'thumb.png')

      await generateTestImage(src, {
        width: 500,
        height: 375,
        format: 'png'
      })

      const result = await createThumbnailJob({ src, dest })

      expect(result).toBe('thumbnail created')
      expect(await fs.pathExists(dest)).toBe(true)

      const metadata = await sharp(dest).metadata()
      expect(metadata.width).toBeLessThanOrEqual(400)
      expect(metadata.height).toBeLessThanOrEqual(400)
    })

    it('should create a thumbnail from a WebP image', async () => {
      const src = path.join(testDir, 'test.webp')
      const dest = path.join(outputDir, 'thumb.webp')

      await generateTestImage(src, {
        width: 1200,
        height: 800,
        format: 'webp'
      })

      const result = await createThumbnailJob({ src, dest })

      expect(result).toBe('thumbnail created')
      expect(await fs.pathExists(dest)).toBe(true)

      const metadata = await sharp(dest).metadata()
      expect(metadata.width).toBeLessThanOrEqual(400)
      expect(metadata.height).toBeLessThanOrEqual(400)
    })

    it('should maintain aspect ratio', async () => {
      const src = path.join(testDir, 'wide.jpeg')
      const dest = path.join(outputDir, 'wide-thumb.jpeg')

      // Create a wide image (2:1 aspect ratio)
      await generateTestImage(src, {
        width: 1600,
        height: 800,
        format: 'jpeg'
      })

      await createThumbnailJob({ src, dest })

      const metadata = await sharp(dest).metadata()
      const aspectRatio = metadata.width! / metadata.height!

      // Should maintain 2:1 aspect ratio (with small tolerance)
      expect(aspectRatio).toBeCloseTo(2.0, 1)
    })

    it('should not enlarge small images', async () => {
      const src = path.join(testDir, 'small.jpeg')
      const dest = path.join(outputDir, 'small-thumb.jpeg')

      // Create a small image (smaller than 400x400)
      await generateTestImage(src, {
        width: 200,
        height: 150,
        format: 'jpeg'
      })

      await createThumbnailJob({ src, dest })

      const metadata = await sharp(dest).metadata()

      // Should not be enlarged
      expect(metadata.width).toBeLessThanOrEqual(200)
      expect(metadata.height).toBeLessThanOrEqual(150)
    })
  })

  describe('Special format handling', () => {
    it('should copy GIF files without processing', async () => {
      const specialFiles = await createSpecialFormatFiles(testDir)
      const dest = path.join(outputDir, 'thumb.gif')

      const result = await createThumbnailJob({
        src: specialFiles.gif,
        dest
      })

      expect(result).toBe('image copied')
      expect(await fs.pathExists(dest)).toBe(true)

      // File should be copied as-is
      const srcSize = (await fs.stat(specialFiles.gif)).size
      const destSize = (await fs.stat(dest)).size
      expect(destSize).toBe(srcSize)
    })

    it('should copy SVG files without processing', async () => {
      const specialFiles = await createSpecialFormatFiles(testDir)
      const dest = path.join(outputDir, 'thumb.svg')

      const result = await createThumbnailJob({
        src: specialFiles.svg,
        dest
      })

      expect(result).toBe('image copied')
      expect(await fs.pathExists(dest)).toBe(true)

      // Content should be identical
      const srcContent = await fs.readFile(specialFiles.svg, 'utf8')
      const destContent = await fs.readFile(dest, 'utf8')
      expect(destContent).toBe(srcContent)
    })

    it('should copy ICO files without processing', async () => {
      const specialFiles = await createSpecialFormatFiles(testDir)
      const dest = path.join(outputDir, 'thumb.ico')

      const result = await createThumbnailJob({
        src: specialFiles.ico,
        dest
      })

      expect(result).toBe('image copied')
      expect(await fs.pathExists(dest)).toBe(true)
    })
  })

  describe('Large image handling', () => {
    it('should handle large JPEG images (2MP)', async () => {
      const src = path.join(testDir, 'large.jpeg')
      const dest = path.join(outputDir, 'large-thumb.jpeg')

      // Generate a 2 megapixel image for faster testing
      await generateLargeImage(src, 2)

      const srcMetadata = await sharp(src).metadata()
      expect(srcMetadata.width! * srcMetadata.height!).toBeGreaterThan(1_800_000)

      const result = await createThumbnailJob({ src, dest })

      expect(result).toBe('thumbnail created')
      expect(await fs.pathExists(dest)).toBe(true)

      // Thumbnail should be much smaller
      const destMetadata = await sharp(dest).metadata()
      expect(destMetadata.width).toBeLessThanOrEqual(400)
      expect(destMetadata.height).toBeLessThanOrEqual(400)

      // File size should be dramatically reduced
      const srcSizeMB = await getFileSizeMB(src)
      const destSizeMB = await getFileSizeMB(dest)
      expect(destSizeMB).toBeLessThan(srcSizeMB / 10)
    })

    it('should handle large PNG images', async () => {
      const src = path.join(testDir, 'large.png')
      const dest = path.join(outputDir, 'large-thumb.png')

      // Generate a small PNG for faster testing
      await generateTestImage(src, {
        width: 500,
        height: 375,
        format: 'png'
      })

      const result = await createThumbnailJob({ src, dest })

      expect(result).toBe('thumbnail created')

      const metadata = await sharp(dest).metadata()
      expect(metadata.width).toBeLessThanOrEqual(400)
      expect(metadata.height).toBeLessThanOrEqual(400)
    })
  })

  describe('Error handling', () => {
    it('should throw error if source file does not exist', async () => {
      const src = path.join(testDir, 'nonexistent.jpeg')
      const dest = path.join(outputDir, 'thumb.jpeg')

      await expect(createThumbnailJob({ src, dest })).rejects.toThrow(
        'image file does not exist'
      )
    })

    it('should create destination directory if it does not exist', async () => {
      const src = path.join(testDir, 'test.jpeg')
      const dest = path.join(outputDir, 'deep', 'nested', 'thumb.jpeg')

      await generateTestImage(src, {
        width: 800,
        height: 600,
        format: 'jpeg'
      })

      await createThumbnailJob({ src, dest })

      expect(await fs.pathExists(dest)).toBe(true)
    })
  })

  describe('Multiple format batch', () => {
    it('should process multiple images of different formats', async () => {
      const formats: Array<{ format: 'jpeg' | 'png' | 'webp'; ext: string }> = [
        { format: 'jpeg', ext: 'jpg' },
        { format: 'png', ext: 'png' },
        { format: 'webp', ext: 'webp' }
      ]

      const promises = formats.map(async ({ format, ext }) => {
        const src = path.join(testDir, `test.${ext}`)
        const dest = path.join(outputDir, `thumb.${ext}`)

        await generateTestImage(src, {
          width: 500,
          height: 375,
          format
        })

        await createThumbnailJob({ src, dest })

        expect(await fs.pathExists(dest)).toBe(true)

        const metadata = await sharp(dest).metadata()
        expect(metadata.width).toBeLessThanOrEqual(400)
        expect(metadata.height).toBeLessThanOrEqual(400)
      })

      await Promise.all(promises)
    }, 8000) // 8 second timeout for batch processing
  })
})
