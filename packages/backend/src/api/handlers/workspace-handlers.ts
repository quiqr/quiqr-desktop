/**
 * Workspace API Handlers
 *
 * Handles workspace operations like listing, mounting, and getting details.
 * TODO: These handlers need full implementation once WorkspaceService is migrated.
 */

import type { AppContainer } from '../../config/container.js';
import { SiteService } from '../../services/site/site-service.js';
import fs from 'fs-extra';
import { globSync } from 'glob';
import path from 'path';
import matter from 'gray-matter';
import { createWorkspaceServiceForParams, getCurrentWorkspaceService } from './helpers/workspace-helper.js';
import { processPromptTemplate, buildSelfObject } from '../../utils/prompt-template-processor.js';
import { callLLM, getProviderDisplayName } from '../../utils/llm-service.js';
import { type WorkspaceConfig, type CollectionConfig, type SingleConfig, type MergeableConfigItem, type Field, promptItemConfigSchema, readonlyFieldSchema } from '@quiqr/types';

/**
 * List all workspaces for a site
 */
export function createListWorkspacesHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // List workspaces
    return await siteService.listWorkspaces();
  };
}

/**
 * Get workspace details and configuration
 */
export function createGetWorkspaceDetailsHandler(container: AppContainer) {
  return async ({ siteKey, workspaceKey }: { siteKey: string; workspaceKey: string }) => {
    // Use the container's getWorkspaceService which handles caching and model watcher setup
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);

    // Get configuration - delegates to WorkspaceService
    const config = await workspaceService.getConfigurationsData();

    // Get workspace path for state update
    const workspacePath = workspaceService.getWorkspacePath();

    // Update state - delegates to AppState
    container.state.setCurrentSite(siteKey, workspaceKey, workspacePath);

    // Save last opened - delegates to AppConfig
    container.config.setLastOpenedSite(siteKey, workspaceKey, workspacePath);
    await container.config.save();

    // Update menu to reflect that a site is now selected
    container.adapters.menu.createMainMenu();
    
    return config;
  };
}


/**
 * Mount a workspace (make it active)
 */
export function createMountWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // Mount the workspace
    await siteService.mountWorkspace(workspaceKey);

    // Get the workspace head to find the path
    const workspaceHead = await siteService.getWorkspaceHead(workspaceKey);

    // Update container state (similar to old backend's global state)
    container.state.currentSiteKey = siteKey;
    container.state.currentWorkspaceKey = workspaceKey;
    container.state.currentSitePath = workspaceHead?.path || '';

    // Save last opened site to config
    container.config.setLastOpenedSite(siteKey, workspaceKey, workspaceHead?.path || null);
    await container.config.save();

    // Update menu to reflect that a site is now selected
    container.adapters.menu.createMainMenu();

    // Return workspace path as string (matches frontend schema)
    return workspaceHead?.path || '';
  };
}

/**
 * Get workspace model parse information
 */
export function createGetWorkspaceModelParseInfoHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getModelParseInfo();
  };
}

/**
 * Get creator message for a workspace
 */
export function createGetCreatorMessageHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getCreatorMessage();
  };
}

/**
 * Get languages from Hugo config
 */
export function createGetLanguagesHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getHugoConfigLanguages();
  };
}

/**
 * Get files from an absolute path
 */
export function createGetFilesFromAbsolutePathHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    const workspaceService = getCurrentWorkspaceService(container);
    return await workspaceService.getFilesFromAbsolutePath(path);
  };
}

/**
 * Keys in WorkspaceConfig that contain searchable arrays of config items
 */
type DynFormArrayKey = 'collections' | 'singles' | 'dynamics';

/**
 * Union of all config item types that can be searched
 */
type DynFormConfigItem = CollectionConfig | SingleConfig | MergeableConfigItem;

/**
 * Type guard to check if a key is a valid array property in WorkspaceConfig
 */
function isDynFormArrayKey(
  config: WorkspaceConfig,
  key: string
): key is DynFormArrayKey {
  return (
    (key === 'collections' || key === 'singles' || key === 'dynamics') &&
    key in config
  );
}

/**
 * Get a property value from a config item by dynamic key
 * This is needed because config item types don't have index signatures
 */
function getConfigItemProperty(
  item: DynFormConfigItem,
  key: string
): unknown {
  // All config items are plain objects, safe to access by key
  return (item as Record<string, unknown>)[key];
}

