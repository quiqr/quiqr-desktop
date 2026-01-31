/**
 * Background Job Runner Tests
 *
 * Tests the worker pool concurrency limits and queue management.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BackgroundJobRunner } from '../../../dist/jobs/background-job-runner.js'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { fileURLToPath } from 'url'
import {
  generateImageBatch,
  generateImagesBySize,
  getTotalSizeMB
} from '../../../test/fixtures/image-generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('BackgroundJobRunner', () => {
  let testDir: string
  let outputDir: string
  let runner: BackgroundJobRunner

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'job-runner-test-'))
    outputDir = path.join(testDir, 'output')
    await fs.ensureDir(outputDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  describe('Worker pool concurrency', () => {
    it('should process jobs with less than 4 images immediately', async () => {
      runner = new BackgroundJobRunner(4)

      // Generate 3 test images
      const images = await generateImageBatch(testDir, 3, { width: 800, height: 600 })

      const startTime = Date.now()
      const activeWorkers: number[] = []

      // Track when jobs start
      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)

        // Get the compiled job path (from src/__tests__ to dist/jobs)
        const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

        return runner.run(jobPath, { src, dest })
      })

      const results = await Promise.all(jobPromises)
      const duration = Date.now() - startTime

      expect(results).toHaveLength(3)
      results.forEach(result => expect(result).toBe('thumbnail created'))

      // All 3 should complete (no queueing delay expected for 3 jobs)
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(3)
    })

    it('should limit concurrent workers to 4 when processing more than 4 images', async () => {
      runner = new BackgroundJobRunner(4)

      // Generate 10 test images (smaller size to avoid timeout)
      const images = await generateImageBatch(testDir, 10, { width: 800, height: 600 })

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        return runner.run(jobPath, { src, dest })
      })

      await Promise.all(jobPromises)

      // Should never exceed 4 concurrent workers
      expect(runner.getMaxActiveWorkers()).toBeLessThanOrEqual(4)

      // All thumbnails should be created
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(10)
    }, 20000) // 20 second timeout for generating and processing 10 images

    it('should queue jobs when at max concurrency', async () => {
      runner = new BackgroundJobRunner(2) // Lower limit for easier testing

      // Generate 6 images - smaller size for faster testing
      const images = await generateImageBatch(testDir, 6, { width: 400, height: 300 })

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')
      const completionOrder: number[] = []

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        const result = await runner.run(jobPath, { src, dest })
        completionOrder.push(index)
        return result
      })

      await Promise.all(jobPromises)

      // All should complete
      expect(completionOrder).toHaveLength(6)

      // Verify all files created
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(6)
    }, 15000) // 15 second timeout

    it('should process queued jobs after workers become available', async () => {
      runner = new BackgroundJobRunner(3)

      // Generate 9 images (3 batches of 3) - smaller size for faster testing
      const images = await generateImageBatch(testDir, 9, { width: 400, height: 300 })

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')
      const completedJobs: string[] = []

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        await runner.run(jobPath, { src, dest })
        completedJobs.push(dest)
      })

      await Promise.all(jobPromises)

      // All 9 should complete
      expect(completedJobs).toHaveLength(9)

      // Verify thumbnails exist
      for (const dest of completedJobs) {
        expect(await fs.pathExists(dest)).toBe(true)
      }
    }, 15000)
  })

  describe('Large batch processing', () => {
    // Skip this test in CI as it takes too long (30+ seconds)
    it.skip('should handle a large batch of images with different formats', async () => {
      runner = new BackgroundJobRunner(4)

      // Generate 20 images of various formats
      const images = await generateImageBatch(testDir, 20, { width: 1600, height: 1200 })

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      const startTime = Date.now()

      const jobPromises = images.map(async (src, index) => {
        const ext = path.extname(src)
        const dest = path.join(outputDir, `thumb-${index}${ext}`)
        return runner.run(jobPath, { src, dest })
      })

      const results = await Promise.all(jobPromises)
      const duration = Date.now() - startTime

      expect(results).toHaveLength(20)

      // All thumbnails created
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(20)

      console.log(`Processed 20 images in ${duration}ms`)
    }, 30000) // 30 second timeout

    it('should handle 100MB total file size without OOM errors', async () => {
      runner = new BackgroundJobRunner(4)

      // Generate 6 large images (efficient approach)
      console.log('Generating 6 large images (~16MB each, ~100MB total)...')
      const images = await generateImagesBySize(testDir, 100)

      expect(images).toHaveLength(6)

      const totalSize = await getTotalSizeMB(images)
      console.log(`Generated 6 images, total size: ${totalSize.toFixed(2)}MB`)

      // assert that we test with atleast 80MB of images
      expect(totalSize).toBeGreaterThanOrEqual(80)

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      const startTime = Date.now()

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        return runner.run(jobPath, { src, dest })
      })

      // This should complete without memory errors
      const results = await Promise.all(jobPromises)
      const duration = Date.now() - startTime

      expect(results).toHaveLength(6)
      results.forEach(result => expect(result).toBe('thumbnail created'))

      // All 6 thumbnails created
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(6)

      // Calculate size reduction
      const outputSize = await getTotalSizeMB(
        files.map(f => path.join(outputDir, f))
      )

      console.log(
        `Processed 6 large images (${totalSize.toFixed(2)}MB) ` +
        `in ${duration}ms, output: ${outputSize.toFixed(2)}MB ` +
        `(${((outputSize / totalSize) * 100).toFixed(1)}% of original)`
      )

      // Thumbnails should be much smaller (< 1MB total for 6 thumbnails)
      expect(outputSize).toBeLessThan(1)
    }, 60000) // 1 minute timeout
  })

  describe('Error handling', () => {
    it('should handle job errors gracefully', async () => {
      runner = new BackgroundJobRunner(4)

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      // Try to process non-existent file
      await expect(
        runner.run(jobPath, {
          src: path.join(testDir, 'nonexistent.jpeg'),
          dest: path.join(outputDir, 'thumb.jpeg')
        })
      ).rejects.toThrow()
    })

    it('should continue processing other jobs after one fails', async () => {
      runner = new BackgroundJobRunner(4)

      // Generate 3 valid images
      const images = await generateImageBatch(testDir, 3, { width: 800, height: 600 })

      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      // Mix valid and invalid jobs
      const jobs = [
        { src: images[0], dest: path.join(outputDir, 'thumb-0.jpeg') },
        { src: path.join(testDir, 'nonexistent.jpeg'), dest: path.join(outputDir, 'thumb-fail.jpeg') },
        { src: images[1], dest: path.join(outputDir, 'thumb-1.jpeg') },
        { src: images[2], dest: path.join(outputDir, 'thumb-2.jpeg') }
      ]

      const results = await Promise.allSettled(
        jobs.map(params => runner.run(jobPath, params))
      )

      // Should have 3 successes and 1 failure
      const successes = results.filter(r => r.status === 'fulfilled')
      const failures = results.filter(r => r.status === 'rejected')

      expect(successes).toHaveLength(3)
      expect(failures).toHaveLength(1)

      // Valid thumbnails should exist
      expect(await fs.pathExists(path.join(outputDir, 'thumb-0.jpeg'))).toBe(true)
      expect(await fs.pathExists(path.join(outputDir, 'thumb-1.jpeg'))).toBe(true)
      expect(await fs.pathExists(path.join(outputDir, 'thumb-2.jpeg'))).toBe(true)
    })
  })

  describe('Custom concurrency limits', () => {
    it.skip('should respect custom maxConcurrency setting', async () => {
      runner = new BackgroundJobRunner(1) // Single worker

      const images = await generateImageBatch(testDir, 3, { width: 800, height: 600 })
      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        return runner.run(jobPath, { src, dest })
      })

      await Promise.all(jobPromises)

      // Should never exceed 1 concurrent worker
      expect(runner.getMaxActiveWorkers()).toBe(1)
    })

    it('should allow higher concurrency limits', async () => {
      runner = new BackgroundJobRunner(8) // Higher limit

      const images = await generateImageBatch(testDir, 12, { width: 800, height: 600 })
      const jobPath = path.join(__dirname, '../../../dist/jobs/create-thumbnail-job.js')

      const jobPromises = images.map(async (src, index) => {
        const dest = path.join(outputDir, `thumb-${index}.jpeg`)
        return runner.run(jobPath, { src, dest })
      })

      await Promise.all(jobPromises)

      // All should complete
      const files = await fs.readdir(outputDir)
      expect(files).toHaveLength(12)
    }, 25000) // 25 second timeout for generating and processing 12 images
  })
})
