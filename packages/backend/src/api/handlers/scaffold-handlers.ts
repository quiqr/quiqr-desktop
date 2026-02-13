/**
 * Scaffold Model API Handlers
 *
 * Handles scaffolding of content models from existing data files.
 * Creates single or collection model configurations by inferring field types.
 */

import type { AppContainer } from '../../config/container.js';
import type { ScaffoldDataType } from '../../services/scaffold-model/types.js';

export function createScaffoldSingleFromFileHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    dataType,
  }: {
    siteKey: string;
    workspaceKey: string;
    dataType?: ScaffoldDataType;
  }) => {
    const scaffoldService = await container.getScaffoldModelService(siteKey, workspaceKey);
    return await scaffoldService.scaffoldSingleFromFile(dataType || 'single');
  };
}

export function createScaffoldCollectionFromFileHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    dataType,
  }: {
    siteKey: string;
    workspaceKey: string;
    dataType?: ScaffoldDataType;
  }) => {
    const scaffoldService = await container.getScaffoldModelService(siteKey, workspaceKey);
    return await scaffoldService.scaffoldCollectionFromFile(dataType || 'collection');
  };
}

export function createScaffoldHandlers(container: AppContainer) {
  return {
    scaffoldSingleFromFile: createScaffoldSingleFromFileHandler(container),
    scaffoldCollectionFromFile: createScaffoldCollectionFromFileHandler(container),
  };
}
