import { z } from 'zod'

// Base field schema (common properties for all fields)
const baseFieldSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  arrayTitle: z.boolean().optional(),
  hidden: z.boolean().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  tip: z.string().optional(),
  name: z.string().optional(),
  group: z.string().optional(),
  groupdata: z.boolean().optional(),
  content: z.string().optional(),
  theme: z.string().optional()
})

// Extended base schema that includes the type property
// This will be used to validate all fields, both built-in and custom
const typedBaseFieldSchema = baseFieldSchema.extend({
  type: z.string() // Accept any string for extensibility
})

const stringFieldSchema = baseFieldSchema.extend({
  type: z.literal('string'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional(),
  txtInsertButtons: z.array(z.string()).optional()
})

const markdownFieldSchema = baseFieldSchema.extend({
  type: z.literal('markdown'),
  default: z.string().optional(),
  tip: z.string().optional(),
})

const hiddenFieldSchema = baseFieldSchema.extend({
  type: z.literal('hidden'),
  default: z.string().optional(),
})

const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  default: z.string().optional(),
  dateFormat: z.string().optional(),
  tip: z.string().optional()
})

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(z.union([
    z.string(),
    z.number(),
    z.object({ value: z.union([z.string(), z.number()]), text: z.string() })
  ])),
  default: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]).optional(),
  multiple: z.boolean().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional(),
  option_image_path: z.string().optional(),
  option_image_width: z.number().optional(),
  option_image_extension: z.string().optional()
})

// Chips field schema
const chipsFieldSchema = baseFieldSchema.extend({
  type: z.literal('chips'),
  default: z.array(z.any()).optional(),
  tip: z.string().optional(),
})

const imageSelectFieldSchema = baseFieldSchema.extend({
  type: z.literal('image-select'),
  path: z.string(),
  buttonTitle: z.string().optional(),
  extensions: z.array(z.string()).optional(),
  forceFileName: z.string().optional(),
  real_fs_path: z.string().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

const fieldSchemaRef: z.ZodType<unknown> = z.lazy(() => fieldSchema)

const bundleManagerFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-manager'),
  path: z.string(),
  addButtonLocationTop: z.boolean().optional(),
  extensions: z.array(z.string()).optional(),
  forceFileName: z.string().optional(),
  maxItems: z.number().optional(),
  fields: z.array(fieldSchemaRef).optional()
}).passthrough() // TODO fix nested types

const accordionFieldSchema = baseFieldSchema.extend({
  type: z.literal('accordion'),
  fields: z.array(fieldSchemaRef),
  dynFormSearchKey: z.string().optional(),
  arrayIndicesAreKeys: z.boolean().optional(),
  disableCreate: z.boolean().optional(),
  disableSort: z.boolean().optional(),
  disableDelete: z.boolean().optional(),
  dynFormObjectRoot: z.string().optional(),
  lazy: z.boolean().optional(),
  lazyTemp: z.boolean().optional()
}).passthrough() // TODO fix nested types

const bundleImageThumbnailFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-image-thumbnail'),
  src: z.string().optional()
})

const fontPickerFieldSchema = baseFieldSchema.extend({
  type: z.literal('font-picker'),
  tip: z.string().optional(),
  default: z.string().optional(),
  autoSave: z.boolean().optional(),
  limit: z.number().int().optional(),
  families: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional()
})

const booleanFieldSchema = baseFieldSchema.extend({
  type: z.literal('boolean'),
  default: z.boolean().optional(),
  tip: z.string().optional()
})

const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal('number'),
  default: z.number().optional(),
  tip: z.string().optional()
})

