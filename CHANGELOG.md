# Quiqr App CHANGELOG

## NEXT RELEASE
- **BREAKING CHANGE:** Removed legacy direct OpenAI field AI assist
  - Removed `openAiApiKey` configuration from Advanced Preferences
  - Removed direct OpenAI API calls from frontend (`openai` npm package)
  - Removed `meta.enableAiAssist` flag from form system
  - **Migration:** Use template-based field AI assist with `field_prompt_templates/`
  - **Migration:** Configure LLM providers via `QUIQR_LLM_PROVIDER_*` environment variables
  - **See:** Documentation in `prompts_templates.md` for migration guide
- feature: Field AI Assist with Prompt Templates
  - Add `field_prompt_templates/` directory for field-specific AI templates
  - Support both `.yaml` and `.yml` file extensions for all templates
  - New variables: `self.fields.[key].content` for page templates
  - New variables: `parent_page.fields.[key].content` for field templates
  - Rename components: `AiAssist.tsx` → `PageAIAssistButton.tsx`, `AIAssistDialog.tsx` → `PageAIAssistDialog.tsx`
  - Create `FieldAIAssistButton` and `FieldAIAssistDialog` components
  - Backend: Enhanced `prompt-template-processor.ts` with field context support
  - Backend: Add field prompt template handlers
  - Backend: Support both `.yaml` and `.yml` extensions with `.yaml` precedence
- feature: Add OpenSpec Workflow for Spec-Driven Development
- feature: SSG provider architecture - support for multiple static site generators (Jekyll added)
- feature: standalone web version with menu bar replacing Electron native menu
- feature: collapsible sidebar with workspace switcher and site developer settings
- feature: breadcrumb navigation in nest fields and accordions
- feature: implement openExternal and SSE for menu updates
- fix: reload theme automatically when toggling between light and dark theme
- fix: config.mounts handling and site name validation in config migration
- fix: clear site library cache before navigating to newly imported sites
- fix: Field AI templates - `parent_page.fields.*` variable resolution for Singles
- refactor: convert all remaining class components to functional components
- refactor: massive TypeScript improvements - removed hundreds of `any` types across codebase
- refactor: workspace routing from wildcard to nested routes
- refactor: dialog management through DialogContext
- refactor: replace Jimp with Sharp for image processing
- chore: upgrade Node.js to v22 in CI, add backend tests with coverage reporting
- chore: monorepo package refactoring - moved frontend to @quiqr/frontend workspace
- chore: upgrade glob package from v10 to v13 with comprehensive test coverage
- chore: add ESLint configs for all packages and contribution guidelines
- security: remove dependency on @electron/remote. Enable nodeIntegration: false and contextIsolation: true

## 0.21.6 (2025-12-12)
- fix: improve position of AI Assist Button
- fix: in Funding a todo is set for the new idea of having a Quiqr Stichting
- feature: AI Assist Button with Prompt templates for Page objects
- feature: new fresh AI Assist Button with Prompt templates for Page objects 🕺
- docs: add docs book and new docs. This will be the future for Quiqr's official documentation
- feature: rerender based on chokidar change
- fix: replace localhost with windows.location.hostname
- feature: add chokidar file watcher to model
- fix: correct type definition for prompt_templates to string array
- feature: add prompt_templates field to FormMeta interface
- chore: more informative Zod/schema errors. When a site model is incorrect, we
    need to identify the configuration error using this message
- chore: hide/remove noise console.logs
- wip: fix hugo download race condition
- fix: concurrent hugo download
- chore: convert import from hugo theme to functional
- chore: convert import from folder to functional
- chore: convert site view (home, single, collection) to functional
- chore: convert SiteConfRoute to functional
- chore: convert sync dialogs to functional
- chore: convert site library cards/rows to functional
- chore: convert preferences to functional
- chore: convert collection action dialogs to functional
- chore: convert ProgressDialog to functional
- chore: Convert SelectImagesDialog to functional
- chore: convert console output to functional
- chore: convert FormPartialNewFromScratch to functional
- chore: convert ToolbarToggleButtonGroup to functional
- chore: convert FolderPicker to functional
- chore: convert CardNew to functional
- fix: wrap setState in callback
- chore: convert CardNew to functional
- feature: let hugo listen to 0.0.0.0
- chore: convert layouts and sidebars to functional components
- fix: new network addresses for the server version

## 0.21.5 (2025-12-09)
- fix: default message at API root url
- chore: convert workspaces to functional. track progress
- chore: add SSE endpoints to server
- chore: actually display progress in SyncBusyDialog
- chore: add optional callback to track progress
- chore: add reusable sync progress hook
- chore: remove dead code, add todo comments
- feat: make openExternal and copyToClipboard platform agnostic
- feat: re-enable updateCommunityTemplates
- fix: slow form renders in public git import form
- fix: slow form renders in private import form
- chore: update readme
- chore: remove unneccesary json parse

