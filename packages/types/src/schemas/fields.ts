import { z } from 'zod'

// Base field schema (common properties for all fields)
export const baseFieldSchema = z.object({
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
export const typedBaseFieldSchema = baseFieldSchema.extend({
  type: z.string() // Accept any string for extensibility
})

export const stringFieldSchema = baseFieldSchema.extend({
  type: z.literal('string'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional(),
  txtInsertButtons: z.array(z.string()).optional()
})

export const markdownFieldSchema = baseFieldSchema.extend({
  type: z.literal('markdown'),
  default: z.string().optional(),
  tip: z.string().optional(),
})

export const hiddenFieldSchema = baseFieldSchema.extend({
  type: z.literal('hidden'),
  default: z.string().optional(),
})

export const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  default: z.string().optional(),
  dateFormat: z.string().optional(),
  tip: z.string().optional()
})

export const selectFieldSchema = baseFieldSchema.extend({
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
export const chipsFieldSchema = baseFieldSchema.extend({
  type: z.literal('chips'),
  default: z.array(z.any()).optional(),
  tip: z.string().optional(),
})

export const imageSelectFieldSchema = baseFieldSchema.extend({
  type: z.literal('image-select'),
  path: z.string(),
  buttonTitle: z.string().optional(),
  extensions: z.array(z.string()).optional(),
  forceFileName: z.string().optional(),
  real_fs_path: z.string().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

// Forward reference for recursive field types
const fieldSchemaRef: z.ZodType<unknown> = z.lazy(() => fieldSchema)

export const bundleManagerFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-manager'),
  path: z.string(),
  addButtonLocationTop: z.boolean().optional(),
  extensions: z.array(z.string()).optional(),
  forceFileName: z.string().optional(),
  maxItems: z.number().optional(),
  fields: z.array(fieldSchemaRef).optional()
}).passthrough() // TODO fix nested types

export const accordionFieldSchema = baseFieldSchema.extend({
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

export const bundleImageThumbnailFieldSchema = baseFieldSchema.extend({
  type: z.literal('bundle-image-thumbnail'),
  src: z.string().optional()
})

export const fontPickerFieldSchema = baseFieldSchema.extend({
  type: z.literal('font-picker'),
  tip: z.string().optional(),
  default: z.string().optional(),
  autoSave: z.boolean().optional(),
  limit: z.number().int().optional(),
  families: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional()
})

export const booleanFieldSchema = baseFieldSchema.extend({
  type: z.literal('boolean'),
  default: z.boolean().optional(),
  tip: z.string().optional()
})

export const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal('number'),
  default: z.number().optional(),
  tip: z.string().optional()
})

export const sliderFieldSchema = baseFieldSchema.extend({
  type: z.literal('slider'),
  default: z.number().optional(),
  min: z.number(),
  max: z.number(),
  step: z.number().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

export const colorFieldSchema = baseFieldSchema.extend({
  type: z.literal('color'),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

export const fontIconPickerFieldSchema = baseFieldSchema.extend({
  type: z.literal('fonticon-picker'),
  default: z.string().optional(),
  multiple: z.boolean().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})

export const easymdeFieldSchema = baseFieldSchema.extend({
  type: z.literal('easymde'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

export const eisenhouwerFieldSchema = baseFieldSchema.extend({
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

export const emptyLineFieldSchema = baseFieldSchema.extend({
  type: z.literal('empty-line'),
  amount: z.number().optional()
})

export const infoFieldSchema = baseFieldSchema.extend({
  type: z.literal('info'),
  content: z.string(),
  size: z.string().optional(),
  lineHeight: z.string().optional(),
  theme: z
    .enum(['default', 'bare', 'warn', 'warn-bare', 'black', 'black-bare', 'gray', 'gray-bare'])
    .optional()
})

export const leafArrayFieldSchema = baseFieldSchema.extend({
  type: z.literal('leaf-array'),
  default: z.array(z.any()).optional(),
  field: z.any()
})

export const nestFieldSchema = baseFieldSchema.extend({
  type: z.literal('nest'),
  fields: z.array(fieldSchemaRef),
  groupdata: z.boolean().optional()
})

export const pullFieldSchema = baseFieldSchema.extend({
  type: z.literal('pull'),
  group: z.string().optional(),
  fields: z.array(fieldSchemaRef)
})

export const readonlyFieldSchema = baseFieldSchema.extend({
  type: z.literal('readonly'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

export const sectionFieldSchema = baseFieldSchema.extend({
  type: z.literal('section'),
  fields: z.array(fieldSchemaRef),
  groupdata: z.boolean().optional()
})

export const selectFromQueryFieldSchema = baseFieldSchema.extend({
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

export const uniqFieldSchema = baseFieldSchema.extend({
  type: z.literal('uniq'),
  default: z.string().optional(),
  multiLine: z.boolean().optional(),
  tip: z.string().optional()
})

export const CoreFields = {
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

export const coreFieldSchemas = [
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

// Create the field schema as a discriminated union of all built-in fields
export const coreFieldSchema = z.discriminatedUnion('type', coreFieldSchemas)

// Use only core field schema for now (custom fields disabled)
export const fieldSchema = coreFieldSchema

// Type exports
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
