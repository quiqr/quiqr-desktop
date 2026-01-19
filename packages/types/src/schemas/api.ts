import { z } from 'zod'
import {
  configurationsSchema,
  workspaceSchema,
  workspaceDetailsSchema,
  siteConfigSchema,
  userPreferencesSchema
} from './config.js'
import {
  quiqrSiteRepoInfoSchema,
  hugoThemeRepoInfoSchema
} from './embgit.js'

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

export const hugoVersionCheckResponseSchema = z.object({
  installed: z.boolean(),
  version: z.string()
})

export const ssgVersionCheckResponseSchema = z.object({
  installed: z.boolean(),
  version: z.string(),
  ssgType: z.string()
})

export const ssgVersionsResponseSchema = z.object({
  ssgType: z.string(),
  versions: z.array(z.string())
})

export const collectionItemKeyResponseSchema = z.object({
  key: z.string()
})

export const folderDialogResponseSchema = z.object({
  selectedFolder: z.string().nullable()
})

export const deleteFileFromBundleResponseSchema = z.object({
  deleted: z.boolean()
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

// Parse info - tracks which files were used to build the workspace config
export const parseInfoIncludeFileSchema = z.object({
  key: z.string(),
  filename: z.string()
})

export const parseInfoSchema = z.object({
  baseFile: z.string(),
  includeFiles: z.array(parseInfoIncludeFileSchema),
  includeFilesSub: z.array(parseInfoIncludeFileSchema)
})

// Build action result - returned by buildSingle and buildCollectionItem
export const buildActionResultSchema = z.object({
  actionName: z.string(),
  stdoutType: z.string().optional(),
  stdoutContent: z.string()
})

// Collection item operation results
export const deleteCollectionItemResponseSchema = z.object({
  deleted: z.boolean()
})

export const renameCollectionItemResponseSchema = z.object({
  renamed: z.boolean(),
  item: collectionItemSchema.optional()
})

export const copyCollectionItemResponseSchema = z.object({
  copied: z.boolean(),
  item: collectionItemSchema.optional()
})

// Key pair response for createKeyPairGithub
export const keyPairResponseSchema = z.object({
  privateKey: z.string(),
  publicKey: z.string()
})

// Public key response for derivePublicKey
export const publicKeyResponseSchema = z.object({
  publicKey: z.string()
})

// Hugo configuration file schema (hugo.toml, config.toml, etc.)
// Uses passthrough to allow any Hugo config properties while typing the ones we use
export const hugoConfigSchema = z
  .object({
    baseURL: z.string().optional(),
    theme: z.union([z.string(), z.array(z.string())]).optional(),
    title: z.string().optional(),
    languageCode: z.string().optional()
  })
  .passthrough()

export type HugoConfig = z.infer<typeof hugoConfigSchema>

// Site inventory - returned by hugosite_dir_show
export const siteInventorySchema = z.object({
  dirExist: z.boolean(),
  dirName: z.string(),
  hugoConfigExists: z.boolean(),
  hugoConfigParsed: hugoConfigSchema.nullable(),
  hugoThemesDirExists: z.boolean(),
  hugoContentDirExists: z.boolean(),
  hugoDataDirExists: z.boolean(),
  hugoStaticDirExists: z.boolean(),
  quiqrModelDirExists: z.boolean(),
  quiqrFormsDirExists: z.boolean(),
  quiqrDirExists: z.boolean(),
  quiqrModelParsed: z.any().nullable() // WorkspaceConfig, but using any to avoid circular dependency
})

// Menu schemas - for web-based menu bar
export const webMenuItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(['normal', 'checkbox', 'separator', 'submenu']),
    label: z.string().optional(),
    checked: z.boolean().optional(),
    enabled: z.boolean().optional(), // Optional for separator items
    action: z.string().optional(),
    submenu: z.array(webMenuItemSchema).optional()
  })
)

export const webMenuDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(webMenuItemSchema)
})

export const webMenuStateSchema = z.object({
  menus: z.array(webMenuDefinitionSchema),
  version: z.number()
})

