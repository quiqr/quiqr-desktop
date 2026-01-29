import { useState } from 'react';
import TextField from '@mui/material/TextField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { FieldAIAssistButton } from '../FieldAIAssistButton';
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

  // New field-level AI assist (template-based)
  if (config.field_prompt_templates && config.field_prompt_templates.length > 0) {
    // Determine if we're in a single or collection context
    const isCollection = meta.collectionKey && meta.collectionItemKey;
    
    iconButtons.push(
      <FieldAIAssistButton
        key="field-ai-assist"
        fieldKey={config.key}
        fieldType="string"
        fieldContent={localValue}
        availableTemplates={config.field_prompt_templates}
        onReplace={(text: string) => {
          setLocalValue(text);
          setValue(text, 0);
        }}
        onAppend={(text: string) => {
          const newValue = localValue ? `${localValue}\n${text}` : text;
          setLocalValue(newValue);
          setValue(newValue, 0);
        }}
        siteKey={meta.siteKey}
        workspaceKey={meta.workspaceKey}
        collectionKey={isCollection ? meta.collectionKey : undefined}
        collectionItemKey={isCollection ? meta.collectionItemKey : undefined}
        singleKey={!isCollection ? meta.collectionItemKey : undefined}
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
