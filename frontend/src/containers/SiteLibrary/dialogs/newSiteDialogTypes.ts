// Types and state management for NewSlashImportSiteDialog

export type SourceType = "scratch" | "hugotheme" | "folder" | "git" | "";
export type DialogMode = "new" | "import";
export type GitProvider = "github" | "gitlab" | "forgejo" | "generic";

export interface PrivateRepoData {
  gitBaseUrl: string;
  gitProtocol: 'ssh' | 'https';
  sshPort: number;
  username: string;
  repository: string;
  deployPrivateKey: string;
  deployPublicKey?: string;
  email: string;
  branch?: string;
  gitProvider?: GitProvider;
}

export interface HugoThemeInfo {
  Screenshot?: string;
  MinHugoVersion?: string;
  Name?: string;
  License?: string;
  LicenseLink?: string;
  Homepage?: string;
  Demosite?: string;
  Description?: string;
  ExampleSite?: boolean;
  Author?: string;
  AuthorHomepage?: string;
}

export interface DialogState {
  // Step tracking
  activeStep: number;

  // Source type selection
  sourceType: SourceType;

  // Site naming
  siteName: string;
  siteNameError: string;
  isNameValid: boolean;

  // Hugo configuration
  hugoVersion: string;
  hugoExtended: boolean;
  hugoVersionDisabled: boolean;
  hugoExtendedEnabled: boolean;
  generateQuiqrModel: boolean;

  // Form validation state
  isFormValid: boolean;

  // Loading states
  isValidating: boolean;
  isCreating: boolean;

  // Success state
  createdSiteKey: string | null;

  // Source-specific data
  // Hugo theme
  hugoThemeUrl: string;
  hugoThemeInfo: HugoThemeInfo | null;

  // Git import
  gitUrl: string;
  gitPrivateRepo: boolean;
  privateRepoData: PrivateRepoData | null;

  // Folder import
  folderPath: string;

  // Scratch
  scratchConfigFormat: string;

  // Sync configuration (for private git imports)
  enableSync: boolean;
  gitProvider: GitProvider;
}

export const initialDialogState: DialogState = {
  activeStep: 0,
  sourceType: "",
  siteName: "",
  siteNameError: "",
  isNameValid: false,
  hugoVersion: "",
  hugoExtended: false,
  hugoVersionDisabled: false,
  hugoExtendedEnabled: true,
  generateQuiqrModel: true,
  isFormValid: false,
  isValidating: false,
  isCreating: false,
  createdSiteKey: null,
  hugoThemeUrl: "",
  hugoThemeInfo: null,
  gitUrl: "",
  gitPrivateRepo: false,
  privateRepoData: null,
  folderPath: "",
  scratchConfigFormat: "toml",
  enableSync: false,
  gitProvider: "generic",
};

export type DialogAction =
  | { type: "SET_ACTIVE_STEP"; payload: number }
  | { type: "SET_SOURCE_TYPE"; payload: SourceType }
  | { type: "SET_SITE_NAME"; payload: string }
  | { type: "SET_SITE_NAME_ERROR"; payload: string }
  | { type: "SET_NAME_VALID"; payload: boolean }
  | { type: "SET_HUGO_VERSION"; payload: string }
  | { type: "SET_HUGO_EXTENDED"; payload: boolean }
  | { type: "SET_HUGO_VERSION_DISABLED"; payload: boolean }
  | { type: "SET_HUGO_EXTENDED_ENABLED"; payload: boolean }
  | { type: "SET_GENERATE_QUIQR_MODEL"; payload: boolean }
  | { type: "SET_FORM_VALID"; payload: boolean }
  | { type: "SET_VALIDATING"; payload: boolean }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_CREATED_SITE_KEY"; payload: string | null }
  | { type: "SET_HUGO_THEME_URL"; payload: string }
  | { type: "SET_HUGO_THEME_INFO"; payload: HugoThemeInfo | null }
  | { type: "SET_GIT_URL"; payload: string }
  | { type: "SET_GIT_PRIVATE_REPO"; payload: boolean }
  | { type: "SET_PRIVATE_REPO_DATA"; payload: PrivateRepoData | null }
  | { type: "SET_FOLDER_PATH"; payload: string }
  | { type: "SET_SCRATCH_CONFIG_FORMAT"; payload: string }
  | { type: "SET_HUGO_CONFIG"; payload: { version: string; extended: boolean; disabled: boolean; extendedEnabled: boolean; generateModel: boolean } }
  | { type: "SET_ENABLE_SYNC"; payload: boolean }
  | { type: "SET_GIT_PROVIDER"; payload: GitProvider }
  | { type: "RESET_TO_SOURCE_SELECTION" }
  | { type: "RESET_ALL" };

export function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "SET_ACTIVE_STEP":
      return { ...state, activeStep: action.payload };
    case "SET_SOURCE_TYPE":
      return { ...state, sourceType: action.payload };
    case "SET_SITE_NAME":
      return { ...state, siteName: action.payload };
    case "SET_SITE_NAME_ERROR":
      return { ...state, siteNameError: action.payload };
    case "SET_NAME_VALID":
      return { ...state, isNameValid: action.payload };
    case "SET_HUGO_VERSION":
      return { ...state, hugoVersion: action.payload };
    case "SET_HUGO_EXTENDED":
      return { ...state, hugoExtended: action.payload };
    case "SET_HUGO_VERSION_DISABLED":
      return { ...state, hugoVersionDisabled: action.payload };
    case "SET_HUGO_EXTENDED_ENABLED":
      return { ...state, hugoExtendedEnabled: action.payload };
    case "SET_GENERATE_QUIQR_MODEL":
      return { ...state, generateQuiqrModel: action.payload };
    case "SET_FORM_VALID":
      return { ...state, isFormValid: action.payload };
    case "SET_VALIDATING":
      return { ...state, isValidating: action.payload };
    case "SET_CREATING":
      return { ...state, isCreating: action.payload };
    case "SET_CREATED_SITE_KEY":
      return { ...state, createdSiteKey: action.payload };
    case "SET_HUGO_THEME_URL":
      return { ...state, hugoThemeUrl: action.payload };
    case "SET_HUGO_THEME_INFO":
      return { ...state, hugoThemeInfo: action.payload };
    case "SET_GIT_URL":
      return { ...state, gitUrl: action.payload };
    case "SET_GIT_PRIVATE_REPO":
      return { ...state, gitPrivateRepo: action.payload };
    case "SET_PRIVATE_REPO_DATA":
      return { ...state, privateRepoData: action.payload };
    case "SET_FOLDER_PATH":
      return { ...state, folderPath: action.payload };
    case "SET_SCRATCH_CONFIG_FORMAT":
      return { ...state, scratchConfigFormat: action.payload };
    case "SET_HUGO_CONFIG":
      return {
        ...state,
        hugoVersion: action.payload.version,
        hugoExtended: action.payload.extended,
        hugoVersionDisabled: action.payload.disabled,
        hugoExtendedEnabled: action.payload.extendedEnabled,
        generateQuiqrModel: action.payload.generateModel,
      };
    case "SET_ENABLE_SYNC":
      return { ...state, enableSync: action.payload };
    case "SET_GIT_PROVIDER":
      return { ...state, gitProvider: action.payload };
    case "RESET_TO_SOURCE_SELECTION":
      return {
        ...initialDialogState,
        activeStep: 0,
      };
    case "RESET_ALL":
      return initialDialogState;
    default:
      return state;
  }
}
