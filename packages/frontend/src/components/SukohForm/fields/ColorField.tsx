import TextField from '@mui/material/TextField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import type { ColorField as ColorFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * ColorField - renders a color picker input.
 * Uses native HTML color input with optional auto-save.
 */
function ColorField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as ColorFieldConfig;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setValue(e.target.value, 250);

      if (config.autoSave === true) {
        saveForm();
      }
    }
  };

  return (
    <FormItemWrapper
      control={
          <DefaultWrapper>
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
              {config.title ?? config.key}
            </label>

            <TextField
              type="color"
              value={value ?? '#ffffff'}
              onChange={handleChange}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  style: { width: '100px' },
                },
              }}
            />
          </DefaultWrapper>

      }
      iconButtons={iconButtons}
    />
  );
}

export default ColorField;
