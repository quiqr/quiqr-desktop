import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import service from './../../services/service';
import { SukohForm } from './../../components/SukohForm';
import Spinner from './../../components/Spinner';

interface SingleProps {
  siteKey: string;
  workspaceKey: string;
  singleKey: string;
  fileOverride?: string | null;
  refreshed?: boolean;
  modelRefreshKey?: number;
}

interface WorkspaceSingle {
  key: string;
  title: string;
  fields: unknown[];
  build_actions?: unknown[];
  prompt_templates?: unknown[];
  hidePreviewIcon?: boolean;
  previewUrl?: string;
  hideExternalEditIcon?: boolean;
  hideSaveButton?: boolean;
  [key: string]: unknown;
}

interface WorkspaceDetails {
  singles: WorkspaceSingle[];
  [key: string]: unknown;
}

function Single({ siteKey, workspaceKey, singleKey, fileOverride, refreshed, modelRefreshKey }: SingleProps) {
  const [selectedWorkspaceDetails, setSelectedWorkspaceDetails] = useState<WorkspaceDetails | null>(null);
  const [singleValues, setSingleValues] = useState<unknown>(null);
  const [currentBaseUrlPath, setCurrentBaseUrlPath] = useState<string | undefined>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      try {
        const [single, workspaceDetails, baseUrlPath] = await Promise.all([
          service.api.getSingle(siteKey, workspaceKey, singleKey, fileOverride),
          service.api.getWorkspaceDetails(siteKey, workspaceKey),
          service.api.getCurrentBaseUrl(),
        ]);

        if (isMountedRef.current) {
          setSingleValues(single);
          setSelectedWorkspaceDetails(workspaceDetails as WorkspaceDetails);
          setCurrentBaseUrlPath(typeof baseUrlPath === 'string' ? baseUrlPath : undefined);
        }
      } catch (e) {
        service.api.logToConsole(e, 'error');
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [siteKey, workspaceKey, singleKey, fileOverride, modelRefreshKey]);

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

  const handleSave = useCallback(
    (context: { data: unknown; accept: (values: unknown) => void; reject: (message: string) => void }) => {
      const promise = service.api.updateSingle(siteKey, workspaceKey, singleKey, context.data);
      promise.then(
        function (updatedValues) {
          context.accept(updatedValues);
        },
        function () {
          context.reject('Something went wrong.');
        }
      );
    },
    [siteKey, workspaceKey, singleKey]
  );

  const single = selectedWorkspaceDetails?.singles.find((x) => x.key === singleKey);

  const previewUrl = useMemo(() => {
    if (!single) return null;

    if (single.hidePreviewIcon) {
      return '';
    }

    let finalpath = currentBaseUrlPath || '';

    if (single.previewUrl) {
      finalpath = (currentBaseUrlPath || '') + single.previewUrl;
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
        onFilesReady: unknown
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

  if (singleValues === undefined || selectedWorkspaceDetails == null) {
    return <Spinner />;
  }

  if (single == null) return null;

  const buildActions = single.build_actions ? single.build_actions.slice(0) : [];
  const prompt_templates = single.prompt_templates ? single.prompt_templates.slice(0) : [];

  return (
    <SukohForm
      key={`${singleKey}-${modelRefreshKey}`}
      debug={false}
      rootName={single.title}
      singleKey={singleKey}
      refreshed={refreshed}
      fields={single.fields}
      values={singleValues}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      pageUrl={previewUrl}
      onSave={handleSave}
      onOpenInEditor={handleOpenInEditor}
      hideExternalEditIcon={single.hideExternalEditIcon}
      hideSaveButton={single.hideSaveButton}
      prompt_templates={prompt_templates}
      buildActions={buildActions}
      plugins={plugins}
    />
  );
}

export default Single;
