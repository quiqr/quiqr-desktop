import { useState } from "react";
import service from "../../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";

type PrivData = {
  type: string;
  username: string;
  email: string;
  repository: string;
  branch: string;
  deployPrivateKey: string;
  deployPublicKey: string;
};

type PrivateGitHubImportFormProps = {
  onValidationDone: (data: {
    newReadyForNaming: boolean;
    importTypeGitLastValidatedUrl: string;
    gitPrivateRepo: boolean;
    privData: PrivData;
  }) => void;
  onSetName: (name: string) => void;
};

const PrivateGitHubImportForm = ({
  onValidationDone,
  onSetName,
}: PrivateGitHubImportFormProps) => {
  const [privData, setPrivData] = useState<PrivData>({
    type: "github",
    username: "",
    email: "",
    repository: "",
    branch: "main",
    deployPrivateKey: "",
    deployPublicKey: "",
  });
  const [isGeneratingKeyPair, setIsGeneratingKeyPair] = useState<boolean | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);

  const notifyIfValid = (data: PrivData) => {
    // Check if all required fields are filled, including the private key
    if (data.username && data.repository && data.branch && data.email && data.deployPrivateKey) {
      onSetName(data.repository);
      // Construct the GitHub URL from username and repository
      const gitUrl = `https://github.com/${data.username}/${data.repository}.git`;
      onValidationDone({
        newReadyForNaming: true,
        importTypeGitLastValidatedUrl: gitUrl,
        gitPrivateRepo: true,
        privData: data,
      });
    }
  };

  const generateKeyPair = async () => {
    setIsGeneratingKeyPair(true);
    try {
      const resp = await service.api.createKeyPairGithub();
      setPrivData((prev) => {
        const updated = {
          ...prev,
          deployPrivateKey: resp.privateKey,
          deployPublicKey: resp.publicKey,
        };
        // Notify parent if all fields are now valid
        notifyIfValid(updated);
        return updated;
      });
    } catch (e) {
      service.api.logToConsole(e, "ERRR");
    } finally {
      setIsGeneratingKeyPair(false);
    }
  };

  const updateField = (field: Partial<PrivData>) => {
    setPrivData((prev) => {
      const updated = { ...prev, ...field };
      notifyIfValid(updated);
      return updated;
    });
  };

  const copyToClipboard = () => {
    const { clipboard } = window.require("electron");
    clipboard.writeText(privData.deployPublicKey);
  };

  // Generate key pair on first render
  if (isGeneratingKeyPair === undefined) {
    generateKeyPair();
  }

  return (
    <>
      <Box my={1}>
        <TextField
          id="username-organization"
          label="Username / Organization"
          helperText="GitHub username or organization containing the target repository"
          variant="outlined"
          sx={{ margin: (theme) => theme.spacing(1) }}
          value={privData.username}
          onChange={(e) => updateField({ username: e.target.value })}
        />
        <TextField
          id="email"
          label="E-mail"
          helperText="E-mail address to use for commit messages"
          variant="outlined"
          sx={{ margin: (theme) => theme.spacing(1) }}
          value={privData.email}
          onChange={(e) => updateField({ email: e.target.value })}
        />
      </Box>

      <Box my={1}>
        <TextField
          id="repository"
          label="Repository"
          helperText="Target Repository"
          variant="outlined"
          sx={{ margin: (theme) => theme.spacing(1) }}
          value={privData.repository}
          onChange={(e) => updateField({ repository: e.target.value })}
        />
      </Box>

      <Box my={1}>
        {isGeneratingKeyPair !== false ? (
          <FormControl sx={{ margin: (theme) => theme.spacing(1) }}>
            <InputLabel
              shrink
              htmlFor="progress"
              sx={{
                marginLeft: (theme) => theme.spacing(3),
                backgroundColor: "white",
              }}
            >
              Deploy Public Key
            </InputLabel>
            <Paper
              variant="outlined"
              id="progress"
              elevation={1}
              sx={{
                height: "160px",
                padding: "40px",
                cursor: "pointer",
                backgroundColor: "#eee",
                "&:hover": { backgroundColor: "#ccc" },
              }}
            >
              <LinearProgress />
            </Paper>
          </FormControl>
        ) : (
          <FormControl
            sx={{ margin: (theme) => theme.spacing(1), width: "60ch" }}
            variant="outlined"
          >
            <InputLabel htmlFor="deploy-public-key">Deploy Public Key</InputLabel>
            <OutlinedInput
              id="deploy-public-key"
              type={showPassword ? "text" : "password"}
              value={privData.deployPublicKey}
              onChange={(e) => updateField({ deployPublicKey: e.target.value })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle deploy key visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
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
          sx={{
            margin: (theme) => theme.spacing(1),
            marginTop: (theme) => theme.spacing(2),
          }}
          disabled={isGeneratingKeyPair !== false}
          onClick={copyToClipboard}
          variant="contained"
        >
          Copy
        </Button>

        <Button
          sx={{
            margin: (theme) => theme.spacing(1),
            marginTop: (theme) => theme.spacing(2),
          }}
          onClick={generateKeyPair}
          disabled={isGeneratingKeyPair !== false}
          color="secondary"
          variant="contained"
        >
          Re-generate
        </Button>
      </Box>
    </>
  );
};

export default PrivateGitHubImportForm;
