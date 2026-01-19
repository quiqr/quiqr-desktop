// Additional TypeScript-only types (not Zod schemas)
// These are types that exist only in the frontend and don't need validation

import type { SingleConfig, CollectionConfig, MenuConfig } from '../schemas/config.js'
import type { Field } from '../schemas/fields.js'

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

export interface HugoThemeInfo {
  Screenshot?: string;
  MinHugoVersion?: string;
  Name?: string;
  License?: string;
  LicenseLink?: string;
  Homepage?: string;
  Demosite?: string;
  Description?: string;
  ExampleSite?: boolean;
  Author?: string;
  AuthorHomepage?: string;
}

/**
 * Extra build configuration
 */
export interface ExtraBuildConfig {
  overrideBaseURLSwitch?: boolean;
  overrideBaseURL?: string;
}
