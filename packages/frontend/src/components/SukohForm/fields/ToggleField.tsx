import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { BooleanField as BooleanFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * ToggleField - renders a boolean toggle switch.
 * Maps to field type 'boolean' in the schema.
 */
function ToggleField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<boolean>(compositeKey);
  const config = field as BooleanFieldConfig;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  const handleChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setValue(checked);
  };

  return (
    <FormItemWrapper
      control={
        <FormControlLabel
          label={config.title ?? config.key}
          control={
            <Switch
              checked={value === true}
              onChange={handleChange}
            />
          }
        />
      }
      iconButtons={iconButtons}
    />
  );
}

export default ToggleField;
