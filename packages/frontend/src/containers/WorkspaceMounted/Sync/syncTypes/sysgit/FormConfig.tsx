import { useState, useEffect } from 'react';
import service from '../../../../../services/service';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import { SysgitPublishConf } from '../../../../../../types';
import { copyToClipboard } from '../../../../../utils/platform';

interface PublishConfig {
  key: string;
  config: SysgitPublishConf;
}

interface FormConfigProps {
  publishConf?: PublishConfig;
  setData: (data: SysgitPublishConf) => void;
  setSaveEnabled: (enabled: boolean) => void;
}

const defaultPubData: SysgitPublishConf = {
  type: 'sysgit',
  title: '',
  git_server_url: '',
  email: '',
  branch: 'main',
  deployPrivateKey: '',
  deployPublicKey: 'xxxx',
  publishScope: 'build',
  setGitHubActions: false,
  overrideBaseURLSwitch: false,
  overrideBaseURL: '',
  pullOnly: false,
  backupAtPull: false,
  syncSelection: '',
  CNAMESwitch: false,
  CNAME: '',
};

function FormConfig({ publishConf, setData, setSaveEnabled }: FormConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [gitHubActionsSwitchEnable, setGitHubActionsSwitchEnable] = useState(false);
  const [syncSelectionSwitchEnable, setSyncSelectionSwitchEnable] = useState(true);
  const [keyPairBusy, setKeyPairBusy] = useState(true);
  const [pubData, setPubData] = useState<SysgitPublishConf>(defaultPubData);

  const getKeyPair = async () => {
    setKeyPairBusy(true);
    try {
      const resp = await service.api.createKeyPairGithub();
      updatePubData({ deployPrivateKey: resp.privateKey, deployPublicKey: resp.publicKey });
      setKeyPairBusy(false);
    } catch (e) {
      service.api.logToConsole(e, 'ERRR');
      setKeyPairBusy(false);
    }
  };

  useEffect(() => {
    if (publishConf) {
      setPubData(publishConf.config);
      if (publishConf.config.publishScope !== 'build') {
        setGitHubActionsSwitchEnable(true);
      }
      setKeyPairBusy(false);
    } else {
      getKeyPair();
    }
  }, []);

  const updatePubData = (newData: Partial<SysgitPublishConf>) => {
    const updated = { ...pubData, ...newData };
    setPubData(updated);
    setData(updated);
    setSaveEnabled(updated.git_server_url !== '' && updated.branch !== '' && updated.email !== '');
  };

  const renderGitHubActionsForm = () => {
    if (pubData.pullOnly === true) {
      return null;
    }

    return (
      <>
        <Box my={1}>
          <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
            <InputLabel id="demo-simple-select-outlined-label">Publish Source or Build</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={pubData.publishScope}
              onChange={(e) => {
                if (e.target.value === 'build') {
                  updatePubData({ publishScope: e.target.value, setGitHubActions: false, syncSelection: '' });
                  setGitHubActionsSwitchEnable(false);
                  setSyncSelectionSwitchEnable(false);
                } else {
                  updatePubData({ publishScope: e.target.value });
                  setGitHubActionsSwitchEnable(true);
                  setSyncSelectionSwitchEnable(true);
                }
              }}
              label="Publish Source and Build"
            >
              <MenuItem value="build">Publish only build files</MenuItem>
              <MenuItem value="source">Publish only source files</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box my={1}>
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
            sx={{ m: 1, width: '20ch' }}
          />
        </Box>
      </>
    );
  };

  return (
    <>
      <Box my={1} sx={{ display: 'flex' }}>
        <TextField
          id="target name"
          label="Sync name"
          helperText="This helps identifying the correct Synchronization target"
          variant="outlined"
          sx={{ m: 1 }}
          value={pubData.title}
          onChange={(e) => updatePubData({ title: e.target.value })}
        />
      </Box>
      <Box my={1} sx={{ display: 'flex' }}>
        <TextField
          id="git_server_url"
          label="git server url (only SSH supported)"
          helperText="e.g: git@github.com:quiqr/quiqr-template-kitchen-sink.git"
          variant="outlined"
          sx={{ m: 1 }}
          value={pubData.git_server_url}
          onChange={(e) => updatePubData({ git_server_url: e.target.value })}
        />

        <TextField
          id="email"
          label="E-mail"
          helperText="E-mail address to use for commit messages"
          variant="outlined"
          sx={{ m: 1 }}
          value={pubData.email}
          onChange={(e) => updatePubData({ email: e.target.value })}
        />
      </Box>
      <Box my={1}>
        <TextField
          id="branch"
          label="Branch"
          onChange={(e) => updatePubData({ branch: e.target.value })}
          value={pubData.branch}
          helperText="Target Branch"
          variant="outlined"
          sx={{ m: 1 }}
        />
      </Box>
      <Box my={1}>
        {keyPairBusy ? (
          <FormControl sx={{ m: 1 }}>
            <InputLabel shrink htmlFor="progress" sx={{ ml: 3, backgroundColor: 'white' }}>
              Deploy Public Key
            </InputLabel>
            <Paper variant="outlined" id="progress" elevation={1} sx={{ m: 1, width: '60ch', p: 3 }}>
              <LinearProgress />
            </Paper>
          </FormControl>
        ) : (
          <FormControl sx={{ m: 1, width: '60ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Deploy Public Key</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={pubData.deployPublicKey}
              onChange={() => {}}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle deploy key visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
        <Button
          sx={{ m: 1, mt: 2 }}
          disabled={keyPairBusy}
          onClick={async () => {
            await copyToClipboard(pubData.deployPublicKey);
          }}
          variant="contained"
        >
          Copy
        </Button>
        <Button sx={{ m: 1, mt: 2 }} onClick={getKeyPair} disabled={keyPairBusy} color="secondary" variant="contained">
          Re-generate
        </Button>
      </Box>
      <Box my={1}>
        <FormControlLabel
          sx={{ m: 1, mt: 2 }}
          control={
            <Switch
              checked={pubData.pullOnly}
              onChange={(e) => {
                updatePubData({ pullOnly: e.target.checked, publishScope: 'source' });
                setSyncSelectionSwitchEnable(true);
              }}
              name="pullOnly"
              color="primary"
            />
          }
          label="Pull Only"
        />

        <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
          <InputLabel id="demo-simple-select-outlined-label">Selective Synchronization</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            disabled={!syncSelectionSwitchEnable}
            id="select-sync-selection"
            value={pubData.syncSelection}
            onChange={(e) => updatePubData({ syncSelection: e.target.value })}
            label="Sync Selection"
          >
            <MenuItem value="all">Sync All</MenuItem>
            <MenuItem value="themeandquiqr">Sync only Design and Model</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {renderGitHubActionsForm()}
    </>
  );
}

export default FormConfig;

