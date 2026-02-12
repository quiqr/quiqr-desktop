/**
 * Query and Mutation Options Factories
 *
 * This file contains query options factories following TanStack Query's recommended pattern.
 * These options can be used directly with useQuery/useMutation or in TanStack Router loaders.
 *
 * Benefits:
 * - No wrapper abstraction - use TanStack Query's native API
 * - Full type safety through api.method() calls
 * - Reusable in components and Router loaders
 * - Automatic cache invalidation in mutation options
 * - Centralized query keys and stale times
 */

import * as api from '../api';
import type { QueryClient } from '@tanstack/react-query';
import type { SiteConfig, ExtraBuildConfig, GitPublishConf } from '../../types';

// ============================================================
// QUERY OPTIONS FACTORIES
// ============================================================

/**
 * Configuration queries
 */
export const configQueryOptions = {
  all: (invalidateCache = false) => ({
    queryKey: ['getConfigurations', { invalidateCache }] as const,
    queryFn: () => api.getConfigurations({ invalidateCache }),
    staleTime: 5 * 60 * 1000, // 5 minutes - configurations don't change often
  }),

  previewCheck: () => ({
    queryKey: ['getPreviewCheckConfiguration'] as const,
    queryFn: () => api.getPreviewCheckConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }),
};

/**
 * Workspace queries
 */
export const workspaceQueryOptions = {
  list: (siteKey: string) => ({
    queryKey: ['listWorkspaces', siteKey] as const,
    queryFn: () => api.listWorkspaces(siteKey),
    staleTime: 60 * 1000, // 1 minute
  }),

  details: (siteKey: string, workspaceKey: string) => ({
    queryKey: ['getWorkspaceDetails', siteKey, workspaceKey] as const,
    queryFn: () => api.getWorkspaceDetails(siteKey, workspaceKey),
    staleTime: 30 * 1000, // 30 seconds - workspace details change more frequently
  }),

  modelParseInfo: (siteKey: string, workspaceKey: string) => ({
    queryKey: ['getWorkspaceModelParseInfo', siteKey, workspaceKey] as const,
    queryFn: () => api.getWorkspaceModelParseInfo(siteKey, workspaceKey),
    staleTime: 2 * 60 * 1000, // 2 minutes
  }),
};

/**
 * Single content item queries
 */
export const singleQueryOptions = {
  detail: (siteKey: string, workspaceKey: string, singleKey: string, fileOverride?: string) => ({
    queryKey: ['getSingle', siteKey, workspaceKey, singleKey, fileOverride] as const,
    queryFn: () => api.getSingle(siteKey, workspaceKey, singleKey, fileOverride || ''),
    staleTime: 30 * 1000, // 30 seconds
  }),
};

/**
 * Collection queries
 */
export const collectionQueryOptions = {
  items: (siteKey: string, workspaceKey: string, collectionKey: string) => ({
    queryKey: ['listCollectionItems', siteKey, workspaceKey, collectionKey] as const,
    queryFn: () => api.listCollectionItems(siteKey, workspaceKey, collectionKey),
    staleTime: 30 * 1000, // 30 seconds
  }),

  item: (siteKey: string, workspaceKey: string, collectionKey: string, itemKey: string) => ({
    queryKey: ['getCollectionItem', siteKey, workspaceKey, collectionKey, itemKey] as const,
    queryFn: () => api.getCollectionItem(siteKey, workspaceKey, collectionKey, itemKey),
    staleTime: 30 * 1000, // 30 seconds
  }),
};

/**
 * Site configuration queries
 */
export const siteQueryOptions = {
  config: (siteKey: string) => ({
    queryKey: ['getSiteConfig', siteKey] as const,
    queryFn: () => api.getSiteConfig(siteKey),
    staleTime: 2 * 60 * 1000, // 2 minutes
  }),

  languages: (siteKey: string, workspaceKey: string) => ({
    queryKey: ['getLanguages', siteKey, workspaceKey] as const,
    queryFn: () => api.getLanguages(siteKey, workspaceKey),
    staleTime: 5 * 60 * 1000, // 5 minutes - languages rarely change
  }),

  currentKey: () => ({
    queryKey: ['getCurrentSiteKey'] as const,
    queryFn: () => api.getCurrentSiteKey(),
  }),

  currentBaseUrl: () => ({
    queryKey: ['getCurrentBaseUrl'] as const,
    queryFn: () => api.getCurrentBaseUrl(),
  }),
};

