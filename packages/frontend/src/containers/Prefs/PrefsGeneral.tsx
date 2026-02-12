import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import LockIcon from '@mui/icons-material/Lock';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prefsQueryOptions, prefsMutationOptions } from '../../queries/options';
import FolderPicker from '../../components/FolderPicker';
import { useAppTheme } from '../../contexts/ThemeContext';

/**
 * Locked indicator component - shows when a preference is forced by instance settings
 */
function LockedIndicator({ locked, source }: { locked: boolean; source?: string }) {
  if (!locked) return null;

  return (
    <Tooltip title={`This setting is locked by ${source || 'instance configuration'}`}>
      <LockIcon
        fontSize="small"
        sx={{
          ml: 1,
          color: 'warning.main',
          verticalAlign: 'middle',
        }}
      />
    </Tooltip>
  );
}

function PrefsGeneral() {
  const { updateTheme } = useAppTheme();
  const queryClient = useQueryClient();

  // Query: Fetch all effective preferences using unified config API
  const { data: prefs } = useQuery(prefsQueryOptions.all());

  // Query: Check if specific preferences are locked
  const { data: dataFolderMeta } = useQuery(prefsQueryOptions.withMetadata('dataFolder'));
  const { data: interfaceStyleMeta } = useQuery(prefsQueryOptions.withMetadata('interfaceStyle'));

  // Mutation: Save preference using unified config API
  const savePrefMutation = useMutation(prefsMutationOptions.save(queryClient));

  const dataFolder = prefs?.dataFolder ?? '~/Quiqr';
  const interfaceStyle = prefs?.interfaceStyle ?? 'quiqr10-light';

  const isDataFolderLocked = dataFolderMeta?.locked ?? false;
  const isInterfaceStyleLocked = interfaceStyleMeta?.locked ?? false;

  const handleFolderSelected = (folder: string | null) => {
    if (folder && !isDataFolderLocked) {
      savePrefMutation.mutate({ prefKey: 'dataFolder', prefValue: folder });
    }
  };

  const handleInterfaceStyleChange = (value: string) => {
    if (isInterfaceStyleLocked) return;

    // Optimistically update the theme immediately
    updateTheme(value);
    // Save to backend using unified config API
    savePrefMutation.mutate({ prefKey: 'interfaceStyle', prefValue: value });
  };

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">General Preferences</Typography>

      <Box my={2} mx={1}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FolderPicker
            label="Quiqr Data Folder"
            selectedFolder={dataFolder}
            onFolderSelected={handleFolderSelected}
          />
          <LockedIndicator locked={isDataFolderLocked} source={dataFolderMeta?.source} />
        </Box>
        {isDataFolderLocked && (
          <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
            This setting is locked and cannot be changed
          </Typography>
        )}
      </Box>

      <Box my={2}>
        <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
          <InputLabel>Interface Style</InputLabel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={interfaceStyle}
              onChange={(e) => handleInterfaceStyleChange(e.target.value)}
              label="Interface Style"
              disabled={isInterfaceStyleLocked}
              sx={{ flex: 1 }}
            >
              <MenuItem key="quiqr10" value="quiqr10-light">
                Light
              </MenuItem>
              <MenuItem key="quiqr10-dark" value="quiqr10-dark">
                Dark
              </MenuItem>
            </Select>
            <LockedIndicator locked={isInterfaceStyleLocked} source={interfaceStyleMeta?.source} />
          </Box>
        </FormControl>
      </Box>

      {/* Show preference source info for debugging */}
      {(dataFolderMeta || interfaceStyleMeta) && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Configuration Sources:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            {dataFolderMeta && (
              <li>dataFolder: {dataFolderMeta.source}{dataFolderMeta.locked ? ' (locked)' : ''}</li>
            )}
            {interfaceStyleMeta && (
              <li>interfaceStyle: {interfaceStyleMeta.source}{interfaceStyleMeta.locked ? ' (locked)' : ''}</li>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PrefsGeneral;
