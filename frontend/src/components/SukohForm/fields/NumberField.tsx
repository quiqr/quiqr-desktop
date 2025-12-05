import { useState } from 'react';
import TextField from '@mui/material/TextField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { NumberField as NumberFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * NumberField - numeric input field.
 * Parses input as float and clears value when empty.
 */
function NumberField({ compositeKey }: Props) {
  const { field, value, setValue, clearValue } = useField<number>(compositeKey);
  const config = field as NumberFieldConfig;

  const getDisplayValue = () => {
    if (value === undefined || value === null) return '';
    return value.toString();
  };

  const [localValue, setLocalValue] = useState(getDisplayValue());

  // Sync local value when external value changes
  const displayValue = getDisplayValue();
  if (displayValue !== localValue && value !== undefined) {
    setLocalValue(displayValue);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    if (inputValue === '' || inputValue.length === 0) {
      clearValue();
      return;
    }

    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      setValue(parsed, 250);
    }
  };

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <FormItemWrapper
      control={
        <TextField
          id={`number-field-${config.key}`}
          onChange={handleChange}
          value={localValue}
          type="number"
          fullWidth
          label={config.title ?? config.key}
        />
      }
      iconButtons={iconButtons}
    />
  );
}

export default NumberField;