/**
 * Log queries
 */
export const logQueryOptions = {
  application: (options: {
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => ({
    queryKey: ['getApplicationLogs', options] as const,
    queryFn: () => api.getApplicationLogs(options),
    staleTime: 10 * 1000, // 10 seconds - logs are time-sensitive
  }),

  site: (options: {
    siteKey: string;
    workspaceKey: string;
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => ({
    queryKey: ['getSiteLogs', options] as const,
    queryFn: () => api.getSiteLogs(options),
    staleTime: 10 * 1000, // 10 seconds
  }),

  dates: (options: {
    type: 'application' | 'site';
    siteKey?: string;
    workspaceKey?: string;
  }) => ({
    queryKey: ['getLogDates', options] as const,
    queryFn: () => api.getLogDates(options),
    staleTime: 60 * 1000, // 1 minute
  }),
};

/**
 * AI/LLM queries
 */
export const aiQueryOptions = {
  promptTemplate: (siteKey: string, workspaceKey: string, templateKey: string) => ({
    queryKey: ['getPromptTemplateConfig', siteKey, workspaceKey, templateKey] as const,
    queryFn: () => api.getPromptTemplateConfig(siteKey, workspaceKey, templateKey),
  }),

  fieldPromptTemplate: (siteKey: string, workspaceKey: string, templateKey: string) => ({
    queryKey: ['getFieldPromptTemplateConfig', siteKey, workspaceKey, templateKey] as const,
    queryFn: () => api.getFieldPromptTemplateConfig(siteKey, workspaceKey, templateKey),
  }),
};

/**
 * SSG (Static Site Generator) queries
 */
export const ssgQueryOptions = {
  filteredVersions: (ssgType: string) => ({
    queryKey: ['getFilteredSSGVersions', ssgType] as const,
    queryFn: () => api.getFilteredSSGVersions(ssgType),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - versions don't change often
  }),

  versionCheck: (ssgType: string, version: string) => ({
    queryKey: ['checkSSGVersion', ssgType, version] as const,
    queryFn: () => api.checkSSGVersion(ssgType, version),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }),

  hugoTemplates: () => ({
    queryKey: ['getHugoTemplates'] as const,
    queryFn: () => api.getHugoTemplates(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  }),
};

/**
 * Bundle/resource queries
 */
export const bundleQueryOptions = {
  files: (
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    extensions: string[],
    forceFileName: string
  ) => ({
    queryKey: [
      'getFilesInBundle',
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey,
      targetPath,
      extensions,
      forceFileName,
    ] as const,
    queryFn: () =>
      api.getFilesInBundle(
        siteKey,
        workspaceKey,
        collectionKey,
        collectionItemKey,
        targetPath,
        extensions,
        forceFileName
      ),
  }),

  thumbnail: (siteKey: string, workspaceKey: string, targetPath: string) => ({
    queryKey: ['getThumbnailForPath', siteKey, workspaceKey, targetPath] as const,
    queryFn: () => api.getThumbnailForPath(siteKey, workspaceKey, targetPath),
  }),

  thumbnailForItem: (
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string
  ) => ({
    queryKey: [
      'getThumbnailForCollectionOrSingleItemImage',
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey,
      targetPath,
    ] as const,
    queryFn: () =>
      api.getThumbnailForCollectionOrSingleItemImage(
        siteKey,
        workspaceKey,
        collectionKey,
        collectionItemKey,
        targetPath
      ),
  }),
};

/**
 * User preferences queries (unified config API)
 */
export const prefsQueryOptions = {
  /**
   * Get all effective preferences (resolved through all layers)
   */
  all: () => ({
    queryKey: ['getEffectivePreferences'] as const,
    queryFn: () => api.getEffectivePreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  /**
   * Legacy: Get all prefs from old API (for backward compatibility)
   * @deprecated Use prefsQueryOptions.all() instead
   */
  allLegacy: () => ({
    queryKey: ['readConfKey', 'prefs'] as const,
    queryFn: () => api.readConfKey('prefs'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  /**
   * Get a single preference with full metadata (value, source, locked status)
   */
  withMetadata: <K extends keyof import('../../types').UserPreferences>(prefKey: K) => ({
    queryKey: ['getEffectivePreference', prefKey] as const,
    queryFn: () => api.getEffectivePreference(prefKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  /**
   * Check if a preference is locked (forced by instance settings)
   */
  isLocked: <K extends keyof import('../../types').UserPreferences>(prefKey: K) => ({
    queryKey: ['isPreferenceLocked', prefKey] as const,
    queryFn: () => api.isPreferenceLocked(prefKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  /**
   * Legacy: Get single preference key
   * @deprecated Use prefsQueryOptions.withMetadata() for full info
   */
  key: (confkey: string) => ({
    queryKey: ['readConfPrefKey', confkey] as const,
    queryFn: () => api.readConfPrefKey(confkey),
  }),

  /**
   * Get all property metadata (for about:config style UI)
   */
  allMetadata: () => ({
    queryKey: ['getAllPropertyMetadata'] as const,
    queryFn: () => api.getAllPropertyMetadata(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),
};

// ============================================================
// MUTATION OPTIONS FACTORIES
// ============================================================

/**
 * Single content item mutations
 */
export const singleMutationOptions = {
  update: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      singleKey: string;
      document: Record<string, unknown>;
    }) => api.updateSingle(params.siteKey, params.workspaceKey, params.singleKey, params.document),

    onSuccess: (data: Record<string, unknown>, variables: {
      siteKey: string;
      workspaceKey: string;
      singleKey: string;
      document: Record<string, unknown>;
    }) => {
      // Invalidate the specific single item
      queryClient.invalidateQueries({
        queryKey: ['getSingle', variables.siteKey, variables.workspaceKey, variables.singleKey],
      });
      // Invalidate workspace details (might contain updated data)
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),

  save: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      singleKey: string;
      document: Record<string, unknown>;
    }) => api.saveSingle(params.siteKey, params.workspaceKey, params.singleKey, params.document),

    onSuccess: (data: Record<string, unknown>, variables: {
      siteKey: string;
      workspaceKey: string;
      singleKey: string;
      document: Record<string, unknown>;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['getSingle', variables.siteKey, variables.workspaceKey, variables.singleKey],
      });
    },
  }),

  build: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      singleKey: string;
      buildAction: string;
    }) => api.buildSingle(params.siteKey, params.workspaceKey, params.singleKey, params.buildAction),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      // Building might affect workspace state
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),
};

/**
 * Collection mutations
 */
export const collectionMutationOptions = {
  updateItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      document: Record<string, unknown>;
    }) =>
      api.updateCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.document
      ),

    onSuccess: (data: Record<string, unknown>, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      document: Record<string, unknown>;
    }) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({
        queryKey: [
          'getCollectionItem',
          variables.siteKey,
          variables.workspaceKey,
          variables.collectionKey,
          variables.collectionItemKey,
        ],
      });
      // Invalidate the collection list (item might have changed in ways that affect the list)
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  deleteItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
    }) =>
      api.deleteCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string; collectionItemKey: string;
    }) => {
      // Invalidate the collection list
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  createItemKey: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      itemTitle: string;
    }) =>
      api.createCollectionItemKey(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.itemTitle
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string; collectionItemKey: string; itemTitle: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  renameItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      collectionItemNewKey: string;
    }) =>
      api.renameCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.collectionItemNewKey
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string; collectionItemKey: string; collectionItemNewKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
      // Invalidate all items in this collection (keys might have changed)
      queryClient.invalidateQueries({
        queryKey: ['getCollectionItem', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  copyItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      collectionItemNewKey: string;
    }) =>
      api.copyCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.collectionItemNewKey
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string; collectionItemKey: string; collectionItemNewKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  copyItemToLang: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      collectionItemNewKey: string;
      destLang: string;
    }) =>
      api.copyCollectionItemToLang(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.collectionItemNewKey,
        params.destLang
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string; collectionItemKey: string; collectionItemNewKey: string; destLang: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),

  buildItem: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      buildAction: string;
    }) =>
      api.buildCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.buildAction
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),

  makePageBundle: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
    }) =>
      api.makePageBundleCollectionItem(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
    }) => {
      // Invalidate the specific item (structure changed)
      queryClient.invalidateQueries({
        queryKey: [
          'getCollectionItem',
          variables.siteKey,
          variables.workspaceKey,
          variables.collectionKey,
          variables.collectionItemKey,
        ],
      });
      // Invalidate the collection list
      queryClient.invalidateQueries({
        queryKey: ['listCollectionItems', variables.siteKey, variables.workspaceKey, variables.collectionKey],
      });
    },
  }),
};

