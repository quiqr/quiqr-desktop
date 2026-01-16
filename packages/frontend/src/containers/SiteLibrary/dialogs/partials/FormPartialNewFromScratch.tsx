import { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface FormPartialNewFromScratchProps {
  onChange: (newState: { newTypeScratchConfigFormat: string }) => void;
}

function FormPartialNewFromScratch({ onChange }: FormPartialNewFromScratchProps) {
  const [configFormat, setConfigFormat] = useState('toml');

  const handleChange = (value: string) => {
    onChange({
      newTypeScratchConfigFormat: value,
    });
    setConfigFormat(value);
  };

  return (
    <>
      <FormControl variant="outlined" sx={{ minWidth: 300 }}>
        <InputLabel id="demo-simple-select-outlined-label">Config Format</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={configFormat}
          style={{ width: '150px' }}
          onChange={(e) => handleChange(e.target.value)}
          label="Config Format"
        >
          <MenuItem value="toml">toml</MenuItem>
          <MenuItem value="json">json</MenuItem>
          <MenuItem value="yaml">yaml</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default FormPartialNewFromScratch;
