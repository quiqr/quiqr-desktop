import { useState } from 'react';
import service from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { openExternal } from '../../../../utils/platform';

const regexpHttp = new RegExp('^http(s?)://', 'i');

interface HugoThemeInfo {
  Screenshot?: string;
  MinHugoVersion?: string;
  Name?: string;
  License?: string;
  LicenseLink?: string;
  Homepage?: string;
  Demosite?: string;
  Description?: string;
  ExampleSite?: boolean;
  Author?: string;
  AuthorHomepage?: string;
}

interface FormPartialNewFromHugoThemeProps {
  onSetName: (name: string) => void;
  onValidationDone: (newState: {
    newReadyForNaming: boolean;
    newTypeHugoThemeLastValidatedUrl: string;
    newHugoThemeInfoDict: HugoThemeInfo;
  }) => void;
}

function FormPartialNewFromHugoTheme({ onSetName, onValidationDone }: FormPartialNewFromHugoThemeProps) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [readyForValidation, setReadyForValidation] = useState(false);
  const [lastValidatedUrl, setLastValidatedUrl] = useState('');
  const [provider, setProvider] = useState('');
  const [errorText, setErrorText] = useState('');
  const [themeInfo, setThemeInfo] = useState<HugoThemeInfo>({});

  const resetState = () => {
    setProvider('');
    setErrorText('');
    setBusy(false);
    setLastValidatedUrl('');
    setReadyForValidation(false);
    setThemeInfo({});
  };

  const validateURL = async (urlToValidate: string) => {
    resetState();

    const regexpGitHub = new RegExp('^https://github.com/', 'i');
    const regexpGitLab = new RegExp('^https://gitlab.com/', 'i');
    const regexpSourceHut = new RegExp('^https://git.sr.ht/', 'i');

    setBusy(true);

    if (regexpGitHub.test(urlToValidate)) {
      setProvider('GitHub');
    } else if (regexpGitLab.test(urlToValidate)) {
      setProvider('GitLab');
    } else if (regexpSourceHut.test(urlToValidate)) {
      setProvider('SourceHut');
    }

    const urlparts = urlToValidate.split('/');
    let siteNameFromUrl = urlparts.pop() || urlparts.pop();
    if (siteNameFromUrl?.includes('.')) {
      siteNameFromUrl = siteNameFromUrl.split('.').pop();
    }

    if (siteNameFromUrl && siteNameFromUrl !== '') {
      onSetName(siteNameFromUrl);
    }

    try {
      const response = await service.api.hugotheme_git_repo_show(urlToValidate);
      if (response) {
        setThemeInfo(response);
        setBusy(false);
        setLastValidatedUrl(urlToValidate);

        onValidationDone({
          newReadyForNaming: true,
          newTypeHugoThemeLastValidatedUrl: urlToValidate,
          newHugoThemeInfoDict: response,
        });
      }
    } catch (e) {
      service.api.logToConsole(e);
      setErrorText('It seems that the URL does not point to a valid git repository');
      setBusy(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);

    if (value && value !== '') {
      if (lastValidatedUrl !== value) {
        if (!regexpHttp.test(value)) {
          setErrorText('URL is invalid. Currently only http:// or https:// are supported.');
          setReadyForValidation(false);
        } else {
          setErrorText('');
          setReadyForValidation(true);
        }
      } else {
        setErrorText('');
        setReadyForValidation(false);
      }
    }
  };

  return (
    <>
      <Box my={3}>
        <p>Enter a public git URL with a Hugo theme.</p>
      </Box>
      <Box my={3} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          id="standard-full-width"
          autoFocus
          label="Hugo Theme Git URL"
          value={url}
          variant="outlined"
          onChange={(e) => handleUrlChange(e.target.value)}
          error={errorText !== ''}
          helperText={errorText}
        />
        <Button
          variant="contained"
          disabled={busy || !readyForValidation}
          sx={{ ml: 1, width: 400, height: 55 }}
          color="primary"
          onClick={() => validateURL(url)}
        >
          Validate Remote Repository
        </Button>
      </Box>

      <Box my={3}>
        <Card sx={{ margin: 0, display: 'flex' }} variant="outlined">
          <CardMedia
            sx={{ width: 351 }}
            image={themeInfo.Screenshot ?? ScreenShotPlaceholder}
            title="site screenshot"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <TableContainer>
                <Table size="small" aria-label="a dense table">
                  <TableBody>
                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Hugo Theme Git URL
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{lastValidatedUrl}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Git Provider
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{provider}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Example Content
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{themeInfo.ExampleSite ? 'Present' : ''}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Name
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {busy && <CircularProgress size={20} />} {themeInfo.Name}
                        {themeInfo.Homepage && (
                          <Button onClick={async () => await openExternal(themeInfo.Homepage!)}>Homepage</Button>
                        )}
                        {themeInfo.Demosite && (
                          <Button onClick={async () => await openExternal(themeInfo.Demosite!)}>Demo</Button>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Description
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{themeInfo.Description}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Author
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {themeInfo.AuthorHomepage ? (
                          <Button onClick={async () => await openExternal(themeInfo.AuthorHomepage!)}>
                            {themeInfo.Author}
                          </Button>
                        ) : (
                          themeInfo.Author
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Licence
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {themeInfo.LicenseLink ? (
                          <Button onClick={async () => await openExternal(themeInfo.LicenseLink!)}>
                            {themeInfo.License}
                          </Button>
                        ) : (
                          themeInfo.License
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Minimal Hugo version
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{themeInfo.MinHugoVersion}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Box>
        </Card>
      </Box>
    </>
  );
}

export default FormPartialNewFromHugoTheme;
