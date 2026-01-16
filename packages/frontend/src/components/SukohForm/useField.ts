import { useMemo } from 'react';
import { useFormContext, FieldConfig, FileReference } from './FormContext';

export interface UseFieldResult<T = unknown> {
  field: FieldConfig;
  value: T | undefined;
  setValue: (value: T, debounce?: number) => void;
  clearValue: () => void;
  cache: Record<string, unknown>;
  meta: typeof useFormContext extends () => infer R ? R extends { meta: infer M } ? M : never : never;
}

export function useField<T = unknown>(compositeKey: string): UseFieldResult<T> {
  const form = useFormContext();
  const field = form.getFieldConfig(compositeKey);

  if (!field) {
    throw new Error(`Field config not found: ${compositeKey}`);
  }

  const valuePath = useMemo(() => compositeKey.replace(/^root\./, ''), [compositeKey]);

  const value = form.getValueAtPath<T>(valuePath);
  const cache = form.getCache(compositeKey);

  const setValue = useMemo(
    () => (newValue: T, debounce?: number) => {
      form.setValueAtPath(valuePath, newValue, debounce);
    },
    [form, valuePath]
  );

  const clearValue = useMemo(
    () => () => {
      form.clearValueAtPath(valuePath);
    },
    [form, valuePath]
  );

  return { field, value, setValue, clearValue, cache, meta: form.meta };
}

export interface UseResourcesResult {
  resources: FileReference[];
  setResources: (files: FileReference[]) => void;
  addResource: (file: FileReference) => void;
  removeResource: (src: string) => void;
  updateResource: (src: string, updates: Partial<FileReference>) => void;
}

export function useResources(compositeKey: string): UseResourcesResult {
  const form = useFormContext();
  const resources = form.getResources(compositeKey);

  const setResources = useMemo(
    () => (files: FileReference[]) => {
      form.setResources(compositeKey, files);
    },
    [form, compositeKey]
  );

  const addResource = useMemo(
    () => (file: FileReference) => {
      form.setResources(compositeKey, [...resources, file]);
    },
    [form, compositeKey, resources]
  );

  const removeResource = useMemo(
    () => (src: string) => {
      form.setResources(
        compositeKey,
        resources.filter((r) => r.src !== src)
      );
    },
    [form, compositeKey, resources]
  );

  const updateResource = useMemo(
    () => (src: string, updates: Partial<FileReference>) => {
      form.setResources(
        compositeKey,
        resources.map((r) => (r.src === src ? { ...r, ...updates } : r))
      );
    },
    [form, compositeKey, resources]
  );

  return { resources, setResources, addResource, removeResource, updateResource };
}

export function useRenderFields() {
  return useFormContext().renderFields;
}

export function useFormState() {
  const form = useFormContext();
  return {
    isDirty: form.isDirty,
    isSubmitting: form.isSubmitting,
    saveForm: form.saveForm,
    document: form.document,
    meta: form.meta,
  };
}

export default useField;
