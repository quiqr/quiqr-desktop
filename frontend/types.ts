import { z } from 'zod'

// Base field schema (common properties for all fields)
const baseFieldSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  arrayTitle: z.boolean().optional(),
  hidden: z.boolean().optional()
})

// Extended base schema that includes the type property
// This will be used to validate all fields, both built-in and custom
const typedBaseFieldSchema = baseFieldSchema.extend({
  type: z.string() // Accept any string for extensibility
})

const stringFieldSchema = baseFieldSchema.extend({
  type: z.literal('string'),
  multiLine: z.boolean().optional()
})

const markdownFieldSchema = baseFieldSchema.extend({
  type: z.literal('markdown')
})

const hiddenFieldSchema = baseFieldSchema.extend({
  type: z.literal('hidden')
})

const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  default: z.string().optional()
})

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  multiple: z.boolean().optional(),
  options: z.array(z.string())
})

// Chips field schema
const chipsFieldSchema = baseFieldSchema.extend({
  type: z.literal('chips')
})

const imageSelectFieldSchema = baseFieldSchema.extend({
  type: z.literal('image-select'),
  path: z.string(),
  buttonTitle: z.string().optional()
})

const fieldSchemaRef: z.ZodType<unknown> = z.lazy(() => fieldSchema)

const bundleManagerFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-manager'),
  path: z.string(),
  addButtonLocationTop: z.boolean().optional(),
  extensions: z.array(z.string()).optional(),
  fields: z.array(fieldSchemaRef).optional()
})

const accordionFieldSchema = baseFieldSchema.extend({
  type: z.literal('accordion'),
  fields: z.array(fieldSchemaRef)
})

const bundleImageThumbnailFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-image-thumbnail')
})

const CoreFields = {
  string: stringFieldSchema,
  markdown: markdownFieldSchema,
  hidden: hiddenFieldSchema,
  date: dateFieldSchema,
  select: selectFieldSchema,
  chips: chipsFieldSchema,
  imageSelect: imageSelectFieldSchema,
  bundleManager: bundleManagerFieldSchema,
  accordion: accordionFieldSchema,
  bundleImageThumbnail: bundleImageThumbnailFieldSchema
} as const

const coreFieldSchemas = [
  stringFieldSchema,
  markdownFieldSchema,
  hiddenFieldSchema,
  dateFieldSchema,
  selectFieldSchema,
  chipsFieldSchema,
  imageSelectFieldSchema,
  bundleManagerFieldSchema,
  accordionFieldSchema,
  bundleImageThumbnailFieldSchema
] as const

// For generic custom fields, create a catch-all schema
// This will match any field with a type not covered by built-in schemas
const customFieldSchema = typedBaseFieldSchema
  .extend({
    // Ensure it doesn't match any built-in types
    type: z
      .string()
      .refine(
        (type) => !Object.values(CoreFields).some((schema) => schema.shape.type.value === type),
        { message: 'Type already exists as a built-in field type' }
      )
  })
  .catchall(z.any())

// Create the field schema as a union of built-in fields and custom fields
// First create a discriminated union of all built-in fields
const coreFieldSchema = z.discriminatedUnion('type', coreFieldSchemas)

// Then create a union with the custom field schema
const fieldSchema = z.union([coreFieldSchema, customFieldSchema])

const baseConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  fields: z.array(fieldSchema).optional()
})

export const singleConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  file: z.string(),
  previewUrl: z.string().optional(),
  _mergePartial: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  hideExternalEditIcon: z.boolean().optional(),
  hideSaveButton: z.boolean().optional(),
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
  key: z.string(),
  matchRole: z.string().optional(),
  menuItems: z.array(menuItemSchema)
})

export const menuSchema = z.array(menuSectionSchema)

export const publConfSchema = z.object({
  type: z.string(),
  username: z.string(),
  email: z.string(),
  repository: z.string(),
  branch: z.string(),
  deployPrivateKey: z.string(),
  deployPublicKey: z.string(),
  publishScope: z.string(),
  setGitHubActions: z.boolean(),
  keyPairBusy: z.boolean(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string()
})

export const siteConfigSchema = z.object({
  key: z.string(),
  name: z.string(),
  source: z.object({
    type: z.literal('folder'),
    path: z.string()
  }),
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
  lastPublish: z.number().optional(),
  publishStatus: z.number().int().min(0).max(8).optional(),
  lastEdit: z.number().optional(),
  transform: z.array(z.unknown()).optional()
})

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
  bundleImageThumbnailFieldSchema
}

export type BaseField = z.infer<typeof baseFieldSchema>

export type StringField = z.infer<typeof stringFieldSchema>
export type MarkdownField = z.infer<typeof markdownFieldSchema>
export type HiddenField = z.infer<typeof hiddenFieldSchema>
export type DateField = z.infer<typeof dateFieldSchema>
export type SelectField = z.infer<typeof selectFieldSchema>
export type ChipsField = z.infer<typeof chipsFieldSchema>
export type ImageSelectField = z.infer<typeof imageSelectFieldSchema>
export type BundleManagerField = z.infer<typeof bundleManagerFieldSchema>
export type AccordionField = z.infer<typeof accordionFieldSchema>
export type BundleImageThumbnailField = z.infer<typeof bundleImageThumbnailFieldSchema>

export type Field = z.infer<typeof fieldSchema>

export type BaseConfig = z.infer<typeof baseConfigSchema>
// export type SingleConfig = z.infer<typeof singleConfigSchema>
export type CollectionConfig = z.infer<typeof collectionConfigSchema>
// export type MenuItem = z.infer<typeof menuItemSchema>
// export type MenuSection = z.infer<typeof menuSectionSchema>
// export type MenuConfig = z.infer<typeof menuSchema>
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
