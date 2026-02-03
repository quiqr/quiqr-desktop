import { useState, useEffect, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import type { PromptItemConfig } from '@quiqr/types';
import type { Field } from '@quiqr/types';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import type { FormMeta } from './FormContext';

interface FieldAIAssistDialogProps {
  open: boolean;
  onClose: () => void;
  siteKey: string;
  workspaceKey: string;
  fieldKey: string;
  fieldType: string;
  fieldContent: string;
  availableTemplates: string[];
  onReplace: (content: string) => void;
  onAppend: (content: string) => void;
  collectionKey?: string;
  collectionItemKey?: string;
  singleKey?: string;
}

export function FieldAIAssistDialog({
  open,
  onClose,
  siteKey,
  workspaceKey,
  fieldKey,
  fieldType,
  fieldContent,
  availableTemplates,
  onReplace,
  onAppend,
  collectionKey,
  collectionItemKey,
  singleKey,
}: FieldAIAssistDialogProps) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('');
  const [templateConfigs, setTemplateConfigs] = useState<Record<string, PromptItemConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [, setFormDirty] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] = useState<{
    provider?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  } | null>(null);

  // Load all template configs when dialog opens
  useEffect(() => {
    if (!open || availableTemplates.length === 0) return;

    const loadTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const configs: Record<string, PromptItemConfig> = {};

        for (const templateKey of availableTemplates) {
          const config = await service.api.getFieldPromptTemplateConfig(
            siteKey,
            workspaceKey,
            templateKey
          );
          configs[templateKey] = config;
        }

        setTemplateConfigs(configs);

        // Select first template by default
        if (availableTemplates.length > 0 && !selectedTemplateKey) {
          setSelectedTemplateKey(availableTemplates[0]);
        }
      } catch (e) {
        console.error('Failed to load field prompt templates:', e);
        setError('Failed to load AI Assist templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [open, siteKey, workspaceKey, availableTemplates, selectedTemplateKey]);

  // Reset form values when template changes
  useEffect(() => {
    if (selectedTemplateKey) {
      setFormValues({});
      setFormDirty(false);
      setAiResponse(null);
      setResponseMetadata(null);
    }
  }, [selectedTemplateKey]);

  const selectedConfig = useMemo(() => {
    return selectedTemplateKey ? templateConfigs[selectedTemplateKey] : null;
  }, [selectedTemplateKey, templateConfigs]);

  const handleTemplateChange = useCallback((event: SelectChangeEvent) => {
    setSelectedTemplateKey(event.target.value);
  }, []);

  const handleFormChange = useCallback(
    (document: Record<string, unknown>, isDirty: boolean) => {
      setFormValues(document);
      setFormDirty(isDirty);
    },
    []
  );

  const handleFormSave = useCallback(
    async (document: Record<string, unknown>) => {
      // Form save is not needed for AI Assist (no persistence)
      // Just update the local state
      setFormValues(document);
      setFormDirty(false);
    },
    []
  );

  const handleSendPrompt = useCallback(async () => {
    if (!selectedTemplateKey) return;

    setSending(true);
    setError(null);

    try {
      const result = await service.api.processFieldAiPrompt(
        siteKey,
        workspaceKey,
        selectedTemplateKey,
        formValues,
        {
          fieldKey,
          fieldType,
          fieldContent,
          collectionKey,
          collectionItemKey,
          singleKey,
        }
      );

      console.log('Field AI Prompt processed successfully:', result);

      // Store the response
      setAiResponse(result.response);
      setResponseMetadata({
        provider: result.provider,
        usage: result.usage,
      });
    } catch (err: unknown) {
      console.error('Failed to process field AI prompt:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to process prompt. Please check the console for details.');
      }
      setAiResponse(null);
      setResponseMetadata(null);
    } finally {
      setSending(false);
    }
  }, [
    selectedTemplateKey,
    formValues,
    siteKey,
    workspaceKey,
    fieldKey,
    fieldType,
    fieldContent,
    collectionKey,
    collectionItemKey,
    singleKey,
  ]);

  const handleClose = useCallback(() => {
    setFormValues({});
    setFormDirty(false);
    setError(null);
    setAiResponse(null);
    setResponseMetadata(null);
    onClose();
  }, [onClose]);

  const handleCopyResponse = useCallback(() => {
    if (aiResponse) {
      navigator.clipboard
        .writeText(aiResponse)
        .then(() => {
          alert('Response copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
          alert('Failed to copy to clipboard');
        });
    }
  }, [aiResponse]);

  const handleReplaceClick = useCallback(() => {
    if (!aiResponse) return;
    onReplace(aiResponse);
    handleClose();
  }, [aiResponse, onReplace, handleClose]);

  const handleAppendClick = useCallback(() => {
    if (!aiResponse) return;
    onAppend(aiResponse);
    handleClose();
  }, [aiResponse, onAppend, handleClose]);

  const handleReset = useCallback(() => {
    setFormValues({});
    setFormDirty(false);
    setError(null);
    setAiResponse(null);
    setResponseMetadata(null);
  }, []);

  // Create metadata for the form
  const meta: FormMeta = useMemo(
    () => ({
      siteKey,
      workspaceKey,
      collectionKey: '',
      collectionItemKey: '',
      prompt_templates: [],
      pageUrl: '',
    }),
    [siteKey, workspaceKey]
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>AI Assist for Field: {fieldKey}</span>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {/* Template Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="field-ai-template-select-label">Template</InputLabel>
              <Select
                labelId="field-ai-template-select-label"
                id="field-ai-template-select"
                value={selectedTemplateKey}
                label="Template"
                onChange={handleTemplateChange}
              >
                {availableTemplates.map((key) => {
                  const config = templateConfigs[key];
                  return (
                    <MenuItem key={key} value={key}>
                      {config?.title || key}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Current Field Content Preview */}
            {fieldContent && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Current Content:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1.5,
                    maxHeight: '150px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'text.primary',
                  }}
                >
                  {fieldContent}
                </Box>
              </Box>
            )}

            {/* Form Area */}
            {selectedConfig && selectedConfig.fields && (
              <Box sx={{ mb: 2 }}>
                {selectedConfig.description && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {selectedConfig.description}
                  </Alert>
                )}

                <FormProvider
                  fields={selectedConfig.fields as Field[]}
                  initialValues={formValues}
                  meta={meta}
                  onSave={handleFormSave}
                  onChange={handleFormChange}
                >
                  {(selectedConfig.fields as Field[]).map((field) => (
                    <FieldRenderer key={field.key} compositeKey={`root.${field.key}`} />
                  ))}
                </FormProvider>
              </Box>
            )}

            {selectedConfig && !selectedConfig.fields && (
              <Alert severity="warning">This template has no fields configured.</Alert>
            )}

            {/* AI Response Section */}
            {aiResponse && (
              <Box sx={{ mt: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" component="h3">
                    Response
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCopyResponse}
                      disabled={sending}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={handleAppendClick}
                      disabled={sending}
                    >
                      Append to Field
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleReplaceClick}
                      disabled={sending}
                    >
                      Replace Field
                    </Button>
                  </Box>
                </Box>

                {responseMetadata && (
                  <Box
                    sx={{ mb: 1, display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}
                  >
                    {responseMetadata.provider && <span>Provider: {responseMetadata.provider}</span>}
                    {responseMetadata.usage && (
                      <span>
                        Tokens: {responseMetadata.usage.promptTokens ?? 0} +{' '}
                        {responseMetadata.usage.completionTokens ?? 0} ={' '}
                        {responseMetadata.usage.totalTokens ?? 0}
                      </span>
                    )}
                  </Box>
                )}

                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    maxHeight: '400px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: 'text.primary',
                  }}
                >
                  {aiResponse}
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          {aiResponse ? 'Close' : 'Cancel'}
        </Button>
        {aiResponse && (
          <Button variant="outlined" onClick={handleReset} disabled={sending}>
            Reset
          </Button>
        )}
        {!aiResponse && (
          <Button
            variant="contained"
            onClick={handleSendPrompt}
            disabled={loading || !!error || !selectedTemplateKey || sending}
          >
            {sending ? 'Processing...' : 'Send Prompt to AI'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default FieldAIAssistDialog;
