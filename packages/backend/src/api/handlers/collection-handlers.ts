/**
 * Collection API Handlers
 *
 * Handles collection operations (blog posts, products, etc.).
 * TODO: Implement when WorkspaceService is migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createListCollectionItemsHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
  }) => {
    throw new Error('listCollectionItems: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createGetCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
  }) => {
    throw new Error('getCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createCreateCollectionItemKeyHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    itemTitle,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    itemTitle: string;
  }) => {
    throw new Error('createCollectionItemKey: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createUpdateCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    document,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    document: any;
  }) => {
    throw new Error('updateCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createDeleteCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
  }) => {
    throw new Error('deleteCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createRenameCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    collectionItemNewKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    collectionItemNewKey: string;
  }) => {
    throw new Error('renameCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createCopyCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    collectionItemNewKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    collectionItemNewKey: string;
  }) => {
    throw new Error('copyCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createCopyCollectionItemToLangHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    collectionItemNewKey,
    destLang,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    collectionItemNewKey: string;
    destLang: string;
  }) => {
    throw new Error('copyCollectionItemToLang: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createOpenFileDialogForCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
  }) => {
    throw new Error('openFileDialogForCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createBuildCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    buildAction,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    buildAction: string;
  }) => {
    throw new Error('buildCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createMakePageBundleCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
  }) => {
    throw new Error('makePageBundleCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createCopyFilesIntoCollectionItemHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    targetPath,
    files,
    forceFileName,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    targetPath: string;
    files: string[];
    forceFileName?: string;
  }) => {
    throw new Error('copyFilesIntoCollectionItem: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createGetFilesInBundleHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    targetPath,
    extensions,
    forceFileName,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    targetPath: string;
    extensions: string[];
    forceFileName?: string;
  }) => {
    throw new Error('getFilesInBundle: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createGetThumbnailForPathHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    targetPath,
  }: {
    siteKey: string;
    workspaceKey: string;
    targetPath: string;
  }) => {
    throw new Error('getThumbnailForPath: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createGetThumbnailForCollectionOrSingleItemImageHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    targetPath,
  }: {
    siteKey: string;
    workspaceKey: string;
    collectionKey: string;
    collectionItemKey: string;
    targetPath: string;
  }) => {
    throw new Error('getThumbnailForCollectionOrSingleItemImage: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createGenereateEtalageImagesHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    throw new Error('genereateEtalageImages: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createCollectionHandlers(container: AppContainer) {
  return {
    listCollectionItems: createListCollectionItemsHandler(container),
    getCollectionItem: createGetCollectionItemHandler(container),
    createCollectionItemKey: createCreateCollectionItemKeyHandler(container),
    updateCollectionItem: createUpdateCollectionItemHandler(container),
    deleteCollectionItem: createDeleteCollectionItemHandler(container),
    renameCollectionItem: createRenameCollectionItemHandler(container),
    copyCollectionItem: createCopyCollectionItemHandler(container),
    copyCollectionItemToLang: createCopyCollectionItemToLangHandler(container),
    openFileDialogForCollectionItem: createOpenFileDialogForCollectionItemHandler(container),
    buildCollectionItem: createBuildCollectionItemHandler(container),
    makePageBundleCollectionItem: createMakePageBundleCollectionItemHandler(container),
    copyFilesIntoCollectionItem: createCopyFilesIntoCollectionItemHandler(container),
    getFilesInBundle: createGetFilesInBundleHandler(container),
    getThumbnailForPath: createGetThumbnailForPathHandler(container),
    getThumbnailForCollectionOrSingleItemImage: createGetThumbnailForCollectionOrSingleItemImageHandler(container),
    genereateEtalageImages: createGenereateEtalageImagesHandler(container),
  };
}
