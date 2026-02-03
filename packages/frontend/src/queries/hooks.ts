/**
 * Convenience Hooks (Optional)
 *
 * These hooks wrap TanStack Query's useQuery/useMutation with our query options.
 * They're OPTIONAL - you can always use query options directly in components:
 *
 * @example Direct usage (no convenience hook):
 * ```ts
 * const { data } = useQuery(singleQueryOptions.detail(siteKey, workspaceKey, singleKey));
 * ```
 *
 * @example With options override:
 * ```ts
 * const { data } = useQuery({
 *   ...singleQueryOptions.detail(siteKey, workspaceKey, singleKey),
 *   enabled: someCondition,
 *   staleTime: 60 * 1000,
 * });
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  configQueryOptions,
  workspaceQueryOptions,
  singleQueryOptions,
  collectionQueryOptions,
  siteQueryOptions,
  singleMutationOptions,
  collectionMutationOptions,
  siteMutationOptions,
} from './options';

// ============================================================
// CONVENIENCE QUERY HOOKS
// ============================================================

/**
 * Get all configurations
 */
export function useConfigurations(invalidateCache = false) {
  return useQuery(configQueryOptions.all(invalidateCache));
}

/**
 * Get workspace list for a site
 */
export function useWorkspaceList(siteKey: string) {
  return useQuery(workspaceQueryOptions.list(siteKey));
}

/**
 * Get workspace details
 */
export function useWorkspaceDetails(siteKey: string, workspaceKey: string) {
  return useQuery(workspaceQueryOptions.details(siteKey, workspaceKey));
}

/**
 * Composed hook that replaces service.getSiteAndWorkspaceData
 * Fetches configurations, workspace list, and workspace details in sequence
 */
export function useSiteAndWorkspaceData(siteKey: string, workspaceKey: string) {
  const configurations = useQuery(configQueryOptions.all());

  const workspacesList = useQuery({
    ...workspaceQueryOptions.list(siteKey),
    enabled: configurations.isSuccess,
  });

  const workspaceDetails = useQuery({
    ...workspaceQueryOptions.details(siteKey, workspaceKey),
    enabled: workspacesList.isSuccess,
  });

  return {
    data: {
      configurations: configurations.data,
      site: configurations.data?.sites.find(s => s.key === siteKey),
      siteWorkspaces: workspacesList.data,
      workspace: workspacesList.data?.find(w => w.key === workspaceKey),
      workspaceDetails: workspaceDetails.data,
    },
    isLoading: configurations.isLoading || workspacesList.isLoading || workspaceDetails.isLoading,
    isError: configurations.isError || workspacesList.isError || workspaceDetails.isError,
    error: configurations.error || workspacesList.error || workspaceDetails.error,
    refetch: () => {
      configurations.refetch();
      workspacesList.refetch();
      workspaceDetails.refetch();
    },
  };
}

/**
 * Get a single content item
 */
export function useSingle(
  siteKey: string,
  workspaceKey: string,
  singleKey: string,
  fileOverride?: string
) {
  return useQuery(singleQueryOptions.detail(siteKey, workspaceKey, singleKey, fileOverride));
}

/**
 * Get collection items list
 */
export function useCollectionItems(siteKey: string, workspaceKey: string, collectionKey: string) {
  return useQuery(collectionQueryOptions.items(siteKey, workspaceKey, collectionKey));
}

/**
 * Get a specific collection item
 */
export function useCollectionItem(
  siteKey: string,
  workspaceKey: string,
  collectionKey: string,
  itemKey: string
) {
  return useQuery(collectionQueryOptions.item(siteKey, workspaceKey, collectionKey, itemKey));
}

/**
 * Get site configuration
 */
export function useSiteConfig(siteKey: string) {
  return useQuery(siteQueryOptions.config(siteKey));
}

/**
 * Get languages for a workspace
 */
export function useLanguages(siteKey: string, workspaceKey: string) {
  return useQuery(siteQueryOptions.languages(siteKey, workspaceKey));
}

// ============================================================
// CONVENIENCE MUTATION HOOKS
// ============================================================

/**
 * Update a single content item
 */
export function useUpdateSingle() {
  const queryClient = useQueryClient();
  return useMutation(singleMutationOptions.update(queryClient));
}

/**
 * Save a single content item
 */
export function useSaveSingle() {
  const queryClient = useQueryClient();
  return useMutation(singleMutationOptions.save(queryClient));
}

/**
 * Build a single content item
 */
export function useBuildSingle() {
  const queryClient = useQueryClient();
  return useMutation(singleMutationOptions.build(queryClient));
}

/**
 * Update a collection item
 */
export function useUpdateCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.updateItem(queryClient));
}

/**
 * Delete a collection item
 */
export function useDeleteCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.deleteItem(queryClient));
}

/**
 * Create a new collection item key
 */
export function useCreateCollectionItemKey() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.createItemKey(queryClient));
}

/**
 * Rename a collection item
 */
export function useRenameCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.renameItem(queryClient));
}

/**
 * Copy a collection item
 */
export function useCopyCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.copyItem(queryClient));
}

/**
 * Copy a collection item to another language
 */
export function useCopyCollectionItemToLang() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.copyItemToLang(queryClient));
}

/**
 * Build a collection item
 */
export function useBuildCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.buildItem(queryClient));
}

/**
 * Convert collection item to page bundle
 */
export function useMakePageBundle() {
  const queryClient = useQueryClient();
  return useMutation(collectionMutationOptions.makePageBundle(queryClient));
}

/**
 * Save site configuration
 */
export function useSaveSiteConfig() {
  const queryClient = useQueryClient();
  return useMutation(siteMutationOptions.saveConfig(queryClient));
}

/**
 * Delete a site
 */
export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation(siteMutationOptions.delete(queryClient));
}

/**
 * Copy a site
 */
export function useCopySite() {
  const queryClient = useQueryClient();
  return useMutation(siteMutationOptions.copy(queryClient));
}
