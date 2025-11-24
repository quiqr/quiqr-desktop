import { z } from 'zod'
import { fieldSchema } from './fields.js'

export const baseConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  fields: z.array(fieldSchema).optional()
})

export const singleConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  file: z.string().optional(),
  previewUrl: z.string().optional(),
  description: z.string().optional(),
  _mergePartial: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  hideExternalEditIcon: z.boolean().optional(),
  hideSaveButton: z.boolean().optional(),
  pullOuterRootKey: z.string().optional(),
  fields: z.array(fieldSchema).optional()
})

export const collectionConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  folder: z.string(),
  extension: z.string(),
  dataformat: z.string(),
  itemtitle: z.string(),
  hideIndex: z.boolean().optional(),
  previewUrlBase: z.string().optional(),
  _mergePartial: z.string().optional(),
  sortkey: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  fields: z.array(fieldSchema)
})

export const menuItemSchema = z.object({
  key: z.string()
})

export const menuSectionSchema = z.object({
  title: z.string(),
  key: z.string().optional(),
  matchRole: z.string().optional(),
  menuItems: z.array(menuItemSchema)
})

export const menuSchema = z.array(menuSectionSchema)

// Folder publish configuration
export const folderPublishConfSchema = z.object({
  type: z.literal('folder'),
  path: z.string(),
  publishScope: z.string(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string()
})

// GitHub publish configuration
export const githubPublishConfSchema = z.object({
  type: z.literal('github'),
  title: z.string().optional(),
  username: z.string(),
  email: z.string(),
  repository: z.string(),
  branch: z.string(),
  deployPrivateKey: z.string(),
  deployPublicKey: z.string(),
  publishScope: z.string(),
  setGitHubActions: z.boolean(),
  keyPairBusy: z.boolean().optional(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string(),
  pullOnly: z.boolean().optional(),
  backupAtPull: z.boolean().optional(),
  syncSelection: z.string().optional(),
  CNAMESwitch: z.boolean().optional(),
  CNAME: z.string().optional()
})

// System Git publish configuration
export const sysgitPublishConfSchema = z.object({
  type: z.literal('sysgit'),
  title: z.string().optional(),
  git_server_url: z.string(),
  email: z.string(),
  branch: z.string(),
  deployPrivateKey: z.string(),
  deployPublicKey: z.string(),
  publishScope: z.string(),
  setGitHubActions: z.boolean(),
  keyPairBusy: z.boolean().optional(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string(),
  pullOnly: z.boolean().optional(),
  backupAtPull: z.boolean().optional(),
  syncSelection: z.string().optional(),
  CNAMESwitch: z.boolean().optional(),
  CNAME: z.string().optional()
})

// Union of all publish config types
export const publConfSchema = z.discriminatedUnion('type', [
  folderPublishConfSchema,
  githubPublishConfSchema,
  sysgitPublishConfSchema
])

export const siteConfigSchema = z.object({
  key: z.string(),
  name: z.string().optional(),
  source: z.object({
    type: z.literal('folder'),
    path: z.string()
  }).optional(),
  serve: z
    .object({
      key: z.string(),
      config: z.string(),
      hugoHidePreviewSite: z.boolean()
    })
    .optional(),
  build: z
    .object({
      key: z.string(),
      config: z.string()
    })
    .optional(),
  publish: z
    .array(
      z.object({
        key: z.string(),
        config: publConfSchema
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  template: z.boolean().optional(),
  remote: z.boolean().optional(),
  screenshotURL: z.string().optional(),
  homepageURL: z.string().optional(),
  importSiteURL: z.string().optional(),
  etalage: z.object({
    screenshots: z.array(z.string()).optional(),
    favicons: z.array(z.string()).optional()
  }).passthrough().optional(),
  lastPublish: z.number().optional(),
  publishStatus: z.number().int().min(0).max(8).optional(),
  lastEdit: z.number().optional(),
  transform: z.array(z.unknown()).optional()
}).transform((data) => ({
  ...data,
  // Ensure name always exists - use key as fallback
  name: data.name || data.key
}))

export const serveConfigSchema = z.object({
  key: z.string(),
  config: z.string(),
  hugoHidePreviewSite: z.boolean().optional()
})

export const buildConfigSchema = z.object({
  key: z.string(),
  config: z.string()
})

export const workspaceSchema = z.object({
  key: z.string(),
  path: z.string(),
  state: z.string()
})

export const workspaceDetailsSchema = z.object({
  hugover: z.string(),
  serve: z.array(serveConfigSchema).optional(),
  build: z.array(buildConfigSchema).optional(),
  menu: menuSchema.optional(),
  collections: z.array(collectionConfigSchema),
  singles: z.array(singleConfigSchema)
})

export const configurationsSchema = z.object({
  sites: z.array(siteConfigSchema)
})

export const userPreferencesSchema = z.object({
  dataFolder: z.string().optional(),
  interfaceStyle: z.union([z.literal('quiqr10-dark'), z.literal('quiqr10-light')]),
  sitesListingView: z.string().optional(),
  libraryView: z.string().optional(),
  openAiApiKey: z.string().optional(),
  systemGitBinPath: z.string().optional(),
  customOpenInCommand: z.string().optional(),
  showSplashAtStartup: z.boolean().optional(),
  applicationRole: z.string().optional()
}).passthrough() // TODO fix nested types

// Schema for the full application config object (global.pogoconf in backend)
export const appConfigSchema = z.object({
  lastOpenedSite: z.object({
    siteKey: z.string().nullable(),
    workspaceKey: z.string().nullable(),
    sitePath: z.string().nullable()
  }),
  prefs: userPreferencesSchema,
  lastOpenedPublishTargetForSite: z.record(z.string()),
  skipWelcomeScreen: z.boolean(),
  experimentalFeatures: z.boolean(),
  disablePartialCache: z.boolean(),
  devLocalApi: z.boolean(),
  devDisableAutoHugoServe: z.boolean(),
  hugoServeDraftMode: z.boolean(),
  devShowCurrentUser: z.boolean(),
  sitesListingView: z.string(),
  currentUsername: z.string().nullable()
})

export const grayMatterParseResultSchema = z.object({
  content: z.string(),
  data: z.record(z.any()),
  excerpt: z.string(),
  isEmpty: z.boolean(),
  orig: z.record(z.string(), z.number())
})

// Type exports
export type BaseConfig = z.infer<typeof baseConfigSchema>
export type SingleConfig = z.infer<typeof singleConfigSchema>
export type CollectionConfig = z.infer<typeof collectionConfigSchema>
export type MenuItem = z.infer<typeof menuItemSchema>
export type MenuSection = z.infer<typeof menuSectionSchema>
export type MenuConfig = z.infer<typeof menuSchema>
export type FolderPublishConf = z.infer<typeof folderPublishConfSchema>
export type GithubPublishConf = z.infer<typeof githubPublishConfSchema>
export type SysgitPublishConf = z.infer<typeof sysgitPublishConfSchema>
export type PublConf = z.infer<typeof publConfSchema>
export type SiteConfig = z.infer<typeof siteConfigSchema>
export type ServeConfig = z.infer<typeof serveConfigSchema>
export type BuildConfig = z.infer<typeof buildConfigSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceDetails = z.infer<typeof workspaceDetailsSchema>
export type Configurations = z.infer<typeof configurationsSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
export type GrayMatterParseResult = z.infer<typeof grayMatterParseResultSchema>

// Type mapping for readConfKey - extracts types from appConfigSchema
export type ReadConfKeyMap = z.infer<typeof appConfigSchema>
