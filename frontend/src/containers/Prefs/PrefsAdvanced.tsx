import { useState, useEffect } from 'react';
import service from './../../services/service';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { UserPreferences } from '../../../types';

function PrefsAdvanced() {
  const [systemGitBinPath, setSystemGitBinPath] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [customOpenInCommand, setCustomOpenInCommand] = useState('');

  useEffect(() => {
    service.api.readConfKey('prefs').then((value: UserPreferences) => {
      setSystemGitBinPath(value.systemGitBinPath ?? '');
      setOpenAiApiKey(value.openAiApiKey ?? '');
      setCustomOpenInCommand(value.customOpenInCommand ?? '');
    });
  }, []);

  const handleCustomOpenInCommandChange = (value: string) => {
    setCustomOpenInCommand(value);
    service.api.saveConfPrefKey('customOpenInCommand', value);
  };

  const handleOpenAiApiKeyChange = (value: string) => {
    setOpenAiApiKey(value);
    service.api.saveConfPrefKey('openAiApiKey', value);
  };

  const handleSystemGitBinPathChange = (value: string) => {
    setSystemGitBinPath(value);
    service.api.saveConfPrefKey('systemGitBinPath', value);
  };

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">Advanced Preferences</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <TextField
          id="openInCommand"
          label="Custom open-in-command"
          helperText='Command to open directory in. E.g. alacritty --title "%site_name" --working-directory "%site_path"'
          variant="outlined"
          sx={{ m: 1 }}
          value={customOpenInCommand}
          onChange={(e) => handleCustomOpenInCommandChange(e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <TextField
          id="openAiApiKey"
          label="openAiApikey"
          helperText="Enter API key to enable AI services. Translate texts, create meta summaries, etc.."
          variant="outlined"
          sx={{ m: 1 }}
          value={openAiApiKey}
          onChange={(e) => handleOpenAiApiKeyChange(e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <TextField
          id="gitBinary"
          label="Path to git binary"
          helperText="providing a path to a installed version of git enables the real git sync target"
          variant="outlined"
          sx={{ m: 1 }}
          value={systemGitBinPath}
          onChange={(e) => handleSystemGitBinPathChange(e.target.value)}
        />
      </Box>
    </Box>
  );
}

export default PrefsAdvanced;
