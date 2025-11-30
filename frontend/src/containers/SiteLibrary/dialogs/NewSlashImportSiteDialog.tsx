import * as React from "react";
import service from "./../../../services/service";
import { snackMessageService } from "./../../../services/ui-service";
import SnackbarManager from "./../../../components/SnackbarManager";
import LogosGitServices from "../../../svg-assets/LogosGitServices";
import IconHugo from "../../../svg-assets/IconHugo";
import FormPartialNewFromHugoTheme from "./partials/FormPartialNewFromHugoTheme";
import FormPartialNewFromScratch from "./partials/FormPartialNewFromScratch";
import FormPartialNewFromFolder from "./partials/FormPartialNewFromFolder";
import FormPartialImportFromGit from "./partials/FormPartialImportFromGit";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid';
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

interface NewSiteDialogProps {
  open: boolean;
  newOrImport: "new" | "import";
  importSiteURL?: string;
  mountSite: (siteKey: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}

const NewSiteDialog: React.FC<NewSiteDialogProps> = ({ open, newOrImport, importSiteURL, mountSite, onSuccess, onClose }) => {
  const [title, setTitle] = React.useState(newOrImport === "import" ? "Import Quiqr Site" : "New Quiqr Site");
  const [filteredHugoVersions, setFilteredHugoVersions] = React.useState<string[]>([]);
  const [newType, setNewType] = React.useState("");
  const [newReadyForNew, setNewReadyForNew] = React.useState(false);
  const [newReadyForNaming, setNewReadyForNaming] = React.useState(false);
  const [newLastStepBusy, setNewLastStepBusy] = React.useState(false);
  const [hugoVersionSelectDisable, setHugoVersionSelectDisable] = React.useState(false);
  const [hugoExtended, setHugoExtended] = React.useState<boolean | string>("");
  const [hugoVersion, setHugoVersion] = React.useState("");
  const [generateQuiqrModel, setGenerateQuiqrModel] = React.useState(false);
  const [newSiteNameErrorText, setNewSiteNameErrorText] = React.useState("");
  const [newSiteName, setNewSiteName] = React.useState("");
  const [newTypeHugoThemeLastValidatedUrl, setNewTypeHugoThemeLastValidatedUrl] = React.useState<string | undefined>();
  const [newHugoThemeInfoDict, setNewHugoThemeInfoDict] = React.useState<any>();
  const [newSiteKey, setNewSiteKey] = React.useState<string | null>(null);
  const [newTypeScratchConfigFormat, setNewTypeScratchConfigFormat] = React.useState<string | undefined>();
  const [newTypeFolderLastValidatedPath, setNewTypeFolderLastValidatedPath] = React.useState<string | undefined>();
  const [gitPrivateRepo, setGitPrivateRepo] = React.useState<boolean | undefined>();
  const [privData, setPrivData] = React.useState<{
    username: string;
    repository: string;
    deployPrivateKey: string;
    email: string;
  } | undefined>();
  const [importTypeGitLastValidatedUrl, setImportTypeGitLastValidatedUrl] = React.useState<string | undefined>();
  const [hugoExtendedEnabled, setHugoExtendedEnabled] = React.useState<boolean | undefined>();
  const [dialogSize, setDialogSize] = React.useState<string | undefined>();

  // Handle importSiteURL prop changes
  React.useEffect(() => {
    if (importSiteURL) {
      setNewType("git");
    }
  }, [importSiteURL]);

  React.useEffect(() => {
    service.api.getFilteredHugoVersions().then((versions) => {
      setFilteredHugoVersions(versions);
    });
  }, []);

  const checkFreeSiteName = (name: string) => {
    service.api.checkFreeSiteName(name).then((isFreeSiteName) => {
      if (isFreeSiteName) {
        setNewReadyForNew(true);
        setNewSiteNameErrorText("");
      } else {
        setNewReadyForNew(false);
        setNewSiteNameErrorText("Site name is already in use. Please choose another name.");
      }
    });
  };

  const handleSetVersion = (hugover: string | null) => {
    if (hugover) {
      setGenerateQuiqrModel(false);
      setHugoExtendedEnabled(false);
      setHugoVersionSelectDisable(true);

      if (hugover.startsWith("extended_")) {
        setHugoVersion("v" + hugover.replace("extended_", ""));
        setHugoExtended(true);
      } else {
        setHugoVersion("v" + hugover);
        setHugoExtended(false);
      }
    } else {
      setGenerateQuiqrModel(true);
      setHugoVersion("");
      setHugoExtended(false);
      setHugoExtendedEnabled(true);
      setHugoVersionSelectDisable(false);
    }
  };

  const renderStep1Cards = () => {
    const sourceDefsNew = [
      {
        type: "scratch",
        title: "FROM SCRATCH",
        icon: <BuildIcon fontSize='large' />,
        stateUpdate: () => {
          setNewType("scratch");
          setTitle("New Quiqr Site from scratch");
          setDialogSize("md");
          setNewReadyForNew(true);
          setNewReadyForNaming(true);
        },
      },
      {
        type: "hugotheme",
        title: "FROM A HUGO THEME",
        icon: <IconHugo style={{ transform: "scale(1.0)" }} />,
        stateUpdate: () => {
          setNewType("hugotheme");
          setTitle("New Quiqr Site from Hugo Theme");
          setDialogSize("md");
        },
      },
    ];
    const sourceDefsImport = [
      {
        type: "folder",
        title: "FROM FOLDER",
        icon: <FolderIcon fontSize='large' />,
        stateUpdate: () => {
          setNewType("folder");
          setTitle("Import Site from a folder with a Hugo site");
          setDialogSize("md");
        },
      },
      {
        type: "git",
        title: "FROM GIT SERVER URL",
        icon: <LogosGitServices />,
        stateUpdate: () => {
          setNewType("git");
          setTitle("Import Quiqr Site from GitHub, GitLab or Generic Git URL");
          setDialogSize("md");
        },
      },
    ];

    const sourceDefs = newOrImport === "new" ? sourceDefsNew : sourceDefsImport;
    const instructions = newOrImport === "new" ? "How to create a new site..." : "Choose the source you want to import from...";

    const sourceCards = sourceDefs.map((source) => {
      return (
          <Paper
            key={source.title}
            onClick={source.stateUpdate}
            sx={{
              height: "160px",
              padding: "40px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#eee",
                color: "#222",
              }
            }}>
            <Box display='flex' alignItems='center' justifyContent='center'>
              {source.icon}
            </Box>
            <Box display='flex' alignItems='center' justifyContent='center' p={1} height={70}>
              <Typography variant='h5'>{source.title}</Typography>
            </Box>
          </Paper>
      );
    });

    return (
      <Box my={2}>
        <p>{instructions}</p>
        <Grid container spacing={2} columns={2}>
          {sourceCards}
        </Grid>
      </Box>
    );
  };

