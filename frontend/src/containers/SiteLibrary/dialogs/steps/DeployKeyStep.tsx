import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import service from "../../../../services/service";

interface DeployKeyStepProps {
  deployPublicKey: string;
  onKeyGenerated: (privateKey: string, publicKey: string) => void;
}

const DeployKeyStep = ({
  deployPublicKey,
  onKeyGenerated,
}: DeployKeyStepProps) => {
  // Use undefined to track if we've done initial generation check
  const [isGeneratingKeyPair, setIsGeneratingKeyPair] = useState<boolean | undefined>(
    deployPublicKey ? false : undefined
  );
  const [showKey, setShowKey] = useState(false);
  const [localPublicKey, setLocalPublicKey] = useState(deployPublicKey);

  const generateKeyPair = async () => {
    setIsGeneratingKeyPair(true);
    try {
      const resp = await service.api.createKeyPairGithub();
      setLocalPublicKey(resp.publicKey);
      onKeyGenerated(resp.privateKey, resp.publicKey);
    } catch (e) {
      service.api.logToConsole(e, "ERRR");
    } finally {
      setIsGeneratingKeyPair(false);
    }
  };

  const copyToClipboard = () => {
    const { clipboard } = window.require("electron");
    clipboard.writeText(localPublicKey);
  };

  // Generate key pair on first render if not already present
  if (isGeneratingKeyPair === undefined) {
    generateKeyPair();
  }

  return (
    <>
      <Box my={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Important:</strong> You need to add the deploy key below to your Git repository before importing.
          </Typography>
        </Alert>

        <Typography variant="body1" paragraph>
          Copy the public key below and add it as a <strong>Deploy Key</strong> in your repository settings.
          Make sure to enable <strong>write access</strong> if you want to sync changes back to the repository.
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          For detailed instructions on adding deploy keys to GitHub, GitLab, Forgejo, or other Git providers, see:{' '}
          <Link
            href="https://book.quiqr.org/importing-a-private-repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            book.quiqr.org/importing-a-private-repo
          </Link>
        </Typography>
      </Box>

      <Box my={2}>
        {isGeneratingKeyPair !== false ? (
          <FormControl sx={{ width: "100%" }}>
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
                paddingTop: "19.5px",
                paddingRight: '14px',
                paddingBottom: "19.5px",
                paddingLeft: '14px',
                backgroundColor: "#eee",
              }}
            >
              {/* sx={{paddingTop: '0.5em', paddingBottom: '0.5em'}} */}
              <LinearProgress />
            </Paper>
          </FormControl>
        ) : (
          <FormControl sx={{ width: "100%" }} variant="outlined">
            <InputLabel htmlFor="deploy-public-key">Deploy Public Key</InputLabel>
            <OutlinedInput
              id="deploy-public-key"
              type={showKey ? "text" : "password"}
              value={localPublicKey}
              readOnly
              multiline={showKey}
              rows={showKey ? 3 : 1}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle deploy key visibility"
                    onClick={() => setShowKey(!showKey)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="large"
                  >
                    {showKey ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Deploy Public Key"
            />
          </FormControl>
        )}
      </Box>

      <Box my={2} display="flex" gap={1}>
        <Button
          disabled={isGeneratingKeyPair !== false || !localPublicKey}
          onClick={copyToClipboard}
          variant="contained"
          color="primary"
        >
          Copy to Clipboard
        </Button>

        <Button
          onClick={generateKeyPair}
          disabled={isGeneratingKeyPair !== false}
          variant="outlined"
        >
          Re-generate Key
        </Button>
      </Box>
    </>
  );
};

export default DeployKeyStep;
