import { createContext, useContext, ReactNode } from 'react';
import type { Field } from '@quiqr/types';

/**
 * Reference to a file in a bundle (used by bundle-manager fields)
 */
export interface FileReference {
  src: string;
  filename?: string;
  thumbnail?: string;
}

/**
 * Extended field config with runtime properties added during form initialization.
 * The compositeKey is computed to create a unique path identifier for each field instance.
 *
 * Uses intersection type since Field is a discriminated union that can't be extended.
 */
export type FieldConfig = Field & {
  compositeKey: string;
};

/**
 * Form metadata used across the form system
 */
export interface FormMeta {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
  collectionItemKey: string;
  prompt_templates: array;
  enableAiAssist: boolean;
  pageUrl: string;
}

/**
 * Main form context value interface.
 *
 * The form uses nested state to match YAML/frontmatter structure.
 * Resources (files) are separated for easier management but merged when saving.
 */
export interface FormContextValue {
  // Nested document state (matches YAML structure)
  document: Record<string, unknown>;

  // Path-based value access
  getValueAtPath: <T>(path: string) => T | undefined;
  setValueAtPath: (path: string, value: unknown, debounce?: number) => void;
  clearValueAtPath: (path: string) => void;

  // Separated resources (for bundle-manager fields)
  // Keyed by compositeKey
  resources: Record<string, FileReference[]>;
  getResources: (key: string) => FileReference[];
  setResources: (key: string, files: FileReference[], markDirty?: boolean) => void;

  // Field configs indexed by compositeKey (preprocessed once at init)
  fieldConfigs: Map<string, FieldConfig>;
  getFieldConfig: (compositeKey: string) => FieldConfig | undefined;

  // Form state
  isDirty: boolean;
  isSubmitting: boolean;

  // Form metadata
  meta: FormMeta;

  // Per-field cache (for expensive computations)
  getCache: (compositeKey: string) => Record<string, unknown>;

  // For rendering nested fields (accordion items, etc.)
  renderFields: (parentPath: string, fields: Field[]) => ReactNode;

  // Save handler
  saveForm: () => Promise<void>;
}

const FormContext = createContext<FormContextValue | null>(null);

/**
 * Hook to access the form context.
 * Must be used within a FormProvider.
 */
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return ctx;
}

/**
 * Consumer component for class components that can't use hooks
 */
export const FormContextConsumer = FormContext.Consumer;

export { FormContext };
export default FormContext;
