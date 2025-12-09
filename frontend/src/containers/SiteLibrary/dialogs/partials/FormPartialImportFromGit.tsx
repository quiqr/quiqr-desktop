import { useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import PublicGitImportForm from "./PublicGitImportForm";
import PrivateGitHubImportForm from "./PrivateGitHubImportForm";
import { GitValidationResult, PrivateRepoData } from "../newSiteDialogTypes";

type FormPartialImportFromGitProps = {
  importSiteURL?: string;
  privData: PrivateRepoData;
  onPrivDataChange: (data: PrivateRepoData) => void;
  onValidationDone: (data: GitValidationResult) => void;
  onSetName: (name: string) => void;
  onSetVersion: (version?: string) => void;
};

const FormPartialImportFromGit = ({
  importSiteURL,
  privData,
  onPrivDataChange,
  onValidationDone,
  onSetName,
  onSetVersion,
}: FormPartialImportFromGitProps) => {
  const [usePrivateRepo, setUsePrivateRepo] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      onSetVersion("set");
    } else {
      onSetVersion();
    }
    setUsePrivateRepo(checked);
  };

  return (
    <Box my={2}>
      <FormControlLabel
        sx={{
          margin: (theme) => theme.spacing(1),
          marginTop: (theme) => theme.spacing(2),
        }}
        control={
          <Switch
            checked={usePrivateRepo}
            onChange={(e) => handleToggle(e.target.checked)}
            name="usePrivateRepo"
            color="primary"
          />
        }
        label="Private GitHub Repository"
      />

      {usePrivateRepo ? (
        <PrivateGitHubImportForm
          privData={privData}
          onPrivDataChange={onPrivDataChange}
          onValidationDone={onValidationDone}
          onSetName={onSetName}
        />
      ) : (
        <PublicGitImportForm
          importSiteURL={importSiteURL}
          onValidationDone={onValidationDone}
          onSetName={onSetName}
          onSetVersion={onSetVersion}
        />
      )}
    </Box>
  );
};

export default FormPartialImportFromGit;
