import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import LockIcon from '@mui/icons-material/Lock';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prefsQueryOptions, prefsMutationOptions } from '../../queries/options';

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

function PrefsAdvanced() {
  const queryClient = useQueryClient();

  // Query: Fetch all effective preferences using unified config API
  const { data: prefs } = useQuery(prefsQueryOptions.all());

  // Query: Check if specific preferences are locked
  const { data: customOpenInCommandMeta } = useQuery(prefsQueryOptions.withMetadata('customOpenInCommand'));
  const { data: systemGitBinPathMeta } = useQuery(prefsQueryOptions.withMetadata('systemGitBinPath'));
  const { data: logRetentionDaysMeta } = useQuery(prefsQueryOptions.withMetadata('logRetentionDays'));

  // Mutation: Save preference using unified config API
  const savePrefMutation = useMutation(prefsMutationOptions.save(queryClient));

  const customOpenInCommand = prefs?.customOpenInCommand ?? '';
  const systemGitBinPath = prefs?.systemGitBinPath ?? '';
  const logRetentionDays = prefs?.logRetentionDays ?? 30;

  const isCustomOpenInCommandLocked = customOpenInCommandMeta?.locked ?? false;
  const isSystemGitBinPathLocked = systemGitBinPathMeta?.locked ?? false;
  const isLogRetentionDaysLocked = logRetentionDaysMeta?.locked ?? false;

  const handleCustomOpenInCommandChange = (value: string) => {
    if (isCustomOpenInCommandLocked) return;
    savePrefMutation.mutate({ prefKey: 'customOpenInCommand', prefValue: value });
  };

  const handleSystemGitBinPathChange = (value: string) => {
    if (isSystemGitBinPathLocked) return;
    savePrefMutation.mutate({ prefKey: 'systemGitBinPath', prefValue: value });
  };

  const handleLogRetentionDaysChange = (value: string) => {
    if (isLogRetentionDaysLocked) return;
    const days = parseInt(value, 10);
    if (!isNaN(days) && days >= 0 && days <= 365) {
      savePrefMutation.mutate({ prefKey: 'logRetentionDays', prefValue: days });
    }
  };

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">Advanced Preferences</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="openInCommand"
          label="Custom open-in-command"
          helperText='Command to open directory in. E.g. alacritty --title "%site_name" --working-directory "%site_path"'
          variant="outlined"
          sx={{ m: 1, minWidth: 400 }}
          value={customOpenInCommand}
          onChange={(e) => handleCustomOpenInCommandChange(e.target.value)}
          disabled={isCustomOpenInCommandLocked}
        />
        <LockedIndicator locked={isCustomOpenInCommandLocked} source={customOpenInCommandMeta?.source} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="gitBinary"
          label="Path to git binary"
          helperText="Providing a path to an installed version of git enables the real git sync target"
          variant="outlined"
          sx={{ m: 1, minWidth: 400 }}
          value={systemGitBinPath}
          onChange={(e) => handleSystemGitBinPathChange(e.target.value)}
          disabled={isSystemGitBinPathLocked}
        />
        <LockedIndicator locked={isSystemGitBinPathLocked} source={systemGitBinPathMeta?.source} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="logRetentionDays"
          label="Log Retention (days)"
          helperText="Number of days to keep log files (0 = never delete, 7-365 = auto-delete after N days). Default: 30"
          variant="outlined"
          type="number"
          sx={{ m: 1 }}
          value={logRetentionDays}
          onChange={(e) => handleLogRetentionDaysChange(e.target.value)}
          inputProps={{ min: 0, max: 365, step: 1 }}
          disabled={isLogRetentionDaysLocked}
        />
        <LockedIndicator locked={isLogRetentionDaysLocked} source={logRetentionDaysMeta?.source} />
      </Box>

      {/* Show preference source info for debugging */}
      {(customOpenInCommandMeta || systemGitBinPathMeta || logRetentionDaysMeta) && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Configuration Sources:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            {customOpenInCommandMeta && (
              <li>customOpenInCommand: {customOpenInCommandMeta.source}{customOpenInCommandMeta.locked ? ' (locked)' : ''}</li>
            )}
            {systemGitBinPathMeta && (
              <li>systemGitBinPath: {systemGitBinPathMeta.source}{systemGitBinPathMeta.locked ? ' (locked)' : ''}</li>
            )}
            {logRetentionDaysMeta && (
              <li>logRetentionDays: {logRetentionDaysMeta.source}{logRetentionDaysMeta.locked ? ' (locked)' : ''}</li>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PrefsAdvanced;
