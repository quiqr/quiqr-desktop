/**
 * Sync and Publish API Handlers
 *
 * Handles syncing and publishing operations.
 * TODO: Implement when sync modules are migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createMergeSiteWithRemoteHandler(container: AppContainer) {
  return async ({
    siteKey,
    publishConf,
  }: {
    siteKey: string;
    publishConf: any;
  }) => {
    throw new Error('mergeSiteWithRemote: Not yet implemented - needs SiteService migration');
  };
}

export function createPublishSiteHandler(container: AppContainer) {
  return async ({
    siteKey,
    publishConf,
  }: {
    siteKey: string;
    publishConf: any;
  }) => {
    throw new Error('publishSite: Not yet implemented - needs SiteService migration');
  };
}

export function createPublisherDispatchActionHandler(container: AppContainer) {
  return async ({
    siteKey,
    publishConf,
    action,
    actionParameters,
  }: {
    siteKey: string;
    publishConf: any;
    action: string;
    actionParameters: any;
  }) => {
    throw new Error('publisherDispatchAction: Not yet implemented - needs SiteService migration');
  };
}

export function createUpdateCommunityTemplatesHandler(container: AppContainer) {
  return async () => {
    throw new Error('updateCommunityTemplates: Not yet implemented - needs jobs migration');
  };
}

export function createCreateKeyPairGithubHandler(container: AppContainer) {
  return async () => {
    throw new Error('createKeyPairGithub: Not yet implemented - needs GithubKeyManager migration');
  };
}

export function createOpenCustomCommandHandler(container: AppContainer) {
  return async ({ command }: { command: string }) => {
    throw new Error('openCustomCommand: Not yet implemented');
  };
}

export function createSyncHandlers(container: AppContainer) {
  return {
    mergeSiteWithRemote: createMergeSiteWithRemoteHandler(container),
    publishSite: createPublishSiteHandler(container),
    publisherDispatchAction: createPublisherDispatchActionHandler(container),
    updateCommunityTemplates: createUpdateCommunityTemplatesHandler(container),
    createKeyPairGithub: createCreateKeyPairGithubHandler(container),
    openCustomCommand: createOpenCustomCommandHandler(container),
  };
}
