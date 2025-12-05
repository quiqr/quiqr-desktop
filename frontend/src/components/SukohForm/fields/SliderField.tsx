import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import type { SliderField as SliderFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * SliderField - renders a numeric slider control.
 * Supports min/max/step configuration and optional auto-save.
 */
function SliderField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<number>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as SliderFieldConfig;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue as number, 250);
  };

  const handleChangeCommitted = () => {
    if (config.autoSave === true) {
      saveForm();
    }
  };

  return (
    <FormItemWrapper
      control={
        <>
          <DefaultWrapper>
            <Typography id={`slider-${compositeKey}`} gutterBottom>
              {config.title ?? config.key}
            </Typography>

            <Slider
              defaultValue={config.default}
              aria-labelledby={`slider-${compositeKey}`}
              valueLabelDisplay="auto"
              value={value ?? config.default ?? config.min}
              onChange={handleChange}
              onChangeCommitted={handleChangeCommitted}
              step={config.step}
              marks
              min={config.min}
              max={config.max}
            />
          </DefaultWrapper>
        </>
      }
      iconButtons={iconButtons}
    />
  );
}

export default SliderField;