## 0.21.4 (2025-12-09)
- fix: run glob relative to workspace
- chore: convert select from query to typescript
- fix: make dynamic form fields optional
- chore: delete unused electron file from frontend
- chore(lint): autofix replace let and var with const
- chore: ignore build, dist and node_modules in eslint config
- chore: remove image plugin from markdown editor
- fix: replace references to old component system
- chore: update chartjs and fix colors
- feat: remove old component system
- convert Eisenhouwer field to functional component
- chore: cleanup debugging logs
- fix: actually delete bundle-manager items from disk instead of soft-deleting
- fix: implement BundleImgThumbField and save resources to singles config
- feat: add scaffold field command
- feat: add dev tutorial explaining the new field registry
- fix: bundle image upload size in express. TODO: convert to formdata
- wip: rewrite bundlemanager to functional component. use api and native filepickers instead of electron windows
- fix: convert image select field to new system
- wip: fontpickerfield
- wip: FontIconPicker
- chore: convert leafarray to functional component
- chore: convert accordion to functional component
- chore: replace react-simplemde-editor with mdxeditor
- feature: make nest a dropdown for quick validation
- fix: remove unneeded fragment causing a warning
- fix: remove unneeded fragment causing a warning
- refactor: implement SelectField
- refactor: implement SectionField
- refactor: implement NumberField
- refactor: implement NestField
- refactor: implement DateField
- refactor: implement ChipsField
- refactor: implement UniqField
- refactor: implement StringField
- fix: temporarily improve layout
- wip: opt in to new form system
- refactor: implement ToggleField
- refactor: implement SliderField
- refactor: implement ReadonlyField
- refactor: implement PullField
- refactor: implement InfoField
- refactor: implement HiddenField
- refactor: implement EmptyLineField
- refactor: implement ColorField
- wip: create foundation for refactored functional form field component
- fix: move deprecated prop to slotProps
- chore: convert CardNew to functional
- chore: add GitValidationResult in private and public import forms
- chore: type onValidationDone with GitValidationResult type
- chore: add GitValidationResult type
- feat: support multiple git providers, like github, gitlab, forgea/codeberg, for both import and sync.
- feat: When a user imports a private repository, they get instructions to add a
    deploykey. If they enable write access, a sync target is also created
    automatically.
