import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import service from './../../services/service';
import FolderPicker from '../../components/FolderPicker';
import { UserPreferences } from '../../../types';
import { useAppTheme } from '../../contexts/ThemeContext';

function PrefsGeneral() {
  const [dataFolder, setDataFolder] = useState('');
  const [interfaceStyle, setInterfaceStyle] = useState('');
  const { updateTheme } = useAppTheme();

  useEffect(() => {
    service.api.readConfKey('prefs').then((value: UserPreferences) => {
      setInterfaceStyle(value.interfaceStyle ?? 'quiqr10');
      setDataFolder(value.dataFolder ?? '~/Quiqr');
    });
  }, []);

  const handleFolderSelected = (folder: string | null) => {
    if (folder) {
      service.api.saveConfPrefKey('dataFolder', folder);
      setDataFolder(folder);
    }
  };

  const handleInterfaceStyleChange = (value: string) => {
    // Optimistically update the theme immediately
    updateTheme(value);
    setInterfaceStyle(value);
    // Save to backend
    service.api.saveConfPrefKey('interfaceStyle', value);
  };

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">General Preferences</Typography>

      <Box my={2} mx={1}>
        <FolderPicker label="Quiqr Data Folder" selectedFolder={dataFolder} onFolderSelected={handleFolderSelected} />
      </Box>

      <Box my={2}>
        <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
          <InputLabel>Interface Style</InputLabel>
          <Select
            value={interfaceStyle}
            onChange={(e) => handleInterfaceStyleChange(e.target.value)}
            label="Interface Style"
          >
            <MenuItem key="quiqr10" value="quiqr10-light">
              Light
            </MenuItem>
            <MenuItem key="quiqr10-dark" value="quiqr10-dark">
              Dark
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default PrefsGeneral;
