import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import type { GitProvider } from "../newSiteDialogTypes";

interface SyncConfigStepProps {
  enableSync: boolean;
  gitProvider: GitProvider;
  suggestedProvider: GitProvider;
  onEnableSyncChange: (enabled: boolean) => void;
  onGitProviderChange: (provider: GitProvider) => void;
}

const providerLabels: Record<GitProvider, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  forgejo: "Forgejo / Gitea / Codeberg",
  generic: "Other / Generic Git",
};

const SyncConfigStep = ({
  enableSync,
  gitProvider,
  suggestedProvider,
  onEnableSyncChange,
  onGitProviderChange,
}: SyncConfigStepProps) => {
  return (
    <>
      <Box my={2}>
        <Typography variant="h6" gutterBottom>
          Sync Configuration
        </Typography>

        <Typography variant="body1" paragraph>
          With sync enabled, you can upload changes you make to your site back to the repository.
          This requires your deploy key to have <strong>write access</strong>.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            If you only need to import the site once and don&apos;t plan to push changes back,
            you can leave sync disabled.
          </Typography>
        </Alert>
      </Box>

      <Box my={3}>
        <FormControlLabel
          control={
            <Switch
              checked={enableSync}
              onChange={(e) => onEnableSyncChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">Enable automatic sync</Typography>
              <Typography variant="body2" color="text.secondary">
                Push changes from your local site back to the repository
              </Typography>
            </Box>
          }
        />
      </Box>

      {enableSync && (
        <Box my={3}>
          <FormControl fullWidth>
            <InputLabel id="git-provider-label">Git Provider</InputLabel>
            <Select
              labelId="git-provider-label"
              id="git-provider"
              value={gitProvider}
              label="Git Provider"
              onChange={(e) => onGitProviderChange(e.target.value as GitProvider)}
            >
              <MenuItem value="github">{providerLabels.github}</MenuItem>
              <MenuItem value="gitlab">{providerLabels.gitlab}</MenuItem>
              <MenuItem value="forgejo">{providerLabels.forgejo}</MenuItem>
              <MenuItem value="generic">{providerLabels.generic}</MenuItem>
            </Select>
          </FormControl>

          {suggestedProvider !== "generic" && gitProvider !== suggestedProvider && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Based on your repository URL, we detected <strong>{providerLabels[suggestedProvider]}</strong>.
                You can override this if needed.
              </Typography>
            </Alert>
          )}

          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {gitProvider === "github" && (
                <>
                  GitHub Actions will be configured to automatically build your Hugo site
                  and deploy to GitHub Pages when you push changes.
                </>
              )}
              {gitProvider === "gitlab" && (
                <>
                  GitLab CI/CD will be configured to automatically build your Hugo site
                  and deploy to GitLab Pages when you push changes.
                </>
              )}
              {gitProvider === "forgejo" && (
                <>
                  Forgejo Actions will be configured to automatically build your Hugo site
                  when you push changes.
                </>
              )}
              {gitProvider === "generic" && (
                <>
                  No CI/CD configuration will be added. You can manually configure
                  your build and deployment pipeline.
                </>
              )}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SyncConfigStep;

/**
 * Detect git provider from a base URL
 */
export function detectGitProvider(baseUrl: string): GitProvider {
  const url = baseUrl.toLowerCase();

  if (url.includes("github.com") || url.includes("github.")) {
    return "github";
  }
  if (url.includes("gitlab.com") || url.includes("gitlab.")) {
    return "gitlab";
  }
  if (url.includes("codeberg.org") || url.includes("forgejo.") || url.includes("gitea.")) {
    return "forgejo";
  }

  return "generic";
}
