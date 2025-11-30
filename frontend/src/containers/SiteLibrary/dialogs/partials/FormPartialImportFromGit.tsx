import React, { useState, useEffect, useCallback } from "react";
import service from "../../../../services/service";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import ScreenShotPlaceholder from "../../../../img-assets/screenshot-placeholder.png";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import OutlinedInput from "@mui/material/OutlinedInput";
import clsx from "clsx";

const regexpHttp = new RegExp("^http(s?)://", "i");

const FormPartialNewFromScratch = (props) => {
  const [importTypeGitUrl, setImportTypeGitUrl] = useState("");
  const [importTypeGitBusy, setImportTypeGitBusy] = useState(false);
  const [importTypeGitReadyForValidation, setImportTypeGitReadyForValidation] = useState(false);
  const [importTypeGitLastValidatedUrl, setImportTypeGitLastValidatedUrl] = useState("");
  const [importTypeGitProvider, setImportTypeGitProvider] = useState("");
  const [importTypeGitErrorText, setImportTypeGitErrorText] = useState("");
  const [importTypeGitScreenshot, setImportTypeGitScreenshot] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [privReadyForVal, setPrivReadyForVal] = useState(false);
  const [privBusy, setPrivBusy] = useState(false);
  const [privData, setPrivData] = useState({
    type: "github",
    username: "",
    email: "",
    repository: "",
    branch: "main",
    deployPrivateKey: "",
    deployPublicKey: "",
  });
  const [keyPairBusy, setKeyPairBusy] = useState(false);
  const [importHugoTheme, setImportHugoTheme] = useState("");
  const [importQuiqrModel, setImportQuiqrModel] = useState("");
  const [importQuiqrForms, setImportQuiqrForms] = useState("");
  const [useDeployKey, setUseDeployKey] = useState(false);

  const updatePubData = useCallback(
    (newData, callback = null) => {
      const newPrivData = { ...privData, ...newData };
      setPrivData(newPrivData);

      if (newPrivData.username !== "" && newPrivData.repository !== "" && newPrivData.branch !== "" && newPrivData.email !== "") {
        setPrivReadyForVal(true);
        props.onSetName(newPrivData.repository);
        props.onValidationDone({
          newReadyForNaming: true,
          gitPrivateRepo: true,
          privData: newPrivData,
        });
      } else {
        setPrivReadyForVal(false);
      }
      typeof callback === "function" && callback();
    },
    [privData, props]
  );

  const getKeyPair = useCallback(() => {
    setKeyPairBusy(true);

    let promise = service.api.createKeyPairGithub();

    promise.then(
      (resp) => {
        updatePubData({ deployPrivateKey: resp.keyPair[0], deployPublicKey: resp.keyPair[1] }, () => {
          setKeyPairBusy(false);
        });
      },
      (e) => {
        service.api.logToConsole(e, "ERRR");
        setKeyPairBusy(false);
      }
    );
  }, [updatePubData]);

  const preValidateURL = useCallback((url) => {
    if (!regexpHttp.test(url)) {
      setImportTypeGitErrorText("URL is invalid. Currently only http:// or https:// are supported.");
      setImportTypeGitReadyForValidation(false);
      return false;
    } else {
      setImportTypeGitErrorText("");
      setImportTypeGitReadyForValidation(true);
      return true;
    }
  }, []);

  const resetImportTypeGitState = useCallback(() => {
    setImportTypeGitProvider("");
    setImportTypeGitErrorText("");
    setImportTypeGitBusy(false);
    setImportTypeGitLastValidatedUrl("");
    setImportTypeGitReadyForValidation(false);
    setImportTypeGitScreenshot(null);
    setImportHugoTheme("");
    setImportQuiqrModel("");
    setImportQuiqrForms("");
  }, []);

  const validateURL = useCallback(
    (url) => {
      props.onSetVersion();
      resetImportTypeGitState();

      const regexpGitHub = new RegExp("^https://github.com/", "i");
      const regexpGitLab = new RegExp("^https://gitlab.com/", "i");
      const regexpSourceHut = new RegExp("^https://git.sr.ht/", "i");

      setImportTypeGitBusy(true);

      if (regexpGitHub.test(url)) {
        setImportTypeGitProvider("GitHub");
      } else if (regexpGitLab.test(url)) {
        setImportTypeGitProvider("GitLab");
      } else if (regexpSourceHut.test(url)) {
        setImportTypeGitProvider("SourceHut");
      } else {
        setImportTypeGitProvider("Unknown");
      }

      var urlparts = url.split("/");
      var siteNameFromUrl = urlparts.pop() || urlparts.pop(); // handle potential trailing slash
      if (siteNameFromUrl.includes(".")) siteNameFromUrl = siteNameFromUrl.split(".").pop();

      if (siteNameFromUrl !== "") {
        props.onSetName(siteNameFromUrl);
      }

      service.api
        .quiqr_git_repo_show(url)
        .then((response) => {
          if (response) {
            setImportTypeGitScreenshot(response.Screenshot ? response.Screenshot : null);
            setImportHugoTheme(response.HugoTheme ? response.HugoTheme : null);
            setImportQuiqrModel(response.QuiqrModel ? response.QuiqrModel : null);
            setImportQuiqrForms(response.QuiqrFormsEndPoints ? response.QuiqrFormsEndPoints : null);
            setImportTypeGitBusy(false);
            setImportTypeGitLastValidatedUrl(url);

            if (response.HugoVersion) {
              props.onSetVersion(response.HugoVersion);
            }

            props.onValidationDone({
              newReadyForNaming: true,
              importTypeGitLastValidatedUrl: url,
              importTypeGitInfoDict: response,
            });
          }
        })
        .catch(() => {
          setImportTypeGitErrorText("It seems that the URL does not point to a valid git repository");
          setImportTypeGitBusy(false);
        });
    },
    [props, resetImportTypeGitState]
  );

  useEffect(() => {
    if (props.importSiteURL && importTypeGitUrl !== props.importSiteURL) {
      setImportTypeGitUrl(props.importSiteURL);
      if (preValidateURL(props.importSiteURL)) {
        validateURL(props.importSiteURL);
      }
    }
  }, [props.importSiteURL, importTypeGitUrl, preValidateURL, validateURL]);



  const validatePrivRepo = useCallback(() => {
    props.onSetVersion();
    props.onValidationDone({
      newReadyForNaming: true,
      gitPrivateRepo: true,
      privData: privData,
    });
  }, [props, privData]);

  const renderDeployKeyForm = useCallback(() => {
    return (
      <React.Fragment>
        <Box my={1}>
          <TextField
            id='username-organization'
            label='Username / Organization'
            helperText='GitHub username or organization containing the target repository'
            variant='outlined'
            sx={{
              margin: theme => theme.spacing(1)
            }}
            value={privData.username}
            onChange={(e) => {
              updatePubData({ username: e.target.value });
            }}
          />
          <TextField
            id='email'
            label='E-mail'
            helperText='E-mail address to use for commit messagessages'
            variant='outlined'
            sx={{
              margin: theme => theme.spacing(1)
            }}            value={privData.email}
            onChange={(e) => {
              updatePubData({ email: e.target.value });
            }}
          />
        </Box>
        <Box my={1}>
          <TextField
            id='repository'
            label='Repository'
            helperText='Target Repository'
            variant='outlined'
            sx={{
              margin: theme => theme.spacing(1)
            }}            value={privData.repository}
            onChange={(e) => {
              updatePubData({ repository: e.target.value });
            }}
          />

          {/*
          <TextField
            id="branch"
            label="Branch"
            onChange={(e)=>{
              this.updatePubData({branch: e.target.value });
            }}
            value={this.state.privData.branch}
            helperText="Target Branch"
            variant="outlined"
            sx={{
              margin: theme => theme.spacing(1)
            }}          />
          */}
        </Box>
        <Box my={1}>
          {keyPairBusy ? (
            <FormControl sx={{
               margin: theme => theme.spacing(1),
            }}>
              <InputLabel shrink htmlFor='progress' sx={ {
                marginLeft: theme => theme.spacing(3),
                backgroundColor: "white",
              }}>
                Deploy Public Key
              </InputLabel>
              <Paper variant='outlined' id='progress' elevation={1} sx={{
                height: "160px",
                padding: "40px",
                cursor: "pointer",
                backgroundColor: "#eee",
                "&:hover": {
                  backgroundColor: "#ccc",
                },
              }}>
                <LinearProgress />
              </Paper>
            </FormControl>
          ) : (
            <React.Fragment>
              <FormControl sx={{
                  margin: theme => theme.spacing(1),
                  width: "60ch",
                }} 
                variant='outlined'
              >
                <InputLabel htmlFor='outlined-adornment-password'>Deploy Public Key</InputLabel>

                <OutlinedInput
                  id='outlined-adornment-password'
                  type={showPassword ? "text" : "password"}
                  value={privData.deployPublicKey}
                  onChange={(e) => {
                    //this.updatePubData({deployPublicKey: e.target.value });
                  }}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle deploy key visibility'
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        edge='end'
                        size='large'>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </React.Fragment>
          )}
          <Button
            sx={{
              margin: theme => theme.spacing(1),
              marginTop: theme => theme.spacing(2),
            }}
            disabled={keyPairBusy}
            onClick={() => {
              const { clipboard } = window.require("electron");
              clipboard.writeText(privData.deployPublicKey);
            }}
            variant='contained'>
            Copy
          </Button>
          <Button
            sx={{
              margin: theme => theme.spacing(1),
              marginTop: theme => theme.spacing(2),
            }}
            onClick={() => {
              getKeyPair();
            }}
            disabled={keyPairBusy}
            color='secondary'
            variant='contained'>
            Re-generate
          </Button>
        </Box>
      </React.Fragment>
    );
  }, [privData, keyPairBusy, showPassword, updatePubData, getKeyPair]);

  const renderPublicField = useCallback(() => {
    return (
      <React.Fragment>
        <Box my={2}>Enter a public git URL with a quiqr website or template to import.</Box>
        <Box my={2} sx={{ display: "flex" }}>
          <TextField
            fullWidth
            id='standard-full-width'
            autoFocus
            label='Git URL'
            value={importTypeGitUrl}
            variant='outlined'
            onChange={(e) => {
              setImportTypeGitUrl(e.target.value);

              if (e.target.value && e.target.value !== "") {
                if (importTypeGitLastValidatedUrl !== e.target.value) {
                  preValidateURL(e.target.value);
                } else {
                  setImportTypeGitErrorText("");
                  setImportTypeGitReadyForValidation(false);
                }
              }
            }}
            error={importTypeGitErrorText === "" ? false : true}
            helperText={importTypeGitErrorText}
          />
          <Button
            variant='contained'
            disabled={importTypeGitBusy || !importTypeGitReadyForValidation ? true : false}
            sx={{ 
              marginLeft: theme => theme.spacing(1),
              width: 400,
              height: 55,
            }}
            color='primary'
            onClick={() => {
              validateURL(importTypeGitUrl);
            }}>
            Validate Remote Repository
          </Button>
        </Box>

        <Box my={2}>
          <Card sx={{
            display: 'flex'
          } } variant='outlined'>
            <CardMedia sx={{ width: 351 }} image={importTypeGitScreenshot ? importTypeGitScreenshot : ScreenShotPlaceholder} title='site screenshot' />
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <TableContainer component={Paper}>
                  <Table size='small' aria-label='a dense table'>
                    <TableBody>
                      <TableRow>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' display='inline' className='specValue' color='textSecondary'>
                            Git URL
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>
                          {importTypeGitBusy ? <CircularProgress size={20} /> : null} {importTypeGitLastValidatedUrl}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' display='inline' className='specValue' color='textSecondary'>
                            Git Provider
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>{importTypeGitProvider}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' display='inline' className='specValue' color='textSecondary'>
                            Hugo Theme
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>{importHugoTheme}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' display='inline' className='specValue' color='textSecondary'>
                            Quiqr Model
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>{importQuiqrModel}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' display='inline' className='specValue' color='textSecondary'>
                            Quiqr Forms
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>{importQuiqrForms}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Box>
          </Card>
        </Box>
      </React.Fragment>
    );
  }, [
    importTypeGitUrl,
    importTypeGitBusy,
    importTypeGitReadyForValidation,
    importTypeGitLastValidatedUrl,
    importTypeGitProvider,
    importTypeGitErrorText,
    importTypeGitScreenshot,
    importHugoTheme,
    importQuiqrModel,
    importQuiqrForms,
    preValidateURL,
    validateURL,
  ]);

  return (
    <React.Fragment>
      <Box my={2}>
        <FormControlLabel
          sx={{
            margin: theme => theme.spacing(1),
            marginTop: theme => theme.spacing(2),
          }}
          control={
            <Switch
              checked={useDeployKey || false}
              onChange={(e) => {
                if (e.target.checked) {
                  getKeyPair();
                  props.onSetVersion("set");
                } else {
                  props.onSetVersion();
                }
                setUseDeployKey(e.target.checked);
              }}
              name='useDeployKey'
              color='primary'
            />
          }
          label='Private GitHub Repository'
        />
        {useDeployKey ? renderDeployKeyForm() : renderPublicField()}
      </Box>
    </React.Fragment>
  );
};

export default FormPartialNewFromScratch;