export const webMenuActionResultSchema = z.object({
  type: z.enum(['success', 'error', 'navigate', 'openDialog', 'info', 'openExternal', 'reload']),
  path: z.string().optional(),
  dialog: z.string().optional(),
  message: z.string().optional(),
  refresh: z.boolean().optional(),
  url: z.string().optional()
})

export const environmentInfoSchema = z.object({
  platform: z.enum(['macOS', 'windows', 'linux']),
  isPackaged: z.boolean()
})

// API Schemas mapping - maps API method names to their response schemas
export const apiSchemas = {
  // Workspace operations
  getConfigurations: configurationsSchema,
  listWorkspaces: z.array(workspaceSchema),
  getWorkspaceDetails: workspaceDetailsSchema,
  getWorkspaceModelParseInfo: parseInfoSchema,
  getPreviewCheckConfiguration: z.any().nullable(), // Reads from JSON file, shape varies
  mountWorkspace: z.string(),
  serveWorkspace: z.any(), // Returns void/undefined, server action
  buildWorkspace: z.union([z.void(), z.string()]), // No return value

  // Single content operations
  getSingle: z.record(z.any()), // Returns dynamic content based on the single's fields
  updateSingle: z.record(z.any()), // Returns the updated document
  saveSingle: z.record(z.any()), // Returns the saved document
  openSingleInEditor: z.void(),
  buildSingle: buildActionResultSchema,

  // Collection operations
  listCollectionItems: z.array(collectionItemSchema),
  getCollectionItem: z.record(z.any()), // Returns dynamic content based on collection's fields
  updateCollectionItem: z.record(z.any()), // Returns the updated document
  createCollectionItemKey: collectionItemKeyResponseSchema,
  deleteCollectionItem: deleteCollectionItemResponseSchema,
  renameCollectionItem: renameCollectionItemResponseSchema,
  copyCollectionItem: copyCollectionItemResponseSchema,
  copyCollectionItemToLang: copyCollectionItemResponseSchema,
  makePageBundleCollectionItem: deleteCollectionItemResponseSchema, // Uses same shape: { deleted: boolean }
  buildCollectionItem: buildActionResultSchema,
  openCollectionItemInEditor: z.void(),

  // File operations
  parseFileToObject: z.any(), // any is needed here because a select-from-query file could have any shape
  globSync: z.array(z.string()),
  getFilesInBundle: z.array(fileReferenceSchema),
  getFilesFromAbsolutePath: z.array(fileReferenceSchema),
  getThumbnailForPath: z.string().optional(),
  getThumbnailForCollectionOrSingleItemImage: z.string().optional(),
  deleteFileFromBundle: deleteFileFromBundleResponseSchema,

  // Site management
  getSiteConfig: siteConfigSchema,
  saveSiteConf: z.boolean(),
  copySite: z.boolean(),
  deleteSite: z.boolean(),
  checkFreeSiteName: z.boolean(),
  getCurrentSiteKey: z.string(),
  getCurrentBaseUrl: z.string(),
  getLanguages: z.array(languageSchema),
  getCreatorMessage: z.string(),

  // Site import/creation
  importSiteAction: z.void(), // ZIP-based import, no return value
  importSiteFromPrivateGitRepo: z.string(), // Returns siteKey
  importSiteFromPublicGitUrl: z.string(), // Returns siteKey
  newSiteFromPublicHugoThemeUrl: z.string(), // Returns siteKey
  newSiteFromLocalDirectory: z.string(), // Returns siteKey
  newSiteFromScratch: z.string(), // Returns siteKey

  // Git repository inspection
  quiqr_git_repo_show: quiqrSiteRepoInfoSchema,
  hugotheme_git_repo_show: hugoThemeRepoInfoSchema,
  hugosite_dir_show: siteInventorySchema,

  // Form state
  getDynFormFields: dynFormFieldsSchema.nullable().or(z.string()),
  shouldReloadForm: z.boolean(),
  getCurrentFormAccordionIndex: z.string(),
  setCurrentFormAccordionIndex: z.boolean(),
  getCurrentFormNodePath: z.string(),
  setCurrentFormNodePath: z.boolean(),
  reloadCurrentForm: z.boolean(),

  // Configuration and preferences
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
  readConfPrefKey: z.union([z.string(), z.boolean(), z.undefined()]),
  saveConfPrefKey: z.boolean(),
  matchRole: z.boolean(),
  invalidateCache: z.boolean(),
  getEnvironmentInfo: environmentInfoSchema,

  // Hugo operations
  stopHugoServer: hugoServerResponseSchema,
  getFilteredHugoVersions: z.array(z.string()),
  getHugoTemplates: z.any(), // Not implemented in backend
  checkHugoVersion: hugoVersionCheckResponseSchema,

  // SSG operations
  checkSSGVersion: ssgVersionCheckResponseSchema,
  getFilteredSSGVersions: ssgVersionsResponseSchema,

  // Window management
  showLogWindow: z.union([z.object({ error: z.string(), stack: z.string() }), z.any()]),
  showMenuBar: z.boolean(),
  hideMenuBar: z.boolean(),
  redirectTo: z.boolean(),
  parentMountWorkspace: z.boolean(),
  reloadThemeStyle: z.union([z.object({ error: z.string(), stack: z.string() }), z.any()]),

  // External/shell operations
  openExternal: z.boolean(),
  openCustomCommand: z.any(), // Not implemented, throws error
  logToConsole: z.boolean(),

  // Sync/publish operations
  publisherDispatchAction: z.any(), // Return type varies by action
  createKeyPairGithub: keyPairResponseSchema,
  derivePublicKey: publicKeyResponseSchema,

  // Site library
  openSiteLibrary: z.boolean(),
  updateCommunityTemplates: z.array(communityTemplateSchema),
  showOpenFolderDialog: folderDialogResponseSchema,

  // Menu operations (web mode)
  getMenuState: webMenuStateSchema,
  executeMenuAction: webMenuActionResultSchema
} as const

