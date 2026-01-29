/**
 * LogRow - Single log entry row with copy functionality
 */

import { useState } from 'react';
import { TableRow, TableCell, IconButton, Tooltip, Typography, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import type { logEntrySchema } from '@quiqr/types';
import { z } from 'zod';

type LogEntry = z.infer<typeof logEntrySchema>;

interface Props {
  entry: LogEntry;
}

const levelColors = {
  debug: '#9e9e9e',
  info: '#2196f3',
  warning: '#ff9800',
  error: '#f44336',
};

function LogRow({ entry }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const jsonString = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format timestamp
  const timestamp = new Date(entry.timestamp).toLocaleString();

  // For logs with metadata.message (like Hugo output), display that instead of the generic message
  const displayMessage = entry.metadata && typeof entry.metadata === 'object' && 'message' in entry.metadata
    ? String(entry.metadata.message)
    : entry.message;

  // Format metadata for display (excluding 'message' field since it's shown separately)
  const formatMetadata = () => {
    if (!entry.metadata || typeof entry.metadata !== 'object') {
      return null;
    }

    // Create a copy without the 'message' field
    const metadataWithoutMessage = { ...entry.metadata };
    if ('message' in metadataWithoutMessage) {
      delete metadataWithoutMessage.message;
    }

    // If there's no remaining metadata, don't display anything
    if (Object.keys(metadataWithoutMessage).length === 0) {
      return null;
    }

    // Format as key-value pairs
    return Object.entries(metadataWithoutMessage)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  const metadataDisplay = formatMetadata();

  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
        {timestamp}
      </TableCell>
      <TableCell>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: levelColors[entry.level],
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {entry.level}
        </Box>
      </TableCell>
      <TableCell sx={{ fontSize: '0.875rem' }}>{entry.category}</TableCell>
      <TableCell sx={{ 
        fontSize: '0.875rem', 
        wordBreak: 'break-word', 
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap'  // Preserve leading spaces and line breaks
      }}>
        <Box>
          <Typography component="div" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {displayMessage}
          </Typography>
          {metadataDisplay && (
            <Typography 
              component="div" 
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem', 
                color: 'text.secondary',
                mt: 0.5,
                fontStyle: 'italic'
              }}
            >
              {metadataDisplay}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ fontSize: '0.875rem' }}>
        {entry.errorCode || '-'}
      </TableCell>
      <TableCell align="center">
        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default LogRow;
