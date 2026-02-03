import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import service from './../../services/service';
import { useSingle, useWorkspaceDetails, useUpdateSingle } from './../../queries/hooks';
import { siteQueryOptions } from './../../queries/options';
import { SukohForm } from './../../components/SukohForm';
import Spinner from './../../components/Spinner';
import type { Field, BuildAction } from '@quiqr/types';

interface SingleProps {
  siteKey: string;
  workspaceKey: string;
  singleKey: string;
  fileOverride?: string | null;
  refreshed?: boolean;
  modelRefreshKey?: number;
  nestPath?: string;
}

function Single({ siteKey, workspaceKey, singleKey, fileOverride, refreshed, modelRefreshKey, nestPath }: SingleProps) {
  // Replace manual state management with TanStack Query
  const { data: singleValues, isLoading: singleLoading, isError: singleError } = useSingle(
    siteKey,
    workspaceKey,
    singleKey,
    fileOverride || undefined
  );

  const { data: selectedWorkspaceDetails, isLoading: workspaceLoading } = useWorkspaceDetails(
    siteKey,
    workspaceKey
  );

  const { data: currentBaseUrlPath } = useQuery(siteQueryOptions.currentBaseUrl());

  // Log errors (if needed)
  if (singleError) {
    service.api.logToConsole('Error loading single', 'error');
  }

  const handleOpenInEditor = useCallback(
    (context: { reject: (message: string) => void }) => {
      const promise = service.api.openSingleInEditor(siteKey, workspaceKey, singleKey);
      promise.then(
        function () {
          // TODO should watch file for changes and if so reload
        },
        function () {
          context.reject('Something went wrong.');
        }
      );
    },
    [siteKey, workspaceKey, singleKey]
  );

  const updateSingleMutation = useUpdateSingle();

  const handleSave = useCallback(
    (context: { data: Record<string, unknown>; accept: (values: Record<string, unknown>) => void; reject: (message: string) => void }) => {
      updateSingleMutation.mutate(
        { siteKey, workspaceKey, singleKey, document: context.data },
        {
          onSuccess: (updatedValues) => {
            context.accept(updatedValues);
          },
          onError: () => {
            context.reject('Something went wrong.');
          },
        }
      );
    },
    [siteKey, workspaceKey, singleKey, updateSingleMutation]
  );

  const single = selectedWorkspaceDetails?.singles.find((x) => x.key === singleKey);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previewUrl = useMemo(() => {
    if (!single) return null;

    if (single.hidePreviewIcon) {
      return '';
    }

    const baseUrl = typeof currentBaseUrlPath === 'string' ? currentBaseUrlPath : '';
    let finalpath = baseUrl;

    if (single.previewUrl) {
      finalpath = baseUrl + single.previewUrl;
    }
    finalpath = finalpath.replace('//', '/').replace('//', '/');

    if (Array.from(finalpath)[0] !== '/') {
      finalpath = '/' + finalpath;
    }

    return 'http://localhost:13131' + finalpath;
  }, [single, currentBaseUrlPath]);

  const plugins = useMemo(
    () => ({
      openBundleFileDialog: function (
        {
          title,
          extensions,
          targetPath,
          forceFileName,
        }: { title: string; extensions: string[]; targetPath: string; forceFileName?: string },
      ) {
        return service.api.openFileDialogForSingleAndCollectionItem(
          siteKey,
          workspaceKey,
          '',
          singleKey,
          targetPath,
          { title, extensions },
          forceFileName
        );
      },

      getFilesInBundle: function (extensions: string[], targetPath: string, forceFileName: string) {
        return service.api.getFilesInBundle(siteKey, workspaceKey, '', singleKey, targetPath, extensions, forceFileName);
      },

      getBundleThumbnailSrc: function (targetPath: string) {
        return service.api.getThumbnailForCollectionOrSingleItemImage(siteKey, workspaceKey, '', singleKey, targetPath);
      },
    }),
    [siteKey, workspaceKey, singleKey]
  );

  if (singleLoading || workspaceLoading || !singleValues || !selectedWorkspaceDetails) {
    return <Spinner />;
  }

  if (single == null) return null;

  const buildActions: BuildAction[] = single.build_actions ? single.build_actions.slice(0) : [];
  const prompt_templates: string[] = single.prompt_templates ? single.prompt_templates.slice(0) : [];
  const fields: Field[] = single.fields;
  const values: Record<string, unknown> = singleValues || {};

  return (
    <SukohForm
      key={`${singleKey}-${modelRefreshKey}`}
      debug={false}
      rootName={single.title}
      singleKey={singleKey}
      refreshed={refreshed}
      fields={fields}
      values={values}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      onSave={handleSave}
      onOpenInEditor={handleOpenInEditor}
      hideExternalEditIcon={single.hideExternalEditIcon}
      hideSaveButton={single.hideSaveButton}
      prompt_templates={prompt_templates}
      buildActions={buildActions}
      plugins={plugins}
      nestPath={nestPath}
    />
  );
}

export default Single;
