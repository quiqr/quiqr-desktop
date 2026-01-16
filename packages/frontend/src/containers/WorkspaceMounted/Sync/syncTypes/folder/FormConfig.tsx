import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FolderPicker from '../../../../../components/FolderPicker';
import { FolderPublishConf } from '../../../../../../types';

interface PublishConfig {
  key: string;
  config: FolderPublishConf;
}

interface FormConfigProps {
  publishConf?: PublishConfig;
  setData: (data: FolderPublishConf) => void;
  setSaveEnabled: (enabled: boolean) => void;
}

const defaultPubData: FolderPublishConf = {
  type: 'folder',
  path: '',
  publishScope: 'build',
  overrideBaseURLSwitch: false,
  overrideBaseURL: '',
};

function FormConfig({ publishConf, setData, setSaveEnabled }: FormConfigProps) {
  const [pubData, setPubData] = useState<FolderPublishConf>(defaultPubData);

  useEffect(() => {
    if (publishConf) {
      setPubData(publishConf.config);
    }
  }, [publishConf]);

  const updatePubData = (newData: Partial<FolderPublishConf>) => {
    const updated = { ...pubData, ...newData };
    setPubData(updated);
    setData(updated);
    setSaveEnabled(updated.path !== null && updated.path !== '');
  };

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <FolderPicker
          label="Export folder"
          selectedFolder={pubData.path}
          onFolderSelected={(folder) => updatePubData({ path: folder })}
        />
      </div>

      <Box my={2}>
        <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
          <InputLabel id="demo-simple-select-outlined-label">Publish Source and Build</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={pubData.publishScope}
            onChange={(e) => updatePubData({ publishScope: e.target.value })}
            label="Publish Source and Build"
          >
            <MenuItem value="build">Publish only build files</MenuItem>
            <MenuItem value="source">Publish only source files</MenuItem>
            <MenuItem value="build_and_source">Publish source and build files</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box my={2}>
        <FormControlLabel
          sx={{ m: 1, mt: 2 }}
          control={
            <Switch
              checked={pubData.overrideBaseURLSwitch}
              onChange={(e) => {
                if (pubData.overrideBaseURLSwitch) {
                  updatePubData({ overrideBaseURLSwitch: e.target.checked, overrideBaseURL: '' });
                } else {
                  updatePubData({ overrideBaseURLSwitch: e.target.checked });
                }
              }}
              name="overrideBaseURLSwitch"
              color="primary"
            />
          }
          label="Override BaseURL"
        />

        <TextField
          id="baseUrl"
          label="BaseURL"
          disabled={!pubData.overrideBaseURLSwitch}
          onChange={(e) => updatePubData({ overrideBaseURL: e.target.value })}
          value={pubData.overrideBaseURL}
          helperText="Override Hugo Configuration with new baseURL"
          variant="outlined"
          sx={{ m: 1 }}
        />
      </Box>
    </>
  );
}

export default FormConfig;
