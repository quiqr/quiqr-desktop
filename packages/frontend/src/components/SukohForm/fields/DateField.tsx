import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { DateField as DateFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

function toStringWithZeros(value: number, length: number): string {
  let str = value.toString();
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function parseDate(val: string | undefined): Date | undefined {
  if (!val) return undefined;
  if (val === 'now') return new Date();

  const values = val.split('-');
  if (values.length !== 3) return undefined;

  const year = parseInt(values[0], 10);
  const month = parseInt(values[1], 10) - 1;
  const day = parseInt(values[2], 10);
  return new Date(year, month, day, 12);
}

function formatDate(date: Date): string {
  const year = toStringWithZeros(date.getFullYear(), 4);
  const month = toStringWithZeros(date.getMonth() + 1, 2);
  const day = toStringWithZeros(date.getDate(), 2);
  return `${year}-${month}-${day}`;
}

/**
 * DateField - date picker field.
 * Stores dates in YYYY-MM-DD format.
 */
function DateField({ compositeKey }: Props) {
  const { field, value, setValue, clearValue } = useField<string>(compositeKey);
  const config = field as DateFieldConfig;

  const dateFormat = config.dateFormat ?? 'dd/MM/yyyy';
  const dateValue = parseDate(value);

  const handleChange = (date: Date | null) => {
    if (date) {
      setValue(formatDate(date));
    }
  };

  const iconButtons: React.ReactNode[] = [];

  if (dateValue) {
    iconButtons.push(
      <IconButton key="clear" aria-label="clear" onClick={() => clearValue()} size="large">
        <HighlightOffIcon />
      </IconButton>
    );
  }

  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <FormItemWrapper
      control={
        <FormControl>
          <InputLabel
            style={{
              marginTop: '-40px',
              fontSize: '12px',
            }}
          >
            {config.title ?? config.key}
          </InputLabel>
          <DatePicker
            className="datepicker"
            dateFormat={dateFormat}
            selected={dateValue}
            onChange={handleChange}
          />
        </FormControl>
      }
      iconButtons={iconButtons}
    />
  );
}

export default DateField;
