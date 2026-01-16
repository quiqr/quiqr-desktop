import { useField, useRenderFields } from '../useField';
import type { SectionField as SectionFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * SectionField - groups child fields with an optional title and visual container.
 * When groupdata is true (default), child values nest under the section key.
 * When groupdata is false, child values remain at the parent level.
 */
function SectionField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const renderFields = useRenderFields();
  const config = field as SectionFieldConfig;

  // Determine the path for child fields based on groupdata setting
  const childPath = compositeKey.replace(/^root\./, '');
  const groupdata = config.groupdata !== false; // Default to true
  const parentPath = groupdata ? childPath : childPath.split('.').slice(0, -1).join('.') || '';

  return (
    <>
      {config.title && (
        <div style={{ fontWeight: 'bold', padding: '16px 0' }}>{config.title}</div>
      )}
      <div
        style={{
          padding: '16px 0px 0px 16px',
          marginBottom: '16px',
          borderLeft: 'solid 10px #eee',
        }}
      >
        {renderFields(parentPath, config.fields as Field[])}
      </div>
    </>
  );
}

export default SectionField;