/**
 * Get dynamic form fields
 */
export function createGetDynFormFieldsHandler(container: AppContainer) {
  return async ({
    searchRootNode,
    searchLevelKeyVal,
  }: {
    searchRootNode: string;
    searchLevelKeyVal: { key: string; val: string };
  }): Promise<DynFormConfigItem | null> => {
    const workspaceService = getCurrentWorkspaceService(container);
    const configuration = await workspaceService.getConfigurationsData();

    if (!isDynFormArrayKey(configuration, searchRootNode)) {
      return null;
    }

    const configArray = configuration[searchRootNode];
    if (!configArray) {
      return null;
    }

    const dynConf = configArray.find(
      (item) => getConfigItemProperty(item, searchLevelKeyVal.key) === searchLevelKeyVal.val
    );

    return dynConf ?? null;
  };
}

/**
 * Type guard to check if a value is a Field with a matching key
 */
function isFieldWithKey(value: unknown, key: string): value is Field {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    value.key === key
  );
}

/**
 * Get value by config path
 */
export function createGetValueByConfigPathHandler(container: AppContainer) {
  return async ({
    searchRootNode,
    path,
  }: {
    searchRootNode: string;
    path: string;
  }): Promise<Field | null> => {
    const workspaceService = getCurrentWorkspaceService(container);
    const configuration = await workspaceService.getConfigurationsData();

    if (!isDynFormArrayKey(configuration, searchRootNode)) {
      return null;
    }

    const configArray = configuration[searchRootNode];
    if (!configArray) {
      return null;
    }

    const confObj = configArray.find((item) => item.key === 'mainConfig');
    if (!confObj) {
      return null;
    }

    const fields = getConfigItemProperty(confObj, 'fields');
    if (!Array.isArray(fields)) {
      return null;
    }

    const value = fields.find((field) => isFieldWithKey(field, path));
    return value ?? null;
  };
}

/**
 * Get preview check configuration
 */
export function createGetPreviewCheckConfigurationHandler(container: AppContainer) {
  return async () => {
    const { state } = container;
    if (!state.currentSitePath) {
      throw new Error('No workspace is currently mounted');
    }

    const filePath = path.join(state.currentSitePath, 'quiqr', 'previewchecksettings.json');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const strData = await fs.readFile(filePath, { encoding: 'utf-8' });
      const formatProvider = container.formatResolver.resolveForFilePath(filePath);

      if (!formatProvider) {
        throw new Error(`Could not resolve a format provider for file ${filePath}.`);
      }

      const obj = formatProvider.parse(strData);
      return obj;
    } catch (e) {
      console.error('Error reading preview check configuration:', e);
      return null;
    }
  };
}

/**
 * Parse a file to an object (file path is relative to current workspace)
 */
export function createParseFileToObjectHandler(container: AppContainer) {
  return async ({ file }: { file: string }) => {
    const { state } = container;

    // Resolve file path relative to current workspace if not absolute
    const filePath = path.isAbsolute(file)
      ? file
      : path.join(state.currentSitePath || process.cwd(), file);

    // Read the file contents
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Resolve the format provider based on file extension
    const formatProvider = container.formatResolver.resolveForFilePath(filePath);

    if (!formatProvider) {
      throw new Error(`Unsupported file format for file: ${filePath}`);
    }

    // Parse the file content
    const parsed = formatProvider.parse(fileContent);

    return parsed;
  };
}

/**
 * Run a glob pattern sync relative to the current workspace
 */
export function createGlobSyncHandler(container: AppContainer) {
  return async ({
    pattern,
    options,
  }: {
    pattern: string;
    options?: string[];
  }) => {
    const { state } = container;

    // Use the current workspace path as the cwd if available
    const cwd = state.currentSitePath || process.cwd();

    // Run glob pattern with workspace as cwd
    const matches = globSync(pattern, { ...options, cwd });

    return matches;
  };
}

/**
 * Check if a Hugo version is installed
 * @deprecated Use createCheckSSGVersionHandler instead
 */
export function createCheckHugoVersionHandler(container: AppContainer) {
  return async ({ version }: { version: string }) => {
    const installed = container.hugoDownloader.isVersionInstalled(version);
    return { installed, version };
  };
}

/**
 * Check if an SSG version is installed
 */
