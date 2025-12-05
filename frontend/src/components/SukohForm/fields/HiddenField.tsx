import { useEffect } from 'react';
import { useField } from '../useField';
import type { HiddenField as HiddenFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * HiddenField - stores a value without rendering any UI.
 * Initializes to the default value if the current value is undefined.
 */
function HiddenField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string>(compositeKey);
  const config = field as HiddenFieldConfig;

  // Initialize with default value if undefined
  useEffect(() => {
    if (value === undefined && config.default !== undefined) {
      setValue(config.default);
    }
  }, [value, config.default, setValue]);

  // Hidden field renders nothing
  return null;
}

export default HiddenField;