- refactor: remove unneccesary effect
- feat: move deploy key to separate step, include instructions
- feat: rewrite git importer to accept generic git base URL, port, protocol.
- fix: add embgit instructions
- chore: upgrade electron-builder to latest
- fix: invalid dom nesting in DeleteSiteDialog
- chore: add clarifying comment to SSE
- fix: add apischema for derived public key
- fix: derive public key from priv key
- fix: handle local history errors by logging
- fix: refresh commit history after push
- refactor: split import form into separate components
- fix: add missing prop to DangerButton
- fix: make sure hugo is downloaded before serving the webpage
- fix: stop each hugo versions server when switching to a new workspace
- chore: remove debug logs
- fix: icons in hugo build
- fix: use a ref instead of useState to avoid triggering rerenders, for example on error
- fix: unpack 7zip from deps
- fix: remove chained state update with useEffect
- fix: convert HugoDownloader to typescript and implement SSE for progress
- fix: implement setting the current baseUrl in the app state
- feat: add api schema for hugo version check
- fix: raise express body size limit to account for large base64 encoded screenshots
- Minor layout fixes
- refactor: move multi step form to reducer and mui stepper
- fix: properly closing new and import dialogs
- fix: replace backslashes on windows with forward slashes for usage in glob
- fix windows navigation by serving frontend from express
- fix: circular dependency
- chore: update react-router-dom to v7. no breaking changes
- feat: convert git sync to ts
- fix: run key gen in temp dir and fix properties
- fix types
- chore: remove unused scripts from frontend package.json
- fix: various mui 7 syntax fixes
- chore: upgrade to react 19 and mui 7. update Grid component syntax
- fix: change ReactDOM.render to createRoot
- chore: Migrate react-router-dom from v5 to v6. Convert class to functional components.
- wip: upgrade to react-router-dom v6. Disable easymde and EasyMarkDownDynamic in prep of react 19 upgrade
- fix: replace most of the weird routing patterns with NavLink from react-router-dom
- wip: themeing
- fix: add missing api response schemas
- fix: invalid domnesting
- wip: theme
- refactor: co-locate css with markup. delete css files
- fix warning
- refactor: replace bootstrap grid with mui grid
- wip: move all appstyles to mui theme
- chore: fix linting issues in App.tsx
- fix: add keys to Dialogs to remount every time
- refactor: unneccesary useEffect
- feat: simplify EditSiteTagsDialog
- feat: simplify CopySiteDialog
- wip: initial cleanup of Dialogs
- fix: CopySiteDialog
- fix build
- refactor: separate site library routing from views
- fix: remove unused prop from SiteItemMenu
- refactor: split SiteLibraryRouted into components
- chore: code style instructions
- refactor: move actions to hooks (open dialogs, delete sites, etc)
- chore: make eslint ignore unused variables starting with an underscore
- chore:convert DeleteSiteDialog to functional component
- wip: convert dialogs to functional components (broken for now)
- fix: avoid duplicating the pathname when copying if the path is an absolute path
- chore: add eslint plugin for useEffect rules
- chore: add example sites to gitignore
- fix: light theme value in select
- chore: remove unused/replaced code
- fix: restore MIT License
- add dockerfile for standalone version
- chore: remove unused packages from root package.json. Replaced node-fetch with regular fetch
- nuke /backend and /electron
- chore: update hugo versions
- fix: add collections to inital workspace config builder
- fix: replace commonjs require with esm import in shell-handler
- fix: resolve root so standalone adapter knows about resources/embgit.
- temp: disable background worker logging
- fix: formatting
- fix: update readme
- feat: add standalone version with dev adapters (server runs and only console.logs)
- add refined plan for next steps: web adapter, remove menu-manager and use MUI dialogs instead of browserwindows
- feat: remove last electron part to handler
- fix: implement sync-to-folder. Stub git sync for now
- fix: illegal h6 nesting in h2
- fix: illegal dom nesting of paragraph elements
- fix: set first workspace as default if source is not set
- fix: remove leading slashes to ensure path.join works correctly
- fix: implement listWorkspaces
- fix: connect menu-manager to backend handlers
- fix: convert pogozipper to typescript
- wip: port emgit to ts. still uses a lot of .js
- fix: checkFreeSiteName
- chore: migrate git import to ts
- chore: implement remaining handlers. Todo: filewatching and hugo download
- chore: implement globSyncHandler and createWorkspaceServiceForParams
- chore: implement parseFileToObject
- chore: implement copySiteHandler
- fix: fix build, update glob to esm
- chore: implement window handlers
- chore: convert window managers to typescript
- chore: migrates jobs to packages/backend and typescript
- chore: update todo with build command
- chore: migrate build-actions to typescript
- chore: update electron to latest in adapter
- chore: update dev command to include file watching in /packages
- chore: implement remaining methods in handlers
- feat: create very minimal viable electron product
- wip: migrate workspace-service to typescript.
- chore: partially convert hugo builder, config and server
- chore: migrate folder importer to TypeScript
- chore: migrate SiteService and factories to TypeScript
- chore: implement site-handlers and import-handlers related to SiteLibrary
- chore: convert the rest of library-service.ts to typescript
- chore: convert getSiteConf to typescript
- chore: convert hugo-utils to typescript
- chore: add temporary 'test'. Todo: create proper tests with vitest
- chore: implement migrated configuration-data-provider in typescript
- wip: incremental api migration with stubs
- chore: convert workspace-config-provider to typescript
- chore: add quiqr docs to gitignore
- chore: convert initial-workspace-config-builder to typescript
- chore: convert file-cache-token to typescript
- chore: convert workspace-config-validator to typescript. add types from @quiqr/types
- chore: convert folder-helper to packages/backend
- chore: replace global.pogoconf with DI configuration class
- chore: move utilities like format providers to packages/backend/src/utils
- chore: create adapter structure for @quiqr/backend/adapters
- chore: create monorepo structure for @quiqr/backend
- chore: update TODO.md with phase once completion
- chore: Move types from frontend to @quiqr/types monorepo package
- fix: replace deprecated/removed button prop on ListItem with ListItemButton
- fix: add 'as const' to style
- fix: typo in Sidebar method name
- chore: add state and proptypes to ToggleDynamic
- fix: typing in SelectDynamic by using built-in MUI types
- chore: add state and proptypes to SliderDynamic
- chore: add state and proptypes to NestDynamic
- chore: add state and proptypes to LeafArrayDynamic
- chore: add prop and statetypes to ImageSelectDynamic
- chore: add prop and statetypes to FontIconPickerDynamic
- chore: add prop and statetypes to EisenhouwerDynamic
- chore: add prop and statetypes to DateDynamic
- fix: set parseFileToObject type to any because we dont know the shape of select-from-query files
- chore: add prop and statetypes to ColorToolDynamic
- chore: add prop and statetypes to ChipsDynamic
- fix: disable custom fields for now to catch schema errors in core fields
- chore: Add state and proptypes to TextFieldNumberDynamic
- chore: update SukohForm component instructions
- chore: Add state and proptypes to BundleImgThumbDynamic and BundleMangerDynamic
- fix: replace inline defined UserPreferences type with the one from types.ts
- fix: remove AIclient beta property
- chore: regenerate package-lock.json after rebase
- chore: remove openai from backend, update frontend package to latest version
- chore: add rpm build command
- temp: disable notarizing for now
- chore: uninstall react-scripts
- fix: build
- chore: update outdated packages
- fix: button prop warning in ListItem
- wip: (needs tests) replace request with node-fetch, remove unused npm scripts +
    dependencies. npm audit in root is clean now
    delete old react-codemod
