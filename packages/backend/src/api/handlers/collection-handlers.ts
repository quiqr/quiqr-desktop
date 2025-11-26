import path from 'path'

/**
 * Collection API Handlers
 *
 * Handles collection operations (blog posts, products, etc.).
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.listCollectionItems(collectionKey);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.getCollectionItem(collectionKey, collectionItemKey);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.createCollectionItemKey(collectionKey, collectionItemKey, itemTitle);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.updateCollectionItem(collectionKey, collectionItemKey, document);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    const deleted = await workspaceService.deleteCollectionItem(collectionKey, collectionItemKey);
    return { deleted };
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.renameCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.copyCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.copyCollectionItemToLang(collectionKey, collectionItemKey, collectionItemNewKey, destLang);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.openCollectionItemInEditor(collectionKey, collectionItemKey);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.buildCollectionItem(collectionKey, collectionItemKey, buildAction);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    const result = await workspaceService.makePageBundleCollectionItem(collectionKey, collectionItemKey);
    return { deleted: result };
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.copyFilesIntoCollectionItem(
      collectionKey,
      collectionItemKey,
      targetPath,
      files,
      forceFileName
    );
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.getFilesInBundle(
      collectionKey,
      collectionItemKey,
      targetPath,
      extensions,
      forceFileName
    );
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    const workspacePath = workspaceService.getWorkspacePath();
    // Remove leading slashes to ensure path.join works correctly
    const normalizedPath = targetPath.replace(/^[/\\]+/, '');
    const absolutePath = path.join(workspacePath, normalizedPath);
    return await workspaceService.getThumbnailForAbsoluteImgPath(absolutePath, targetPath);
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.getThumbnailForCollectionOrSingleItemImage(
      collectionKey,
      collectionItemKey,
      targetPath
    );
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
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    await workspaceService.genereateEtalageImages();
    return true;
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
