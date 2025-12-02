import { useState, useEffect } from "react";
import service from "../../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import RepositoryInfoCard from "./RepositoryInfoCard";

const REGEXP_HTTP = /^http(s?):\/\//i;
const REGEXP_GITHUB = /^https:\/\/github\.com\//i;
const REGEXP_GITLAB = /^https:\/\/gitlab\.com\//i;
const REGEXP_SOURCEHUT = /^https:\/\/git\.sr\.ht\//i;

type RepoInfo = {
  provider: string;
  screenshot: string | null;
  hugoTheme: string;
  quiqrModel: string;
  quiqrForms: string;
};

type PublicGitImportFormProps = {
  importSiteURL?: string;
  onValidationDone: (data: {
    newReadyForNaming: boolean;
    importTypeGitLastValidatedUrl: string;
    importTypeGitInfoDict: unknown;
  }) => void;
  onSetName: (name: string) => void;
  onSetVersion: (version?: string) => void;
};

const PublicGitImportForm = ({
  importSiteURL,
  onValidationDone,
  onSetName,
  onSetVersion,
}: PublicGitImportFormProps) => {
  const [gitUrl, setGitUrl] = useState(importSiteURL ?? "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  // Initialize based on whether we have a valid initial URL
  const [isReadyForValidation, setIsReadyForValidation] = useState(
    () => !!importSiteURL && REGEXP_HTTP.test(importSiteURL)
  );
  const [validatedUrl, setValidatedUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState<RepoInfo>({
    provider: "",
    screenshot: null,
    hugoTheme: "",
    quiqrModel: "",
    quiqrForms: "",
  });

  const preValidateUrl = (url: string): boolean => {
    if (!REGEXP_HTTP.test(url)) {
      setValidationError("URL is invalid. Currently only http:// or https:// are supported.");
      setIsReadyForValidation(false);
      return false;
    }
    setValidationError("");
    setIsReadyForValidation(true);
    return true;
  };

  const detectProvider = (url: string): string => {
    if (REGEXP_GITHUB.test(url)) return "GitHub";
    if (REGEXP_GITLAB.test(url)) return "GitLab";
    if (REGEXP_SOURCEHUT.test(url)) return "SourceHut";
    return "Unknown";
  };

  const extractSiteName = (url: string): string => {
    const urlParts = url.split("/");
    let siteName = urlParts.pop() || urlParts.pop() || "";
    if (siteName.includes(".")) {
      siteName = siteName.split(".").pop() || siteName;
    }
    return siteName;
  };

  const validateUrl = (url: string) => {
    onSetVersion();
    setRepoInfo({
      provider: "",
      screenshot: null,
      hugoTheme: "",
      quiqrModel: "",
      quiqrForms: "",
    });
    setValidationError("");
    setValidatedUrl("");
    setIsReadyForValidation(false);
    setIsValidating(true);

    const provider = detectProvider(url);
    setRepoInfo((prev) => ({ ...prev, provider }));

    const siteName = extractSiteName(url);
    if (siteName) {
      onSetName(siteName);
    }

    service.api
      .quiqr_git_repo_show(url)
      .then((response) => {
        if (response) {
          setRepoInfo({
            provider,
            screenshot: response.Screenshot ?? null,
            hugoTheme: response.HugoTheme ?? "",
            quiqrModel: response.QuiqrModel ?? "",
            quiqrForms: response.QuiqrFormsEndPoints ?? "",
          });
          setIsValidating(false);
          setValidatedUrl(url);

          if (response.HugoVersion) {
            onSetVersion(response.HugoVersion);
          }

          onValidationDone({
            newReadyForNaming: true,
            importTypeGitLastValidatedUrl: url,
            importTypeGitInfoDict: response,
          });
        }
      })
      .catch(() => {
        setValidationError("It seems that the URL does not point to a valid git repository");
        setIsValidating(false);
      });
  };

  const handleUrlChange = (value: string) => {
    setGitUrl(value);
    if (value) {
      if (validatedUrl !== value) {
        preValidateUrl(value);
      } else {
        setValidationError("");
        setIsReadyForValidation(false);
      }
    }
  };

  // Handle initial URL from props
  useEffect(() => {
    if (importSiteURL && importSiteURL !== gitUrl) {
      setGitUrl(importSiteURL);
      if (preValidateUrl(importSiteURL)) {
        validateUrl(importSiteURL);
      }
    }
    // Only run when importSiteURL prop changes
  }, [importSiteURL]);

  return (
    <>
      <Box my={2}>Enter a public git URL with a quiqr website or template to import.</Box>
      <Box my={2} sx={{ display: "flex" }}>
        <TextField
          fullWidth
          autoFocus
          label="Git URL"
          value={gitUrl}
          variant="outlined"
          onChange={(e) => handleUrlChange(e.target.value)}
          error={!!validationError}
          helperText={validationError}
        />
        <Button
          variant="contained"
          disabled={isValidating || !isReadyForValidation}
          sx={{
            marginLeft: (theme) => theme.spacing(1),
            width: 400,
            height: 55,
          }}
          color="primary"
          onClick={() => validateUrl(gitUrl)}
        >
          Validate Remote Repository
        </Button>
      </Box>

      <RepositoryInfoCard
        isLoading={isValidating}
        validatedUrl={validatedUrl}
        provider={repoInfo.provider}
        screenshot={repoInfo.screenshot}
        hugoTheme={repoInfo.hugoTheme}
        quiqrModel={repoInfo.quiqrModel}
        quiqrForms={repoInfo.quiqrForms}
      />
    </>
  );
};

export default PublicGitImportForm;