- chore: update local run instructions
- chore: many npm updates (npm audit)
- fix: fix npm build
- fix: sync route dialogs not showing up
- fix: add name to synced folders. Automatically transform existing synced
    projects to include the name property. Without this, the broken configs from
    previous versions didn't show up in the site library.
- fix: sync to folder folderpicker dialog
- fix: replace local type declarations with types.ts
- chore: add windows target build command, disable x32
- fix: remove AIclient beta property
- fix: add typed response to readConfKey
- fix: replace inline defined UserPreferences type with the one from types.ts

## 0.21.3 (2025-11-21)
- chore: Start using npm workspaces
- chore: Added tons of zod schemas and types.
- chore: Replaced most of the types that were declared locally in the dynamic fields.
- chore: The single source of truth is now frontend/types.ts.
- chore: Added typing to BaseService, Service and UIService.
- fix: Fixed SnackbarManager. Notifications/toasts work now!

## 0.21.2 (2025-11-20)
- chore: react 19
- chore: electron 39
- WIP: migrate to TS
- WIP: migrate to MUI 6

## 0.21.1 (2025-02-24)
- fix: cleanups in package.jsons
- fix: add scripts

## 0.21.0 (2025-02-13)
- first kind of working version

---

## 0.19.10 (2025-04-15)
- fix: fix nested accordions causing Unexpected state fix nested accordions causing Unexpected state 🎉
- feature: add open with filemanager icon in bundle Manager
- fix: filter extensions for bundle manager when having a starting / (abs path)

## 0.19.9 (2025-04-14)
- fix: wrong item listing bug for content outside content dir.
- fix: sorting Items in accordion. From swap items to real ordering

## 0.19.8 (2025-03-10)
- fix: replace all in buildActions by switching to RegEx

## 0.19.7 (2025-03-10)
- feature: `site_path_replace` and `document_path_replace` in buildActions definition to replace substrings before execution. [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/)
- fix: new icon for macos

## 0.19.6 (2025-03-05)
- fix: improve first start
- feature: buildActions [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/)
- feature: buildActions with default variables [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/)
- feature: add search replace for return paths. This is primary implemented to remap the Windows WSL return paths.
- feature: preference variables [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/30-global-preferences/20-variables/)
- breaking: the variables site_path and site_name have been
  renamed to SITE_NAME, SITE_PATH. [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/30-global-preferences/30-advanced/)

## 0.19.5 (2025-02-20)
- fix: whitescreen in compiled version
- feature: add txtInsertButtons option to string fieldtype [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/data-field-types/string/)
- feature: add loadingCircle when actionButton is busy
- feature: add loadingCircle when AI popup is busy
- feature: add buildActions to single form
- fix: prevent timeouts for buildActions

### Stats
- 51 modules 72.76M
- 9 community templates
- 128 stars

---

## 0.19.2 (2025-01-30)
- fix: missing build_actions cause form to crash

## 0.19.1 (2025-01-29)
- fix: replace redirects for import popups with setState handlers
- fix: stabilized log window
- fix: improve startup speed, less redirects
- feature: auto scroll in log window
- feature: document build actions [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/04-build-actions/)
- feature: log button always visible in mounted site
- feature: log button sets focus on log window

## 0.19.0 (2024-12-12)
- feature: Accordion has new option arrayIndicesAreKeys. Enables read/write dictionaries which are actually arrays with keys as indeces [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/container-field-types/accordion/)
- feature: Accordion has new option disableCreate [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/container-field-types/accordion/)
- feature: Accordion has new option disableDelete [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/container-field-types/accordion/)
- feature: Accordion has new option disableSort [documentation](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/container-field-types/accordion/)

## 0.18.13 (2024-12-06)
- no changes
- fix macos pipeline

