import { useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { FormContext, FormContextValue, FieldConfig, FileReference, FormMeta } from './FormContext';
import { FieldRenderer } from './FieldRenderer';
import type { Field } from '@quiqr/types';
import Box from '@mui/material/Box';

/**
 * Get a value from a nested object using dot notation with array support.
 * Supports paths like: "foo.bar", "foo[0].bar", "foo.0.bar"
 */
function getAtPath<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!path || path === '') return obj as T;

  const segments = path
    .replace(/\[(\d+)\]/g, '.$1') // Convert [0] to .0
    .split('.')
    .filter(Boolean);

  let current: unknown = obj;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current as T;
}

/**
 * Set a value in a nested object using dot notation with array support.
 * Creates intermediate objects/arrays as needed.
 * Returns a new object (immutable).
 */
function setAtPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  if (!path || path === '') return value as T;

  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: Record<string, unknown> = result as Record<string, unknown>;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const isNextArrayIndex = /^\d+$/.test(nextSegment);

    if (current[segment] === undefined || current[segment] === null) {
      current[segment] = isNextArrayIndex ? [] : {};
    } else if (Array.isArray(current[segment])) {
      current[segment] = [...(current[segment] as unknown[])];
    } else if (typeof current[segment] === 'object') {
      current[segment] = { ...(current[segment] as Record<string, unknown>) };
    }
    current = current[segment] as Record<string, unknown>;
  }

  const lastSegment = segments[segments.length - 1];
  current[lastSegment] = value;

  return result as T;
}

/**
 * Delete a value from a nested object.
 * Returns a new object (immutable).
 */
function deleteAtPath<T extends Record<string, unknown>>(
  obj: T,
  path: string
): T {
  if (!path || path === '') return {} as T;

  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: Record<string, unknown> = result as Record<string, unknown>;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (current[segment] === undefined) return obj; // Path doesn't exist
    if (Array.isArray(current[segment])) {
      current[segment] = [...(current[segment] as unknown[])];
    } else if (typeof current[segment] === 'object') {
      current[segment] = { ...(current[segment] as Record<string, unknown>) };
    }
    current = current[segment] as Record<string, unknown>;
  }

  const lastSegment = segments[segments.length - 1];
  delete current[lastSegment];

  return result as T;
}

/**
 * Generate compositeKey for a field based on its position in the tree.
 */
function generateCompositeKey(field: Field, parentPath: string): string {
  const basePath = parentPath || 'root';
  return `${basePath}.${field.key}`;
}

function processFields(
  fields: Field[],
  parentPath: string,
  configMap: Map<string, FieldConfig>
): FieldConfig[] {
  return fields.map((field) => {
    const compositeKey = generateCompositeKey(field, parentPath);
    const config: FieldConfig = { ...field, compositeKey };
    configMap.set(compositeKey, config);

    if ('fields' in field && Array.isArray(field.fields)) {
      const nestedFields = field.fields as Field[];
      // For section/nest with groupdata: false, children use same parent path
      const childPath =
        (field.type === 'section' || field.type === 'nest') &&
        (field as { groupdata?: boolean }).groupdata === false
          ? parentPath
          : compositeKey;
      processFields(nestedFields, childPath, configMap);
    }

    return config;
  });
}

function getStatePath(
  _field: FieldConfig,
  parentPath: string,
  fieldKey: string
): string {
  if (!parentPath || parentPath === 'root') {
    return fieldKey;
  }
  const cleanParent = parentPath.replace(/^root\./, '');
  return `${cleanParent}.${fieldKey}`;
}

interface DebouncedUpdate {
  timeoutId: ReturnType<typeof setTimeout> | null;
  pendingValue: unknown;
}

interface FormProviderProps {
  children: ReactNode;
  fields: Field[];
  initialValues: Record<string, unknown>;
  initialResources?: Record<string, FileReference[]>;
  meta: FormMeta;
  onSave: (document: Record<string, unknown>, resources: Record<string, FileReference[]>) => Promise<void>;
  onChange?: (document: Record<string, unknown>, isDirty: boolean) => void;
}

