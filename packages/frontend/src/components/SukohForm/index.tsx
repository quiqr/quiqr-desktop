import { useState, useEffect, useRef, useCallback } from 'react';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import { PageAIAssistDialog } from './PageAIAssistDialog';
import { BuildActionOutput } from './BuildActionOutput';
import type { BuildOutput } from './BuildActionOutput';
import { findFieldByPath, pathHasArrayIndex, getTopLevelKey } from '../../utils/findFieldByPath';
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
  onDocBuild?: (buildAction: BuildAction) => Promise<{ actionName: string; stdoutType?: string; stdoutContent: string }>;
  onSave?: (context: SaveContext) => void;
  hideSaveButton?: boolean;
  refreshed?: boolean;
  debug: boolean;
  /** Path to nested field to display (e.g., "author" or "author.address") */
  nestPath?: string;
};


export const SukohForm = ({
  siteKey,
  workspaceKey,
  collectionKey,
  singleKey,
  prompt_templates,
  collectionItemKey,
  fields,
  buildActions,
  onDocBuild,
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
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [buildOutput, setBuildOutput] = useState<BuildOutput | null>(null);
  
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

  const handleBuildAction = useCallback(
    async (action: BuildAction) => {
      if (!onDocBuild) return;

      const actionKey = action.key;
      setLoadingActions((prev) => new Set(prev).add(actionKey));

      try {
        // Auto-save if form is dirty
        if (changed) {
          saveContent();
        }

        const result = await onDocBuild(action);

        setBuildOutput({
          actionName: result.actionName,
          success: true,
          stdout: result.stdoutContent || '',
          stderr: '',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setBuildOutput({
          actionName: action.title || action.key,
          success: false,
          stdout: '',
          stderr: message,
        });
      } finally {
        setLoadingActions((prev) => {
          const next = new Set(prev);
          next.delete(actionKey);
          return next;
        });
      }
    },
    [onDocBuild, changed, saveContent]
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
      pageUrl: pageUrl || '',
    };

    // Check if AI Assist should be shown
    const hasPromptTemplates = prompt_templates && Array.isArray(prompt_templates) && prompt_templates.length > 0;
    const hasBuildActions = buildActions && buildActions.length > 0;

    return (
      <>
        {(hasPromptTemplates || hasBuildActions) && (
          <div style={{ position: 'absolute', top: 142, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
            {hasPromptTemplates && (
              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setAiAssistOpen(true)}
              >
                PAGE ASSIST
              </Button>
            )}
            {hasBuildActions && buildActions.map((action) => (
              <LoadingButton
                key={action.key}
                variant="outlined"
                startIcon={<BuildIcon />}
                loading={loadingActions.has(action.key)}
                onClick={() => handleBuildAction(action)}
              >
                {action.button_text || action.title || action.key}
              </LoadingButton>
            ))}
          </div>
        )}
        {hasPromptTemplates && (
          <PageAIAssistDialog
            open={aiAssistOpen}
            onClose={() => setAiAssistOpen(false)}
            siteKey={siteKey}
            workspaceKey={workspaceKey}
            promptTemplateKeys={prompt_templates || []}
            collectionKey={collectionKey}
            collectionItemKey={collectionItemKey}
            singleKey={singleKey}
          />
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
              // When the path contains array indices (e.g., "content_blocks[0].button"),
              // the field lives inside a dynamic accordion and won't be in the static schema.
              // Render the parent accordion instead — AccordionField handles deep targeting.
              if (pathHasArrayIndex(nestPath)) {
                const topLevelKey = getTopLevelKey(nestPath);
                const topLevelField = fields.find((f) => f.key === topLevelKey);
                if (!topLevelField) {
                  return <div>Nested field not found: {nestPath}</div>;
                }
                // An accordion renders itself and drills to the targeted item/sub-field
                // via the global nestPath.
                if (topLevelField.type === 'accordion') {
                  return <FieldRenderer key={topLevelKey} compositeKey={`root.${topLevelKey}`} />;
                }
                // A static container (nest/section) wrapping a deeper indexed field:
                // render its children so the nested accordion inside can drill to the target.
                if ('fields' in topLevelField && Array.isArray(topLevelField.fields)) {
                  return (topLevelField.fields as Field[]).map((field) => (
                    <FieldRenderer key={field.key} compositeKey={`root.${topLevelKey}.${field.key}`} />
                  ));
                }
                return <div>Nested field not found: {nestPath}</div>;
              }

              const nestedField = findFieldByPath(fields, nestPath);
              if (!nestedField) {
                return <div>Nested field not found: {nestPath}</div>;
              }

              // For accordion fields, render the field itself (not its children)
              // AccordionField will detect it's being navigated to and auto-expand
              if (nestedField.type === 'accordion') {
                return <FieldRenderer key={nestedField.key} compositeKey={`root.${nestPath}`} />;
              }

              // For nest/section fields, render the children
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
        {buildOutput && (
          <BuildActionOutput
            output={buildOutput}
            onDismiss={() => setBuildOutput(null)}
          />
        )}
        {hideSaveButton ? null : fabButton}
        <div style={{ height: '70px' }}></div>
      </>
    );
};
