import fs from 'fs-extra'
import { Jimp } from 'jimp'
import path from 'path'

export interface CreateThumbnailParams {
  src: string
  dest: string
}

/**
 * Creates a thumbnail image from a source image.
 * For GIF, SVG, and ICO files, simply copies the original.
 * For other image types, scales to fit within 400x400 pixels.
 */
export async function createThumbnailJob(params: CreateThumbnailParams): Promise<string> {
  const { src, dest } = params

  if (!fs.existsSync(src)) {
    throw new Error('image file does not exist')
  }

  await fs.ensureDir(path.dirname(dest))

  const ext = path.extname(src).toLowerCase()

  // For GIF, SVG, and ICO, just copy the original
  if (ext === '.gif' || ext === '.svg' || ext === '.ico') {
    await fs.copy(src, dest)
    return 'image copied'
  }

  // For other image types, create a scaled thumbnail
  try {
    const image = await Jimp.read(src)
    await image.scaleToFit({ h: 400, w: 400 }).write(dest as `${string}.${string}`)
  } catch (e) {
    throw new Error(`Failed to create thumbnail: ${e}`)
  }

  // Verify the thumbnail was created
  const thumbExists = fs.existsSync(dest)
  if (!thumbExists) {
    throw new Error('Thumbnail creation failed - file does not exist after processing')
  }

  return 'thumbnail created'
}

// Export as default for worker-wrapper
export default createThumbnailJob