export function FormProvider({
  children,
  fields,
  initialValues,
  initialResources = {},
  meta,
  onSave,
  onChange,
}: FormProviderProps) {
  const { fieldConfigs, processedFields } = useMemo(() => {
    const configMap = new Map<string, FieldConfig>();
    const processed = processFields(fields, 'root', configMap);
    return { fieldConfigs: configMap, processedFields: processed };
  }, [fields]);

  const [document, setDocument] = useState<Record<string, unknown>>(initialValues);
  const [resources, setResourcesState] = useState<Record<string, FileReference[]>>(initialResources);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cacheRef = useRef<Record<string, Record<string, unknown>>>({});
  const debounceRef = useRef<Record<string, DebouncedUpdate>>({});
  const originalValuesRef = useRef(initialValues);

  const getValueAtPath = useCallback(
    <T,>(path: string): T | undefined => getAtPath<T>(document, path),
    [document]
  );

  const setValueAtPath = useCallback(
    (path: string, value: unknown, debounce = 0) => {
      const applyUpdate = () => {
        setDocument((prev) => {
          const next = setAtPath(prev, path, value);
          const dirty = JSON.stringify(next) !== JSON.stringify(originalValuesRef.current);
          setIsDirty(dirty);
          onChange?.(next, dirty);
          return next;
        });
      };

      if (debounce > 0) {
        const existing = debounceRef.current[path];
        if (existing?.timeoutId) {
          clearTimeout(existing.timeoutId);
        }
        debounceRef.current[path] = {
          timeoutId: setTimeout(applyUpdate, debounce),
          pendingValue: value,
        };
      } else {
        applyUpdate();
      }
    },
    [onChange]
  );

  const clearValueAtPath = useCallback((path: string) => {
    setDocument((prev) => {
      const next = deleteAtPath(prev, path);
      const dirty = JSON.stringify(next) !== JSON.stringify(originalValuesRef.current);
      setIsDirty(dirty);
      onChange?.(next, dirty);
      return next;
    });
  }, [onChange]);

  const getResources = useCallback(
    (key: string): FileReference[] => resources[key] || [],
    [resources]
  );

  const setResourcesHandler = useCallback(
    (key: string, files: FileReference[]) => {
      setResourcesState((prev) => ({ ...prev, [key]: files }));
      setIsDirty(true);
    },
    []
  );

  const getFieldConfig = useCallback(
    (compositeKey: string): FieldConfig | undefined => fieldConfigs.get(compositeKey),
    [fieldConfigs]
  );

  const getCache = useCallback((compositeKey: string): Record<string, unknown> => {
    if (!cacheRef.current[compositeKey]) {
      cacheRef.current[compositeKey] = {};
    }
    return cacheRef.current[compositeKey];
  }, []);

  const renderFields = useCallback(
    (parentPath: string, fieldsToRender: Field[]): ReactNode => {
      // Process fields to get their compositeKeys
      const basePath = parentPath || 'root';

      return fieldsToRender.map((field) => {
        const compositeKey = `${basePath}.${field.key}`;

        // Ensure field config exists in the map (for dynamically rendered fields)
        if (!fieldConfigs.has(compositeKey)) {
          const config: FieldConfig = { ...field, compositeKey };
          fieldConfigs.set(compositeKey, config);
        }

        return <FieldRenderer key={compositeKey} compositeKey={compositeKey} />;
      });
    },
    [fieldConfigs]
  );

  const saveForm = useCallback(async () => {
    // Flush pending debounced updates before save
    Object.entries(debounceRef.current).forEach(([path, { timeoutId, pendingValue }]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setDocument((prev) => setAtPath(prev, path, pendingValue));
      }
    });
    debounceRef.current = {};

    setIsSubmitting(true);
    try {
      await onSave(document, resources);
      setIsDirty(false);
      originalValuesRef.current = document;
    } finally {
      setIsSubmitting(false);
    }
  }, [document, resources, onSave]);

  const contextValue: FormContextValue = useMemo(
    () => ({
      document,
      getValueAtPath,
      setValueAtPath,
      clearValueAtPath,
      resources,
      getResources,
      setResources: setResourcesHandler,
      fieldConfigs,
      getFieldConfig,
      isDirty,
      isSubmitting,
      meta,
      getCache,
      renderFields,
      saveForm,
    }),
    [
      document,
      getValueAtPath,
      setValueAtPath,
      clearValueAtPath,
      resources,
      getResources,
      setResourcesHandler,
      fieldConfigs,
      getFieldConfig,
      isDirty,
      isSubmitting,
      meta,
      getCache,
      renderFields,
      saveForm,
    ]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem'}}>
        {children}
      </Box>
    </FormContext.Provider>
  );
}

export { getAtPath, setAtPath, deleteAtPath, getStatePath };

export default FormProvider;
