/**
 * Test Image Generator
 *
 * Utilities for creating test images programmatically using Sharp.
 * No large images are stored in the repository.
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs-extra'

export interface GenerateImageOptions {
  width: number
  height: number
  format: 'jpeg' | 'png' | 'webp' | 'tiff'
  quality?: number
  background?: { r: number; g: number; b: number }
}

/**
 * Generate a test image with specified dimensions and format
 * Creates images with semi-random noise to prevent over-compression
 */
export async function generateTestImage(
  outputPath: string,
  options: GenerateImageOptions
): Promise<void> {
  const { width, height, format, quality = 80, background = { r: 100, g: 150, b: 200 } } = options

  await fs.ensureDir(path.dirname(outputPath))

  const channels = 3
  const pixelCount = width * height
  const buffer = Buffer.alloc(pixelCount * channels)

  // Fill with semi-random noise based on background color
  // This creates less compressible images for realistic file size testing
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels

    // Add random noise to prevent JPEG over-compression
    // Vary each channel by ±50 from the background color
    const noise = () => Math.floor(Math.random() * 100) - 50

    buffer[offset] = Math.min(255, Math.max(0, background.r + noise()))
    buffer[offset + 1] = Math.min(255, Math.max(0, background.g + noise()))
    buffer[offset + 2] = Math.min(255, Math.max(0, background.b + noise()))
  }

  const image = sharp(buffer, {
    raw: {
      width,
      height,
      channels
    }
  })

  await image[format]({ quality }).toFile(outputPath)
}

/**
 * Generate a very large high-resolution image (for testing memory handling)
 */
export async function generateLargeImage(
  outputPath: string,
  megapixels: number
): Promise<void> {
  // Calculate dimensions for target megapixels (16:9 aspect ratio)
  const totalPixels = megapixels * 1_000_000
  const height = Math.floor(Math.sqrt(totalPixels / (16 / 9)))
  const width = Math.floor(height * (16 / 9))

  await generateTestImage(outputPath, {
    width,
    height,
    format: 'jpeg',
    quality: 90,
    background: { r: 50, g: 100, b: 150 }
  })
}

/**
 * Generate a batch of test images with various formats
 */
export async function generateImageBatch(
  baseDir: string,
  count: number,
  options?: Partial<GenerateImageOptions>
): Promise<string[]> {
  await fs.ensureDir(baseDir)

  const formats: Array<'jpeg' | 'png' | 'webp'> = ['jpeg', 'png', 'webp']
  const paths: string[] = []

  for (let i = 0; i < count; i++) {
    const format = formats[i % formats.length]
    const filename = `test-image-${i}.${format}`
    const filepath = path.join(baseDir, filename)

    await generateTestImage(filepath, {
      width: options?.width ?? 800,
      height: options?.height ?? 600,
      format,
      quality: options?.quality ?? 80,
      background: options?.background ?? { r: 100 + i * 10, g: 150, b: 200 }
    })

    paths.push(filepath)
  }

  return paths
}

/**
 * Generate images with a target total file size
 * Efficiently generates a small number of large images rather than many small ones
 */
export async function generateImagesBySize(
  baseDir: string,
  targetSizeMB: number
): Promise<string[]> {
  await fs.ensureDir(baseDir)

  // Generate 6 large images instead of many small ones
  const imageCount = 6
  const targetSizePerImage = targetSizeMB / imageCount

  // With random noise at quality 85:
  // Random noise compresses poorly in JPEG, actual ratio ~6-7:1
  // Target ~6.5:1 compression ratio for ~100MB total
  // So: uncompressed size = targetSize * 6.5
  // uncompressed size = width * height * 3 bytes (RGB)
  // Therefore: width * height = (targetSizePerImage * 6.5 * 1024 * 1024) / 3
  const pixelsPerImage = (targetSizePerImage * 6.5 * 1024 * 1024) / 3
  const megapixelsPerImage = pixelsPerImage / 1_000_000

  const paths: string[] = []

  for (let i = 0; i < imageCount; i++) {
    // Calculate dimensions for target megapixels (4:3 aspect ratio)
    const height = Math.floor(Math.sqrt(megapixelsPerImage * 1_000_000 / (4 / 3)))
    const width = Math.floor(height * (4 / 3))

    const filename = `large-image-${i}.jpeg`
    const filepath = path.join(baseDir, filename)

    await generateTestImage(filepath, {
      width,
      height,
      format: 'jpeg',
      quality: 85,
      background: { r: 50 + i * 20, g: 100 + i * 10, b: 150 + i * 15 }
    })

    paths.push(filepath)
  }

  return paths
}

/**
 * Copy a file and change extension (for testing GIF, SVG, ICO handling)
 */
export async function createSpecialFormatFiles(baseDir: string): Promise<{
  gif: string
  svg: string
  ico: string
}> {
  await fs.ensureDir(baseDir)

  // Create a simple SVG
  const svgPath = path.join(baseDir, 'test-image.svg')
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#3498db"/>
      <circle cx="200" cy="200" r="100" fill="#e74c3c"/>
      <text x="200" y="210" font-size="30" text-anchor="middle" fill="white">SVG</text>
    </svg>
  `
  await fs.writeFile(svgPath, svgContent.trim())

  // Create a simple GIF (by generating a PNG and renaming - for testing copy behavior)
  const gifPath = path.join(baseDir, 'test-image.gif')
  await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  })
    .png()
    .toFile(gifPath.replace('.gif', '.png'))

  // Rename to .gif (actual GIF encoding is complex, we just test the extension handling)
  await fs.rename(gifPath.replace('.gif', '.png'), gifPath)

  // Create a simple ICO (similar approach - test extension handling)
  const icoPath = path.join(baseDir, 'test-image.ico')
  await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 0, g: 0, b: 255, alpha: 1 }
    }
  })
    .png()
    .toFile(icoPath.replace('.ico', '.png'))

  await fs.rename(icoPath.replace('.ico', '.png'), icoPath)

  return { gif: gifPath, svg: svgPath, ico: icoPath }
}

/**
 * Get the size of a file in MB
 */
export async function getFileSizeMB(filepath: string): Promise<number> {
  const stats = await fs.stat(filepath)
  return stats.size / (1024 * 1024)
}

/**
 * Get total size of multiple files in MB
 */
export async function getTotalSizeMB(filepaths: string[]): Promise<number> {
  let total = 0
  for (const filepath of filepaths) {
    total += await getFileSizeMB(filepath)
  }
  return total
}
