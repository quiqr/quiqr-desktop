import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import type { FontIconPickerField as FontIconPickerFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * FontIconPickerField - Icon picker dialog for selecting font icons.
 * Currently temporarily disabled pending re-integration of icon picker library.
 *
 * Features when enabled:
 * - Icon picker dialog
 * - Icon preview
 * - Font Awesome or custom icon sets
 */
function FontIconPickerField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string | string[]>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as FontIconPickerFieldConfig;

  const isMultiple = config.multiple === true;
  const currentValue = value ?? (isMultiple ? [] : config.default ?? '');

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // Handle value change (for future use when icon picker is re-enabled)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (newValue: string) => {
    if (newValue !== currentValue) {
      setValue(newValue);
    }

    if (config.autoSave === true) {
      saveForm();
    }
  };

  return (
    <FormItemWrapper
      control={
        <div>
          <label
            style={{
              alignSelf: 'stretch',
              display: 'block',
              lineHeight: '22px',
              fontSize: 12,
              pointerEvents: 'none',
              userSelect: 'none',
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {config.title || 'Icon Picker'}
          </label>
          <div style={{ color: 'red', fontSize: '1rem', marginTop: '8px' }}>
            This component has temporarily been disabled.
          </div>
          {/*
           * When icon picker library is re-integrated:
           *
           * <FormControl>
           *   <InputLabel>{config.title}</InputLabel>
           *   <IconPicker
           *     value={currentValue as string}
           *     onChange={handleChange}
           *     buttonStyles={{ marginTop: '40px', width: '130px' }}
           *     buttonIconStyles={{ fontSize: '100px', color: '#666' }}
           *     containerStyles={{ marginLeft: '230px', height: '300px', width: '500px' }}
           *     size={48}
           *   />
           *   <TextField value={currentValue || ''} disabled fullWidth />
           * </FormControl>
           */}
          {currentValue && (
            <div style={{ marginTop: '8px', color: '#666' }}>
              Current value: {Array.isArray(currentValue) ? currentValue.join(', ') : currentValue}
            </div>
          )}
        </div>
      }
      iconButtons={iconButtons}
    />
  );
}

export default FontIconPickerField;
