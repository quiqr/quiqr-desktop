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
  GitProvider,
  dialogReducer,
  initialDialogState,
  PrivateRepoData,
  HugoThemeInfo,
} from "./newSiteDialogTypes";
import SourceTypeStep from "./steps/SourceTypeStep";
import ConfigureSourceStep from "./steps/ConfigureSourceStep";
import DeployKeyStep from "./steps/DeployKeyStep";
import SyncConfigStep, { detectGitProvider } from "./steps/SyncConfigStep";
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
const STEPS_IMPORT_PRIVATE_GIT = ["Choose Source", "Configure Import", "Deploy Key", "Sync Settings", "Done"];

const NewSiteDialog = ({
  open,
  newOrImport,
  importSiteURL,
  mountSite,
  onSuccess,
  onClose,
}: NewSiteDialogProps) => {
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);

  // Determine if we need the extra deploy key step
  const needsDeployKeyStep = state.sourceType === "git" && state.gitPrivateRepo;

  // Calculate the steps array based on source type
  const steps = useMemo(() => {
    if (newOrImport === "new") {
      return STEPS_NEW;
    }
    return needsDeployKeyStep ? STEPS_IMPORT_PRIVATE_GIT : STEPS_IMPORT;
  }, [newOrImport, needsDeployKeyStep]);

  // Calculate the final step index (Done step)
  const finalStepIndex = steps.length - 1;

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

  // Calculate suggested git provider from URL
  const suggestedGitProvider = useMemo(() => {
    if (state.privateRepoData?.gitBaseUrl) {
      return detectGitProvider(state.privateRepoData.gitBaseUrl);
    }
    return "generic" as GitProvider;
  }, [state.privateRepoData?.gitBaseUrl]);

  const dialogTitle = useMemo(() => {
    if (state.createdSiteKey) {
      return "Site Created";
    }

    // Show deploy key title on step 2 for private git
    if (needsDeployKeyStep && state.activeStep === 2) {
      return "Configure Deploy Key";
    }

    // Show sync config title on step 3 for private git
    if (needsDeployKeyStep && state.activeStep === 3) {
      return "Configure Sync Settings";
    }

    const titles: Record<SourceType, string> = {
      scratch: "New Quiqr Site from Scratch",
      hugotheme: "New Quiqr Site from Hugo Theme",
      folder: "Import Site from Folder",
      git: "Import Site from Git",
      "": newOrImport === "new" ? "New Quiqr Site" : "Import Quiqr Site",
    };

    return titles[state.sourceType];
  }, [state.sourceType, state.createdSiteKey, state.activeStep, needsDeployKeyStep, newOrImport]);

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
    } else if (state.activeStep === 2 && needsDeployKeyStep) {
      dispatch({ type: "SET_ACTIVE_STEP", payload: 1 });
    } else if (state.activeStep === 3 && needsDeployKeyStep) {
      dispatch({ type: "SET_ACTIVE_STEP", payload: 2 });
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

  const handleNextToDeployKey = () => {
    dispatch({ type: "SET_ACTIVE_STEP", payload: 2 });
  };

  const handleNextToSyncConfig = () => {
    // Auto-detect git provider when moving to sync config step
    dispatch({ type: "SET_GIT_PROVIDER", payload: suggestedGitProvider });
    dispatch({ type: "SET_ACTIVE_STEP", payload: 3 });
  };

  const handleEnableSyncChange = (enabled: boolean) => {
    dispatch({ type: "SET_ENABLE_SYNC", payload: enabled });
  };

  const handleGitProviderChange = (provider: GitProvider) => {
    dispatch({ type: "SET_GIT_PROVIDER", payload: provider });
  };

  const handleDeployKeyGenerated = (privateKey: string, publicKey: string) => {
    if (state.privateRepoData) {
      dispatch({
        type: "SET_PRIVATE_REPO_DATA",
        payload: {
          ...state.privateRepoData,
          deployPrivateKey: privateKey,
          deployPublicKey: publicKey,
        },
      });
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
              state.enableSync, // Only save sync target if sync is enabled
              state.siteName,
              gitProtocol,
              sshPort,
              state.gitProvider
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
        dispatch({ type: "SET_ACTIVE_STEP", payload: finalStepIndex });
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

  const handlePrivDataChange = (data: PrivateRepoData) => {
    dispatch({ type: "SET_PRIVATE_REPO_DATA", payload: data });
  };

  const isCreateDisabled =
    !state.hugoVersion ||
    !state.isNameValid ||
    state.isCreating ||
    !state.siteName;

  // For private git on step 2 (deploy key step), also check if deploy key exists
  const isImportDisabledPrivateGit =
    isCreateDisabled ||
    !state.privateRepoData?.deployPrivateKey;

  const renderStepContent = () => {
    // Handle the "Done" step (which varies in index)
    if (state.activeStep === finalStepIndex && state.createdSiteKey) {
      return (
        <SuccessStep
          siteName={state.siteName}
          onOpenSite={handleOpenSite}
        />
      );
    }

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
            onPrivDataChange={handlePrivDataChange}
          />
        );

      case 2:
        // For private git, show deploy key step
        if (needsDeployKeyStep) {
          return (
            <DeployKeyStep
              deployPublicKey={state.privateRepoData?.deployPublicKey || ""}
              onKeyGenerated={handleDeployKeyGenerated}
            />
          );
        }
        // For other types, this shouldn't happen but fallback to success
        return null;

      case 3:
        // For private git, show sync config step
        if (needsDeployKeyStep) {
          return (
            <SyncConfigStep
              enableSync={state.enableSync}
              gitProvider={state.gitProvider}
              suggestedProvider={suggestedGitProvider}
              onEnableSyncChange={handleEnableSyncChange}
              onGitProviderChange={handleGitProviderChange}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // Back button
    if (state.activeStep === 1 && !importSiteURL) {
      actions.push(
        <Button key="back" color="primary" onClick={handleBack}>
          Back
        </Button>
      );
    } else if ((state.activeStep === 2 || state.activeStep === 3) && needsDeployKeyStep) {
      actions.push(
        <Button key="back" color="primary" onClick={handleBack}>
          Back
        </Button>
      );
    }

    // Cancel/Close button
    actions.push(
      <Button key="close" color="primary" onClick={handleClose}>
        {state.activeStep === finalStepIndex ? "Close" : "Cancel"}
      </Button>
    );

    // Step 1: "Configure Deploy Key" button for private git, "Create/Import" for others
    if (state.activeStep === 1) {
      if (needsDeployKeyStep) {
        // Private git: show "Configure Deploy Key" button
        actions.push(
          <Button
            key="next"
            variant="contained"
            disabled={!state.isFormValid || !state.isNameValid || !state.siteName}
            onClick={handleNextToDeployKey}
            color="primary"
          >
            Configure Deploy Key
          </Button>
        );
      } else {
        // Other types: show "Create/Import" button
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
    }

    // Step 2 (Deploy Key step for private git): show "Next" button to go to sync config
    if (state.activeStep === 2 && needsDeployKeyStep) {
      actions.push(
        <Button
          key="next"
          variant="contained"
          disabled={!state.privateRepoData?.deployPrivateKey}
          onClick={handleNextToSyncConfig}
          color="primary"
        >
          Next
        </Button>
      );
    }

    // Step 3 (Sync Config step for private git): show "Import Site" button
    if (state.activeStep === 3 && needsDeployKeyStep) {
      actions.push(
        <Button
          key="create"
          variant="contained"
          disabled={isImportDisabledPrivateGit}
          onClick={handleCreateSite}
          color="primary"
        >
          {state.isCreating ? "Importing..." : "Import Site"}
        </Button>
      );
    }

    // Final step: Open button
    if (state.activeStep === finalStepIndex && state.createdSiteKey) {
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
