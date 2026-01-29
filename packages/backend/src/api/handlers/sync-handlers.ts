/**
 * Sync and Publish API Handlers
 *
 * Handles syncing and publishing operations.
 * TODO: Implement when sync modules are migrated.
 */

import type { AppContainer } from '../../config/container.js';
import { updateCommunityTemplatesJob } from '../../jobs/index.js';
import type { CommunityTemplate, PublConf } from '@quiqr/types';

export function createPublishSiteHandler(container: AppContainer) {
  return async ({
    siteKey,
    publishConf,
  }: {
    siteKey: string;
    publishConf: PublConf;
  }) => {
    // Import SiteService dynamically to avoid circular dependency
    const { SiteService } = await import('../../services/site/site-service.js');

    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // Dispatch push action to publish the site
    const action = publishConf.type === 'folder' ? 'pushToRemote' : 'pushWithSoftMerge';
    return await siteService.publisherDispatchAction(publishConf, action);
  };
}

export function createPublisherDispatchActionHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    publishConf,
    action,
    actionParameters,
  }: {
    siteKey: string;
    workspaceKey?: string; // Optional - defaults to "main" if not provided
    publishConf: PublConf;
    action: string;
    actionParameters: unknown;
  }) => {
    // Import SiteService dynamically to avoid circular dependency
    const { SiteService } = await import('../../services/site/site-service.js');

    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // Dispatch the action with parameters and workspaceKey (or undefined to use default)
    return await siteService.publisherDispatchAction(publishConf, action, actionParameters, workspaceKey);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createUpdateCommunityTemplatesHandler(container: AppContainer) {
  return async (): Promise<CommunityTemplate[]> => {
    return updateCommunityTemplatesJob();
  };
}

export function createCreateKeyPairGithubHandler(container: AppContainer) {
  return async (): Promise<{ privateKey: string; publicKey: string }> => {
    return await container.embgit.generateKeyPair();
  };
}

export function createDerivePublicKeyHandler(container: AppContainer) {
  return async ({ privateKey }: { privateKey: string }): Promise<{ publicKey: string }> => {
    const publicKey = container.embgit.derivePublicKeyFromPrivate(privateKey);
    return { publicKey };
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createOpenCustomCommandHandler(container: AppContainer) {
  return async ({ _command }: { _command: string }) => {
    throw new Error('openCustomCommand: Not yet implemented');
  };
}

export function createSyncHandlers(container: AppContainer) {
  return {
    publishSite: createPublishSiteHandler(container),
    publisherDispatchAction: createPublisherDispatchActionHandler(container),
    updateCommunityTemplates: createUpdateCommunityTemplatesHandler(container),
    createKeyPairGithub: createCreateKeyPairGithubHandler(container),
    derivePublicKey: createDerivePublicKeyHandler(container),
    openCustomCommand: createOpenCustomCommandHandler(container),
  };
}