/**
 * Site configuration mutations
 */
export const siteMutationOptions = {
  saveConfig: (queryClient: QueryClient) => ({
    mutationFn: (params: { siteKey: string; newConf: SiteConfig }) =>
      api.saveSiteConf(params.siteKey, params.newConf),

    onSuccess: (_data: unknown, variables: { siteKey: string }) => {
      // Invalidate site config
      queryClient.invalidateQueries({
        queryKey: ['getSiteConfig', variables.siteKey],
      });
      // Invalidate configurations (includes all sites)
      queryClient.invalidateQueries({
        queryKey: ['getConfigurations'],
      });
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationFn: (params: { siteKey: string }) => api.deleteSite(params.siteKey),

    onSuccess: () => {
      // Invalidate all configurations
      queryClient.invalidateQueries({
        queryKey: ['getConfigurations'],
      });
    },
  }),

  copy: (queryClient: QueryClient) => ({
    mutationFn: (params: { siteKey: string; newConf: SiteConfig }) =>
      api.copySite(params.siteKey, params.newConf),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getConfigurations'],
      });
    },
  }),
};

/**
 * Workspace mutations
 */
export const workspaceMutationOptions = {
  build: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      buildKey: string;
      extraConfig: ExtraBuildConfig;
    }) => api.buildWorkspace(params.siteKey, params.workspaceKey, params.buildKey, params.extraConfig),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),

  serve: (queryClient: QueryClient) => ({
    mutationFn: (params: { siteKey: string; workspaceKey: string; serveKey: string }) =>
      api.serveWorkspace(params.siteKey, params.workspaceKey, params.serveKey),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),

  mount: (queryClient: QueryClient) => ({
    mutationFn: (params: { siteKey: string; workspaceKey: string }) =>
      api.mountWorkspace(params.siteKey, params.workspaceKey),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),
};

/**
 * Publisher/sync mutations
 */
export const publisherMutationOptions = {
  dispatch: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      publishConf: GitPublishConf;
      action: string;
      actionParameters: unknown;
      timeout: number;
    }) =>
      api.publisherDispatchAction(
        params.siteKey,
        params.workspaceKey,
        params.publishConf,
        params.action,
        params.actionParameters,
        params.timeout
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
    }) => {
      // Sync operations might affect workspace state
      queryClient.invalidateQueries({
        queryKey: ['getWorkspaceDetails', variables.siteKey, variables.workspaceKey],
      });
    },
  }),
};