## 0.18.12 (2024-12-06)
- no changes

## 0.18.11 (2024-12-05)
- fix: remove warnings in Eisenhouwer field

## 0.18.10 (2024-12-04)
- fix: #452 make config.json source path agnostic
- feature: copy collection item to lang
- feature: new [Eisenhouwer Matrix form-field](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/03-form-fields/data-field-types/eisenhouwer/)
- feature: site property to [hide previewSite button](https://book.quiqr.org/docs/20-quiqr-developer-reference/03-content-model/02-model-file-structure/01-root-properties/02-serve/)
- feature: allow quarto .qmd files as markdown files

### Stats
- 51 modules 72.76M
- 9 community templates
- 110 stars

## 0.18.9 (2024-09-27)
- feature: AI Assistent for text fields. Using ChatGPT from OpenAI.
- fix: improve theme import stability
- fix: new hugo versions use hugo.toml in stead of config.toml #507
- feature: in model sep icon for dogfood items (currently only menu)

### Stats
- 45 modules 52.08M
- 9 community templates
- 96 stars

## 0.18.8 (2024-05-01)
- fix macos build

## 0.18.7 (2024-04-30)
- hide dogfood from cms model parseinfo
- new method to add includes: #500
    - quiqr/model/includes/{singles,collections, menus}/file.yaml
-  new Single property: pullOuterRootKey: [key] #502
  - this make files with outer arrays possible
- feature: dogfood edit menu.yml #501
- fix: accordion items look bad in darkmode #504
- feature: scaffolding of singles (see experimental)
- feature: scaffolding of collections (see experimental)

## 0.18.6 (2024-04-25)
- update readme

## 0.18.5 (2024-04-23)
- feature: new preview SEO check function...
- fix: too long accordion titles #287,312
- fix: accordion UX improvement #224
- feature: show disabled state of accordion items #496
- fix: replace 4 git sync buttons with 2 #495
- fix: after checkout hugo server should be restarted #462
- fix: after import sites are not reloaded #414

## 0.18.4 (2024-04-11)

- fix: disable s3 for pre-release

## 0.18.3 (2024-04-11)
- fix yaml

## 0.18.2 (2024-04-10)
- fix s3 again

## 0.18.1 (2024-04-09)

- feature: new prerelease pipeline

## 0.18.0 (2024-04-09)

- feature: convert shell.nix to flake.nix (run nix develop)
- feature: metadata editor in tools (using eat your own dog food method)
- feature: add prefix to select-image form-field
- fix: sync to folder

### Stats
- 44 modules 47.60M
- 9 community templates
- 73 stars

## 0.17.14 (2023-07-11)
- fix: adding files in Single gave error
- fix: z-index for popups

## 0.17.13 (2023-07-11)
- fix: another fix in the bundlemanager, causing high CPU loads.
- feature: single and collection form top bar static
- feature: copy file path as url in bundle manager to clipboard
- feature: github show limited commits with more button

### Stats
- 41 stars
- 6 community templates
- 44 modules 47.60M

## 0.17.12 (2023-06-15)
- fix: bundlemanager bug causing save problems #455
- fix: start with cards by default

## 0.17.11 (2023-06-13)
- feature: save collapse state in site content
- fix: preview single and collections will now respect url-prefix-path
- feature: improve toolbar buttons, improve single and collection action buttons

## 0.17.10 (2023-06-13)
- feature: implement server draft mode

## 0.17.9 (2023-06-12)

- feature: improve link colors for dark mode in site home text
- feature: open in folder button in bundle manager, open sync ignore list
- feature: ignore list working
- feature: add hard push, checkout latest
- fix: deleting files now get staged and commited at git push 😎
- fix: improve soft pull

## 0.17.8 (2023-06-07)
- fix: missing role menu

## 0.17.7 (2023-06-06)
- fix: refreshing history after new clone
- feature: dark mode
- feature: live switch light and dark mode

## 0.17.6 (2023-06-06)
- fix: wrong npm's

## 0.17.5 (2023-06-06)
- feature: new form field type: fontIconSelect 🥳
- feature: new global field propery: disabled
- feature: clear cache a startup
- feature: improve home message font size

### Stats
- 37 stars
- 6 community templates
- 45 modules 48.56M

## 0.17.4 (2023-06-02)
- fix: typo #443

## 0.17.3 (2023-06-01)
- feature: checkout any version in complete history 😎
- feature: show remote versions in github 🥳
- feature: hugo download tester for all platforms
- cleanup: refactored sync frontend
- cleanup: refactored sync api bridge
- cleanup: refactored sync backend
- fix: fix hugo downloads after v0.102.x (wrong url's) #444 #443
- fix: fix folder sync (synced to wrong path)
- fix: typo in sync

## 0.17.2 (2023-05-25)
- fix: disable snap builds

## 0.17.1 (2023-05-25)
- cleanup: improved toolbar buttons 😎
- fix missing npm caused by cleanup

### Stats
- 37 stars
- 5 community templates
- 36 modules 39.86M 🤘

## 0.17.0 (2023-05-17)
- feature: sync screen new layout, ready for advanged sync 💐
- feature: improve git debugging
- feature: add troubleshooting menu item
- feature: move all config to site folder 🐞
- feature: new default data folder `Quiqr`
- feature: app-ui-style is now a preference
- feature: queryselect with keys in file (e.g. .weekdays[] in calendar.json)
- feature: queryselect using Autosuggest
- feature: add images directly from imageselect dialog 💐
- feature: more fuzzy filter in collection listing 💐
- cleanup: refactored cli execute
- cleanup: remove death quiqr-cloud code
- cleanup: remove rimraf
- cleanup: remove death modules
- cleanup: remove field ArrayList
- cleanup: replaced all mui-02 components with mui-4 🥳
- cleanup: improve selectquery layout
- fix: select-image broke with non-image files
- fix: #314 & #181 breadcrumb in collections  cannot go back to root document
- fix: #422 renaming collection items do not allow extensions in new name
- fix: no "make page bundle" for non-markdown-collections
- fix: make dynform more stable

### Stats
- 37 stars
- 5 community templates
- 60 modules - 47.03M

## 0.16.0 (2023-04-24)
- feature: add back button in prefs toolbar
- feature: new field-type: select-from-query
- feature: first proof of concept of the new Quiqr Query Language
- feature: bundle-manager, show add-button on top of the widget
- cleanup: text menu
- cleanup: remove quiqr cloud stuff
- cleanup: remove form cookbook
- breaking changes: new vars format in custom open-in command (%site_name, %site_path)
- fix: #410, show active toolbar
- fix: missing active publish conf in sidebar

### Stats
- 34 stars
- 5 community templates
- 37 NPM modules - 35.11M

## 0.15.2 (2023-01-24)
- fix: application did not start

## 0.15.1 (2023-01-24)
- chore: update electron-builder to fix macos builds

## 0.15.0 (2023-01-24)
- fix: remove mobilePreviewCode
- fix: improve side menu layout
- fix: improve site name validations in library
- feature: hidePreviewIcon for singles and collections
- feature: hideExternalEditIcon for singles and collections
- feature: hideSaveButton for singles
- feature: previewUrlBase for collections
- feature: make site menus collapsable/expandable
- feature: copy site from Library
- feature: copy collection item
- fix: improve rename collection backend function
- fix: image welcomescreen
- feature: experimental setting: new improved sync method
  This prevents stale copies of files which are removed on the other side
- 96 material-02 components import left to port to MUI 4

### Stats
- 27 stars
- 5 community templates
- 37 NPM modules - 35.11M

## 0.14.5 (2022-12-06)
- fix bug in pull sync when repo does not exist
- always use --disableFastRender

## 0.14.4 (2022-12-06)
- removed hugo versions from git workflow to make it succeed more often

## 0.14.3 (2022-12-06)
- private github repos can be imported using private key
- selective sync

## 0.14.2 (2022-10-20)
- enable all matrix platform builds with fail-fast=false

## 0.14.1 (2022-10-19)
- macos build

## 0.14.0 (2022-10-19)
- fix undefined callback function
- implement rough sync from functionality for folder targets
- implement rough sync from functionality for git targets

## 0.13.12 (2022-10-19)
- fix build

## 0.13.11 (2022-10-19)
- update to node 16 in github action

## 0.13.10 (2022-10-19)
- update to node 16 in github action

## 0.13.9 (2022-10-19)
- Implement Custom Open Command (e.g. tmux send-keys 'cd "%s"' Enter)
- Fix help links
- Fix toolbar in Preference Window
- Add concept of option to show/hide menu bar
- Support subdir as baseURL for preview

## 0.13.8 (2022-07-08)
- try fix Windows embgit

## 0.13.7 (2022-07-08)
- try fix Windows embgit

## 0.13.6 (2022-07-01)
- try fix npm packages package-lock.json

## 0.13.5 (2022-07-01)
- try fix npm packages

## 0.13.4 (2022-06-30)
- fix unused var

## 0.13.3 (2022-06-30)
- small bugfixes
- add quickstart video endpoint
- try enable linux build target

## 0.13.2 (2022-06-29)
- set cname for github pages
- sort tags
- Quiqr Community Templates listing
- show active toolbar item in workspace
- move role to edit below preferences
- role has effect on toolbar and content dashboard
- show content items on dashboard
- fix #412 read and save md without frontmatter
- add new collection propery includeSubDirs default true

## 0.13.1 (2022-06-23)
- lint fixes

## 0.13.0 (2022-06-23)
- wip: open in quiqr (quiqr://)
- reorganized site dev tools
- new welcome screen
- new/import site from folder
- remove old create site
- new site from scratch
- simplified text-menu
- log to console main-api request timeouts
- minimal windows sizes

## 0.12.0 (2022-06-14)
- add Hugo Version select in new site
- show last used publish conf
- add timeout on embgit show repo
- add sync-to-folder target

## 0.11.4 (2022-06-14)
- fix problem in react-scripts

## 0.11.3 (2022-06-14)
- show mousefeedback when clicking card in Library
- fix react errors and depreciations
- fix problem preventing starting on a mac

## 0.11.2 (2022-06-13)

- fix empty page in library after startup
- fix production

## 0.11.1 (2022-06-13)
- fix missing resources/all dir for buildinfo.js

## 0.11.0 (2022-06-13)
- add disable model cache option
- dynamics can now be defined in model/includes/
- implement mergePartials in dynamics, refactor initial config provider
- save accordion state with dynamic fields
- autoSave for all relevant field types
- hideIndex for collection
- accordion dynamic reload fixes
- use key for title when not set
- update license
- fix relative paths for bundle-image-mananager and image-select
- add bugfixes to single
- fix cookbook
- big ux refactor
- refactor site config, add open in editor
- add top toolbar right
- renamed publish to sync
- seperate component for publish
- fix routings
- implemented site tags
- remember site library state
- cleanup remote content menu in publish
- edit tags is working
- add site rename dialog
- UI improvements
- new role selectionmenu
- implement roles in sidebar menu
- first version cards listing
- autogenerate etalage screenshot
- implemented favicon detection and display
- first work on the new sync sidebarmenu
- add publish github
- show GH card
- edit configuration
- start with quiqr cloud form
- github sync, WIP almost finisged
- import from git
- fix embgit name
- refactor, almost finsished import git url
- add lint to servemain
- upgrade react-script to align eslint versions
- fix 4 dependabot security issues
- implemented new site from hugo theme

## 0.10.4 (2022-04-14)
- only mac build

## 0.10.3 (2022-04-14)
- BREAKING: change mergeFromPartial to mergePartial
- concept: add file:// URI protocol possibility to partial
- show read only quiqr-model parse information
- move post-requests to src-main
- improve quiqrcloud plan:
  - delete form cloud
  - unsubscribe plan
  - move all actions to dialog
  - chain check delete actions

## 0.10.2 (2022-04-09)
- new type: font-picker
- new type: image-select
- show read only site configuration
- improve image layout
- upgraded electron from 5 to 9
- remove redundant openFileDialog code
- unsubscribe from listeners in App.js
- auto compile (inotify) site-root/quiqr/model/base.yml

## 0.10.1 (2022-03-31)
- code cleanup

## 0.10.0 (2022-03-31)
- implement preferences with choosable Data Folder
- many fixes in bundle-manager
- new bundle-manager attribute: forceFileName
- new bundle-manager attribute: maxItems
- new bundle-manager feature to write to path relative to site dir

## 0.9.5-4 (2022-03-17)
- fix mac build

## 0.9.5-3 (2022-03-17)
- enable flatpak

## 0.9.5-2 (2022-03-17)
- enable more linux formats

## 0.9.5-1 (2022-03-17)
- enable more linux formats

## 0.9.5-0 (2022-03-17)
- todo

## 0.9.4 (2022-03-16)
- todo

## 0.9.3 (2022-03-16)
- todo

## 0.9.2 (2022-03-16)
- fork from PoppyGo App

## v0.9.1
- todo ...

## v0.9.0
- todo ...

## v0.8.3
- fix upgrade race conditions on windows

## v0.8.2
- new embgit to fix openssh keys on mac

## v0.8.1
- all subscription stuff

## v0.7.5
- static imagebundles
- image thumb sizes smaller
- small styling improvements
- updated sukoh generator
- homescreen improved with themes overview

## v0.7.4
- fix accordion

## v0.7.2
- detect if hugo server is running or not
- show not running server in preview window
- improve restart of hugo server
- autoimport by clicking link in browser for Windows & Linux (quiqr://)

## v0.7.1
- auto generate menu
- experimental menu

## v0.7.0
- become a Quiqr member
- claim a Quiqr domain
- new authentication flow for publishing sites

## v0.6.6
- fix image previews in Singles
- improve bundle-manager and image thumb layout
- open single item in editor
- open collection item in editor
- don't bother users with valid keys, let them enter titles and auto generate key
- delete directory too when deleting a pageBundle
- open entry after creation collections
- imrove texts in dialogs when publishing
- improve preview user interface
- remove markdown preview
- welcome screen
- refresh sites after import
- move to expert: version switcher
- auto open preview url
- add "previewUrl" property to singles
- back button in collections breadcrum
- preview icons in page editor
- improve sidebar menu

## v0.6.5
- new feature: version switcher

## v0.6.4
- fix open last site ad startup
- close app on last window closed (macos)
- fix delete site action

## v0.6.3
- more fixes unstable select site task
- add spectron e2e framework

## v0.6.2

- fix unstable select site task
- fix hugo not starting after returning to quiqr

## v0.6.1
- fix embgit.exe location on Windows
- show version in help menu on Windows

## v0.6.0
- Official Windows support
- Fix Windows installer
- Fix hugo server running on Windows

## v0.5.5
- new confkey for collections: sortkey
- interface in collection listing to sort values

## v0.5.4
- hide previewwindow when video's are played full screen
- position previewwindow correctly when app is fullscreen

## v0.5.3
- soft close mobile preview window in multiple situations where needed
- reopen mobile preview when softclosed

## v0.5.2
- specific help links
- close mobile preview window in multiple situations where needed

## v0.5.1
- [site-source]/quiqr/home/index.md is displayed on the site dashboard

## v0.5.0
- fix progress windows not closing bug
- fix double click pogofile error when quiqr not running
- first working version of the poppy:// handler

## v0.4.5
- fix scss bug

## v0.4.4
- refactored pogopublish, impl.commit -a
- disable gitlab-ci
- remove resources add export

## v0.4.2 [05.06.20 03.03]
- Fix unknown host problem ssh/git
- Upgrade to from electron 3.x to 5.x
- Fix strange browserview HTML behaviour
- Stop server is not defined

## v0.4.1 [04.06.20 20:59]
- Menu rewrote, disable items when no site selected
- Export config with private key as .pogopass-file

## v0.4.0 [04.06.20 03:22]
- mobile browser,
- import/export theme's,
- double click pogosite files opens the app and starts importing,
- double click pogotheme files opens the app and starts importing,
- select site no popup anymore,
- no need to restart the app after site import, or site deletion,
- open site directoty in expert-menu,
- open site config in expert-menu
- help-menu opens https://docs.quiqr.app/

## versie 0.3.5 - Private Beta 3
- cleanup export file (ignore .git and public)

## versie 0.3.4 - Private Beta 2
- embgit fixes

## versie 0.3.2 - Private Beta 1
- quiqr publisher
- custom menu slots
- interface cleanups
- progress windows

## versie 0.3.0 - Birth Poppy Go
- new icon
- new product name
- remember window size
- direct start of server after site switch
- gitlab publisher now uses embgit (https://github.com/mipmip/embgit)

## versie 0.2.5 - Lize
- github publisher now uses embgit (https://github.com/mipmip/embgit)

## versie 0.2.4
- afbeeldingen mogelijk maken in singles
- standaard hugo versie bij nieuwe site 0.66.0

## versie de sukoh 0.2.3 - Andreas
- geen zip extensie
- probleem met starten
- betere afhandeling site naam import export
- methode om te herstarten
- delete site files
- meer feedback na importeren
- meer feedback na exporten
- pas site key aan

## versie de sukoh 0.2.2 - Andreas
- code signature
- git publisher gebaseerd op key
- meer feedback na publiceren
- versie van hokus duidelijk weergeven
- embed gitkeys
- git
- betere bestandsstructuur

## versie de sukoh 0.2.1 - Andreas
- rename to sokuh
- start met versioning

## versie de downward spiral 0.1 - Laurens

## Hokus
- start
  - readSettings
  - when theme found copy to css
  - else copy default
  - voorkeuren voor kleuren (ik word gek van paars en blauw)
- config.json
  - niet gemaximaliseerd starten
  - hide extra menu
- meer stylen als een native programma
- downward-spiral pims/lingewoud branch met alle pr-merged
- tekstmenu voor minder belangrijke zaken
  - hoe ziet het op Linux en Windows eruit
  - hugo console
    - nieuw window
  - configuratie
- start server
- publish
- link om lokaal website te openen
- windows binary
- windows binary ftp
- site testen op windows
- windows binary uploaden github

## Rusland 1 sessie
- fix image upload
- editorconfig
- maak page bundle
- select site, direct vanuit het menu
