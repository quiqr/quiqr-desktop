import { communityTemplateSchema, type CommunityTemplate } from '@quiqr/types'
import { z } from 'zod'

const templatesArraySchema = z.array(communityTemplateSchema)

/**
 * Fetches and validates community templates from the Quiqr repository.
 */
export async function updateCommunityTemplatesJob(): Promise<CommunityTemplate[]> {
  const url = 'https://quiqr.github.io/quiqr-community-templates/templates.json'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Validate the data using Zod
  const result = templatesArraySchema.safeParse(data)

  if (!result.success) {
    throw new Error(`Invalid template data: ${result.error.message}`)
  }

  return result.data
}

// Export as default for worker-wrapper
export default updateCommunityTemplatesJob