export function createCheckSSGVersionHandler(container: AppContainer) {
  return async ({ ssgType, version }: { ssgType: string; version: string }) => {
    const provider = await container.providerFactory.getProvider(ssgType);
    const binaryManager = provider.getBinaryManager();

    if (!binaryManager) {
      // If no binary manager, consider it "installed" (doesn't require installation)
      return { installed: true, version, ssgType };
    }

    const installed = binaryManager.isVersionInstalled(version);
    return { installed, version, ssgType };
  };
}

/**
 * Get prompt template configuration by key
 * Loads and parses the YAML file from quiqr/model/includes/prompts_templates/{templateKey}.yaml
 */
export function createGetPromptTemplateConfigHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    templateKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    templateKey: string;
  }) => {
    // Get the workspace path
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );
    const workspace = await siteService.getWorkspaceHead(workspaceKey);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Construct the path to the prompt template file
    const templatePath = path.join(
      workspace.path,
      'quiqr',
      'model',
      'includes',
      'prompts_templates',
      `${templateKey}.yaml`
    );

    // Check if the file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Prompt template not found: ${templateKey}`);
    }

    // Read and parse the file
    const fileContent = await fs.readFile(templatePath, 'utf-8');
    const formatProvider = container.formatResolver.resolveForFilePath(templatePath);

    if (!formatProvider) {
      throw new Error(`Unsupported file format for prompt template: ${templatePath}`);
    }

    const parsed = formatProvider.parse(fileContent);
    console.log(parsed)
    return parsed;
  };
}

/**
 * Process AI prompt with variable replacement
 * Takes form values and current file context, processes the prompt template
 */
