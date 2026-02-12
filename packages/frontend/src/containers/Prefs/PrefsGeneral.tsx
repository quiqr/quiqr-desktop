import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prefsQueryOptions, prefsMutationOptions } from '../../queries/options';
import FolderPicker from '../../components/FolderPicker';
import { useAppTheme } from '../../contexts/ThemeContext';

function PrefsGeneral() {
  const { updateTheme } = useAppTheme();
  const queryClient = useQueryClient();

  // Query: Fetch preferences
  const { data: prefs } = useQuery(prefsQueryOptions.all());

  // Mutation: Save preference key
  const savePrefMutation = useMutation(prefsMutationOptions.save(queryClient));

  const dataFolder = prefs?.dataFolder ?? '~/Quiqr';
  const interfaceStyle = prefs?.interfaceStyle ?? 'quiqr10-light';

  const handleFolderSelected = (folder: string | null) => {
    if (folder) {
      savePrefMutation.mutate({ prefKey: 'dataFolder', prefValue: folder });
    }
  };

  const handleInterfaceStyleChange = (value: string) => {
    // Optimistically update the theme immediately
    updateTheme(value);
    // Save to backend (automatic cache invalidation via mutation)
    savePrefMutation.mutate({ prefKey: 'interfaceStyle', prefValue: value });
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
