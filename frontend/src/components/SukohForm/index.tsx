import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Form, ComponentRegistry } from '../HoForm';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import dynamicFormComponents from './components/all';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import type { Field } from '@quiqr/types';
import type { FormMeta } from './FormContext';

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

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
  useNewFormSystem?: boolean;
};

export const SukohForm = ({
  siteKey,
  workspaceKey,
  collectionKey,
  singleKey,
  collectionItemKey,
  fields,
  buildActions,
  plugins,
  rootName,
  pageUrl,
  hideExternalEditIcon,
  values,
  onOpenInEditor,
  onSave,
  hideSaveButton,
  refreshed,
  useNewFormSystem = false,
}: SukohFormProps) => {
  const navigate = useNavigate();
  const [actionButtonRightPos] = useState(380);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const valueFactoryRef = useRef<(() => any) | null>(null);

  // For new form system - track document state
  const newFormDocRef = useRef<Record<string, unknown>>(values || {});

  const saveContent = useCallback(() => {
    if (onSave) {
      const context: SaveContext = {
        accept: () => {
          setChanged(false);
          setSavedOnce(true);
        },
        reject: (msg?: string) => {
          setError(msg || 'Error');
        },
        data: useNewFormSystem
          ? Object.assign({}, newFormDocRef.current)
          : Object.assign({}, valueFactoryRef.current?.()),
      };

      onSave(context);
      service.api.reloadCurrentForm();
    } else {
      setError('Save not implemented');
    }
  }, [onSave, useNewFormSystem]);

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

  const handleFormChange = (valueFactory: () => any) => {
    valueFactoryRef.current = valueFactory;
    if (!changed) {
      setChanged(true);
    }
  };

  // Handler for new form system
  const handleNewFormChange = useCallback(
    (document: Record<string, unknown>, isDirty: boolean) => {
      newFormDocRef.current = document;
      if (isDirty && !changed) {
        setChanged(true);
      }
    },
    [changed]
  );

  const handleNewFormSave = useCallback(
    async (document: Record<string, unknown>, _resources: Record<string, unknown[]>) => {
      newFormDocRef.current = document;
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

  // New form system
  if (useNewFormSystem) {
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
  }

  // Legacy form system
  return (
    <>
      <Form
        plugins={plugins}
        debug={false}
        componentRegistry={componentRegistry}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        collectionKey={collectionKey}
        singleKey={singleKey}
        refreshed={refreshed || false}
        collectionItemKey={collectionItemKey}
        fields={fields}
        buildActions={buildActions}
        rootName={rootName}
        saveFormHandler={() => saveContent()}
        pageUrl={pageUrl}
        hideExternalEditIcon={hideExternalEditIcon}
        values={values}
        onChange={handleFormChange}
        onOpenInEditor={onOpenInEditor || (() => {})}
        navigate={navigate}
      />
      {hideSaveButton ? null : fabButton}
      <div style={{ height: '70px' }}></div>
    </>
  );
};
