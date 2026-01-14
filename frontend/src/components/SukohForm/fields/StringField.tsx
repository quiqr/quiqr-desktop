import { useState } from 'react';
import TextField from '@mui/material/TextField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import AiAssist from '../../AiAssist';
import { useField } from '../useField';
import type { StringField as StringFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * StringField - text input with optional multiLine support.
 * Includes AI assist integration and insert buttons.
 */
function StringField({ compositeKey }: Props) {
  const { field, value, setValue, meta } = useField<string>(compositeKey);
  const config = field as StringFieldConfig;
  const [localValue, setLocalValue] = useState(value ?? config.default ?? '');

  // Sync local value when external value changes
  if (value !== undefined && value !== localValue) {
    setLocalValue(value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    setValue(e.target.value, 0);
  };

  const iconButtons: React.ReactNode[] = [];

  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  if (config.txtInsertButtons) {
    const insertButtons = config.txtInsertButtons.map((text, idx) => (
      <button
        key={idx}
        onClick={() => {
          setLocalValue(text);
          setValue(text, 250);
        }}
      >
        {text}
      </button>
    ));
    iconButtons.push(<span key="insert-buttons">{insertButtons}</span>);
  }

  if (meta.enableAiAssist) {
    iconButtons.push(
      <AiAssist
        key="ai-assist"
        handleSetAiText={(text: string) => {
          setLocalValue(text);
          setValue(text);
        }}
        inField={config}
        inValue={localValue}
      />
    );
  }

  return (
    <FormItemWrapper
      control={
        <TextField
          id={`text-field-${config.key}`}
          onChange={handleChange}
          value={localValue}
          multiline={config.multiLine === true}
          fullWidth
          label={config.title ?? config.key}
        />
      }
      iconButtons={iconButtons}
    />
  );
}

export default StringField;