export function createProcessAiPromptHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    templateKey,
    formValues,
    context,
  }: {
    siteKey: string;
    workspaceKey: string;
    templateKey: string;
    formValues: Record<string, unknown>;
    context: {
      collectionKey?: string;
      collectionItemKey?: string;
      singleKey?: string;
    };
  }) => {
    // Get workspace service and path
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );

    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );
    const workspace = await siteService.getWorkspaceHead(workspaceKey);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const workspacePath = workspace.path;

    // Load the prompt template configuration
    const templatePath = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'prompts_templates',
      `${templateKey}.yaml`
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Prompt template not found: ${templateKey}`);
    }

    const fileContent = await fs.readFile(templatePath, 'utf-8');
    const formatProvider = container.formatResolver.resolveForFilePath(templatePath);

    if (!formatProvider) {
      throw new Error(`Unsupported file format for prompt template: ${templatePath}`);
    }

    const rawConfig = formatProvider.parse(fileContent);
    const validationResult = promptItemConfigSchema.safeParse(rawConfig);
    let templateConfig;
    if (validationResult.success) {
      templateConfig = validationResult.data
    } else {
      throw new Error('Schema validation failed: ' + validationResult.error)
    }

    // Build self object if we have context
    let selfObject = null;
    if (context.singleKey || context.collectionItemKey) {
      try {
        const config = await workspaceService.getConfigurationsData();
        let filePath = '';

        if (context.singleKey) {
          // Get file path for single
          const single = config.singles.find((x) => x.key === context.singleKey);
          if (single && single.file) {
            filePath = single.file;
          }
        } else if (context.collectionItemKey && context.collectionKey) {
          // Get file path for collection item
          const collection = config.collections.find((x) => x.key === context.collectionKey);
          if (collection) {
            filePath = path.join(collection.folder, context.collectionItemKey);
          }
        }

        if (filePath) {
          selfObject = await buildSelfObject(workspacePath, filePath);
        }
      } catch (error) {
        console.error('Failed to build self object:', error);
        // Continue without self object
      }
    }

    // Find the prompt template text (usually in a readonly field named 'promptTemplate')
    let templateText = '';
    if (templateConfig.fields) {
      const templateField = templateConfig.fields.find(
        (f: Field) => f.type === 'readonly' && f.key === 'promptTemplate'
      );

      const validationResult = readonlyFieldSchema.safeParse(templateField)

      if (validationResult.data && validationResult.data.default) {
        templateText = validationResult.data.default;
      }
    }

    if (!templateText) {
      throw new Error('No prompt template text found in configuration');
    }

    // Process the template with variable replacement
    const finalPrompt = await processPromptTemplate(templateText, {
      self: selfObject,
      field: formValues,
      workspacePath,
    });

    // Log the prompt to console
    console.log('\n=== AI ASSIST PROMPT ===');
    console.log('Template:', templateKey);
    console.log('LLM Settings:', JSON.stringify(templateConfig.llm_settings, null, 2));
    console.log('\n--- Final Prompt ---');
    console.log(finalPrompt);
    console.log('\n--- Calling LLM ---');

    // Call the LLM
    try {
      const llmResponse = await callLLM({
        model: templateConfig.llm_settings.model,
        prompt: finalPrompt,
        temperature: templateConfig.llm_settings.temperature,
        maxTokens: 4096,
      });

      // Log the response
      console.log('\n--- LLM Response ---');
      console.log(llmResponse.text);

      if (llmResponse.usage) {
        console.log('\n--- Usage Stats ---');
        console.log(`Prompt tokens: ${llmResponse.usage.promptTokens}`);
        console.log(`Completion tokens: ${llmResponse.usage.completionTokens}`);
        console.log(`Total tokens: ${llmResponse.usage.totalTokens}`);
      }

      console.log('\n======================\n');

      // Return both prompt and response
      return {
        prompt: finalPrompt,
        response: llmResponse.text,
        llm_settings: templateConfig.llm_settings,
        usage: llmResponse.usage,
        provider: getProviderDisplayName(llmResponse.provider),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\n--- LLM Error ---');
        console.error(error.message);
        console.log('\n======================\n');
        // Re-throw with context
        throw new Error(`Failed to process AI prompt: ${error.message}`);
      }

      const msg =
        typeof error === "string"
          ? error
          : "Failed to process AI prompt";

      throw new Error(msg);
    }
  };
}

/**
 * Update page content from AI response
 * Parses the AI response (markdown with frontmatter) and updates the Single or CollectionItem
 */
export function createUpdatePageFromAiResponseHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    aiResponse,
    context,
  }: {
    siteKey: string;
    workspaceKey: string;
    aiResponse: string;
    context: {
      collectionKey?: string;
      collectionItemKey?: string;
      singleKey?: string;
    };
  }) => {
    // Get workspace service
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );

    // Parse the AI response with gray-matter
    const parsed = matter(aiResponse);
    const frontmatter = parsed.data;
    const content = parsed.content;

    // Create document object
    const document = {
      ...frontmatter,
      mainContent: content,
    };

    console.log('Updating page with AI response:', {
      singleKey: context.singleKey,
      collectionKey: context.collectionKey,
      collectionItemKey: context.collectionItemKey,
      frontmatterKeys: Object.keys(frontmatter),
      contentLength: content.length,
    });

    // Update based on context
    if (context.singleKey) {
      await workspaceService.updateSingle(context.singleKey, document);
      return { success: true, type: 'single' };
    } else if (context.collectionKey && context.collectionItemKey) {
      await workspaceService.updateCollectionItem(
        context.collectionKey,
        context.collectionItemKey,
        document
      );
      return { success: true, type: 'collection' };
    } else {
      throw new Error('No valid context for updating (missing singleKey or collectionKey)');
    }
  };
}

/**
 * Create all workspace-related handlers
 */
export function createWorkspaceHandlers(container: AppContainer) {
  return {
    listWorkspaces: createListWorkspacesHandler(container),
    getWorkspaceDetails: createGetWorkspaceDetailsHandler(container),
    mountWorkspace: createMountWorkspaceHandler(container),
    getWorkspaceModelParseInfo: createGetWorkspaceModelParseInfoHandler(container),
    getCreatorMessage: createGetCreatorMessageHandler(container),
    getLanguages: createGetLanguagesHandler(container),
    getFilesFromAbsolutePath: createGetFilesFromAbsolutePathHandler(container),
    getDynFormFields: createGetDynFormFieldsHandler(container),
    getValueByConfigPath: createGetValueByConfigPathHandler(container),
    getPreviewCheckConfiguration: createGetPreviewCheckConfigurationHandler(container),
    parseFileToObject: createParseFileToObjectHandler(container),
    globSync: createGlobSyncHandler(container),
    checkHugoVersion: createCheckHugoVersionHandler(container),
    checkSSGVersion: createCheckSSGVersionHandler(container),
    getPromptTemplateConfig: createGetPromptTemplateConfigHandler(container),
    processAiPrompt: createProcessAiPromptHandler(container),
    updatePageFromAiResponse: createUpdatePageFromAiResponseHandler(container),
  };
}
