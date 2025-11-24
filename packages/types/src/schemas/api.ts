import { z } from 'zod'
import {
  configurationsSchema,
  workspaceSchema,
  workspaceDetailsSchema,
  siteConfigSchema,
  userPreferencesSchema
} from './config.js'

export const collectionItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  sortval: z.string()
})

export const languageSchema = z.object({
  source: z.string(),
  target: z.string(),
  lang: z.string()
})

export const fileReferenceSchema = z.object({
  src: z.string(),
  filename: z.string().optional()
})

export const hugoServerResponseSchema = z.object({
  stopped: z.boolean()
})

export const collectionItemKeyResponseSchema = z.object({
  key: z.string()
})

export const folderDialogResponseSchema = z.object({
  selectedFolder: z.string().nullable()
})

export const communityTemplateSchema = z.object({
  HugoVersion: z.string(),
  HugoTheme: z.string(),
  QuiqrFormsEndPoints: z.number(),
  QuiqrModel: z.string(),
  QuiqrEtalageName: z.string(),
  QuiqrEtalageDescription: z.string(),
  QuiqrEtalageHomepage: z.string(),
  QuiqrEtalageDemoUrl: z.string(),
  QuiqrEtalageLicense: z.string(),
  QuiqrEtalageLicenseURL: z.string(),
  QuiqrEtalageAuthor: z.string(),
  QuiqrEtalageAuthorHomepage: z.string(),
  QuiqrEtalageScreenshots: z.array(z.string()),
  ScreenshotImageType: z.string(),
  SourceLink: z.string(),
  NormalizedName: z.string()
})

export const dynFormFieldsSchema = z.object({
  title: z.union([z.string(), z.number()]).optional(),
  fields: z.array(z.any()).nullable().optional(), // Using z.any() to avoid circular dependency with fieldSchema
  key: z.string().optional(),
  content_type: z.string().optional(),
  form_field_type: z.string().optional()
})

// API Schemas mapping - maps API method names to their response schemas
export const apiSchemas = {
  getConfigurations: configurationsSchema,
  listWorkspaces: z.array(workspaceSchema),
  getWorkspaceDetails: workspaceDetailsSchema,
  getSingle: z.record(z.any()), // Returns dynamic content based on the single's fields
  parseFileToObject: z.any(), // any is needed here because a select-from-query file could have any shape
  getCurrentBaseUrl: z.string(),
  getDynFormFields: dynFormFieldsSchema,
  getFilesInBundle: z.array(fileReferenceSchema),
  shouldReloadForm: z.boolean(),
  getCurrentFormAccordionIndex: z.string(),
  setCurrentFormNodePath: z.boolean(),
  globSync: z.array(z.string()),
  getCurrentSiteKey: z.string(),
  reloadThemeStyle: z.union([z.object({ error: z.string(), stack: z.string() }), z.any()]),
  reloadCurrentForm: z.boolean(),
  updateSingle: z.record(z.any()), // Returns the updated document
  listCollectionItems: z.array(collectionItemSchema),
  getLanguages: z.array(languageSchema),
  createCollectionItemKey: collectionItemKeyResponseSchema,
  getCollectionItem: z.record(z.any()), // Returns dynamic content based on collection's fields
  getFilesFromAbsolutePath: z.array(fileReferenceSchema),
  updateCollectionItem: z.record(z.any()), // Returns the updated document
  showLogWindow: z.union([z.object({ error: z.string(), stack: z.string() }), z.any()]),
  openSiteLibrary: z.boolean(),
  readConfPrefKey: z.union([z.string(), z.boolean(), z.undefined()]),
  stopHugoServer: hugoServerResponseSchema,
  getFilteredHugoVersions: z.array(z.string()),
  getThumbnailForPath: z.string().optional(),
  updateCommunityTemplates: z.array(communityTemplateSchema),
  saveConfPrefKey: z.boolean(),
  mountWorkspace: z.string(),
  readConfKey: z.union([
    userPreferencesSchema, // When reading "prefs"
    z.boolean(), // For boolean flags
    z.string().nullable(), // For currentUsername, sitesListingView
    z.record(z.string()), // For lastOpenedPublishTargetForSite
    z.object({
      siteKey: z.string().nullable(),
      workspaceKey: z.string().nullable(),
      sitePath: z.string().nullable()
    }) // For lastOpenedSite
  ]),
  getCreatorMessage: z.string(),
  getSiteConfig: siteConfigSchema,
  serveWorkspace: z.any(), // Returns void/undefined, server action
  showOpenFolderDialog: folderDialogResponseSchema
} as const

// Type exports
export type CollectionItem = z.infer<typeof collectionItemSchema>
export type Language = z.infer<typeof languageSchema>
export type FileReference = z.infer<typeof fileReferenceSchema>
export type HugoServerResponse = z.infer<typeof hugoServerResponseSchema>
export type CollectionItemKeyResponse = z.infer<typeof collectionItemKeyResponseSchema>
export type FolderDialogResponse = z.infer<typeof folderDialogResponseSchema>
export type CommunityTemplate = z.infer<typeof communityTemplateSchema>
export type DynFormFields = z.infer<typeof dynFormFieldsSchema>

// This type includes all the api method names
export type ApiMethod = keyof typeof apiSchemas

// Map each method to its response type
// For methods in apiSchemas, return the typed response; for unknown methods, return unknown
export type ApiResponse<M extends string> = M extends ApiMethod
  ? z.infer<(typeof apiSchemas)[M]>
  : unknown
