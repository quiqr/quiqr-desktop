import { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconRefresh from '@mui/icons-material/Refresh';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { UniqField as UniqFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

function createToken(): string {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}-${s4()}-${s4()}`;
}

/**
 * UniqField - unique identifier field.
 * Auto-generates a token if value is empty.
 */
function UniqField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string>(compositeKey);
  const config = field as UniqFieldConfig;

  // Auto-generate token if empty
  useEffect(() => {
    if (!value || value === '' || typeof value === 'undefined') {
      setValue(createToken());
    }
  }, [value, setValue]);

  const handleGenerateNew = () => {
    setValue(createToken());
  };

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <FormItemWrapper
      control={
        <div>
          <TextField
            value={value ?? ''}
            multiline={config.multiLine === true}
            fullWidth
            label={config.title ?? config.key}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <Button
            startIcon={<IconRefresh />}
            variant="contained"
            style={{ marginBottom: '16px', float: 'right' }}
            onClick={handleGenerateNew}
          >
            Generate new token
          </Button>
        </div>
      }
      iconButtons={iconButtons}
    />
  );
}

export default UniqField;
