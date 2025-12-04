import { useReducer, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import SnackbarManager from "../../../components/SnackbarManager";
import service from "../../../services/service";
import { snackMessageService } from "../../../services/ui-service";
import {
  DialogMode,
  SourceType,
  dialogReducer,
  initialDialogState,
  PrivateRepoData,
  HugoThemeInfo,
} from "./newSiteDialogTypes";
import SourceTypeStep from "./steps/SourceTypeStep";
import ConfigureSourceStep from "./steps/ConfigureSourceStep";
import SuccessStep from "./steps/SuccessStep";

interface NewSiteDialogProps {
  open: boolean;
  newOrImport: DialogMode;
  importSiteURL?: string;
  mountSite: (siteKey: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}

const STEPS_NEW = ["Choose Method", "Configure Site", "Done"];
const STEPS_IMPORT = ["Choose Source", "Configure Import", "Done"];

const NewSiteDialog = ({
  open,
  newOrImport,
  importSiteURL,
  mountSite,
  onSuccess,
  onClose,
}: NewSiteDialogProps) => {
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);

  const steps = newOrImport === "new" ? STEPS_NEW : STEPS_IMPORT;

  // Handle importSiteURL prop - auto-select git and move to step 1
  useEffect(() => {
    if (importSiteURL && open) {
      dispatch({ type: "SET_SOURCE_TYPE", payload: "git" });
      dispatch({ type: "SET_GIT_URL", payload: importSiteURL });
      dispatch({ type: "SET_ACTIVE_STEP", payload: 1 });
    }
  }, [importSiteURL, open]);

  // Reset dialog when closed
  useEffect(() => {
    if (!open) {
      dispatch({ type: "RESET_ALL" });
    }
  }, [open]);

  const dialogTitle = useMemo(() => {
    if (state.createdSiteKey) {
      return "Site Created";
    }

    const titles: Record<SourceType, string> = {
      scratch: "New Quiqr Site from Scratch",
      hugotheme: "New Quiqr Site from Hugo Theme",
      folder: "Import Site from Folder",
      git: "Import Site from Git",
      "": newOrImport === "new" ? "New Quiqr Site" : "Import Quiqr Site",
    };

    return titles[state.sourceType];
  }, [state.sourceType, state.createdSiteKey, newOrImport]);

  const handleSourceSelect = (sourceType: SourceType) => {
    dispatch({ type: "SET_SOURCE_TYPE", payload: sourceType });
    dispatch({ type: "SET_ACTIVE_STEP", payload: 1 });

    // For scratch, enable naming immediately
    if (sourceType === "scratch") {
      dispatch({ type: "SET_FORM_VALID", payload: true });
      dispatch({ type: "SET_NAME_VALID", payload: true });
    }
  };

  const handleBack = () => {
    if (state.activeStep === 1) {
      dispatch({ type: "RESET_TO_SOURCE_SELECTION" });
    }
  };

  const handleClose = () => {
    dispatch({ type: "RESET_ALL" });
    onClose();
  };

  const handleOpenSite = () => {
    if (state.createdSiteKey) {
      onSuccess();
      mountSite(state.createdSiteKey);
      onClose();
    }
  };

  const handleCreateSite = async () => {
    const hugover = (state.hugoExtended ? "extended_" : "") + state.hugoVersion.replace("v", "");
    dispatch({ type: "SET_CREATING", payload: true });

    try {
      let siteKey: string | null = null;

      switch (state.sourceType) {
        case "hugotheme":
          siteKey = await service.api.newSiteFromPublicHugoThemeUrl(
            state.siteName,
            state.hugoThemeUrl,
            state.hugoThemeInfo,
            hugover
          );
          break;

        case "scratch":
          siteKey = await service.api.newSiteFromScratch(
            state.siteName,
            hugover,
            state.scratchConfigFormat
          );
          break;

        case "folder":
          siteKey = await service.api.newSiteFromLocalDirectory(
            state.siteName,
            state.folderPath,
            state.generateQuiqrModel,
            hugover
          );
          break;

        case "git":
          if (state.gitPrivateRepo && state.privateRepoData) {
            const { gitBaseUrl, gitProtocol, sshPort, username, repository, deployPrivateKey, email } = state.privateRepoData;
            siteKey = await service.api.importSiteFromPrivateGitRepo(
              gitBaseUrl,
              username,
              repository,
              deployPrivateKey,
              email,
              true,
              state.siteName,
              gitProtocol,
              sshPort
            );
          } else {
            siteKey = await service.api.importSiteFromPublicGitUrl(
              state.siteName,
              state.gitUrl
            );
          }
          break;
      }

      dispatch({ type: "SET_CREATING", payload: false });

      if (siteKey) {
        dispatch({ type: "SET_CREATED_SITE_KEY", payload: siteKey });
        dispatch({ type: "SET_ACTIVE_STEP", payload: 2 });
      }
    } catch {
      dispatch({ type: "SET_CREATING", payload: false });
      snackMessageService.addSnackMessage("Failed to create site", { severity: "warning" });
    }
  };

  const handleSiteNameChange = (name: string) => {
    dispatch({ type: "SET_SITE_NAME", payload: name });
  };

  const handleSiteNameValidation = (isValid: boolean, error: string) => {
    dispatch({ type: "SET_NAME_VALID", payload: isValid });
    dispatch({ type: "SET_SITE_NAME_ERROR", payload: error });
  };

  const handleHugoVersionChange = (config: {
    version: string;
    extended: boolean;
    disabled: boolean;
    extendedEnabled: boolean;
    generateModel: boolean;
  }) => {
    dispatch({ type: "SET_HUGO_CONFIG", payload: config });
  };

  const handleFormValidation = (isValid: boolean) => {
    dispatch({ type: "SET_FORM_VALID", payload: isValid });
  };

  const handleHugoThemeValidation = (url: string, info: HugoThemeInfo) => {
    dispatch({ type: "SET_HUGO_THEME_URL", payload: url });
    dispatch({ type: "SET_HUGO_THEME_INFO", payload: info });
  };

  const handleGitValidation = (url: string, isPrivate: boolean, privData?: PrivateRepoData) => {
    dispatch({ type: "SET_GIT_URL", payload: url });
    dispatch({ type: "SET_GIT_PRIVATE_REPO", payload: isPrivate });
    if (privData) {
      dispatch({ type: "SET_PRIVATE_REPO_DATA", payload: privData });
    }
  };

  const handleFolderValidation = (path: string) => {
    dispatch({ type: "SET_FOLDER_PATH", payload: path });
  };

  const handleScratchConfigChange = (format: string) => {
    dispatch({ type: "SET_SCRATCH_CONFIG_FORMAT", payload: format });
  };

  const isCreateDisabled =
    !state.hugoVersion ||
    !state.isNameValid ||
    state.isCreating ||
    !state.siteName;

  const renderStepContent = () => {
    switch (state.activeStep) {
      case 0:
        return (
          <SourceTypeStep
            mode={newOrImport}
            onSelectSource={handleSourceSelect}
          />
        );

      case 1:
        return (
          <ConfigureSourceStep
            sourceType={state.sourceType}
            importSiteURL={importSiteURL}
            state={state}
            onSiteNameChange={handleSiteNameChange}
            onSiteNameValidation={handleSiteNameValidation}
            onHugoVersionChange={handleHugoVersionChange}
            onFormValidation={handleFormValidation}
            onHugoThemeValidation={handleHugoThemeValidation}
            onGitValidation={handleGitValidation}
            onFolderValidation={handleFolderValidation}
            onScratchConfigChange={handleScratchConfigChange}
          />
        );

      case 2:
        return (
          <SuccessStep
            siteName={state.siteName}
            onOpenSite={handleOpenSite}
          />
        );

      default:
        return null;
    }
  };

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // Back button (only on step 1, and not when using importSiteURL)
    if (state.activeStep === 1 && !importSiteURL) {
      actions.push(
        <Button key="back" color="primary" onClick={handleBack}>
          Back
        </Button>
      );
    }

    // Cancel/Close button
    actions.push(
      <Button key="close" color="primary" onClick={handleClose}>
        {state.activeStep === 2 ? "Close" : "Cancel"}
      </Button>
    );

    // Create button (only on step 1)
    if (state.activeStep === 1) {
      const buttonText = newOrImport === "new" ? "Create Site" : "Import Site";
      actions.push(
        <Button
          key="create"
          variant="contained"
          disabled={isCreateDisabled}
          onClick={handleCreateSite}
          color="primary"
        >
          {state.isCreating ? "Creating..." : buttonText}
        </Button>
      );
    }

    // Open button (only on step 2)
    if (state.activeStep === 2) {
      actions.push(
        <Button
          key="open"
          variant="contained"
          color="primary"
          onClick={handleOpenSite}
        >
          Open {state.siteName}
        </Button>
      );
    }

    return actions;
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="new-site-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <SnackbarManager />

      <DialogTitle id="new-site-dialog-title">{dialogTitle}</DialogTitle>

      <DialogContent>
        <Box sx={{ width: "100%", mb: 3 }}>
          <Stepper activeStep={state.activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>{renderActions()}</DialogActions>
    </Dialog>
  );
};

export default NewSiteDialog;
