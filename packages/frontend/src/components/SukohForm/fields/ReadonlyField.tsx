import TextField from '@mui/material/TextField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { ReadonlyField as ReadonlyFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * ReadonlyField - displays a read-only text value.
 * The field is disabled and cannot be edited by the user.
 */
function ReadonlyField({ compositeKey }: Props) {
  const { field, value } = useField<string>(compositeKey);
  const config = field as ReadonlyFieldConfig;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <FormItemWrapper
      control={
        <TextField
          value={value ?? config.default ?? ''}
          disabled
          multiline={config.multiLine === true}
          fullWidth
          label={config.title ?? config.key}
        />
      }
      iconButtons={iconButtons}
    />
  );
}

export default ReadonlyField;
