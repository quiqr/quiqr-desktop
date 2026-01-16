import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import service from './../../../services/service';
import { SukohForm } from './../../../components/SukohForm';
import Spinner from './../../../components/Spinner';

interface WorkspaceCollection {
  key: string;
  title: string;
  folder: string;
  fields: unknown[];
  build_actions?: unknown[];
  prompt_templates?: unknown[];
  hidePreviewIcon?: boolean;
  hideExternalEditIcon?: boolean;
  previewUrlBase?: string;
  [key: string]: unknown;
}

interface WorkspaceDetails {
  collections: WorkspaceCollection[];
  [key: string]: unknown;
}

interface CollectionItemProps {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
  collectionItemKey: string;
  modelRefreshKey?: number;
  nestPath?: string;
}

function CollectionItem({ siteKey, workspaceKey, collectionKey, collectionItemKey, modelRefreshKey, nestPath }: CollectionItemProps) {
  const [selectedWorkspaceDetails, setSelectedWorkspaceDetails] = useState<WorkspaceDetails | null>(null);
  const [collectionItemValues, setCollectionItemValues] = useState<unknown>(null);
  const [currentBaseUrlPath, setCurrentBaseUrlPath] = useState<string | undefined>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      const [workspaceDetails, itemValues, baseUrlPath] = await Promise.all([
        service.api.getWorkspaceDetails(siteKey, workspaceKey),
        service.api.getCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey),
        service.api.getCurrentBaseUrl(),
      ]);

      if (isMountedRef.current) {
        setSelectedWorkspaceDetails(workspaceDetails as WorkspaceDetails);
        setCollectionItemValues(itemValues);
        setCurrentBaseUrlPath(typeof baseUrlPath === 'string' ? baseUrlPath : undefined);
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [siteKey, workspaceKey, collectionKey, collectionItemKey, modelRefreshKey]);

  const handleOpenInEditor = useCallback(() => {
    service.api.openCollectionItemInEditor(siteKey, workspaceKey, collectionKey, collectionItemKey);
  }, [siteKey, workspaceKey, collectionKey, collectionItemKey]);

  const handleSave = useCallback(
    (context: { data: unknown; accept: (values: unknown) => void; reject: (message: string) => void }) => {
      const promise = service.api.updateCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, context.data);
      promise.then(
        function (updatedValues) {
          context.accept(updatedValues);
        },
        function () {
          context.reject('Something went wrong.');
        }
      );
    },
    [siteKey, workspaceKey, collectionKey, collectionItemKey]
  );

  const collection = selectedWorkspaceDetails?.collections.find((x) => x.key === collectionKey);

  const pageUrl = useMemo(() => {
    if (!collection || collection.hidePreviewIcon) {
      return '';
    }

    const ItemPathElements = collectionItemKey.split('/');
    const pageItem = ItemPathElements.pop();
    if (pageItem !== 'index.md') {
      ItemPathElements.push(pageItem!.split('.').slice(0, -1).join('.'));
    }

    let path;
    if (collection.previewUrlBase) {
      path = collection.previewUrlBase + '/' + ItemPathElements.join('/');
    } else {
      const CollectionPath = collection.folder.split('/');
      CollectionPath.shift();
      path = CollectionPath.join('/') + '/' + ItemPathElements.join('/');
    }

    let finalpath = (currentBaseUrlPath || '') + path.toLowerCase();
    finalpath = finalpath.replace('//', '/').replace('//', '/');
    if (Array.from(finalpath)[0] !== '/') {
      finalpath = '/' + finalpath;
    }
    return 'http://localhost:13131' + finalpath;
  }, [collection, collectionItemKey, currentBaseUrlPath]);

  const plugins = useMemo(
    () => ({
      openBundleFileDialog: function (
        { title, extensions, targetPath }: { title: string; extensions: string[]; targetPath: string },
        onFilesReady: unknown
      ) {
        return service.api.openFileDialogForSingleAndCollectionItem(
          siteKey,
          workspaceKey,
          collectionKey,
          collectionItemKey,
          targetPath,
          { title, extensions }
        );
      },
      getFilesInBundle: function (extensions: string[], targetPath: string, forceFileName: string) {
        return service.api.getFilesInBundle(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, extensions, forceFileName);
      },
      getBundleThumbnailSrc: function (targetPath: string) {
        return service.api.getThumbnailForCollectionOrSingleItemImage(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath);
      },
    }),
    [siteKey, workspaceKey, collectionKey, collectionItemKey]
  );

  if (collectionItemValues === undefined || selectedWorkspaceDetails == null) {
    return <Spinner />;
  }

  if (collection == null) return null;

  const fields = collection.fields.slice(0);

  if (!collection.prompt_templates) collection.prompt_templates = [];
  const prompt_templates = collection.prompt_templates.slice(0);

  if (!collection.build_actions) collection.build_actions = [];
  const buildActions = collection.build_actions.slice(0);

  const values = Object.assign({}, collectionItemValues);

  return (
    <SukohForm
      key={`${collectionKey}-${collectionItemKey}-${modelRefreshKey}`}
      debug={false}
      rootName={collection.title}
      hideExternalEditIcon={collection.hideExternalEditIcon}
      fields={fields}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={collectionKey}
      collectionItemKey={collectionItemKey}
      values={values}
      buildActions={buildActions}
      prompt_templates={prompt_templates}
      plugins={plugins}
      onSave={handleSave}
      onOpenInEditor={handleOpenInEditor}
      nestPath={nestPath}
    />
  );
}

export default CollectionItem;
