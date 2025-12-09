import { useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import { GitValidationResult, PrivateRepoData } from "../newSiteDialogTypes";

type PrivateGitHubImportFormProps = {
  privData: PrivateRepoData;
  onPrivDataChange: (data: PrivateRepoData) => void;
  onValidationDone: (data: GitValidationResult) => void;
  onSetName: (name: string) => void;
};

const PrivateGitHubImportForm = ({
  privData,
  onPrivDataChange,
  onValidationDone,
  onSetName,
}: PrivateGitHubImportFormProps) => {
  // Use refs to keep callbacks stable and avoid unnecessary effect triggers
  const callbacksRef = useRef({ onPrivDataChange, onValidationDone, onSetName });
  useEffect(() => {
    callbacksRef.current = { onPrivDataChange, onValidationDone, onSetName };
  });

  const { control, watch, getValues, reset } = useForm<PrivateRepoData>({
    defaultValues: privData,
    mode: "onBlur",
  });

  // Track initial mount to avoid resetting on our own updates
  const isInitialMount = useRef(true);
  const lastSyncedDataRef = useRef<string>(JSON.stringify(privData));

  // Sync external privData changes to form (e.g., parent reset)
  // Only reset if the change came from outside (not from our own onPrivDataChange)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newDataStr = JSON.stringify(privData);
    if (newDataStr !== lastSyncedDataRef.current) {
      reset(privData);
      lastSyncedDataRef.current = newDataStr;
    }
  }, [privData, reset]);

  // Watch protocol to conditionally show SSH port field
  const gitProtocol = watch("gitProtocol");

  // Notify parent and run validation - called on blur
  const syncToParent = useCallback(() => {
    const values = getValues();
    const { onPrivDataChange, onValidationDone } = callbacksRef.current;

    // Update our tracking ref to prevent reset loop
    lastSyncedDataRef.current = JSON.stringify(values);

    onPrivDataChange(values);

    const isValid = !!(values.gitBaseUrl && values.username && values.repository && values.email);
    const scheme = values.gitBaseUrl.startsWith("localhost") ? "http" : "https";
    const gitUrl = `${scheme}://${values.gitBaseUrl}/${values.username}/${values.repository}.git`;

    onValidationDone({
      newReadyForNaming: isValid,
      importTypeGitLastValidatedUrl: gitUrl,
      gitPrivateRepo: true,
      privData: values,
    });
  }, [getValues]);

  // Handle repository change - update site name as user types
  const handleRepositoryChange = useCallback(
    (value: string, fieldOnChange: (value: string) => void) => {
      fieldOnChange(value);
      if (value) {
        callbacksRef.current.onSetName(value);
      }
    },
    []
  );

  return (
    <>
      <Box my={1}>
        <Controller
          name="gitBaseUrl"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="git-base-url"
              label="Git Host"
              helperText={
                gitProtocol === "https"
                  ? "Include port if needed (e.g., localhost:3000)"
                  : "Git server hostname (e.g., github.com, localhost)"
              }
              variant="outlined"
              sx={{ margin: (theme) => theme.spacing(1), width: "25ch" }}
              onBlur={() => {
                field.onBlur();
                syncToParent();
              }}
            />
          )}
        />
        <Controller
          name="gitProtocol"
          control={control}
          render={({ field }) => (
            <FormControl
              sx={{ margin: (theme) => theme.spacing(1), minWidth: "12ch" }}
              variant="outlined"
            >
              <InputLabel id="git-protocol-label">Protocol</InputLabel>
              <Select
                {...field}
                labelId="git-protocol-label"
                id="git-protocol"
                label="Protocol"
                onBlur={() => {
                  field.onBlur();
                  syncToParent();
                }}
              >
                <MenuItem value="ssh">SSH</MenuItem>
                <MenuItem value="https">HTTPS</MenuItem>
              </Select>
              <FormHelperText>Connection protocol</FormHelperText>
            </FormControl>
          )}
        />
        {gitProtocol === "ssh" && (
          <Controller
            name="sshPort"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="ssh-port"
                label="SSH Port"
                helperText="SSH port (default: 22)"
                variant="outlined"
                type="number"
                sx={{ margin: (theme) => theme.spacing(1), width: "12ch" }}
                slotProps={{ htmlInput: { min: 1, max: 65535 } }}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 22)}
                onBlur={() => {
                  field.onBlur();
                  syncToParent();
                }}
              />
            )}
          />
        )}
      </Box>

      <Box my={1}>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="username-organization"
              label="Username / Organization"
              helperText="Username or organization containing the target repository"
              variant="outlined"
              sx={{ margin: (theme) => theme.spacing(1) }}
              onBlur={() => {
                field.onBlur();
                syncToParent();
              }}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="email"
              label="E-mail"
              helperText="E-mail address to use for commit messages"
              variant="outlined"
              sx={{ margin: (theme) => theme.spacing(1) }}
              onBlur={() => {
                field.onBlur();
                syncToParent();
              }}
            />
          )}
        />
      </Box>

      <Box my={1}>
        <Controller
          name="repository"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="repository"
              label="Repository"
              helperText="Target Repository"
              variant="outlined"
              sx={{ margin: (theme) => theme.spacing(1) }}
              onChange={(e) => handleRepositoryChange(e.target.value, field.onChange)}
              onBlur={() => {
                field.onBlur();
                syncToParent();
              }}
            />
          )}
        />
      </Box>
    </>
  );
};

export default PrivateGitHubImportForm;
