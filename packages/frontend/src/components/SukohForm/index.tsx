import { useState, useEffect, useRef, useCallback } from 'react';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import { AIAssistDialog } from './AIAssistDialog';
import type { Field, BuildAction } from '@quiqr/types';
import type { FormMeta } from './FormContext';

/**
 * Plugins object providing file and bundle management functions
 */
interface FormPlugins {
  openBundleFileDialog: (
    options: { title: string; extensions: string[]; targetPath: string },
    onFilesReady: unknown
  ) => Promise<unknown>;
  getFilesInBundle: (
    extensions: string[],
    targetPath: string,
    forceFileName: string
  ) => Promise<unknown>;
  getBundleThumbnailSrc: (targetPath: string) => Promise<string>;
}

interface SaveContext {
  accept: (updatedValues: Record<string, unknown>) => void;
  reject: (msg?: string) => void;
  data: Record<string, unknown>;
}

type SukohFormProps = {
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  singleKey?: string;
  collectionItemKey?: string;
  fields: Field[];
  buildActions?: BuildAction[];
  prompt_templates?: string[];
  plugins?: FormPlugins;
  rootName?: string;
  pageUrl?: string;
  hideExternalEditIcon?: boolean;
  values: Record<string, unknown>;
  onOpenInEditor?: (context?: { reject: (message: string) => void }) => void;
  onDocBuild?: (buildAction: BuildAction) => void;
  onSave?: (context: SaveContext) => void;
  hideSaveButton?: boolean;
  refreshed?: boolean;
  debug: boolean;
  /** Path to nested field to display (e.g., "author" or "author.address") */
  nestPath?: string;
};

/**
 * Find a field by its nested path (e.g., "author.address").
 * Traverses the fields tree following the path segments.
 */
function findFieldByPath(fields: Field[], path: string): Field | undefined {
  const segments = path.split('.');
  let currentFields = fields;
  let result: Field | undefined;

  for (const segment of segments) {
    result = currentFields.find((f) => f.key === segment);
    if (!result) return undefined;

    // If there are more segments, dive into this field's children
    if ('fields' in result && Array.isArray(result.fields)) {
      currentFields = result.fields as Field[];
    }
  }

  return result;
}

export const SukohForm = ({
  siteKey,
  workspaceKey,
  collectionKey,
  singleKey,
  prompt_templates,
  collectionItemKey,
  fields,
  pageUrl,
  values,
  onSave,
  hideSaveButton,
  nestPath,
}: SukohFormProps) => {
  const [actionButtonRightPos] = useState(380);
  const [changed, setChanged] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  
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
      prompt_templates,
      enableAiAssist: true, // TODO: Get from user prefs
      pageUrl: pageUrl || '',
    };

    // Check if AI Assist should be shown
    const hasPromptTemplates = prompt_templates && Array.isArray(prompt_templates) && prompt_templates.length > 0;

    return (
      <>
        {hasPromptTemplates && (
          <>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setAiAssistOpen(true)}
              sx={{
                position: 'absolute',
                top: 66,
                right: 16,
                zIndex: 10,
              }}
            >
              AI Assist
            </Button>
            <AIAssistDialog
              open={aiAssistOpen}
              onClose={() => setAiAssistOpen(false)}
              siteKey={siteKey}
              workspaceKey={workspaceKey}
              promptTemplateKeys={prompt_templates || []}
              collectionKey={collectionKey}
              collectionItemKey={collectionItemKey}
              singleKey={singleKey}
            />
          </>
        )}
        <FormProvider
          fields={fields}
          initialValues={values || {}}
          meta={meta}
          onSave={handleNewFormSave}
          onChange={handleNewFormChange}
        >
          {nestPath ? (
            // Render nested field view
            (() => {
              const nestedField = findFieldByPath(fields, nestPath);
              if (!nestedField) {
                return <div>Nested field not found: {nestPath}</div>;
              }

              // For accordion fields, render the field itself (not its children)
              // AccordionField will detect it's being navigated to and auto-expand
              if (nestedField.type === 'accordion') {
                return <FieldRenderer key={nestedField.key} compositeKey={`root.${nestPath}`} />;
              }

              // For nest fields, render the children
              if ('fields' in nestedField && Array.isArray(nestedField.fields)) {
                const childFields = nestedField.fields as Field[];
                return childFields.map((field) => (
                  <FieldRenderer key={field.key} compositeKey={`root.${nestPath}.${field.key}`} />
                ));
              }

              return <div>Nested field not found: {nestPath}</div>;
            })()
          ) : (
            // Render all top-level fields
            fields.map((field) => (
              <FieldRenderer key={field.key} compositeKey={`root.${field.key}`} />
            ))
          )}
        </FormProvider>
        {hideSaveButton ? null : fabButton}
        <div style={{ height: '70px' }}></div>
      </>
    );
};