// Type exports
export type CollectionItem = z.infer<typeof collectionItemSchema>
export type Language = z.infer<typeof languageSchema>
export type FileReference = z.infer<typeof fileReferenceSchema>
export type HugoServerResponse = z.infer<typeof hugoServerResponseSchema>
export type HugoVersionCheckResponse = z.infer<typeof hugoVersionCheckResponseSchema>
export type CollectionItemKeyResponse = z.infer<typeof collectionItemKeyResponseSchema>
export type FolderDialogResponse = z.infer<typeof folderDialogResponseSchema>
export type CommunityTemplate = z.infer<typeof communityTemplateSchema>
export type DynFormFields = z.infer<typeof dynFormFieldsSchema>
export type ParseInfoIncludeFile = z.infer<typeof parseInfoIncludeFileSchema>
export type ParseInfo = z.infer<typeof parseInfoSchema>
export type BuildActionResult = z.infer<typeof buildActionResultSchema>
export type DeleteCollectionItemResponse = z.infer<typeof deleteCollectionItemResponseSchema>
export type RenameCollectionItemResponse = z.infer<typeof renameCollectionItemResponseSchema>
export type CopyCollectionItemResponse = z.infer<typeof copyCollectionItemResponseSchema>
export type KeyPairResponse = z.infer<typeof keyPairResponseSchema>
export type PublicKeyResponse = z.infer<typeof publicKeyResponseSchema>
export type SiteInventory = z.infer<typeof siteInventorySchema>
export type WebMenuItemDefinition = z.infer<typeof webMenuItemSchema>
export type WebMenuDefinition = z.infer<typeof webMenuDefinitionSchema>
export type WebMenuState = z.infer<typeof webMenuStateSchema>
export type WebMenuActionResult = z.infer<typeof webMenuActionResultSchema>
export type EnvironmentInfo = z.infer<typeof environmentInfoSchema>

// This type includes all the api method names
export type ApiMethod = keyof typeof apiSchemas

// Map each method to its response type
// For methods in apiSchemas, return the typed response; for unknown methods, return unknown
export type ApiResponse<M extends string> = M extends ApiMethod
  ? z.infer<(typeof apiSchemas)[M]>
  : unknown