  const renderStep2Form = () => {
    const filteredVersionItems = filteredHugoVersions.map((version, index) => {
      return (
        <MenuItem key={"version-" + version} value={version}>
          {version}
        </MenuItem>
      );
    });

    let fromForm;
    const finalButtonText = newOrImport === "new" ? "Create Site" : "Import Site";

    if (newType === "hugotheme") {
      fromForm = (
        <FormPartialNewFromHugoTheme
          onSetName={setNewSiteName}
          onValidationDone={(newState) => {
            checkFreeSiteName(newSiteName);
            setNewReadyForNaming(newState.newReadyForNaming ?? false);
            setNewTypeHugoThemeLastValidatedUrl(newState.newTypeHugoThemeLastValidatedUrl);
            setNewHugoThemeInfoDict(newState.newHugoThemeInfoDict);
          }}
        />
      );
    } else if (newType === "git") {
      fromForm = (
        <FormPartialImportFromGit
          importSiteURL={importSiteURL}
          onSetName={setNewSiteName}
          onSetVersion={handleSetVersion}
          onValidationDone={(newState) => {
            checkFreeSiteName(newSiteName);
            setNewReadyForNaming(newState.newReadyForNaming ?? false);
            setGitPrivateRepo(newState.gitPrivateRepo);
            setPrivData(newState.privData);
            setImportTypeGitLastValidatedUrl(newState.importTypeGitLastValidatedUrl);
          }}
        />
      );
    } else if (newType === "scratch") {
      fromForm = (
        <FormPartialNewFromScratch
          onChange={(newState) => {
            setNewSiteName(newState.newSiteName ?? "");
            setNewTypeScratchConfigFormat(newState.newTypeScratchConfigFormat);
          }}
        />
      );
    } else if (newType === "folder") {
      fromForm = (
        <FormPartialNewFromFolder
          onSetName={setNewSiteName}
          onSetVersion={handleSetVersion}
          onValidationDone={(newState) => {
            checkFreeSiteName(newSiteName);
            setNewReadyForNaming(newState.newReadyForNaming ?? false);
            setNewTypeFolderLastValidatedPath(newState.newTypeFolderLastValidatedPath);
          }}
        />
      );
    }

    const handleCreateSite = () => {
      const hugover = (hugoExtended ? "extended_" : "") + hugoVersion.replace("v", "");
      setNewLastStepBusy(true);

      if (newType === "hugotheme") {
        service.api
          .newSiteFromPublicHugoThemeUrl(
            newSiteName,
            newTypeHugoThemeLastValidatedUrl,
            newHugoThemeInfoDict,
            hugover
          )
          .then((siteKey) => {
            setNewLastStepBusy(false);
            setNewSiteKey(siteKey);
          })
          .catch(() => {
            setNewLastStepBusy(false);
          });
      }

      if (newType === "scratch") {
        service.api
          .newSiteFromScratch(newSiteName, hugover, newTypeScratchConfigFormat)
          .then((siteKey) => {
            setNewLastStepBusy(false);
            setNewSiteKey(siteKey);
          })
          .catch(() => {
            setNewLastStepBusy(false);
          });
      }

      if (newType === "folder") {
        service.api
          .newSiteFromLocalDirectory(newSiteName, newTypeFolderLastValidatedPath, generateQuiqrModel, hugover)
          .then((siteKey) => {
            setNewLastStepBusy(false);
            setNewSiteKey(siteKey);
          })
          .catch(() => {
            setNewLastStepBusy(false);
          });
      }

      if (newType === "git") {
        if (gitPrivateRepo && privData) {
          service.api
            .importSiteFromPrivateGitRepo(privData.username, privData.repository, privData.deployPrivateKey, privData.email, true, newSiteName)
            .then((siteKey) => {
              setNewLastStepBusy(false);
              setNewSiteKey(siteKey);
            })
            .catch(() => {
              snackMessageService.addSnackMessage("Import Failed");
              setNewLastStepBusy(false);
            });
        } else {
          service.api
            .importSiteFromPublicGitUrl(newSiteName, importTypeGitLastValidatedUrl)
            .then((siteKey) => {
              setNewLastStepBusy(false);
              setNewSiteKey(siteKey);
            })
            .catch(() => {
              setNewLastStepBusy(false);
            });
        }
      }
    };

    return (
      <React.Fragment>
        {fromForm}

        <Box my={2}>
          <TextField
            fullWidth
            id='standard-full-width'
            label='Name'
            value={newSiteName}
            disabled={!newReadyForNaming}
            variant='outlined'
            error={newSiteNameErrorText !== ""}
            helperText={newSiteNameErrorText}
            onChange={(e) => {
              setNewSiteName(e.target.value);
              checkFreeSiteName(e.target.value);
            }}
          />
          {newLastStepBusy ? <CircularProgress size={20} /> : null}
        </Box>

        <Box my={2}>
          <FormControl variant='outlined' sx={{ m: 1, minWidth: 300 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Hugo Version</InputLabel>
            <Select
              labelId='demo-simple-select-outlined-label'
              id='demo-simple-select-outlined'
              disabled={hugoVersionSelectDisable}
              value={hugoVersion || ""}
              onChange={(e) => {
                const featureVersion = Number(e.target.value.split(".")[1]);
                if (featureVersion > 42) {
                  setHugoVersion(e.target.value);
                  setHugoExtendedEnabled(true);
                } else {
                  setHugoVersion(e.target.value);
                  setHugoExtendedEnabled(false);
                  setHugoExtended(false);
                }
              }}
              label='Publish Source and Build'>
              {filteredVersionItems}
            </Select>
          </FormControl>

          <FormControlLabel
            sx={{ m: 1, mt: 2 }}
            control={
              <Switch
                checked={hugoExtended || false}
                disabled={!hugoExtendedEnabled}
                onChange={(e) => {
                  setHugoExtended(e.target.checked);
                }}
                name='configureActions'
                color='primary'
              />
            }
            label='Hugo Extended'
          />
        </Box>

        <Button
          variant='contained'
          disabled={hugoVersion === "" || !newReadyForNew || newLastStepBusy}
          onClick={handleCreateSite}
          color='primary'>
          {finalButtonText}
        </Button>
      </React.Fragment>
    );
  };

  const handleOpenNewSite = () => {
    if (newSiteKey) {
      onSuccess();
      mountSite(newSiteKey);
      onClose();
    }
  };

  const renderStep3NewFinished = () => {
    return (
      <div>
        The site has been succesfully created.{" "}
        <Button onClick={handleOpenNewSite}>
          Open {newSiteName} now
        </Button>
        .
      </div>
    );
  };

  let newButtonHidden = true;
  let backButtonHidden = true;
  let closeText = "cancel";
  let content;

  if (!newSiteKey && !newType) {
    content = renderStep1Cards();
    backButtonHidden = true;
  } else if (!newSiteKey) {
    content = renderStep2Form();
    backButtonHidden = false;
  } else {
    content = renderStep3NewFinished();
    newButtonHidden = false;
    backButtonHidden = true;
    closeText = "close";
  }

  if (importSiteURL) {
    backButtonHidden = true;
  }

  const actions = [
    backButtonHidden ? null : (
      <Button
        key={"actionNewDialog2"}
        color='primary'
        onClick={() => {
          setNewType("");
        }}>
        {"back"}
      </Button>
    ),
    <Button
      key={"actionNewDialog1"}
      color='primary'
      onClick={() => {
        setNewSiteKey(null);
        onClose();
      }}>
      {closeText}
    </Button>,
    newButtonHidden ? null : (
      <Button
        key={"actionNewDialog3"}
        color='primary'
        onClick={handleOpenNewSite}>
        {"open " + newSiteName}
      </Button>
    ),
  ];

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"md"}>
      <SnackbarManager />

      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default NewSiteDialog;
