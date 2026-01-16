import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import service from "../../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import RepositoryInfoCard from "./RepositoryInfoCard";
import { GitValidationResult } from "../newSiteDialogTypes";

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

const emptyRepoInfo: RepoInfo = {
  provider: "",
  screenshot: null,
  hugoTheme: "",
  quiqrModel: "",
  quiqrForms: "",
};

type FormValues = {
  gitUrl: string;
};

export type PublicGitImportFormProps = {
  importSiteURL?: string;
  onValidationDone: (data: GitValidationResult) => void;
  onSetName: (name: string) => void;
  onSetVersion: (version?: string) => void;
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

type ValidationState = {
  isValidating: boolean;
  apiError: string;
  validatedUrl: string;
  repoInfo: RepoInfo;
};

const initialValidationState: ValidationState = {
  isValidating: false,
  apiError: "",
  validatedUrl: "",
  repoInfo: emptyRepoInfo,
};

const PublicGitImportForm = ({
  importSiteURL,
  onValidationDone,
  onSetName,
  onSetVersion,
}: PublicGitImportFormProps) => {
  // Store callbacks in ref to avoid dependency issues
  const callbacksRef = useRef({ onValidationDone, onSetName, onSetVersion });
  useEffect(() => {
    callbacksRef.current = { onValidationDone, onSetName, onSetVersion };
  });

  const { register, watch, reset } = useForm<FormValues>({
    defaultValues: {
      gitUrl: importSiteURL ?? "",
    },
  });

  const gitUrl = watch("gitUrl");

  // Combined validation state - async data from API
  const [validation, setValidation] = useState<ValidationState>(initialValidationState);

  // Track if initial URL was already validated to avoid duplicate validation
  const initialUrlValidatedRef = useRef(false);
  const prevImportUrlRef = useRef(importSiteURL);

  // Derive pre-validation error (computed, not stored)
  const preValidationError = useMemo(() => {
    if (!gitUrl) return "";
    if (!REGEXP_HTTP.test(gitUrl)) {
      return "URL is invalid. Currently only http:// or https:// are supported.";
    }
    return "";
  }, [gitUrl]);

  // Combined error for display - API error takes precedence if URL hasn't changed
  const displayError = gitUrl === validation.validatedUrl
    ? validation.apiError
    : (validation.apiError || preValidationError);

  // Derive if ready for validation (computed, not stored)
  const isReadyForValidation = useMemo(() => {
    return !!gitUrl && !preValidationError && gitUrl !== validation.validatedUrl;
  }, [gitUrl, preValidationError, validation.validatedUrl]);

  const validateUrl = useCallback((url: string) => {
    const { onSetVersion, onSetName, onValidationDone } = callbacksRef.current;

    onSetVersion();
    setValidation({
      isValidating: true,
      apiError: "",
      validatedUrl: "",
      repoInfo: emptyRepoInfo,
    });

    const provider = detectProvider(url);

    const siteName = extractSiteName(url);
    if (siteName) {
      onSetName(siteName);
    }

    service.api
      .quiqr_git_repo_show(url)
      .then((response) => {
        if (response) {
          setValidation({
            isValidating: false,
            apiError: "",
            validatedUrl: url,
            repoInfo: {
              provider,
              screenshot: response.Screenshot ?? null,
              hugoTheme: response.HugoTheme ?? "",
              quiqrModel: response.QuiqrModel ?? "",
              quiqrForms: response.QuiqrFormsEndPoints ?? "",
            },
          });

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
        setValidation((prev) => ({
          ...prev,
          isValidating: false,
          apiError: "It seems that the URL does not point to a valid git repository",
        }));
      });
  }, []);

  // Handle initial URL from props - validate on mount if valid
  useEffect(() => {
    if (importSiteURL && !initialUrlValidatedRef.current && REGEXP_HTTP.test(importSiteURL)) {
      initialUrlValidatedRef.current = true;
      validateUrl(importSiteURL);
    }
  }, [importSiteURL, validateUrl]);

  // Reset form if importSiteURL changes after initial mount
  useEffect(() => {
    if (importSiteURL !== prevImportUrlRef.current) {
      prevImportUrlRef.current = importSiteURL;
      if (importSiteURL) {
        reset({ gitUrl: importSiteURL });
        setValidation(initialValidationState);
        if (REGEXP_HTTP.test(importSiteURL)) {
          validateUrl(importSiteURL);
        }
      }
    }
  }, [importSiteURL, reset, validateUrl]);

  const { ref, ...inputProps } = register("gitUrl");

  return (
    <>
      <Box my={2}>Enter a public git URL with a quiqr website or template to import.</Box>
      <Box my={2} sx={{ display: "flex" }}>
        <TextField
          {...inputProps}
          inputRef={ref}
          fullWidth
          autoFocus
          label="Git URL"
          variant="outlined"
          error={!!displayError}
          helperText={displayError}
        />
        <Button
          variant="contained"
          disabled={validation.isValidating || !isReadyForValidation}
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
        isLoading={validation.isValidating}
        validatedUrl={validation.validatedUrl}
        provider={validation.repoInfo.provider}
        screenshot={validation.repoInfo.screenshot}
        hugoTheme={validation.repoInfo.hugoTheme}
        quiqrModel={validation.repoInfo.quiqrModel}
        quiqrForms={validation.repoInfo.quiqrForms}
      />
    </>
  );
};

export default PublicGitImportForm;
