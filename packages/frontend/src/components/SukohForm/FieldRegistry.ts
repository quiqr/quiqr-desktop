import type { ComponentType } from 'react';

export interface FieldComponentProps {
  compositeKey: string;
}

export type FieldImporter = () => Promise<{
  default: ComponentType<FieldComponentProps>;
}>;

// Module-level state
const components: Map<string, FieldImporter> = new Map();
let legacyMode = true;

// Initialize default field type registrations
function registerDefaults(): void {
  // Text fields
  components.set('string', () => import('./fields/StringField'));
  components.set('markdown', () => import('./fields/MarkdownField'));
  components.set('easymde', () => import('./fields/EasyMdeField'));
  components.set('readonly', () => import('./fields/ReadonlyField'));
  components.set('uniq', () => import('./fields/UniqField'));

  // Number fields
  components.set('number', () => import('./fields/NumberField'));
  components.set('slider', () => import('./fields/SliderField'));

  // Boolean fields
  components.set('boolean', () => import('./fields/ToggleField'));

  // Date fields
  components.set('date', () => import('./fields/DateField'));

  // Selection fields
  components.set('select', () => import('./fields/SelectField'));
  components.set('select-from-query', () => import('./fields/SelectFromQueryField'));
  components.set('chips', () => import('./fields/ChipsField'));
  components.set('color', () => import('./fields/ColorField'));
  components.set('fonticon-picker', () => import('./fields/FontIconPickerField'));
  components.set('font-picker', () => import('./fields/FontPickerField'));

  // Image/File fields
  components.set('image-select', () => import('./fields/ImageSelectField'));
  components.set('bundle-manager', () => import('./fields/BundleManagerField'));
  components.set('bundle-image-thumbnail', () => import('./fields/BundleImgThumbField'));

  // Container fields
  components.set('accordion', () => import('./fields/AccordionField'));
  components.set('section', () => import('./fields/SectionField'));
  components.set('nest', () => import('./fields/NestField'));
  components.set('pull', () => import('./fields/PullField'));
  components.set('leaf-array', () => import('./fields/LeafArrayField'));

  // Utility fields
  components.set('hidden', () => import('./fields/HiddenField'));
  components.set('empty-line', () => import('./fields/EmptyLineField'));
  components.set('info', () => import('./fields/InfoField'));

  // Special fields
  components.set('eisenhouwer', () => import('./fields/EisenhouwerField'));

  // Not found fallback
  components.set('not-found', () => import('./fields/NotFoundField'));
}

// Call initialization at module load
registerDefaults();

/**
 * Register a custom field type with its lazy-loaded component
 */
export function register(type: string, importer: FieldImporter): void {
  components.set(type, importer);
}

/**
 * Get the lazy importer for a field type
 * Returns 'not-found' field if type is not registered
 */
export function getFieldComponent(type: string): FieldImporter {
  return components.get(type) || components.get('not-found')!;
}

/**
 * Check if a field type is registered
 */
export function hasFieldComponent(type: string): boolean {
  return components.has(type);
}

/**
 * Get all registered field types (excluding 'not-found')
 */
export function getRegisteredTypes(): string[] {
  return Array.from(components.keys()).filter((t) => t !== 'not-found');
}

/**
 * Enable or disable legacy mode
 */
export function setLegacyMode(enabled: boolean): void {
  legacyMode = enabled;
}

/**
 * Check if legacy mode is enabled
 */
export function isLegacyMode(): boolean {
  return legacyMode;
}

// Interface for type inference
export interface FieldRegistry {
  register: typeof register;
  getFieldComponent: typeof getFieldComponent;
  hasFieldComponent: typeof hasFieldComponent;
  getRegisteredTypes: typeof getRegisteredTypes;
  setLegacyMode: typeof setLegacyMode;
  isLegacyMode: typeof isLegacyMode;
}

// Backward compatibility: namespace object
export const fieldRegistry: FieldRegistry = {
  register,
  getFieldComponent,
  hasFieldComponent,
  getRegisteredTypes,
  setLegacyMode,
  isLegacyMode,
};

export default fieldRegistry;
