import { useMemo } from 'react';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import type { FontPickerField as FontPickerFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * FontPickerField - Google Fonts picker with font preview.
 * Currently temporarily disabled pending re-integration of font picker library.
 *
 * Features when enabled:
 * - Google Fonts picker
 * - Font preview with sample text
 * - Loads fonts dynamically
 * - Supports filtering by families, categories, and variants
 */
function FontPickerField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as FontPickerFieldConfig;

  const currentValue = value ?? config.default ?? '';

  // Generate unique picker ID for font preview styling
  const pickerId = useMemo(() => {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }, []);

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // Handle value change (for future use when font picker is re-enabled)
  const handleChange = (newValue: string) => {
    setValue(newValue);
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
            }}
          >
            {config.title || 'Font Picker'}
          </label>

          {/*
           * When font picker library is re-integrated:
           *
           * <FontPicker
           *   pickerId={pickerId}
           *   apiKey="YOUR_GOOGLE_FONTS_API_KEY"
           *   activeFontFamily={currentValue}
           *   limit={config.limit ?? 10}
           *   families={config.families ?? []}
           *   variants={config.variants ?? []}
           *   categories={config.categories ?? []}
           *   onChange={(nextFont) => {
           *     handleChange(nextFont.family);
           *   }}
           * />
           */}
          <div
            style={{
              color: 'red',
              fontSize: '1rem',
              marginTop: '8px',
            }}
          >
            This component has temporarily been disabled.
          </div>

          {currentValue && (
            <div style={{ marginTop: '8px', color: '#666' }}>
              Current font: {currentValue}
            </div>
          )}

          <div>
            <p
              className={`apply-font-${pickerId}`}
              style={{ fontFamily: currentValue || 'inherit' }}
            >
              the quick brown fox jumps over the lazy dog.
              <br />
              THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.
            </p>
          </div>
        </div>
      }
      iconButtons={iconButtons}
    />
  );
}

export default FontPickerField;
