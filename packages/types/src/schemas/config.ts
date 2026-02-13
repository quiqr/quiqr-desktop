import { object, z } from 'zod'
import { fieldSchema } from './fields.js'

export const baseConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  fields: z.array(fieldSchema).optional()
})

// Build action variable schema (custom variable declarations)
export const buildActionVariableSchema = z.object({
  name: z.string(),
  value: z.string()
})

// Build action path replacement schema (for WSL path mapping, etc.)
export const buildActionPathReplaceSchema = z.object({
  search: z.string(),
  replace: z.string()
})

// Build action command schema (platform-specific)
export const buildActionCommandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  file_path_replace: z.array(buildActionPathReplaceSchema).optional(),
  document_path_replace: z.array(buildActionPathReplaceSchema).optional(),
  site_path_replace: z.array(buildActionPathReplaceSchema).optional()
})

// Build action execute dictionary (contains windows/unix commands)
export const buildActionExecuteSchema = z.object({
  windows: buildActionCommandSchema,
  unix: buildActionCommandSchema,
  variables: z.array(buildActionVariableSchema).optional(),
  stdout_type: z.string().optional()
})

// Build action schema (used in collections and singles)
export const buildActionSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  button_text: z.string(),
  execute: buildActionExecuteSchema
})

export const llmSettingsSchema = z.object({
  model: z.string(),
  temperature: z.number().optional()
})


export const promptItemConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  llm_settings: llmSettingsSchema,
  savePromptHistory: z.boolean().optional(),
  saveResultHistory: z.boolean().optional(),
  showPreviewButton: z.boolean().optional(),
  description: z.string().optional(),
  _mergePartial: z.string().optional(),
  fields: z.array(fieldSchema).optional(),
})

export const singleConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  file: z.string().optional(),
  dataformat: z.string().optional(),
  previewUrl: z.string().optional(),
  description: z.string().optional(),
  _mergePartial: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  hideExternalEditIcon: z.boolean().optional(),
  hideSaveButton: z.boolean().optional(),
  pullOuterRootKey: z.string().optional(),
  fields: z.array(fieldSchema).optional(),
  prompt_templates: z.array(z.string()).optional(),
  build_actions: z.array(buildActionSchema).optional()
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
  fields: z.array(fieldSchema),
  prompt_templates: z.array(z.string()).optional(),
  build_actions: z.array(buildActionSchema).optional()
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

// Git provider enum for CI configuration
export const gitProviderSchema = z.enum(['github', 'gitlab', 'forgejo', 'generic']);

