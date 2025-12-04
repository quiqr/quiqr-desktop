import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";

type PrivData = {
  type: string;
  gitBaseUrl: string;
  gitProtocol: 'ssh' | 'https';
  sshPort: number;
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
    type: "git",
    gitBaseUrl: "github.com",
    gitProtocol: "ssh",
    sshPort: 22,
    username: "",
    email: "",
    repository: "",
    branch: "main",
    deployPrivateKey: "",
    deployPublicKey: "",
  });

  const notifyParent = (data: PrivData) => {
    // Check if all required fields are filled (deploy key will be added in step 3)
    const isValid = !!(data.gitBaseUrl && data.username && data.repository && data.email);

    if (isValid) {
      onSetName(data.repository);
    }

    // Construct the Git URL from base URL, username and repository
    const scheme = data.gitBaseUrl.startsWith('localhost') ? 'http' : 'https';
    const gitUrl = `${scheme}://${data.gitBaseUrl}/${data.username}/${data.repository}.git`;

    onValidationDone({
      newReadyForNaming: isValid,
      importTypeGitLastValidatedUrl: gitUrl,
      gitPrivateRepo: true,
      privData: data,
    });
  };

  const updateField = (field: Partial<PrivData>) => {
    setPrivData((prev) => {
      const updated = { ...prev, ...field };
      notifyParent(updated);
      return updated;
    });
  };

  // Notify parent on initial render
  useEffect(() => {
    notifyParent(privData);
  }, []);

  return (
    <>
      <Box my={1}>
        <TextField
          id="git-base-url"
          label="Git Host"
          helperText={privData.gitProtocol === 'https'
            ? "Include port if needed (e.g., localhost:3000)"
            : "Git server hostname (e.g., github.com, localhost)"}
          variant="outlined"
          sx={{ margin: (theme) => theme.spacing(1), width: '25ch' }}
          value={privData.gitBaseUrl}
          onChange={(e) => updateField({ gitBaseUrl: e.target.value })}
        />
        <FormControl sx={{ margin: (theme) => theme.spacing(1), minWidth: '12ch' }} variant="outlined">
          <InputLabel id="git-protocol-label">Protocol</InputLabel>
          <Select
            labelId="git-protocol-label"
            id="git-protocol"
            value={privData.gitProtocol}
            onChange={(e) => updateField({ gitProtocol: e.target.value as 'ssh' | 'https' })}
            label="Protocol"
          >
            <MenuItem value="ssh">SSH</MenuItem>
            <MenuItem value="https">HTTPS</MenuItem>
          </Select>
          <FormHelperText>Connection protocol</FormHelperText>
        </FormControl>
        {privData.gitProtocol === 'ssh' && (
          <TextField
            id="ssh-port"
            label="SSH Port"
            helperText="SSH port (default: 22)"
            variant="outlined"
            type="number"
            sx={{ margin: (theme) => theme.spacing(1), width: '12ch' }}
            value={privData.sshPort}
            onChange={(e) => updateField({ sshPort: parseInt(e.target.value, 10) || 22 })}
            slotProps={{ htmlInput: { min: 1, max: 65535 } }}
          />
        )}
      </Box>

      <Box my={1}>
        <TextField
          id="username-organization"
          label="Username / Organization"
          helperText="Username or organization containing the target repository"
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
    </>
  );
};

export default PrivateGitHubImportForm;