/**
 * Bundle/file mutations
 */
export const bundleMutationOptions = {
  uploadFile: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      targetPath: string;
      filename: string;
      base64Content: string;
    }) =>
      api.uploadFileToBundlePath(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.targetPath,
        params.filename,
        params.base64Content
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      targetPath: string;
    }) => {
      // Invalidate bundle files list
      queryClient.invalidateQueries({
        queryKey: [
          'getFilesInBundle',
          variables.siteKey,
          variables.workspaceKey,
          variables.collectionKey,
          variables.collectionItemKey,
          variables.targetPath,
        ],
      });
      // If it's a collection item, invalidate it
      if (variables.collectionKey) {
        queryClient.invalidateQueries({
          queryKey: [
            'getCollectionItem',
            variables.siteKey,
            variables.workspaceKey,
            variables.collectionKey,
            variables.collectionItemKey,
          ],
        });
      }
    },
  }),

  deleteFile: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      targetPath: string;
      filename: string;
    }) =>
      api.deleteFileFromBundle(
        params.siteKey,
        params.workspaceKey,
        params.collectionKey,
        params.collectionItemKey,
        params.targetPath,
        params.filename
      ),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      collectionKey: string;
      collectionItemKey: string;
      targetPath: string;
    }) => {
      // Invalidate bundle files list
      queryClient.invalidateQueries({
        queryKey: [
          'getFilesInBundle',
          variables.siteKey,
          variables.workspaceKey,
          variables.collectionKey,
          variables.collectionItemKey,
          variables.targetPath,
        ],
      });
    },
  }),
};