const sliderFieldSchema = baseFieldSchema.extend({
  type: z.literal('slider'),
  default: z.number().optional(),
  min: z.number(),
  max: z.number(),
  step: z.number().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

const colorFieldSchema = baseFieldSchema.extend({
  type: z.literal('color'),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

const fontIconPickerFieldSchema = baseFieldSchema.extend({
  type: z.literal('fonticon-picker'),
  default: z.string().optional(),
  multiple: z.boolean().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

const easymdeFieldSchema = baseFieldSchema.extend({
  type: z.literal('easymde'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

const eisenhouwerFieldSchema = baseFieldSchema.extend({
  type: z.literal('eisenhouwer'),
  dataSetsPath: z.string().optional(),
  dataSetsKeyToLabel: z.boolean().optional(),
  dataSetsDataPointsPath: z.string().optional(),
  dataSetsDataPointsKeyToItem: z.boolean().optional(),
  dataSetsDataPointPosXPath: z.string().optional(),
  dataSetsDataPointPosYPath: z.string().optional(),
  dataSetsDataPointLabelTemplate: z.string().optional(),
  xScaleTitle: z.string().optional(),
  yScaleTitle: z.string().optional(),
  pointRadius: z.number().optional(),
  labelDoNow: z.string().optional(),
  labelToPlan: z.string().optional(),
  labelDelegate: z.string().optional(),
  labelDelete: z.string().optional(),
  tip: z.string().optional()
})

const emptyLineFieldSchema = baseFieldSchema.extend({
  type: z.literal('empty-line'),
  amount: z.number().optional()
})

const infoFieldSchema = baseFieldSchema.extend({
  type: z.literal('info'),
  content: z.string(),
  size: z.string().optional(),
  lineHeight: z.string().optional(),
  theme: z
    .enum(['default', 'bare', 'warn', 'warn-bare', 'black', 'black-bare', 'gray', 'gray-bare'])
    .optional()
})

const leafArrayFieldSchema = baseFieldSchema.extend({
  type: z.literal('leaf-array'),
  default: z.array(z.any()).optional(),
  field: z.any()
})

const nestFieldSchema = baseFieldSchema.extend({
  type: z.literal('nest'),
  fields: z.array(fieldSchemaRef),
  groupdata: z.boolean().optional()
})

const pullFieldSchema = baseFieldSchema.extend({
  type: z.literal('pull'),
  group: z.string().optional(),
  fields: z.array(fieldSchemaRef)
})

const readonlyFieldSchema = baseFieldSchema.extend({
  type: z.literal('readonly'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

const sectionFieldSchema = baseFieldSchema.extend({
  type: z.literal('section'),
  fields: z.array(fieldSchemaRef),
  groupdata: z.boolean().optional()
})

const selectFromQueryFieldSchema = baseFieldSchema.extend({
  type: z.literal('select-from-query'),
  query_glob: z.string(),
  query_string: z.string(),
  default: z.union([z.string(), z.array(z.string())]).optional(),
  multiple: z.boolean().optional(),
  option_image_path: z.string().optional(),
  option_image_width: z.number().optional(),
  option_image_extension: z.string().optional(),
  tip: z.string().optional()
})

const uniqFieldSchema = baseFieldSchema.extend({
  type: z.literal('uniq'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

const CoreFields = {
  string: stringFieldSchema,
  markdown: markdownFieldSchema,
  hidden: hiddenFieldSchema,
  date: dateFieldSchema,
  boolean: booleanFieldSchema,
  number: numberFieldSchema,
  select: selectFieldSchema,
  chips: chipsFieldSchema,
  imageSelect: imageSelectFieldSchema,
  bundleManager: bundleManagerFieldSchema,
  accordion: accordionFieldSchema,
  bundleImageThumbnail: bundleImageThumbnailFieldSchema,
  fontPicker: fontPickerFieldSchema,
  slider: sliderFieldSchema,
  color: colorFieldSchema,
  fontIconPicker: fontIconPickerFieldSchema,
  easymde: easymdeFieldSchema,
  eisenhouwer: eisenhouwerFieldSchema,
  emptyLine: emptyLineFieldSchema,
  info: infoFieldSchema,
  leafArray: leafArrayFieldSchema,
  nest: nestFieldSchema,
  pull: pullFieldSchema,
  readonly: readonlyFieldSchema,
  section: sectionFieldSchema,
  selectFromQuery: selectFromQueryFieldSchema,
  uniq: uniqFieldSchema
} as const

const coreFieldSchemas = [
  stringFieldSchema,
  markdownFieldSchema,
  hiddenFieldSchema,
  dateFieldSchema,
  booleanFieldSchema,
  numberFieldSchema,
  selectFieldSchema,
  chipsFieldSchema,
  imageSelectFieldSchema,
  bundleManagerFieldSchema,
  accordionFieldSchema,
  bundleImageThumbnailFieldSchema,
  fontPickerFieldSchema,
  sliderFieldSchema,
  colorFieldSchema,
  fontIconPickerFieldSchema,
  easymdeFieldSchema,
  eisenhouwerFieldSchema,
  emptyLineFieldSchema,
  infoFieldSchema,
  leafArrayFieldSchema,
  nestFieldSchema,
  pullFieldSchema,
  readonlyFieldSchema,
  sectionFieldSchema,
  selectFromQueryFieldSchema,
  uniqFieldSchema
] as const

// For generic custom fields, create a catch-all schema
// This will match any field with a type not covered by built-in schemas
// COMMENTED OUT: Causing validation issues, masking real errors
// const customFieldSchema = typedBaseFieldSchema
//   .extend({
//     // Ensure it doesn't match any built-in types
//     type: z
//       .string()
//       .refine(
//         (type) => !Object.values(CoreFields).some((schema) => schema.shape.type.value === type),
//         { message: 'Type already exists as a built-in field type' }
//       )
//   })
//   .catchall(z.any())

// Create the field schema as a union of built-in fields and custom fields
// First create a discriminated union of all built-in fields
const coreFieldSchema = z.discriminatedUnion('type', coreFieldSchemas)

// Use only core field schema for now (custom fields disabled)
// const fieldSchema = z.union([coreFieldSchema, customFieldSchema])
const fieldSchema = coreFieldSchema

const baseConfigSchema = z.object({
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

export const grayMatterParseResultSchema = z.object({
  content: z.string(),
  data: z.record(z.any()),
  excerpt: z.string(),
  isEmpty: z.boolean(),
  orig: z.record(z.string(), z.number())
})

export {
  baseFieldSchema,
  fieldSchema,
  baseConfigSchema,
  stringFieldSchema,
  markdownFieldSchema,
  hiddenFieldSchema,
  dateFieldSchema,
  selectFieldSchema,
  chipsFieldSchema,
  imageSelectFieldSchema,
  bundleManagerFieldSchema,
  accordionFieldSchema,
  bundleImageThumbnailFieldSchema,
  fontPickerFieldSchema,
  booleanFieldSchema,
  numberFieldSchema,
  sliderFieldSchema,
  colorFieldSchema,
  fontIconPickerFieldSchema,
  easymdeFieldSchema,
  eisenhouwerFieldSchema,
  emptyLineFieldSchema,
  infoFieldSchema,
  leafArrayFieldSchema,
  nestFieldSchema,
  pullFieldSchema,
  readonlyFieldSchema,
  sectionFieldSchema,
  selectFromQueryFieldSchema,
  uniqFieldSchema
}

export type BaseField = z.infer<typeof baseFieldSchema>

export type StringField = z.infer<typeof stringFieldSchema>
export type MarkdownField = z.infer<typeof markdownFieldSchema>
export type HiddenField = z.infer<typeof hiddenFieldSchema>
export type DateField = z.infer<typeof dateFieldSchema>
export type BooleanField = z.infer<typeof booleanFieldSchema>
export type NumberField = z.infer<typeof numberFieldSchema>
export type SelectField = z.infer<typeof selectFieldSchema>
export type ChipsField = z.infer<typeof chipsFieldSchema>
export type ImageSelectField = z.infer<typeof imageSelectFieldSchema>
export type BundleManagerField = z.infer<typeof bundleManagerFieldSchema>
export type AccordionField = z.infer<typeof accordionFieldSchema>
export type BundleImageThumbnailField = z.infer<typeof bundleImageThumbnailFieldSchema>
export type FontPickerField = z.infer<typeof fontPickerFieldSchema>
export type SliderField = z.infer<typeof sliderFieldSchema>
export type ColorField = z.infer<typeof colorFieldSchema>
export type FontIconPickerField = z.infer<typeof fontIconPickerFieldSchema>
export type EasymdeField = z.infer<typeof easymdeFieldSchema>
export type EisenhouwerField = z.infer<typeof eisenhouwerFieldSchema>
export type EmptyLineField = z.infer<typeof emptyLineFieldSchema>
export type InfoField = z.infer<typeof infoFieldSchema>
export type LeafArrayField = z.infer<typeof leafArrayFieldSchema>
export type NestField = z.infer<typeof nestFieldSchema>
export type PullField = z.infer<typeof pullFieldSchema>
export type ReadonlyField = z.infer<typeof readonlyFieldSchema>
export type SectionField = z.infer<typeof sectionFieldSchema>
export type SelectFromQueryField = z.infer<typeof selectFromQueryFieldSchema>
export type UniqField = z.infer<typeof uniqFieldSchema>

export type Field = z.infer<typeof fieldSchema>

export type BaseConfig = z.infer<typeof baseConfigSchema>
// export type SingleConfig = z.infer<typeof singleConfigSchema>
export type CollectionConfig = z.infer<typeof collectionConfigSchema>
// export type MenuItem = z.infer<typeof menuItemSchema>
// export type MenuSection = z.infer<typeof menuSectionSchema>
// export type MenuConfig = z.infer<typeof menuSchema>
export type FolderPublishConf = z.infer<typeof folderPublishConfSchema>
export type GithubPublishConf = z.infer<typeof githubPublishConfSchema>
export type SysgitPublishConf = z.infer<typeof sysgitPublishConfSchema>
export type PublConf = z.infer<typeof publConfSchema>
export type SiteConfig = z.infer<typeof siteConfigSchema>

export type GrayMatterParseResult = z.infer<typeof grayMatterParseResultSchema>

export interface IndexedSinglesConfig {
  [key: string]: Omit<SingleConfig, 'key'>
}

export interface IndexedMenuConfig {
  [key: string]: Omit<EnhancedMenuConfig, 'key'>
}

export interface IndexedCollectionsConfig {
  [key: string]: Omit<CollectionConfig, 'key'>
}

export type CollectionConfigValue = IndexedCollectionsConfig[string]
export type SingleConfigValue = IndexedSinglesConfig[string]

/**
 * Type guard to check if a config is a CollectionConfig by checking
 * if it has a folder property
 */
export function isCollectionConfig(
  config:
    | IndexedSinglesConfig
    | IndexedCollectionsConfig
    | CollectionConfigValue
    | SingleConfigValue
): config is IndexedCollectionsConfig {
  return 'folder' in config && typeof config.folder === 'string'
}

/**
 * Type guard to check if a config is a SingleConfig by checking
 * that it doesn't have a folder property
 */
export function isSingleConfig(
  config: CollectionConfigValue | SingleConfigValue
): config is SingleConfig {
  return !('folder' in config)
}

export interface ValidatedProject {
  menuConfig: MenuConfig
  enhancedMenuConfig: EnhancedMenuConfig
  singlesConfig: SingleConfig[]
  collectionsConfig: CollectionConfig[]
  indexedSingles: IndexedSinglesConfig
  indexedCollections: IndexedCollectionsConfig
  isValid: boolean
  errors: MissingMenuItemError[]
  projectName: string
}

/**
 * The Quiqr menu configs only store the reference name,
 * not the type they reference.
 *
 * When a config file gets read, we check if a reference is either
 * a single or a collection
 *
 * If no reference is found, the reference field is omitted
 */
export interface EnhancedMenuItem {
  key: string
  reference?: {
    type: 'single' | 'collection'
    key: string
  }
}

export interface EnhancedMenuSection {
  title: string
  key?: string
  matchRole?: string
  menuItems: EnhancedMenuItem[]
}

export type EnhancedMenuConfig = EnhancedMenuSection[]

export type MissingMenuItemError = {
  [key: string]: string
}

export interface ValidationResult {
  valid: boolean
  errors: MissingMenuItemError[]
}

export interface MenuItem {
  key: string
}

export interface MenuSection {
  title: string
  key?: string
  matchRole?: string
  menuItems: MenuItem[]
}

export type MenuConfig = MenuSection[]

export interface SingleConfig extends BaseConfig {
  file?: string
  previewUrl?: string
  _mergePartial?: string
  hidePreviewIcon?: boolean
  hideExternalEditIcon?: boolean
  hideSaveButton?: boolean
}

export interface BundleConfig extends SingleConfig {
  fields: Field[]
}

export interface MediaConfig extends BundleConfig {
  hideExternalEditIcon: boolean
  hidePreviewIcon: boolean
  hideSaveButton?: boolean
  file: string
}

export interface PageConfig extends SingleConfig {
  previewUrl: string // Pages must have preview URLs
  _mergePartial: string // Pages usually use _mergePartials like composit_page
}

export type SinglesConfig = SingleConfig[]

// API Response Schemas
export const workspaceSchema = z.object({
  key: z.string(),
  path: z.string(),
  state: z.string()
})

export const serveConfigSchema = z.object({
  key: z.string(),
  config: z.string(),
  hugoHidePreviewSite: z.boolean().optional()
})

export const buildConfigSchema = z.object({
  key: z.string(),
  config: z.string()
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
  src: z.string()
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
  fields: z.array(fieldSchema).nullable().optional(),
  key: z.string().optional(),
  content_type: z.string().optional(),
  form_field_type: z.string().optional()
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

// Type mapping for readConfKey - extracts types from appConfigSchema
export type ReadConfKeyMap = z.infer<typeof appConfigSchema>

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

// Export types for the API responses
export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceDetails = z.infer<typeof workspaceDetailsSchema>
export type Configurations = z.infer<typeof configurationsSchema>
export type CollectionItem = z.infer<typeof collectionItemSchema>
export type Language = z.infer<typeof languageSchema>
export type FileReference = z.infer<typeof fileReferenceSchema>
export type CommunityTemplate = z.infer<typeof communityTemplateSchema>
export type DynFormFields = z.infer<typeof dynFormFieldsSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
export type FolderDialogResponse = z.infer<typeof folderDialogResponseSchema>

// This type includes all the api method names
export type ApiMethod = keyof typeof apiSchemas

// Map each method to its response type
// For methods in apiSchemas, return the typed response; for unknown methods, return unknown
export type ApiResponse<M extends string> = M extends ApiMethod
  ? z.infer<typeof apiSchemas[M]>
  : unknown

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
  severity: z.enum(['success', 'warning']),
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

// Export types for Service responses
export type SiteAndWorkspaceData = z.infer<typeof siteAndWorkspaceDataSchema>
export type SnackMessage = z.infer<typeof snackMessageSchema>
export type ConsoleMessage = z.infer<typeof consoleMessageSchema>

// This type includes all the service method names
export type ServiceMethod = keyof typeof serviceSchemas

// Map each service method to its response type
export type ServiceResponse<M extends string> = M extends ServiceMethod
  ? z.infer<typeof serviceSchemas[M]>
  : unknown

// This type includes all the UI service method names
export type UIServiceMethod = keyof typeof uiServiceSchemas

// Map each UI service method to its response type
export type UIServiceResponse<M extends string> = M extends UIServiceMethod
  ? z.infer<typeof uiServiceSchemas[M]>
  : unknown
