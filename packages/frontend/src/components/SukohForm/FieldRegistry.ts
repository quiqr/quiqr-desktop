import type { ComponentType } from 'react';

export interface FieldComponentProps {
  compositeKey: string;
}

export type FieldImporter = () => Promise<{
  default: ComponentType<FieldComponentProps>;
}>;

class FieldRegistry {
  private components: Map<string, FieldImporter> = new Map();
  private legacyMode = true;

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    // Text fields
    this.components.set('string', () => import('./fields/StringField'));
    this.components.set('markdown', () => import('./fields/MarkdownField'));
    this.components.set('easymde', () => import('./fields/EasyMdeField'));
    this.components.set('readonly', () => import('./fields/ReadonlyField'));
    this.components.set('uniq', () => import('./fields/UniqField'));

    // Number fields
    this.components.set('number', () => import('./fields/NumberField'));
    this.components.set('slider', () => import('./fields/SliderField'));

    // Boolean fields
    this.components.set('boolean', () => import('./fields/ToggleField'));

    // Date fields
    this.components.set('date', () => import('./fields/DateField'));

    // Selection fields
    this.components.set('select', () => import('./fields/SelectField'));
    this.components.set('select-from-query', () => import('./fields/SelectFromQueryField'));
    this.components.set('chips', () => import('./fields/ChipsField'));
    this.components.set('color', () => import('./fields/ColorField'));
    this.components.set('fonticon-picker', () => import('./fields/FontIconPickerField'));
    this.components.set('font-picker', () => import('./fields/FontPickerField'));

    // Image/File fields
    this.components.set('image-select', () => import('./fields/ImageSelectField'));
    this.components.set('bundle-manager', () => import('./fields/BundleManagerField'));
    this.components.set('bundle-image-thumbnail', () => import('./fields/BundleImgThumbField'));

    // Container fields
    this.components.set('accordion', () => import('./fields/AccordionField'));
    this.components.set('section', () => import('./fields/SectionField'));
    this.components.set('nest', () => import('./fields/NestField'));
    this.components.set('pull', () => import('./fields/PullField'));
    this.components.set('leaf-array', () => import('./fields/LeafArrayField'));

    // Utility fields
    this.components.set('hidden', () => import('./fields/HiddenField'));
    this.components.set('empty-line', () => import('./fields/EmptyLineField'));
    this.components.set('info', () => import('./fields/InfoField'));

    // Special fields
    this.components.set('eisenhouwer', () => import('./fields/EisenhouwerField'));

    // Not found fallback
    this.components.set('not-found', () => import('./fields/NotFoundField'));
  }

  register(type: string, importer: FieldImporter): this {
    this.components.set(type, importer);
    return this;
  }

  get(type: string): FieldImporter {
    return this.components.get(type) || this.components.get('not-found')!;
  }

  has(type: string): boolean {
    return this.components.has(type);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys()).filter((t) => t !== 'not-found');
  }

  setLegacyMode(enabled: boolean): void {
    this.legacyMode = enabled;
  }

  isLegacyMode(): boolean {
    return this.legacyMode;
  }
}

export const fieldRegistry = new FieldRegistry();

export default fieldRegistry;
