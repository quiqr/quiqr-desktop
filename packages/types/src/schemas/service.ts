import { z } from 'zod'
import { configurationsSchema, siteConfigSchema, workspaceSchema, workspaceDetailsSchema } from './config.js'

// Service Response Schemas
export const siteAndWorkspaceDataSchema = z.object({
  configurations: configurationsSchema,
  site: siteConfigSchema,
  siteWorkspaces: z.array(workspaceSchema),
  workspace: workspaceSchema,
  workspaceDetails: workspaceDetailsSchema
})

export const snackMessageSchema = z.object({
  message: z.string(),
  severity: z.enum(['success', 'info', 'warning', 'error']),
  action: z.any().optional(),
  onActionClick: z.unknown().optional(),
  autoHideDuration: z.number().optional()
})

export const consoleMessageSchema = z.object({
  id: z.number(),
  line: z.string()
})

// Service Schemas mapping - maps Service method names to their response schemas
export const serviceSchemas = {
  getConfigurations: configurationsSchema,
  getSiteAndWorkspaceData: siteAndWorkspaceDataSchema,
  getWorkspaceDetails: workspaceDetailsSchema,
  getSiteCreatorMessage: z.string(),
  serveWorkspace: z.void(),
  openWorkspaceDir: z.void()
} as const

// UI Service Schemas
export const uiServiceSchemas = {
  getCurrentSnackMessage: snackMessageSchema.optional(),
  getPreviousSnackMessage: snackMessageSchema.optional(),
  getConsoleMessages: z.array(consoleMessageSchema)
} as const

// Type exports
export type SiteAndWorkspaceData = z.infer<typeof siteAndWorkspaceDataSchema>
export type SnackMessage = z.infer<typeof snackMessageSchema>
export type ConsoleMessage = z.infer<typeof consoleMessageSchema>

// This type includes all the service method names
export type ServiceMethod = keyof typeof serviceSchemas

// Map each service method to its response type
export type ServiceResponse<M extends string> = M extends ServiceMethod
  ? z.infer<(typeof serviceSchemas)[M]>
  : unknown

// This type includes all the UI service method names
export type UIServiceMethod = keyof typeof uiServiceSchemas

// Map each UI service method to its response type
export type UIServiceResponse<M extends string> = M extends UIServiceMethod
  ? z.infer<(typeof uiServiceSchemas)[M]>
  : unknown
