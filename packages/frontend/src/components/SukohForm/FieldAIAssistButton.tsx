import { useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AiIcon from '@mui/icons-material/AutoAwesome';
import { FieldAIAssistDialog } from './FieldAIAssistDialog';

interface FieldAIAssistButtonProps {
  fieldKey: string;
  fieldType: string;
  fieldContent: string;
  availableTemplates: string[];
  onReplace: (content: string) => void;
  onAppend: (content: string) => void;
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  collectionItemKey?: string;
  singleKey?: string;
}

export function FieldAIAssistButton({
  fieldKey,
  fieldType,
  fieldContent,
  availableTemplates,
  onReplace,
  onAppend,
  siteKey,
  workspaceKey,
  collectionKey,
  collectionItemKey,
  singleKey,
}: FieldAIAssistButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // Don't render if no templates available
  if (!availableTemplates || availableTemplates.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title="Field Assist">
        <IconButton aria-label="Page Assist" onClick={handleOpen} size="small">
          <AiIcon />
        </IconButton>
      </Tooltip>

      <FieldAIAssistDialog
        open={dialogOpen}
        onClose={handleClose}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        fieldKey={fieldKey}
        fieldType={fieldType}
        fieldContent={fieldContent}
        availableTemplates={availableTemplates}
        onReplace={onReplace}
        onAppend={onAppend}
        collectionKey={collectionKey}
        collectionItemKey={collectionItemKey}
        singleKey={singleKey}
      />
    </>
  );
}

export default FieldAIAssistButton;
