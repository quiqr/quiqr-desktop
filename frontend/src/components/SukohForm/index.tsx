import { useState, useEffect, useRef, useCallback } from 'react';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import type { Field } from '@quiqr/types';
import type { FormMeta } from './FormContext';


interface SaveContext {
  accept: (updatedValues: any) => void;
  reject: (msg?: string) => void;
  data: any;
}

type SukohFormProps = {
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  singleKey?: string;
  collectionItemKey?: string;
  fields: any;
  buildActions?: any;
  plugins?: any;
  rootName?: string;
  pageUrl?: string;
  hideExternalEditIcon?: boolean;
  values: any;
  onOpenInEditor?: any;
  onDocBuild?: any;
  onSave?: (context: SaveContext) => void;
  hideSaveButton?: boolean;
  refreshed?: boolean;
  debug: boolean;
  /** Enable the new functional form system (default: false) */
};

export const SukohForm = ({
  siteKey,
  workspaceKey,
  collectionKey,
  singleKey,
  collectionItemKey,
  fields,
  pageUrl,
  values,
  onSave,
  hideSaveButton,
}: SukohFormProps) => {
  const [actionButtonRightPos] = useState(380);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const valueFactoryRef = useRef<(() => any) | null>(null);

  // For new form system - track document state and resources
  const newFormDocRef = useRef<Record<string, unknown>>(values || {});
  const newFormResourcesRef = useRef<Record<string, unknown[]>>({});

  const saveContent = useCallback(() => {
    if (onSave) {

      // Merge resources into document for saving
      const mergedDocument = { ...newFormDocRef.current };
      for (const [compositeKey, files] of Object.entries(newFormResourcesRef.current)) {
        // Extract field key from compositeKey (e.g., "root.image" -> "image")
        const fieldKey = compositeKey.replace(/^root\./, '');
        mergedDocument[fieldKey] = files;
      }
      const data: Record<string, unknown> = mergedDocument;

      const context: SaveContext = {
        accept: () => {
          setChanged(false);
          setSavedOnce(true);
        },
        reject: (msg?: string) => {
          setError(msg || 'Error');
        },
        data,
      };

      onSave(context);
      service.api.reloadCurrentForm();
    } else {
      setError('Save not implemented');
    }
  }, [onSave]);

  useEffect(() => {
    service.api.shouldReloadForm(null);

    const keydownHandler = (e: KeyboardEvent) => {
      const keyCode = e.keyCode || e.which;
      if (e.ctrlKey && keyCode === 83) {
        if (changed) {
          saveContent();
        }
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, [changed, saveContent]);


  // Handler for new form system - tracks both document and resource changes
  const handleNewFormChange = useCallback(
    (document: Record<string, unknown>, isDirty: boolean, resources?: Record<string, unknown[]>) => {
      newFormDocRef.current = document;
      if (resources) {
        newFormResourcesRef.current = resources;
      }
      if (isDirty && !changed) {
        setChanged(true);
      }
    },
    [changed]
  );

  const handleNewFormSave = useCallback(
    async (document: Record<string, unknown>, resources: Record<string, unknown[]>) => {
      // Merge resources into document for saving
      // Resources are keyed by compositeKey (e.g., "root.image"), extract field key for merging
      const mergedDocument = { ...document };
      for (const [compositeKey, files] of Object.entries(resources)) {
        // Extract field key from compositeKey (e.g., "root.image" -> "image")
        const fieldKey = compositeKey.replace(/^root\./, '');
        // Only include non-deleted files
        mergedDocument[fieldKey] = files;
      }
      newFormDocRef.current = mergedDocument;
      // Trigger save through existing mechanism
      saveContent();
    },
    [saveContent]
  );

  let floatingActionButtonClass = 'animated';
  if (!savedOnce) floatingActionButtonClass += ' zoomIn';
  if (changed) floatingActionButtonClass += ' rubberBand';

  const fabButton = (
    <Fab
      style={{
        position: 'fixed',
        right: actionButtonRightPos,
        bottom: '20px',
        zIndex: 3,
      }}
      className={floatingActionButtonClass}
      disabled={!changed}
      onClick={() => saveContent()}
      color="primary"
      aria-label="add"
    >
      <CheckIcon />
    </Fab>
  );

    const meta: FormMeta = {
      siteKey,
      workspaceKey,
      collectionKey: collectionKey || '',
      collectionItemKey: collectionItemKey || singleKey || '',
      enableAiAssist: false, // TODO: Get from user prefs
      pageUrl: pageUrl || '',
    };

    const typedFields = fields as Field[];

    return (
      <>
        <FormProvider
          fields={typedFields}
          initialValues={values || {}}
          meta={meta}
          onSave={handleNewFormSave}
          onChange={handleNewFormChange}
        >
          {typedFields.map((field) => (
            <FieldRenderer key={field.key} compositeKey={`root.${field.key}`} />
          ))}
        </FormProvider>
        {hideSaveButton ? null : fabButton}
        <div style={{ height: '70px' }}></div>
      </>
    );
};
