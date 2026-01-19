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
import type { LlmSettings, PromptItemConfig } from '@quiqr/types';
import type { Field } from '@quiqr/types';
import service from './../../services/service';
import { FormProvider } from './FormProvider';
import { FieldRenderer } from './FieldRenderer';
import type { FormMeta } from './FormContext';

interface AIAssistDialogProps {
  open: boolean;
  onClose: () => void;
  siteKey: string;
  workspaceKey: string;
  promptTemplateKeys: string[];
  collectionKey?: string;
  collectionItemKey?: string;
  singleKey?: string;
}

export function AIAssistDialog({
  open,
  onClose,
  siteKey,
  workspaceKey,
  promptTemplateKeys,
  collectionKey,
  collectionItemKey,
  singleKey,
}: AIAssistDialogProps) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('');
  const [templateConfigs, setTemplateConfigs] = useState<Record<string, PromptItemConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [,setFormDirty] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] = useState<{
    provider?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  } | null>(null);

  // Load all template configs when dialog opens
  useEffect(() => {
    if (!open || promptTemplateKeys.length === 0) return;

    const loadTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const configs: Record<string, PromptItemConfig> = {};

        for (const templateKey of promptTemplateKeys) {
          const config = await service.api.getPromptTemplateConfig(
            siteKey,
            workspaceKey,
            templateKey
          );
          configs[templateKey] = config as PromptItemConfig;
        }

        setTemplateConfigs(configs);

        // Select first template by default
        if (promptTemplateKeys.length > 0 && !selectedTemplateKey) {
          setSelectedTemplateKey(promptTemplateKeys[0]);
        }
      } catch (e) {
        console.error('Failed to load prompt templates:', e);
        setError('Failed to load AI Assist templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [open, siteKey, workspaceKey, promptTemplateKeys, selectedTemplateKey]);

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
      const result = await service.api.processAiPrompt(
        siteKey,
        workspaceKey,
        selectedTemplateKey,
        formValues,
        {
          collectionKey,
          collectionItemKey,
          singleKey,
        }
      ) as {
        prompt: string;
        response: string;
        llm_settings: LlmSettings;
        usage?: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
        provider?: string;
      };

      console.log('AI Prompt processed successfully:', result);

      // Store the response
      setAiResponse(result.response);
      setResponseMetadata({
        provider: result.provider,
        usage: result.usage,
      });
    } catch (err: unknown) {
      console.error('Failed to process AI prompt:', err);
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
      navigator.clipboard.writeText(aiResponse).then(() => {
        alert('Response copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      });
    }
  }, [aiResponse]);

  const handleUpdatePage = useCallback(async () => {
    if (!aiResponse) return;

    // Confirm with user
    if (!window.confirm('This will replace the current page content with the AI response. Continue?')) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Send the AI response to backend for parsing and updating
      await service.api.updatePageFromAiResponse(
        siteKey,
        workspaceKey,
        aiResponse,
        {
          collectionKey,
          collectionItemKey,
          singleKey,
        }
      );

      // Reload the current form to show the updated content
      await service.api.reloadCurrentForm();

      // Close the dialog
      handleClose();

      // Show success message
      alert('Page updated successfully!');
    } catch (err: unknown) {
      console.error('Failed to update page:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to update page. Please check the console for details.');
      }
    } finally {
      setSending(false);
    }
  }, [
    aiResponse,
    siteKey,
    workspaceKey,
    singleKey,
    collectionKey,
    collectionItemKey,
    handleClose,
  ]);

  // Create metadata for the form
  const meta: FormMeta = useMemo(() => ({
    siteKey,
    workspaceKey,
    collectionKey: '',
    collectionItemKey: '',
    prompt_templates: [],
    enableAiAssist: false, // Disable nested AI Assist
    pageUrl: '',
  }), [siteKey, workspaceKey]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>AI Assist</span>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
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
              <InputLabel id="ai-template-select-label">Template</InputLabel>
              <Select
                labelId="ai-template-select-label"
                id="ai-template-select"
                value={selectedTemplateKey}
                label="Template"
                onChange={handleTemplateChange}
              >
                {promptTemplateKeys.map((key) => {
                  const config = templateConfigs[key];
                  return (
                    <MenuItem key={key} value={key}>
                      {config?.title || key}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

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
              <Alert severity="warning">
                This template has no fields configured.
              </Alert>
            )}

            {/* AI Response Section */}
            {aiResponse && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                      Copy Response
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleUpdatePage}
                      disabled={sending}
                    >
                      Update Page
                    </Button>
                  </Box>
                </Box>

                {responseMetadata && (
                  <Box sx={{ mb: 1, display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                    {responseMetadata.provider && (
                      <span>Provider: {responseMetadata.provider}</span>
                    )}
                    {responseMetadata.usage && (
                      <span>
                        Tokens: {responseMetadata.usage.promptTokens} + {responseMetadata.usage.completionTokens} = {responseMetadata.usage.totalTokens}
                      </span>
                    )}
                  </Box>
                )}

                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'grey.100',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    p: 2,
                    maxHeight: '400px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
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
        {!aiResponse && (
          <Button
            variant="contained"
            onClick={handleSendPrompt}
            disabled={loading || !!error || !selectedTemplateKey || sending}
          >
            {sending ? 'Processing...' : 'Send Prompt to AI Assist'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AIAssistDialog;