/**
 * User preferences mutations (unified config API)
 */
export const prefsMutationOptions = {
  /**
   * Save a single user preference using the unified config API
   */
  save: (queryClient: QueryClient) => ({
    mutationFn: (params: { prefKey: string; prefValue: unknown }) =>
      api.setUserPreference(params.prefKey as keyof import('../../types').UserPreferences, params.prefValue),

    onSuccess: (_data: unknown, variables: { prefKey: string; prefValue: unknown }) => {
      // Invalidate unified config queries
      queryClient.invalidateQueries({
        queryKey: ['getEffectivePreferences'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEffectivePreference', variables.prefKey],
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllPropertyMetadata'],
      });
      // Also invalidate legacy queries for backward compatibility
      queryClient.invalidateQueries({
        queryKey: ['readConfPrefKey', variables.prefKey],
      });
      queryClient.invalidateQueries({
        queryKey: ['readConfKey', 'prefs'],
      });
    },
  }),

  /**
   * Save multiple user preferences at once
   */
  saveMultiple: (queryClient: QueryClient) => ({
    mutationFn: (params: { preferences: Partial<import('../../types').UserPreferences> }) =>
      api.setUserPreferences(params.preferences),

    onSuccess: () => {
      // Invalidate all preference-related queries
      queryClient.invalidateQueries({
        queryKey: ['getEffectivePreferences'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEffectivePreference'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllPropertyMetadata'],
      });
      queryClient.invalidateQueries({
        queryKey: ['readConfKey', 'prefs'],
      });
    },
  }),

  /**
   * Legacy save using old API
   * @deprecated Use prefsMutationOptions.save() instead
   */
  saveLegacy: (queryClient: QueryClient) => ({
    mutationFn: (params: { prefKey: string; prefValue: unknown }) =>
      api.saveConfPrefKey(params.prefKey, params.prefValue),

    onSuccess: (_data: unknown, variables: { prefKey: string; prefValue: unknown }) => {
      queryClient.invalidateQueries({
        queryKey: ['readConfPrefKey', variables.prefKey],
      });
      queryClient.invalidateQueries({
        queryKey: ['readConfKey', 'prefs'],
      });
    },
  }),
};

/**
 * AI/LLM mutations
 */
export const aiMutationOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processPrompt: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      templateKey: string;
      formValues: Record<string, unknown>;
      context: {
        collectionKey?: string;
        collectionItemKey?: string;
        singleKey?: string;
      };
    }) =>
      api.processAiPrompt(
        params.siteKey,
        params.workspaceKey,
        params.templateKey,
        params.formValues,
        params.context
      ),
  }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processFieldPrompt: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      templateKey: string;
      formValues: Record<string, unknown>;
      fieldContext: {
        fieldKey: string;
        fieldType: string;
        fieldContent: string;
        collectionKey?: string;
        collectionItemKey?: string;
        singleKey?: string;
      };
    }) =>
      api.processFieldAiPrompt(
        params.siteKey,
        params.workspaceKey,
        params.templateKey,
        params.formValues,
        params.fieldContext
      ),
  }),

  updatePageFromResponse: (queryClient: QueryClient) => ({
    mutationFn: (params: {
      siteKey: string;
      workspaceKey: string;
      aiResponse: string;
      context: {
        collectionKey?: string;
        collectionItemKey?: string;
        singleKey?: string;
      };
    }) =>
      api.updatePageFromAiResponse(params.siteKey, params.workspaceKey, params.aiResponse, params.context),

    onSuccess: (_data: unknown, variables: {
      siteKey: string;
      workspaceKey: string;
      context: {
        collectionKey?: string;
        collectionItemKey?: string;
        singleKey?: string;
      };
    }) => {
      // Invalidate the affected content
      if (variables.context.singleKey) {
        queryClient.invalidateQueries({
          queryKey: ['getSingle', variables.siteKey, variables.workspaceKey, variables.context.singleKey],
        });
      }
      if (variables.context.collectionKey && variables.context.collectionItemKey) {
        queryClient.invalidateQueries({
          queryKey: [
            'getCollectionItem',
            variables.siteKey,
            variables.workspaceKey,
            variables.context.collectionKey,
            variables.context.collectionItemKey,
          ],
        });
      }
    },
  }),
};