// Generic Git publish configuration (supports GitHub, GitLab, Forgejo, etc.)
export const gitPublishConfSchema = z.object({
  type: z.literal('git'),
  title: z.string().optional(),
  gitProvider: gitProviderSchema, // Determines CI configuration
  gitBaseUrl: z.string(), // e.g., 'github.com', 'gitlab.com', 'localhost:3000'
  gitProtocol: z.enum(['ssh', 'https']),
  sshPort: z.number().optional(), // SSH port, defaults to 22 (only used for SSH protocol)
  username: z.string(),
  email: z.string(),
  repository: z.string(),
  branch: z.string(),
  deployPrivateKey: z.string(),
  deployPublicKey: z.string(),
  publishScope: z.string(),
  keyPairBusy: z.boolean().optional(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string(),
  pullOnly: z.boolean().optional(),
  backupAtPull: z.boolean().optional(),
  syncSelection: z.string().optional(),
  // CI-related settings
  setCIWorkflow: z.boolean().optional(), // Whether to generate CI workflow files
  CNAMESwitch: z.boolean().optional(),
  CNAME: z.string().optional(),
})

// Union of all publish config types
export const publConfSchema = z.discriminatedUnion('type', [
  folderPublishConfSchema,
  githubPublishConfSchema,
  sysgitPublishConfSchema,
  gitPublishConfSchema
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

// Base workspace details schema (for extending)
export const workspaceDetailsBaseSchema = z.object({
  ssgType: z.string().default('hugo'),
  ssgVersion: z.string(),
  serve: z.array(serveConfigSchema).optional(),
  build: z.array(buildConfigSchema).optional(),
  menu: menuSchema.optional(),
  // Collections and singles can be missing or empty - defaults to empty array
  collections: z.array(collectionConfigSchema).optional().default([]),
  singles: z.array(singleConfigSchema).optional().default([]),
  providerConfig: z.record(z.unknown()).optional()
});

/**
 * MergeableConfigItem - config item that supports partial merging
 * Both SingleConfig and CollectionConfig can have _mergePartial during the build phase
 */
export const mergeableConfigItemSchema = z.object({
  key: z.string(),
  _mergePartial: z.string().optional(),
}).passthrough();

/**
 * WorkspaceConfig - complete workspace configuration
 * Extends WorkspaceDetails with dynamics, path, and key
 * Note: dynamics uses a permissive schema since configs may have varied structures
 */
export const workspaceConfigSchema = workspaceDetailsBaseSchema.extend({
  // Dynamics can have varied structures, use permissive validation
  dynamics: z.array(mergeableConfigItemSchema).optional(),
  path: z.string().optional(),
  key: z.string().optional(),
});

// Workspace details with auto-migration from old Hugo-specific format
// Using preprocess to handle both old (hugover) and new (ssgType + ssgVersion) formats
export const workspaceDetailsSchema = z.preprocess(
  (data: unknown) => {

    if (!data || !(data instanceof Object)) return data;
      const ssgType = 'ssgType' in data ? data.ssgType : 'hugo';

    // If old format with hugover, convert to new format
    if ('hugover' in data) {
      const transformed = {
        ...data,
        ssgType: ssgType,
        ssgVersion: data.hugover,
        hugover: undefined // Remove old field
      };
      return transformed;
    }

    // If missing both hugover and ssgVersion, add defaults (very old configs)
    if (!('ssgVersion' in data) && !('hugover' in data)) {
      const transformed = {
        ...data,
        ssgType: ssgType,
        ssgVersion: 'v0.100.2' // Default version for old configs without version info
      };
      return transformed;
    }

    // If has ssgVersion but missing ssgType, default to hugo
    if ('ssgVersion' in data && !('ssgType' in data)) {
      const transformed = {
        ...data,
        ssgType: 'hugo'
      };
      return transformed;
    }

    return data;
  },
  workspaceDetailsBaseSchema
)

export const configurationsSchema = z.object({
  sites: z.array(siteConfigSchema)
})

export const userPreferencesSchema = z.object({
  dataFolder: z.string().optional(),
  interfaceStyle: z.union([z.literal('quiqr10-dark'), z.literal('quiqr10-light')]).default('quiqr10-light'),
  sitesListingView: z.string().optional(),
  libraryView: z.string().optional(),
  systemGitBinPath: z.string().optional(),
  customOpenInCommand: z.string().optional(),
  showSplashAtStartup: z.boolean().optional(),
  applicationRole: z.string().optional(),
  logRetentionDays: z.number().min(0).max(365).optional().default(30)
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
export type BuildActionVariable = z.infer<typeof buildActionVariableSchema>
export type BuildActionPathReplace = z.infer<typeof buildActionPathReplaceSchema>
export type BuildActionCommand = z.infer<typeof buildActionCommandSchema>
export type BuildActionExecute = z.infer<typeof buildActionExecuteSchema>
export type BuildAction = z.infer<typeof buildActionSchema>
export type LlmSettings = z.infer<typeof llmSettingsSchema>
export type PromptItemConfig = z.infer<typeof promptItemConfigSchema>
export type SingleConfig = z.infer<typeof singleConfigSchema>
export type CollectionConfig = z.infer<typeof collectionConfigSchema>
export type MenuItem = z.infer<typeof menuItemSchema>
export type MenuSection = z.infer<typeof menuSectionSchema>
export type MenuConfig = z.infer<typeof menuSchema>
export type FolderPublishConf = z.infer<typeof folderPublishConfSchema>
export type GithubPublishConf = z.infer<typeof githubPublishConfSchema>
export type SysgitPublishConf = z.infer<typeof sysgitPublishConfSchema>
export type GitProvider = z.infer<typeof gitProviderSchema>
export type GitPublishConf = z.infer<typeof gitPublishConfSchema>
export type PublConf = z.infer<typeof publConfSchema>
export type SiteConfig = z.infer<typeof siteConfigSchema>
export type ServeConfig = z.infer<typeof serveConfigSchema>
export type BuildConfig = z.infer<typeof buildConfigSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceDetails = z.infer<typeof workspaceDetailsSchema>
export type MergeableConfigItem = z.infer<typeof mergeableConfigItemSchema>
export type WorkspaceConfig = z.infer<typeof workspaceConfigSchema>
export type Configurations = z.infer<typeof configurationsSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
export type GrayMatterParseResult = z.infer<typeof grayMatterParseResultSchema>

/**
 * PartialWorkspaceConfig - workspace config during the building/merging phase
 * TypeScript-only interface since the schema would be too complex for inference
 */
export interface PartialWorkspaceConfig {
  menu: MenuConfig;
  collections: MergeableConfigItem[];
  singles: MergeableConfigItem[];
  dynamics: MergeableConfigItem[];
  [key: string]: unknown;
}

// Type mapping for readConfKey - extracts types from appConfigSchema
export type ReadConfKeyMap = z.infer<typeof appConfigSchema>

// ============================================================================
// Unified Configuration Architecture
// ============================================================================
// Implements hierarchical config with layered resolution:
// App Defaults < Instance Defaults < User Preferences < Instance Forced
// See: openspec/changes/unify-configuration-architecture/

/**
 * Instance-level settings schema
 * Settings that apply to the entire Quiqr instance
 */
export const instanceSettingsSchema = z.object({
  // Storage configuration
  storage: z.object({
    type: z.enum(['fs', 's3']).default('fs'),
    dataFolder: z.string().default('~/Quiqr'),
  }).default({ type: 'fs', dataFolder: '~/Quiqr' }),

  // Default preferences for new users (can be overridden per-user)
  userDefaultPreferences: userPreferencesSchema.partial().default({}),

  // Forced preferences that override user settings (admin control)
  userForcedPreferences: userPreferencesSchema.partial().default({}),

  // Feature flags and experimental features
  experimentalFeatures: z.boolean().default(false),

  // Development settings
  dev: z.object({
    localApi: z.boolean().default(false),
    disableAutoHugoServe: z.boolean().default(false),
    showCurrentUser: z.boolean().default(false),
  }).default({ localApi: false, disableAutoHugoServe: false, showCurrentUser: false }),

  // Hugo-specific settings
  hugo: z.object({
    serveDraftMode: z.boolean().default(false),
  }).default({ serveDraftMode: false }),

  // Cache settings
  disablePartialCache: z.boolean().default(false),
})

/**
 * User-level configuration schema
 * Contains user preferences and user-specific state
 */
export const userConfigSchema = z.object({
  // User identifier (use 'default' for single-user mode)
  userId: z.string().default('default'),

  // User preferences (overrides instance defaults, can be overridden by forced)
  preferences: userPreferencesSchema.partial().default({}),

  // User-specific state
  lastOpenedSite: z.object({
    siteKey: z.string().nullable(),
    workspaceKey: z.string().nullable(),
    sitePath: z.string().nullable(),
  }).default({ siteKey: null, workspaceKey: null, sitePath: null }),

  // Last opened publish target per site
  lastOpenedPublishTargetForSite: z.record(z.string()).default({}),

  // UI state
  skipWelcomeScreen: z.boolean().default(false),
  sitesListingView: z.string().default('all'),
})

/**
 * Site-level settings schema
 * Settings specific to a single site
 */
export const siteSettingsSchema = z.object({
  // Site identifier
  siteKey: z.string(),

  // Site-specific preferences (future use)
  settings: z.record(z.unknown()).default({}),

  // Last publish timestamp
  lastPublish: z.number().optional(),

  // Publish status
  publishStatus: z.number().int().min(0).max(8).optional(),
})

/**
 * Configuration layer enum for precedence tracking
 */
export const configLayerSchema = z.enum([
  'app-default',
  'instance-default',
  'user',
  'instance-forced',
])

/**
 * Configuration property metadata schema
 * Used for about:config style property inspection
 */
export const configPropertyMetadataSchema = z.object({
  // Dot-notation path to the property
  path: z.string(),

  // Current effective value
  value: z.unknown(),

  // Which layer provided this value
  source: configLayerSchema,

  // Whether this property is locked (from forced layer)
  locked: z.boolean(),

  // Type of the value
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),

  // Optional description
  description: z.string().optional(),
})

/**
 * Environment variable mapping schema
 * Maps QUIQR_* env vars to config paths
 */
export const envVarMappingSchema = z.object({
  // Environment variable name (without QUIQR_ prefix)
  envVar: z.string(),

  // Dot-notation config path
  configPath: z.string(),

  // Value transformation
  transform: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
})

/**
 * Standard environment variable mappings
 * Format: QUIQR_<SECTION>_<KEY> maps to <section>.<key>
 */
export const standardEnvMappings: z.infer<typeof envVarMappingSchema>[] = [
  { envVar: 'STORAGE_TYPE', configPath: 'instance.storage.type', transform: 'string' },
  { envVar: 'STORAGE_DATAFOLDER', configPath: 'instance.storage.dataFolder', transform: 'string' },
  { envVar: 'EXPERIMENTAL_FEATURES', configPath: 'instance.experimentalFeatures', transform: 'boolean' },
  { envVar: 'DEV_LOCAL_API', configPath: 'instance.dev.localApi', transform: 'boolean' },
  { envVar: 'DEV_DISABLE_AUTO_HUGO_SERVE', configPath: 'instance.dev.disableAutoHugoServe', transform: 'boolean' },
  { envVar: 'DEV_SHOW_CURRENT_USER', configPath: 'instance.dev.showCurrentUser', transform: 'boolean' },
  { envVar: 'HUGO_SERVE_DRAFT_MODE', configPath: 'instance.hugo.serveDraftMode', transform: 'boolean' },
  { envVar: 'DISABLE_PARTIAL_CACHE', configPath: 'instance.disablePartialCache', transform: 'boolean' },
]

/**
 * Migration mapping from legacy config to unified config
 */
export const legacyToUnifiedMapping = {
  // Instance-level mappings
  'experimentalFeatures': 'instance.experimentalFeatures',
  'disablePartialCache': 'instance.disablePartialCache',
  'devLocalApi': 'instance.dev.localApi',
  'devDisableAutoHugoServe': 'instance.dev.disableAutoHugoServe',
  'devShowCurrentUser': 'instance.dev.showCurrentUser',
  'hugoServeDraftMode': 'instance.hugo.serveDraftMode',

  // User-level mappings (go to default user)
  'prefs': 'user.preferences',
  'lastOpenedSite': 'user.lastOpenedSite',
  'lastOpenedPublishTargetForSite': 'user.lastOpenedPublishTargetForSite',
  'skipWelcomeScreen': 'user.skipWelcomeScreen',
  'sitesListingView': 'user.sitesListingView',
  'currentUsername': 'user.userId',

  // Storage mappings
  'prefs.dataFolder': 'instance.storage.dataFolder',
} as const

// Type exports for unified config
export type InstanceSettings = z.infer<typeof instanceSettingsSchema>
export type UserConfig = z.infer<typeof userConfigSchema>
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type ConfigLayer = z.infer<typeof configLayerSchema>
export type ConfigPropertyMetadata = z.infer<typeof configPropertyMetadataSchema>
export type EnvVarMapping = z.infer<typeof envVarMappingSchema>
