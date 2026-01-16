import { useField, useRenderFields } from '../useField';
import type { PullField as PullFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * PullField - groups child fields under a specific key in the document.
 * The state is allocated to `field.group` or `field.key`, creating a nested object.
 * This allows pulling fields into a different location in the data structure.
 */
function PullField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const renderFields = useRenderFields();
  const config = field as PullFieldConfig;

  // The parent path for child fields includes the group key
  // State allocation is handled by FormProvider based on field type
  const groupKey = config.group ?? config.key;
  const childPath = compositeKey.replace(/^root\./, '');
  const parentPath = childPath ? `${childPath}.${groupKey}` : groupKey;

  // Render all child fields (cast needed due to recursive type limitation in Zod)
  return <>{renderFields(parentPath, config.fields as Field[])}</>;
}

export default PullField;
