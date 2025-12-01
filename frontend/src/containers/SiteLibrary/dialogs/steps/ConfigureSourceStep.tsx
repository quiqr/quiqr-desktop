import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import service from "../../../../services/service";
import { SourceType, DialogState, PrivateRepoData, HugoThemeInfo } from "../newSiteDialogTypes";
import FormPartialNewFromHugoTheme from "../partials/FormPartialNewFromHugoTheme";
import FormPartialNewFromScratch from "../partials/FormPartialNewFromScratch";
import FormPartialNewFromFolder from "../partials/FormPartialNewFromFolder";
import FormPartialImportFromGit from "../partials/FormPartialImportFromGit";

interface ConfigureSourceStepProps {
  sourceType: SourceType;
  importSiteURL?: string;
  state: DialogState;
  onSiteNameChange: (name: string) => void;
  onSiteNameValidation: (isValid: boolean, error: string) => void;
  onHugoVersionChange: (config: {
    version: string;
    extended: boolean;
    disabled: boolean;
    extendedEnabled: boolean;
    generateModel: boolean;
  }) => void;
  onFormValidation: (isValid: boolean) => void;
  onHugoThemeValidation: (url: string, info: HugoThemeInfo) => void;
  onGitValidation: (url: string, isPrivate: boolean, privData?: PrivateRepoData) => void;
  onFolderValidation: (path: string) => void;
  onScratchConfigChange: (format: string) => void;
}

const ConfigureSourceStep = ({
  sourceType,
  importSiteURL,
  state,
  onSiteNameChange,
  onSiteNameValidation,
  onHugoVersionChange,
  onFormValidation,
  onHugoThemeValidation,
  onGitValidation,
  onFolderValidation,
  onScratchConfigChange,
}: ConfigureSourceStepProps) => {
  const [filteredHugoVersions, setFilteredHugoVersions] = useState<string[]>([]);
  // Track latest site name to avoid stale state in callbacks
  const latestNameRef = useRef(state.siteName);

  useEffect(() => {
    service.api.getFilteredHugoVersions().then((versions) => {
      setFilteredHugoVersions(versions);
    });
  }, []);

  const checkFreeSiteName = (name: string) => {
    if (!name) {
      onSiteNameValidation(false, "");
      return;
    }
    service.api.checkFreeSiteName(name).then((isFreeSiteName) => {
      if (isFreeSiteName) {
        onSiteNameValidation(true, "");
      } else {
        onSiteNameValidation(false, "Site name is already in use. Please choose another name.");
      }
    });
  };

  const handleSetVersion = (hugover: string | null) => {
    if (hugover) {
      if (hugover.startsWith("extended_")) {
        onHugoVersionChange({
          version: "v" + hugover.replace("extended_", ""),
          extended: true,
          disabled: true,
          extendedEnabled: false,
          generateModel: false,
        });
      } else {
        onHugoVersionChange({
          version: "v" + hugover,
          extended: false,
          disabled: true,
          extendedEnabled: false,
          generateModel: false,
        });
      }
    } else {
      onHugoVersionChange({
        version: "",
        extended: false,
        disabled: false,
        extendedEnabled: true,
        generateModel: true,
      });
    }
  };

  const handleHugoVersionSelectChange = (version: string) => {
    const featureVersion = Number(version.split(".")[1]);
    onHugoVersionChange({
      version,
      extended: featureVersion > 42 ? state.hugoExtended : false,
      disabled: state.hugoVersionDisabled,
      extendedEnabled: featureVersion > 42,
      generateModel: state.generateQuiqrModel,
    });
  };

  const handleHugoExtendedChange = (checked: boolean) => {
    onHugoVersionChange({
      version: state.hugoVersion,
      extended: checked,
      disabled: state.hugoVersionDisabled,
      extendedEnabled: state.hugoExtendedEnabled,
      generateModel: state.generateQuiqrModel,
    });
  };

  const renderSourceForm = () => {
    switch (sourceType) {
      case "hugotheme":
        return (
          <FormPartialNewFromHugoTheme
            onSetName={(name) => {
              latestNameRef.current = name;
              onSiteNameChange(name);
            }}
            onValidationDone={(newState) => {
              checkFreeSiteName(latestNameRef.current);
              onFormValidation(newState.newReadyForNaming ?? false);
              if (newState.newTypeHugoThemeLastValidatedUrl && newState.newHugoThemeInfoDict) {
                onHugoThemeValidation(
                  newState.newTypeHugoThemeLastValidatedUrl,
                  newState.newHugoThemeInfoDict
                );
              }
            }}
          />
        );

      case "git":
        return (
          <FormPartialImportFromGit
            importSiteURL={importSiteURL}
            onSetName={(name) => {
              latestNameRef.current = name;
              onSiteNameChange(name);
            }}
            onSetVersion={handleSetVersion}
            onValidationDone={(newState) => {
              checkFreeSiteName(latestNameRef.current);
              onFormValidation(newState.newReadyForNaming ?? false);
              if (newState.importTypeGitLastValidatedUrl) {
                onGitValidation(
                  newState.importTypeGitLastValidatedUrl,
                  newState.gitPrivateRepo ?? false,
                  newState.privData
                );
              }
            }}
          />
        );

      case "scratch":
        return (
          <FormPartialNewFromScratch
            onChange={(newState) => {
              if (newState.newTypeScratchConfigFormat) {
                onScratchConfigChange(newState.newTypeScratchConfigFormat);
              }
            }}
          />
        );

      case "folder":
        return (
          <FormPartialNewFromFolder
            onSetName={(name) => {
              latestNameRef.current = name;
              onSiteNameChange(name);
            }}
            onSetVersion={handleSetVersion}
            onValidationDone={(newState) => {
              checkFreeSiteName(latestNameRef.current);
              onFormValidation(newState.newReadyForNaming ?? false);
              if (newState.newTypeFolderLastValidatedPath) {
                onFolderValidation(newState.newTypeFolderLastValidatedPath);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  const isNameFieldEnabled = sourceType === "scratch" || state.isFormValid;

  return (
    <>
      {renderSourceForm()}

      <Box my={2}>
        <TextField
          fullWidth
          label="Site Name"
          value={state.siteName}
          disabled={!isNameFieldEnabled}
          variant="outlined"
          error={state.siteNameError !== ""}
          helperText={state.siteNameError}
          onChange={(e) => {
            latestNameRef.current = e.target.value;
            onSiteNameChange(e.target.value);
            checkFreeSiteName(e.target.value);
          }}
        />
        {state.isValidating && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Box>

      <Box my={2}>
        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
          <InputLabel id="hugo-version-label">Hugo Version</InputLabel>
          <Select
            labelId="hugo-version-label"
            disabled={state.hugoVersionDisabled}
            value={state.hugoVersion}
            onChange={(e) => handleHugoVersionSelectChange(e.target.value)}
            label="Hugo Version"
          >
            {filteredHugoVersions.map((version) => (
              <MenuItem key={version} value={version}>
                {version}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          sx={{ m: 1, mt: 2 }}
          control={
            <Switch
              checked={state.hugoExtended}
              disabled={!state.hugoExtendedEnabled}
              onChange={(e) => handleHugoExtendedChange(e.target.checked)}
              name="hugoExtended"
              color="primary"
            />
          }
          label="Hugo Extended"
        />
      </Box>
    </>
  );
};

export default ConfigureSourceStep;
